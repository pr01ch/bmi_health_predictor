import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Heart size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
          VitalCheck
        </div>
        <ul className="footer-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="mailto:support@vitalcheck.app">Contact</a></li>
        </ul>
        <p className="footer-copy">
          © {new Date().getFullYear()} VitalCheck. For educational purposes only. Not a substitute for professional medical advice.
        </p>
      </div>
    </footer>
  )
}
