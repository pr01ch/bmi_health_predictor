import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Heart, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <nav className="navbar" id="main-nav">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <Heart size={28} strokeWidth={2.5} />
          <span>VitalCheck</span>
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li>
            <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/assess" className={isActive('/assess')} onClick={() => setMenuOpen(false)}>
              Health Assessment
            </Link>
          </li>
          <li>
            <Link
              to="/assess"
              className="nav-cta"
              onClick={() => setMenuOpen(false)}
            >
              Start Checkup
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
