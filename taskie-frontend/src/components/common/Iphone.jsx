export default function Iphone({ width = 300, children }) {
  const height = width * 2.05

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg
        viewBox="0 0 300 612"
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      >
        <defs>
          {/* Titanium-style bezel gradient */}
          <linearGradient id="bezelEdge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5a5a5e" />
            <stop offset="8%" stopColor="#1c1c1e" />
            <stop offset="50%" stopColor="#0a0a0b" />
            <stop offset="92%" stopColor="#1c1c1e" />
            <stop offset="100%" stopColor="#4a4a4e" />
          </linearGradient>
          <linearGradient id="bodyFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c2c2e" />
            <stop offset="100%" stopColor="#0e0e0f" />
          </linearGradient>
          <radialGradient id="screenSheen" cx="30%" cy="0%" r="80%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Outer titanium frame */}
        <rect x="0" y="0" width="300" height="612" rx="46" fill="url(#bezelEdge)" />
        {/* Inner body */}
        <rect x="4" y="4" width="292" height="604" rx="42" fill="url(#bodyFill)" />
        {/* Screen black base */}
        <rect x="10" y="10" width="280" height="592" rx="38" fill="#000" />
        {/* Screen sheen overlay */}
        <rect x="10" y="10" width="280" height="592" rx="38" fill="url(#screenSheen)" />

        {/* Side buttons */}
        <rect x="-2" y="118" width="3" height="24" rx="1.5" fill="#1a1a1a" />
        <rect x="-2" y="156" width="3" height="46" rx="1.5" fill="#1a1a1a" />
        <rect x="-2" y="212" width="3" height="46" rx="1.5" fill="#1a1a1a" />
        <rect x="299" y="152" width="3" height="58" rx="1.5" fill="#1a1a1a" />
      </svg>

      {/* Screen content */}
      <div style={{
        position: 'absolute',
        top: `${(10 / 612) * 100}%`,
        left: `${(10 / 300) * 100}%`,
        width: `${(280 / 300) * 100}%`,
        height: `${(592 / 612) * 100}%`,
        borderRadius: `${(38 / 300) * width}px`,
        overflow: 'hidden',
        backgroundColor: '#000',
        zIndex: 1,
      }}>
        {children}
      </div>

      {/* Dynamic island */}
      <div style={{
        position: 'absolute',
        top: `${(22 / 612) * 100}%`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${(96 / 300) * 100}%`,
        height: `${(26 / 612) * 100}%`,
        backgroundColor: '#000',
        borderRadius: '100px',
        zIndex: 2,
      }} />
    </div>
  )
}
