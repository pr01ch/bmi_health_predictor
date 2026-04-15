import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'
import Stepper from './Stepper'

export default function DynamicSurvey({ updateData, data }) {
  const navigate = useNavigate()
  const history = data.past_history || ""
  const [symptoms, setSymptoms] = useState([])

  const toggleSymptom = (sym) => {
    if (symptoms.includes(sym)) {
      setSymptoms(symptoms.filter(s => s !== sym))
    } else {
      setSymptoms([...symptoms, sym])
    }
  }

  const handleFinish = (e) => {
    e.preventDefault()
    updateData({ symptoms })
    navigate('/results')
  }

  const generalSymptoms = [
    { id: 'fever', label: '🌡️ Fever' },
    { id: 'cough', label: '😷 Cough' },
    { id: 'fatigue', label: '😴 Fatigue' },
    { id: 'runny_nose', label: '🤧 Runny Nose' },
    { id: 'nausea', label: '🤢 Nausea' },
    { id: 'weakness', label: '😞 General Weakness' },
    { id: 'loss_of_appetite', label: '🍽️ Loss of Appetite' },
    { id: 'body_ache', label: '🦴 Body Ache' },
    { id: 'chills', label: '🥶 Chills' },
    { id: 'sore_throat', label: '🗣️ Sore Throat' },
  ]

  const heartSymptoms = [
    { id: 'shortness_of_breath', label: '💨 Shortness of Breath' },
    { id: 'chest_pain', label: '💔 Chest Pain' },
    { id: 'dizziness', label: '😵 Dizziness' },
    { id: 'rapid_heartbeat', label: '💓 Rapid Heartbeat' },
    { id: 'swollen_legs', label: '🦵 Swollen Legs/Ankles' },
    { id: 'cold_sweats', label: '💧 Cold Sweats' },
    { id: 'irregular_heartbeat', label: '💗 Irregular Heartbeat' },
    { id: 'jaw_pain', label: '😣 Jaw/Neck Pain' },
  ]

  const diabetesSymptoms = [
    { id: 'increased_thirst', label: '🥤 Increased Thirst' },
    { id: 'frequent_urination', label: '🚻 Frequent Urination' },
    { id: 'blurred_vision', label: '👓 Blurred Vision' },
    { id: 'slow_healing', label: '🩹 Slow Wound Healing' },
    { id: 'numbness_in_hands', label: '🖐️ Numbness/Tingling' },
    { id: 'unexplained_weight_loss', label: '⚖️ Unexplained Weight Loss' },
    { id: 'dry_skin', label: '🧴 Dry/Itchy Skin' },
  ]

  const thyroidSymptoms = [
    { id: 'weight_loss', label: '⚖️ Unexpected Weight Loss' },
    { id: 'rapid_heartbeat', label: '💓 Rapid Heartbeat' },
    { id: 'sweating', label: '💦 Excessive Sweating' },
    { id: 'tremors', label: '🤲 Tremors/Shaking' },
    { id: 'anxiety', label: '😰 Anxiety/Nervousness' },
    { id: 'heat_intolerance', label: '🔥 Heat Intolerance' },
    { id: 'insomnia', label: '🌙 Insomnia' },
    { id: 'sensitivity_to_light', label: '☀️ Light Sensitivity' },
  ]

  const allergySymptoms = [
    { id: 'wheezing', label: '🌬️ Wheezing' },
    { id: 'chest_tightness', label: '😤 Chest Tightness' },
    { id: 'rash', label: '🔴 Skin Rash/Hives' },
    { id: 'itchy_eyes', label: '👁️ Itchy/Watery Eyes' },
    { id: 'sneezing', label: '🤧 Excessive Sneezing' },
    { id: 'shortness_of_breath', label: '💨 Shortness of Breath' },
    { id: 'swelling', label: '🫧 Swelling (Face/Throat)' },
  ]

  const autoImmuneSymptoms = [
    { id: 'joint_pain', label: '🦴 Joint Pain' },
    { id: 'rash', label: '🔴 Skin Rash' },
    { id: 'numbness_in_hands', label: '🖐️ Numbness/Tingling' },
    { id: 'swelling', label: '🫧 Swelling' },
    { id: 'hair_loss', label: '💇 Hair Loss' },
    { id: 'dry_skin', label: '🧴 Dry Skin' },
    { id: 'sensitivity_to_light', label: '☀️ Light Sensitivity' },
    { id: 'blurred_vision', label: '👓 Blurred Vision' },
    { id: 'weight_loss', label: '⚖️ Weight Loss' },
    { id: 'tremors', label: '🤲 Tremors' },
  ]

  const otherSymptoms = [
    { id: 'headache', label: '🤕 Headache' },
    { id: 'weight_loss', label: '⚖️ Weight Loss' },
    { id: 'sensitivity_to_light', label: '☀️ Light Sensitivity' },
    { id: 'pale_skin', label: '😶 Pale Skin' },
    { id: 'daytime_sleepiness', label: '😪 Daytime Sleepiness' },
    { id: 'loud_snoring', label: '😴 Loud Snoring' },
    { id: 'heartburn', label: '🔥 Heartburn' },
    { id: 'difficulty_swallowing', label: '😖 Difficulty Swallowing' },
    { id: 'loss_of_taste', label: '👅 Loss of Taste/Smell' },
    { id: 'joint_pain', label: '🦴 Joint Pain' },
  ]

  const showHeart = history === 'blood_pressure' || history === 'heart_disease'
  const showDiabetes = history === 'diabetes'
  const showThyroid = history === 'thyroid_issues'
  const showAllergy = history === 'allergies'
  const showAutoimmune = history === 'autoimmune'
  const showOther = !showHeart && !showDiabetes && !showThyroid && !showAllergy && !showAutoimmune

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <Stepper currentStep={3} />

        <div className="card" id="symptoms-card">
          <div className="card-header">
            <h1 className="card-title">
              <Stethoscope size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '10px' }} />
              Symptom Check
            </h1>
            <p className="card-desc">
              Select <strong>all symptoms</strong> you're currently experiencing for the most accurate prediction. We've customized options based on your medical history.
            </p>
          </div>

          <form onSubmit={handleFinish} id="symptoms-form">
            {/* General symptoms — always shown */}
            <p className="form-label" style={{ marginBottom: '12px' }}>Common Symptoms</p>
            <div className="chip-group">
              {generalSymptoms.map(s => (
                <button
                  type="button"
                  key={s.id}
                  className={`chip ${symptoms.includes(s.id) ? 'selected' : ''}`}
                  onClick={() => toggleSymptom(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Heart / Blood Pressure */}
            {showHeart && (
              <>
                <p className="form-label" style={{ marginBottom: '12px', color: 'var(--clr-danger)' }}>
                  ❤️ Cardiovascular Symptoms
                </p>
                <div className="chip-group">
                  {heartSymptoms.map(s => (
                    <button
                      type="button"
                      key={s.id}
                      className={`chip conditional ${symptoms.includes(s.id) ? 'selected' : ''}`}
                      onClick={() => toggleSymptom(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Diabetes */}
            {showDiabetes && (
              <>
                <p className="form-label" style={{ marginBottom: '12px', color: 'var(--clr-accent)' }}>
                  🩸 Diabetes-Related Symptoms
                </p>
                <div className="chip-group">
                  {diabetesSymptoms.map(s => (
                    <button
                      type="button"
                      key={s.id}
                      className={`chip conditional ${symptoms.includes(s.id) ? 'selected' : ''}`}
                      onClick={() => toggleSymptom(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Thyroid */}
            {showThyroid && (
              <>
                <p className="form-label" style={{ marginBottom: '12px', color: 'var(--clr-warning)' }}>
                  🦋 Thyroid-Related Symptoms
                </p>
                <div className="chip-group">
                  {thyroidSymptoms.map(s => (
                    <button
                      type="button"
                      key={s.id}
                      className={`chip conditional ${symptoms.includes(s.id) ? 'selected' : ''}`}
                      onClick={() => toggleSymptom(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Allergies / Asthma */}
            {showAllergy && (
              <>
                <p className="form-label" style={{ marginBottom: '12px', color: 'var(--clr-accent)' }}>
                  🫁 Allergy & Respiratory Symptoms
                </p>
                <div className="chip-group">
                  {allergySymptoms.map(s => (
                    <button
                      type="button"
                      key={s.id}
                      className={`chip conditional ${symptoms.includes(s.id) ? 'selected' : ''}`}
                      onClick={() => toggleSymptom(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Autoimmune */}
            {showAutoimmune && (
              <>
                <p className="form-label" style={{ marginBottom: '12px', color: 'var(--clr-danger)' }}>
                  🧬 Autoimmune-Related Symptoms
                </p>
                <div className="chip-group">
                  {autoImmuneSymptoms.map(s => (
                    <button
                      type="button"
                      key={s.id}
                      className={`chip conditional ${symptoms.includes(s.id) ? 'selected' : ''}`}
                      onClick={() => toggleSymptom(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* No specific history */}
            {showOther && (
              <>
                <p className="form-label" style={{ marginBottom: '12px', color: 'var(--clr-text-secondary)' }}>
                  Additional Symptoms
                </p>
                <div className="chip-group">
                  {otherSymptoms.map(s => (
                    <button
                      type="button"
                      key={s.id}
                      className={`chip ${symptoms.includes(s.id) ? 'selected' : ''}`}
                      onClick={() => toggleSymptom(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Selection summary */}
            <div style={{
              padding: '12px 16px',
              background: 'var(--clr-bg)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '8px',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--clr-text-secondary)',
            }}>
              Selected: <strong style={{ color: 'var(--clr-text)' }}>{symptoms.length}</strong>
              {symptoms.length > 0 && (
                <span> — {symptoms.map(s => s.replace(/_/g, ' ')).join(', ')}</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-block" id="symptoms-submit">
              View My Results →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
