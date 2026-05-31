import { useNavigate } from 'react-router-dom'

type UnderConstructionPageProps = {
  featureNameVi: string
  featureNameEn: string
}

export function UnderConstructionPage({ featureNameVi, featureNameEn }: UnderConstructionPageProps) {
  const navigate = useNavigate()
  const lang = localStorage.getItem('govdoc.lang') || 'vi'

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={iconStyle}>
          <span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>
            construction
          </span>
        </div>
        <h2 style={titleStyle}>
          {lang === 'vi' ? `Tính năng ${featureNameVi}` : `${featureNameEn} Feature`}
        </h2>
        <p style={descStyle}>
          {lang === 'vi'
            ? 'Tính năng này đang tiếp tục được phát triển và tối ưu. Vui lòng quay lại sau!'
            : 'This feature is currently under development and optimization. Please check back later!'}
        </p>

        <div style={mockInterfaceStyle}>
          <div style={mockLineStyle} />
          <div style={{ ...mockLineStyle, width: '70%' }} />
          <div style={{ ...mockLineStyle, width: '40%' }} />
          <div style={glowBallStyle} />
        </div>

        <button type="button" style={btnStyle} onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
            arrow_back
          </span>
          {lang === 'vi' ? 'Quay lại Trang tổng quan' : 'Back to Dashboard'}
        </button>
      </div>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f8f9fa',
  backgroundImage:
    'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
  backgroundSize: '24px 24px',
  fontFamily: 'inherit',
  padding: '1.5rem',
}

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '480px',
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(12px)',
  borderRadius: '1.25rem',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
  padding: '2.5rem 2rem',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
}

const iconStyle: React.CSSProperties = {
  width: '5.5rem',
  height: '5.5rem',
  borderRadius: '50%',
  background: 'rgba(0, 104, 95, 0.08)',
  color: '#00685f',
  display: 'grid',
  placeItems: 'center',
  marginBottom: '1.5rem',
  animation: 'pulse 2s infinite ease-in-out',
}

const titleStyle: React.CSSProperties = {
  margin: '0 0 0.75rem',
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#1e293b',
}

const descStyle: React.CSSProperties = {
  margin: '0 0 2rem',
  fontSize: '0.9rem',
  lineHeight: 1.6,
  color: '#64748b',
}

const mockInterfaceStyle: React.CSSProperties = {
  width: '100%',
  height: '110px',
  background: '#f8fafc',
  border: '1px dashed #cbd5e1',
  borderRadius: '0.75rem',
  padding: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.65rem',
  position: 'relative',
  marginBottom: '2rem',
  overflow: 'hidden',
}

const mockLineStyle: React.CSSProperties = {
  height: '8px',
  background: '#e2e8f0',
  borderRadius: '4px',
}

const glowBallStyle: React.CSSProperties = {
  position: 'absolute',
  width: '40px',
  height: '40px',
  background: 'radial-gradient(circle, rgba(137, 245, 231, 0.6) 0%, rgba(0, 104, 95, 0) 70%)',
  borderRadius: '50%',
  bottom: '-10px',
  right: '20px',
}

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45rem',
  border: '0',
  borderRadius: '0.75rem',
  padding: '0.75rem 1.25rem',
  background: 'linear-gradient(140deg, #00685f, #0d9488)',
  color: '#ffffff',
  fontWeight: '600',
  fontSize: '0.88rem',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0, 104, 95, 0.2)',
  transition: 'transform 0.2s',
}
