import { useEffect, useState } from 'react'

export default function DotMatrixLoader({ size = 48, dotSize = 6, color = '#ff4d00', speed = 1.2 }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, (speed * 1000) / 16)
    return () => clearInterval(interval)
  }, [speed])

  const n = 5
  const center = Math.floor(n / 2)
  const gap = Math.max(1, Math.floor((size - dotSize * n) / (n - 1)))

  const dots = []
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const dist = Math.abs(row - center) + Math.abs(col - center) // manhattan distance
      const phase = (tick * 0.15 - dist * 0.6) % (Math.PI * 2)
      const wave = (Math.sin(phase) + 1) / 2 // 0..1
      const opacity = 0.15 + wave * 0.85
      dots.push({ row, col, opacity })
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${n}, ${dotSize}px)`,
        gridTemplateRows: `repeat(${n}, ${dotSize}px)`,
        gap: `${gap}px`,
        width: size,
        height: size,
      }}
    >
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '2px',
            backgroundColor: color,
            opacity: d.opacity,
            transition: 'opacity 0.05s linear',
          }}
        />
      ))}
    </div>
  )
}
