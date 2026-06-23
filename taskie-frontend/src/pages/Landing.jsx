import { Link } from 'react-router-dom'
import Highlighter from '../components/common/Highlighter'
import InfinityIcon from '../components/common/InfinityIcon'
import ShaderAnimation from '../components/common/ShaderAnimation'

export default function Landing() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#000', position: 'relative', overflow: 'hidden' }}
    >
      <ShaderAnimation />
      <ShaderAnimation />
      {/* Logo */}
      {/* Logo */}
<div style={{ marginBottom: '32px', position: 'relative', zIndex: 1 }}>
  <InfinityIcon size={98} color="#ff4d00" strokeWidth={2.5} />
</div>

      {/* Headline */}
      <h1
  className="text-center"
  style={{
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontSize: '92px',
    fontWeight: 900,
    color: '#f0f0f0',
    letterSpacing: '-1.5px',
    lineHeight: 1.15,
    maxWidth: '760px',
    marginBottom: '20px',
    position: 'relative', zIndex: 1,
  }}
>
        <Highlighter action="underline" color="#ff4d00" delay={300}>
          SYNQ
        </Highlighter>
        ronize your life with{' '}
        <Highlighter action="highlight" color="#ff0000" delay={800}>
          SYNQ
        </Highlighter>
      </h1>

      {/* Subtext */}
      <p
  style={{
    fontFamily: 'Inter, sans-serif',
    fontSize: '16px',
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    maxWidth: '460px',
    marginBottom: '40px',
    lineHeight: 1.6,
    position: 'relative', zIndex: 1,
  }}
>
        SYNQ keeps your life in sync. 
      </p>

      {/* CTA */}
      {/* CTA */}
<div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
        <Link
  to="/showcase"
  style={{
    padding: '13px 28px',
    borderRadius: '10px',
    backgroundColor: '#ff4d00',
    color: 'white',
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontWeight: 700,
    fontSize: '14px',
    textDecoration: 'none',
    transition: 'opacity 0.2s',
  }}
  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
>
  Get Started →
</Link>
        <Link
          to="/login"
          style={{
            padding: '13px 28px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            textDecoration: 'none',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
          }}
        >
          Log in
        </Link>
      </div>
    </div>
  )
}
