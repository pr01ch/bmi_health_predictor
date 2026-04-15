import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  MapPin,
  Navigation,
  RotateCcw,
  Loader,
  Stethoscope,
  ShieldCheck,
  TrendingUp
} from 'lucide-react'
import Stepper from './Stepper'

export default function Results({ data }) {
  const [prediction, setPrediction] = useState(null)
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [predLoading, setPredLoading] = useState(true)
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    // 1. Fetch ML Prediction
    const fetchPrediction = async () => {
      try {
        const res = await axios.post('http://localhost:8000/predict', {
          symptoms: data.symptoms || [],
          past_history: data.past_history || "none",
          genetic_issue: data.genetic_issue || "no"
        })
        setPrediction(res.data)
      } catch (err) {
        console.error("Failed to fetch prediction", err)
      }
      setPredLoading(false)
    }

    const fetchMetrics = async () => {
      try {
        const res = await axios.get('http://localhost:8000/metrics')
        setMetrics(res.data)
      } catch (err) {
        console.error("Failed to fetch metrics", err)
      }
    }

    // 2. Fetch Hospitals — increased radius to 10km, fetch up to 10
    const fetchHospitals = (lat, lon) => {
      const query = `[out:json];(node(around:10000,${lat},${lon})[amenity=hospital];way(around:10000,${lat},${lon})[amenity=hospital];);out center 10;`
      axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
        .then(res => {
          if (res.data && res.data.elements) {
            setHospitals(res.data.elements.map(e => ({
              id: e.id,
              name: (e.tags && e.tags.name) || "Unknown Hospital",
              lat: e.lat || (e.center && e.center.lat),
              lon: e.lon || (e.center && e.center.lon),
            })))
          }
          setLoading(false)
        }).catch(() => setLoading(false))
    }

    // Run geolocation independently (not chained to prediction)
    const getGeoLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            fetchHospitals(pos.coords.latitude, pos.coords.longitude)
          },
          (err) => {
            console.log("Geo error, defaulting to New Delhi for demo", err)
            fetchHospitals(28.6139, 77.2090) // New Delhi fallback
          },
          {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 300000, // Cache position for 5 minutes
          }
        )
      } else {
        fetchHospitals(28.6139, 77.2090) // New Delhi fallback
      }
    }

    fetchPrediction()
    fetchMetrics()
    getGeoLocation()
  }, [data])

  // BMI
  const bmiValue = parseFloat(data.bmi || 0)
  let bmiCategory = "Unknown"
  if (bmiValue > 0) {
    if (bmiValue < 18.5) bmiCategory = "Underweight"
    else if (bmiValue < 25) bmiCategory = "Healthy Weight"
    else if (bmiValue < 30) bmiCategory = "Overweight"
    else bmiCategory = "Obese"
  }

  // Overall health status
  let healthStatus = 'moderate'
  let healthTitle = 'Moderate Health'
  let healthDesc = 'Some areas may need attention. Consider consulting a healthcare provider.'
  if (prediction) {
    if (bmiCategory === "Healthy Weight" && prediction.severity.toLowerCase() !== "high") {
      healthStatus = 'healthy'
      healthTitle = 'Generally Healthy'
      healthDesc = 'Your metrics look good! Continue maintaining healthy habits.'
    } else if (prediction.severity.toLowerCase() === "high") {
      healthStatus = 'risky'
      healthTitle = 'High Risk Detected'
      healthDesc = 'Based on your symptoms and history, we recommend seeing a doctor promptly.'
    }
  }

  const HealthIcon = healthStatus === 'healthy' ? CheckCircle : healthStatus === 'risky' ? AlertTriangle : Info

  // Severity badge class
  const sevClass = prediction
    ? prediction.severity.toLowerCase() === 'high' ? 'high'
      : prediction.severity.toLowerCase() === 'low' ? 'low' : 'medium'
    : 'medium'

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <Stepper currentStep={4} />

        <div className="card" id="results-card">
          <div className="card-header">
            <h1 className="card-title">Your Health Profile</h1>
            <p className="card-desc">Here's a summary of your assessment powered by our AI model.</p>
          </div>

          {/* Health Status Banner */}
          {prediction && (
            <div className={`health-banner ${healthStatus}`} id="health-status-banner">
              <HealthIcon size={28} />
              <div className="banner-text">
                <h4>{healthTitle}</h4>
                <p>{healthDesc}</p>
              </div>
            </div>
          )}

          {/* BMI & Prediction Grid */}
          <div className="results-grid">
            {/* BMI Panel */}
            <div className="result-panel" id="bmi-panel">
              <h3>Body Mass Index</h3>
              <div className="value">{data.bmi}</div>
              <div className="sub">{bmiCategory}</div>
            </div>

            {/* AI Panel — top match */}
            <div className="result-panel" id="prediction-panel">
              <h3>Top AI Match</h3>
              {predLoading ? (
                <div className="loading-pulse" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader size={20} />
                  <span>Analyzing...</span>
                </div>
              ) : prediction ? (
                <>
                  <div className="value" style={{ fontSize: 'var(--font-size-2xl)' }}>
                    {prediction.top_prediction || prediction.prediction}
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <span className={`severity-badge ${sevClass}`}>
                      {prediction.top_severity || prediction.severity} severity
                    </span>
                  </div>
                </>
              ) : (
                <div className="sub">Unable to generate prediction</div>
              )}
            </div>
          </div>

          {/* Possible Conditions — multiple outcomes */}
          {prediction && prediction.predictions && prediction.predictions.length > 0 && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h3 style={{
                fontSize: 'var(--font-size-sm)', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '1px', color: 'var(--clr-text-muted)', marginBottom: 'var(--space-4)',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <Stethoscope size={16} />
                Possible Conditions (Ranked by Likelihood)
              </h3>
              {prediction.predictions.map((p, i) => {
                const sev = p.severity.toLowerCase() === 'high' ? 'high'
                  : p.severity.toLowerCase() === 'low' ? 'low' : 'medium'
                return (
                  <div key={i} style={{
                    padding: 'var(--space-4) var(--space-5)',
                    borderRadius: 'var(--radius-md)',
                    border: i === 0 ? '2px solid var(--clr-primary)' : '1px solid var(--clr-border-light)',
                    background: i === 0 ? 'var(--clr-primary-light)' : 'var(--clr-bg)',
                    marginBottom: 'var(--space-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 'var(--space-3)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: '1 1 200px' }}>
                      <span style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: i === 0 ? 'var(--clr-primary)' : 'var(--clr-border)',
                        color: i === 0 ? 'white' : 'var(--clr-text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'var(--font-size-xs)', fontWeight: 800, flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--clr-text)' }}>{p.disease}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--clr-text-secondary)' }}>
                          {p.probability}% match
                          <span className={`severity-badge ${sev}`} style={{ marginLeft: '8px' }}>
                            {p.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                    {p.paper_link && p.paper_link !== 'No link available' && (
                      <a
                        href={p.paper_link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline"
                        style={{ padding: '4px 12px', fontSize: 'var(--font-size-xs)', whiteSpace: 'nowrap' }}
                      >
                        <ExternalLink size={12} /> Research Paper
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* AI Trust Center Metrics */}
          {metrics && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h3 style={{
                fontSize: 'var(--font-size-sm)', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '1px', color: 'var(--clr-text-muted)', marginBottom: 'var(--space-4)',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <ShieldCheck size={16} />
                AI Trust & Validation Metrics
              </h3>
              <div style={{
                background: 'var(--clr-surface)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-5)',
                border: '1px solid var(--clr-border-light)'
              }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--clr-text-secondary)', marginBottom: 'var(--space-4)' }}>
                  This clinical model was rigorously tested blindly against a holdout split of its database ({metrics.test_samples} cases) resulting in the below performance.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'space-between' }}>
                  
                  <div style={{ flex: '1', minWidth: '120px', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Accuracy</div>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '1.2rem', fontWeight: 800, color: 'var(--clr-primary)' }}>
                      {(metrics.ensemble && metrics.ensemble.accuracy ? (metrics.ensemble.accuracy * 100).toFixed(1) : 0)}%
                    </div>
                  </div>

                  <div style={{ flex: '1', minWidth: '120px', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Precision</div>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid var(--clr-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '1.2rem', fontWeight: 800, color: 'var(--clr-accent)' }}>
                      {(metrics.ensemble && metrics.ensemble.precision ? (metrics.ensemble.precision * 100).toFixed(1) : 0)}%
                    </div>
                  </div>

                  <div style={{ flex: '1', minWidth: '120px', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Recall</div>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid var(--clr-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '1.2rem', fontWeight: 800, color: 'var(--clr-success)' }}>
                      {(metrics.ensemble && metrics.ensemble.recall ? (metrics.ensemble.recall * 100).toFixed(1) : 0)}%
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Details */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--clr-text-muted)', marginBottom: 'var(--space-4)' }}>
              Your Details
            </h3>
            <div className="result-detail">
              <span className="label-text">Age</span>
              <span className="detail-value">{data.age} years</span>
            </div>
            <div className="result-detail">
              <span className="label-text">Gender</span>
              <span className="detail-value" style={{ textTransform: 'capitalize' }}>{data.gender}</span>
            </div>
            <div className="result-detail">
              <span className="label-text">Sleep</span>
              <span className="detail-value">{data.sleep} hrs/night</span>
            </div>
            <div className="result-detail">
              <span className="label-text">Smoking</span>
              <span className="detail-value" style={{ textTransform: 'capitalize' }}>{data.smoking}</span>
            </div>
            <div className="result-detail">
              <span className="label-text">Alcohol</span>
              <span className="detail-value" style={{ textTransform: 'capitalize' }}>{data.alcohol}</span>
            </div>
            <div className="result-detail">
              <span className="label-text">Past History</span>
              <span className="detail-value" style={{ textTransform: 'capitalize' }}>{(data.past_history || 'none').replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* Nearby Hospitals */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{
              fontSize: 'var(--font-size-sm)', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '1px', color: 'var(--clr-text-muted)', marginBottom: 'var(--space-4)',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <MapPin size={16} />
              Nearby Hospitals
            </h3>
            {loading ? (
              <div className="loading-pulse" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
                <Loader size={20} style={{ display: 'inline-block', marginRight: '8px' }} />
                Locating hospitals near you...
              </div>
            ) : (
              <ul className="hospital-list">
                {hospitals.filter(h => h.name !== 'Unknown Hospital').length > 0 ? hospitals.filter(h => h.name !== 'Unknown Hospital').map(h => (
                  <li key={h.id} className="hospital-item">
                    <div className="hospital-info">
                      <div className="hospital-icon">🏥</div>
                      <span style={{ fontWeight: 500 }}>{h.name}</span>
                    </div>
                    <a
                      href={
                        h.lat && h.lon
                          ? `https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lon}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name)}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline"
                      style={{ padding: '4px 12px', fontSize: 'var(--font-size-xs)' }}
                    >
                      <Navigation size={12} /> Directions
                    </a>
                  </li>
                )) : (
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--clr-text-muted)', textAlign: 'center', padding: 'var(--space-4)' }}>
                    No hospitals found within 10km radius. Please allow location access and try again.
                  </p>
                )}
              </ul>
            )}
          </div>

          {/* Disclaimer */}
          <div className="disclaimer" id="medical-disclaimer">
            <strong>⚕️ Medical Disclaimer</strong>
            This tool is for informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified physician with any questions regarding a medical condition.
          </div>

          {/* Restart */}
          <div className="text-center mt-6">
            <Link to="/assess" className="btn btn-outline" id="restart-btn">
              <RotateCcw size={16} /> Take Assessment Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
