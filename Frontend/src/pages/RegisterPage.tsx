import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerApi } from '@/api/auth'

export function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await registerApi(username, password)
      navigate('/workspace')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={logoContainerStyle}>
          <span className="material-symbols-outlined" style={logoIconStyle}>shield_gavel</span>
          <h2 style={titleStyle}>Join GovDoc Intellisense</h2>
          <p style={subtitleStyle}>Create an account to start analyzing documents</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          {error && <div style={errorStyle}>{error}</div>}

          <div style={inputGroupStyle}>
            <label style={labelStyle} htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle} htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            style={loading ? { ...buttonStyle, opacity: 0.7, cursor: 'not-allowed' } : buttonStyle}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <div style={footerStyle}>
          <p>Already have an account? <Link to="/login" style={linkStyle}>Sign In</Link></p>
        </div>
      </div>
    </div>
  )
}

// Inline CSS using the exact GovDoc theme tokens
const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#ece9df', // --sand-100 fallback
  backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(220, 225, 219, 0.4) 0%, rgba(206, 213, 203, 0.4) 81.3%)',
  fontFamily: "'Inter', sans-serif",
  padding: '16px',
}

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  backgroundColor: '#f7f6f3', // --paper
  padding: '40px 32px',
  borderRadius: '16px',
  border: '1px solid #d9ddd9', // --line
  boxShadow: '0 8px 30px rgba(48, 64, 61, 0.15)', // --ink-800 themed shadow
  display: 'flex',
  flexDirection: 'column',
}

const logoContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '32px',
}

const logoIconStyle: React.CSSProperties = {
  fontSize: '48px',
  color: '#1e6558', // --action-700
  marginBottom: '12px',
}

const titleStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#202927', // --ink-900
  margin: '0 0 6px 0',
}

const subtitleStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#5f746e', // --ink-600
  margin: 0,
}

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
}

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
}

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#475c57', // --ink-700
}

const inputStyle: React.CSSProperties = {
  padding: '12px 14px',
  fontSize: '14px',
  borderRadius: '8px',
  border: '1px solid #d9ddd9', // --line
  backgroundColor: '#ffffff',
  color: '#202927',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const errorStyle: React.CSSProperties = {
  backgroundColor: '#fde8e8',
  color: '#9b1c1c',
  padding: '10px 14px',
  borderRadius: '8px',
  fontSize: '13px',
  border: '1px solid #f8b4b4',
}

const buttonStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '15px',
  fontWeight: 600,
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#1e6558', // --action-700
  color: '#ffffff',
  cursor: 'pointer',
  transition: 'background-color 0.2s, transform 0.1s',
  marginTop: '8px',
  boxShadow: '0 4px 12px rgba(30, 101, 88, 0.2)',
}

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '24px',
  fontSize: '13px',
  color: '#5f746e', // --ink-600
}

const linkStyle: React.CSSProperties = {
  color: '#1e6558',
  fontWeight: 600,
  textDecoration: 'none',
}
