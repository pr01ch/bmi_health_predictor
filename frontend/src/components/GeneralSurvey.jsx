import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Cigarette, Wine, FileText, Dna } from 'lucide-react'
import Stepper from './Stepper'

export default function GeneralSurvey({ updateData, data }) {
  const [sleep, setSleep] = useState('7-8')
  const [smoking, setSmoking] = useState('none')
  const [alcohol, setAlcohol] = useState('none')
  const [pastHistoryList, setPastHistoryList] = useState('')
  const [geneticIssue, setGeneticIssue] = useState('no')
  const navigate = useNavigate()

  const handleNext = (e) => {
    e.preventDefault()

    // We infer the past history primary string for the simple ML model
    let ph = "none"
    const histLower = pastHistoryList.toLowerCase()
    if (histLower.includes('blood pressure') || histLower.includes('hypertension')) ph = "blood_pressure"
    if (histLower.includes('diabetes')) ph = "diabetes"
    if (histLower.includes('heart')) ph = "heart_disease"
    if (histLower.includes('allergies') || histLower.includes('asthma')) ph = "allergies"
    if (histLower.includes('thyroid')) ph = "thyroid_issues"
    if (histLower.includes('autoimmune') || histLower.includes('vasculitis') || histLower.includes('lupus') 
        || histLower.includes('arthritis') || histLower.includes('crohn') || histLower.includes('celiac')
        || histLower.includes('multiple sclerosis') || histLower.includes('psoria')) ph = "autoimmune"

    updateData({
      sleep, smoking, alcohol,
      past_history: ph,
      genetic_issue: geneticIssue
    })

    navigate('/dynamic-survey')
  }

  const bmiVal = parseFloat(data.bmi || 0)
  let bmiCategory = 'Unknown'
  let bmiColor = 'var(--clr-text-muted)'
  if (bmiVal > 0) {
    if (bmiVal < 18.5) { bmiCategory = 'Underweight'; bmiColor = 'var(--clr-warning)' }
    else if (bmiVal < 25) { bmiCategory = 'Healthy'; bmiColor = 'var(--clr-success)' }
    else if (bmiVal < 30) { bmiCategory = 'Overweight'; bmiColor = 'var(--clr-warning)' }
    else { bmiCategory = 'Obese'; bmiColor = 'var(--clr-danger)' }
  }

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <Stepper currentStep={2} />

        {/* BMI Summary Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '24px',
          padding: '12px 24px',
          background: 'var(--clr-surface)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--clr-border-light)',
          boxShadow: 'var(--shadow-sm)',
          width: 'fit-content',
          margin: '0 auto 24px',
        }}>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--clr-text-secondary)' }}>
            Your BMI:
          </span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: bmiColor }}>
            {data.bmi}
          </span>
          <span style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 700,
            padding: '2px 10px',
            borderRadius: 'var(--radius-full)',
            background: bmiColor + '18',
            color: bmiColor,
          }}>
            {bmiCategory}
          </span>
        </div>

        <div className="card" id="survey-card">
          <div className="card-header">
            <h1 className="card-title">Lifestyle & History</h1>
            <p className="card-desc">Tell us about your daily habits and medical background.</p>
          </div>

          <form onSubmit={handleNext} id="survey-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="sleep-select">
                  <Moon size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  Average Sleep Duration
                </label>
                <select id="sleep-select" className="form-select" value={sleep} onChange={e => setSleep(e.target.value)}>
                  <option value="<5">Less than 5 hours</option>
                  <option value="5-6">5 – 6 hours</option>
                  <option value="7-8">7 – 8 hours</option>
                  <option value=">8">More than 8 hours</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="smoking-select">
                  <Cigarette size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  Smoking Habits
                </label>
                <select id="smoking-select" className="form-select" value={smoking} onChange={e => setSmoking(e.target.value)}>
                  <option value="none">None</option>
                  <option value="occasional">Occasional</option>
                  <option value="frequent">Frequent</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="alcohol-select">
                  <Wine size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  Alcohol Consumption
                </label>
                <select id="alcohol-select" className="form-select" value={alcohol} onChange={e => setAlcohol(e.target.value)}>
                  <option value="none">None</option>
                  <option value="occasional">Occasional</option>
                  <option value="frequent">Frequent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="genetic-select">
                  <Dna size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  Family / Genetic Issues?
                </label>
                <select id="genetic-select" className="form-select" value={geneticIssue} onChange={e => setGeneticIssue(e.target.value)}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="history-input">
                <FileText size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                Past Medical History
              </label>
              <input
                id="history-input"
                className="form-input"
                type="text"
                value={pastHistoryList}
                onChange={e => setPastHistoryList(e.target.value)}
                placeholder="e.g. Diabetes, Heart Disease, Blood Pressure (or type 'none')"
              />
              <p className="form-hint">Mention any relevant conditions separated by commas.</p>
            </div>

            <button type="submit" className="btn btn-primary btn-block" id="survey-submit">
              Continue to Symptoms →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
