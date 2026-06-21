import { useEffect, useRef, useState } from 'react'

export default function Highlighter({
  children,
  action = 'highlight', // 'highlight' | 'underline'
  color = '#ff4d00',
  delay = 0,
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  if (action === 'underline') {
    return (
      <span ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
        <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
        <svg
          style={{
            position: 'absolute', left: 0, bottom: '-4px',
            width: '100%', height: '8px', overflow: 'visible',
          }}
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
        >
          <path
            d="M2 6 Q 25 2, 50 5 T 98 4"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              strokeDasharray: 110,
              strokeDashoffset: visible ? 0 : 110,
              transition: 'stroke-dashoffset 0.7s ease-out',
            }}
          />
        </svg>
      </span>
    )
  }

  // action === 'highlight'
  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-block', padding: '0 2px' }}>
      <span
        style={{
          position: 'absolute',
          left: 0, top: '8%', bottom: '8%',
          width: visible ? '100%' : '0%',
          backgroundColor: color,
          opacity: 0.35,
          borderRadius: '3px',
          transition: 'width 0.6s ease-out',
          zIndex: 0,
        }}
      />
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </span>
  )
}
