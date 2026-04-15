import { Check } from 'lucide-react'

const steps = [
  { label: 'Body Metrics' },
  { label: 'Lifestyle' },
  { label: 'Symptoms' },
  { label: 'Results' },
]

export default function Stepper({ currentStep }) {
  return (
    <div className="stepper" id="progress-stepper">
      {steps.map((step, i) => {
        const stepNum = i + 1
        const isDone = stepNum < currentStep
        const isActive = stepNum === currentStep

        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`stepper-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
              <div className="stepper-dot">
                {isDone ? <Check size={18} strokeWidth={3} /> : stepNum}
              </div>
              <span className="stepper-label">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`stepper-line ${isDone ? 'done' : ''}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
