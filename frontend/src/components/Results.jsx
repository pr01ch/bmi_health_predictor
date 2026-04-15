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
  ShieldCheck
} from 'lucide-react'
import Stepper from './Stepper'

// ✅ Dynamic API URL
const API_URL = import.meta.env.VITE_API_URL || "http://65.2.188.6:8000";

export default function Results({ data }) {
  const [prediction, setPrediction] = useState(null)
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [predLoading, setPredLoading] = useState(true)
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {

    // 🔮 Fetch Prediction
    const fetchPrediction = async () => {
      try {
        const res = await axios.post(
          `${API_URL}/predict`,
          {
            symptoms: data.symptoms || [],
            past_history: data.past_history || "none",
            genetic_issue: data.genetic_issue || "no"
          },
          { timeout: 10000 }
        )
        setPrediction(res.data)
      } catch (err) {
        console.error("Prediction error:", err)
      }
      setPredLoading(false)
    }

    // 📊 Fetch Metrics
    const fetchMetrics = async () => {
      try {
        const res = await axios.get(`${API_URL}/metrics`, { timeout: 10000 })
        setMetrics(res.data)
      } catch (err) {
        console.error("Metrics error:", err)
      }
    }

    // 🏥 Fetch Hospitals
    const fetchHospitals = (lat, lon) => {
      const query = `[out:json];(node(around:10000,${lat},${lon})[amenity=hospital];way(around:10000,${lat},${lon})[amenity=hospital];);out center 10;`
      axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
        .then(res => {
          if (res.data?.elements) {
            setHospitals(res.data.elements.map(e => ({
              id: e.id,
              name: e.tags?.name || "Unknown Hospital",
              lat: e.lat || e.center?.lat,
              lon: e.lon || e.center?.lon,
            })))
          }
          setLoading(false)
        }).catch(() => setLoading(false))
    }

    const getGeoLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchHospitals(pos.coords.latitude, pos.coords.longitude),
          () => fetchHospitals(28.6139, 77.2090), // fallback
          { timeout: 8000 }
        )
      } else {
        fetchHospitals(28.6139, 77.2090)
      }
    }

    fetchPrediction()
    fetchMetrics()
    getGeoLocation()

  }, [data])

  // 📏 BMI Logic
  const bmiValue = parseFloat(data.bmi || 0)
  let bmiCategory = "Unknown"

  if (bmiValue > 0) {
    if (bmiValue < 18.5) bmiCategory = "Underweight"
    else if (bmiValue < 25) bmiCategory = "Healthy Weight"
    else if (bmiValue < 30) bmiCategory = "Overweight"
    else bmiCategory = "Obese"
  }

  // ❤️ Health Status
  let healthStatus = 'moderate'
  let healthTitle = 'Moderate Health'
  let healthDesc = 'Some areas may need attention.'

  if (prediction) {
    if (bmiCategory === "Healthy Weight" && prediction.severity?.toLowerCase() !== "high") {
      healthStatus = 'healthy'
      healthTitle = 'Generally Healthy'
      healthDesc = 'Keep maintaining your lifestyle!'
    } else if (prediction.severity?.toLowerCase() === "high") {
      healthStatus = 'risky'
      healthTitle = 'High Risk Detected'
      healthDesc = 'Consult a doctor soon.'
    }
  }

  const HealthIcon =
    healthStatus === 'healthy' ? CheckCircle :
      healthStatus === 'risky' ? AlertTriangle : Info

  // 📊 Metrics (safe fallback)
  const modelMetrics =
    metrics?.logistic_regression ||
    metrics?.random_forest ||
    metrics?.hist_gradient_boosting ||
    {}

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <Stepper currentStep={4} />

        <div className="card">
          <h1>Your Health Profile</h1>

          {prediction && (
            <div className={`health-banner ${healthStatus}`}>
              <HealthIcon size={24} />
              <div>
                <h4>{healthTitle}</h4>
                <p>{healthDesc}</p>
              </div>
            </div>
          )}

          {/* BMI */}
          <div>
            <h3>BMI</h3>
            <p>{data.bmi} ({bmiCategory})</p>
          </div>

          {/* Prediction */}
          <div>
            <h3>Prediction</h3>
            {predLoading ? <Loader /> : (
              <p>{prediction?.prediction || "No result"}</p>
            )}
          </div>

          {/* Metrics */}
          {metrics && (
            <div>
              <h3>Model Performance</h3>
              <p>Accuracy: {(modelMetrics.accuracy * 100 || 0).toFixed(1)}%</p>
              <p>Precision: {(modelMetrics.precision * 100 || 0).toFixed(1)}%</p>
              <p>Recall: {(modelMetrics.recall * 100 || 0).toFixed(1)}%</p>
            </div>
          )}

          {/* Hospitals */}
          <div>
            <h3>Nearby Hospitals</h3>
            {loading ? <Loader /> : (
              hospitals.map(h => (
                <div key={h.id}>
                  {h.name}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lon}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Navigation size={14} /> Directions
                  </a>
                </div>
              ))
            )}
          </div>

          <Link to="/assess">
            <RotateCcw size={16} /> Try Again
          </Link>
        </div>
      </div>
    </div>
  )
}