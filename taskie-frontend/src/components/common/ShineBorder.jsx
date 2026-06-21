export default function ShineBorder({
  shineColor = ['#ff4d00', '#ff8a4d', '#ffb37b'],
  borderWidth = 1,
  duration = 8,
}) {
  const gradient = `linear-gradient(90deg, ${shineColor.join(', ')}, ${shineColor[0]})`

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        padding: `${borderWidth}px`,
        background: gradient,
        backgroundSize: '300% 300%',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        animation: `shine-move ${duration}s linear infinite`,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <style>{`
        @keyframes shine-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  )
}
