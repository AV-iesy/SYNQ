export default function Iphone({ width = 280, children }) {
  const height = width * 2.04

  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Outer body with metallic gradient */}
      <svg
        viewBox="0 0 433 882"
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      >
        <defs>
          <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a4a4a" />
            <stop offset="15%" stopColor="#1a1a1a" />
            <stop offset="50%" stopColor="#0a0a0a" />
            <stop offset="85%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#3a3a3a" />
          </linearGradient>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </linearGradient>
        </defs>

        {/* Outer shell */}
        <rect x="0" y="0" width="433" height="882" rx="62" fill="url(#bezelGrad)" />
        {/* Inner body */}
        <rect x="6" y="6" width="421" height="870" rx="56" fill="url(#bodyGrad)" />
        {/* Screen cutout (black) */}
        <rect x="14" y="14" width="405" height="854" rx="50" fill="#000" />

        {/* Side buttons */}
        <rect x="-2" y="160" width="4" height="34" rx="2" fill="#1f1f1f" />
        <rect x="-2" y="212" width="4" height="64" rx="2" fill="#1f1f1f" />
        <rect x="-2" y="292" width="4" height="64" rx="2" fill="#1f1f1f" />
        <rect x="431" y="220" width="4" height="84" rx="2" fill="#1f1f1f" />
      </svg>

      {/* Screen content */}
      <div style={{
        position: 'absolute',
        top: `${(14 / 882) * 100}%`,
        left: `${(14 / 433) * 100}%`,
        width: `${(405 / 433) * 100}%`,
        height: `${(854 / 882) * 100}%`,
        borderRadius: `${(50 / 433) * width}px`,
        overflow: 'hidden',
        backgroundColor: '#000',
        zIndex: 1,
      }}>
        {children}
      </div>

      {/* Dynamic island */}
      <div style={{
        position: 'absolute',
        top: `${(30 / 882) * 100}%`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${(130 / 433) * 100}%`,
        height: `${(32 / 882) * 100}%`,
        backgroundColor: '#000',
        borderRadius: '100px',
        zIndex: 2,
      }} />
    </div>
  )
}
