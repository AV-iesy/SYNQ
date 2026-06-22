export default function ProgressiveBlur({ position = 'bottom', height = '15%' }) {
  const isBottom = position === 'bottom'

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        [isBottom ? 'bottom' : 'top']: 0,
        height,
        pointerEvents: 'none',
        zIndex: 5,
        background: isBottom
          ? 'linear-gradient(to bottom, transparent 0%, rgba(22,22,22,0.4) 50%, rgba(22,22,22,0.9) 100%)'
          : 'linear-gradient(to top, transparent 0%, rgba(22,22,22,0.4) 50%, rgba(22,22,22,0.9) 100%)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        maskImage: isBottom
          ? 'linear-gradient(to bottom, transparent 0%, black 100%)'
          : 'linear-gradient(to top, transparent 0%, black 100%)',
        WebkitMaskImage: isBottom
          ? 'linear-gradient(to bottom, transparent 0%, black 100%)'
          : 'linear-gradient(to top, transparent 0%, black 100%)',
      }}
    />
  )
}
