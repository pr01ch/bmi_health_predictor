import { Link } from 'react-router-dom'
import {
  Activity,
  Brain,
  MapPin,
  MessageCircle,
  Shield,
  ArrowRight,
  ClipboardList,
  BarChart3,
  Hospital,
  Stethoscope
} from 'lucide-react'

export default function HomePage() {
  return (
    <>
      {/* —— Hero Section —— */}
      <section className="hero" id="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Shield size={14} />
              AI-Powered Health Assessment
            </div>
            <h1 className="hero-title">
              Your Health,<br />
              <span className="highlight">Simplified.</span>
            </h1>
            <p className="hero-subtitle">
              Get a comprehensive health evaluation powered by machine learning.
              Calculate BMI, analyze symptoms, and receive personalized wellness insights — all in minutes.
            </p>
            <div className="hero-actions">
              <Link to="/assess" className="btn btn-primary btn-lg" id="hero-cta">
                Start Free Assessment
                <ArrowRight size={20} />
              </Link>
              <a href="#features" className="btn btn-outline btn-lg">
                Learn More
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-illustration">
              <div className="hero-icon-grid">
                <div className="hero-icon-item">
                  <Activity size={32} />
                  <span>BMI Analysis</span>
                </div>
                <div className="hero-icon-item">
                  <Brain size={32} />
                  <span>AI Insights</span>
                </div>
                <div className="hero-icon-item">
                  <MapPin size={32} />
                  <span>Find Hospitals</span>
                </div>
                <div className="hero-icon-item">
                  <MessageCircle size={32} />
                  <span>Health Chat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* —— Features Section —— */}
      <section className="features-section" id="features">
        <div className="features-inner">
          <div className="section-header">
            <span className="section-label">Features</span>
            <h2 className="section-title">Everything You Need for a Quick Health Check</h2>
            <p className="section-desc">
              A multi-step assessment that adapts to your answers and delivers meaningful, AI-backed results.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon green">
                <Activity size={28} />
              </div>
              <h3>BMI Calculator</h3>
              <p>
                Instantly calculate your Body Mass Index using height, weight, age and gender for an accurate baseline.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon blue">
                <Brain size={28} />
              </div>
              <h3>AI Disease Prediction</h3>
              <p>
                Our trained ML model analyzes your symptoms and medical history to identify potential health conditions.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon amber">
                <MapPin size={28} />
              </div>
              <h3>Nearby Hospitals</h3>
              <p>
                Automatically detect your location and find the closest hospitals with directions via Google Maps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* —— How It Works —— */}
      <section className="how-section" id="how-it-works">
        <div className="how-inner">
          <div className="section-header">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">4 Simple Steps to Your Health Profile</h2>
          </div>
          <div className="steps-row">
            <div className="step-item">
              <div className="step-number">1</div>
              <h4>Body Metrics</h4>
              <p>Enter your height, weight, age and gender</p>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <h4>Lifestyle Survey</h4>
              <p>Answer quick questions about sleep, diet & habits</p>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <h4>Symptom Check</h4>
              <p>Select any current symptoms from a dynamic list</p>
            </div>
            <div className="step-item">
              <div className="step-number">4</div>
              <h4>AI Results</h4>
              <p>Get your complete health profile and recommendations</p>
            </div>
          </div>
          <div className="text-center mt-6">
            <Link to="/assess" className="btn btn-primary btn-lg" id="how-cta">
              Begin Assessment
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
