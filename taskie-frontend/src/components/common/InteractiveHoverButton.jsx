import { useState } from 'react'

export default function InteractiveHoverButton({
  children,
  onClick,
  color = '#ff4d00',
  dark = true,
  style = {},
}) {
  const [hovered, setHovered] = useState(false)

  const baseBg = dark ? 'rgba(255,77,0,0.08)' : 'rgba(255,77,0,0.06)'
  const baseBorder = 'rgba(255,77,0,0.2)'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        padding: '9px 14px 9px 28px',
        borderRadius: '8px',
        border: `1px solid ${baseBorder}`,
        backgroundColor: baseBg,
        cursor: 'pointer',
        overflow: 'hidden',
        textAlign: 'left',
        transition: 'border-color 0.3s',
        ...style,
      }}
    >
      {/* Growing dot */}
      <span
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          width: hovered ? '180%' : '6px',
          height: hovered ? '180%' : '6px',
          borderRadius: '50%',
          backgroundColor: color,
          transform: hovered ? 'translate(-15%, -50%) scale(1)' : 'translate(0, -50%) scale(1)',
          transition: 'width 0.4s ease, height 0.4s ease, transform 0.4s ease',
          zIndex: 0,
        }}
      />

      {/* Text — default state */}
      <span
        style={{
          position: 'relative',
          display: 'inline-block',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          color: hovered ? 'transparent' : color,
          transform: hovered ? 'translateX(6px)' : 'translateX(0)',
          opacity: hovered ? 0 : 1,
          transition: 'opacity 0.25s ease, transform 0.3s ease, color 0.25s ease',
          zIndex: 1,
        }}
      >
        {children}
      </span>

      {/* Text — hover state (white, slides in from left) */}
      <span
        style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: hovered ? 'translate(0, -50%)' : 'translate(-10px, -50%)',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          color: 'white',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.25s ease 0.05s, transform 0.3s ease 0.05s',
          zIndex: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </span>
    </button>
  )
}
