import React from 'react'
import DotMatrixLoader from './DotMatrixLoader'
import { useTheme } from '../../context/ThemeContext'

export default function LoadingSplash({ label = 'Loading...' }) {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const subtle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      gap: '16px',
    }}>
      <DotMatrixLoader size={56} dotSize={7} color="#ff4d00" speed={1.2} />
      <span style={{
        fontSize: '13px',
        color: subtle,
        fontFamily: 'Inter, sans-serif',
      }}>
        {label}
      </span>
    </div>
  )
}
