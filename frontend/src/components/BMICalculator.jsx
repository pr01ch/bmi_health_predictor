import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ruler, Weight, Calendar, Users } from 'lucide-react'
import Stepper from './Stepper'

export default function BMICalculator({ updateData }) {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('male')
  const navigate = useNavigate()

  const calculateBMI = (e) => {
    e.preventDefault()
    if (!height || !weight) return
    const hMeters = parseFloat(height) / 100
    const wKg = parseFloat(weight)
    const bmiVal = wKg / (hMeters * hMeters)

    updateData({
      height, weight, age, gender, bmi: bmiVal.toFixed(1)
    })

    navigate('/survey')
  }

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <Stepper currentStep={1} />

        <div className="card" id="bmi-card">
          <div className="card-header">
            <h1 className="card-title">Body Metrics</h1>
            <p className="card-desc">Let's start with your basic measurements to calculate your BMI.</p>
          </div>

          <form onSubmit={calculateBMI} id="bmi-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="height-input">
                  <Ruler size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  Height (cm)
                </label>
                <input
                  id="height-input"
                  className="form-input"
                  type="number"
                  required
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  placeholder="e.g. 175"
                  min="50"
                  max="300"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="weight-input">
                  <Weight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  Weight (kg)
                </label>
                <input
                  id="weight-input"
                  className="form-input"
                  type="number"
                  required
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder="e.g. 70"
                  min="10"
                  max="500"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="age-input">
                  <Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  Age
                </label>
                <input
                  id="age-input"
                  className="form-input"
                  type="number"
                  required
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="e.g. 25"
                  min="1"
                  max="150"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="gender-select">
                  <Users size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  Gender
                </label>
                <select
                  id="gender-select"
                  className="form-select"
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" id="bmi-submit">
              Calculate & Continue →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
