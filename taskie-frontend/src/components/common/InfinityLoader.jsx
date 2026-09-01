export default function InfinityLoader({ size = 64, color = '#ff4d00', trackColor = 'rgba(255,77,0,0.15)', dotSize = 1.2, speed = 5.8 }) {
  const pathId = 'infinity-path'

  return (
    <svg
      width={size}
      height={size}
      viewBox="-2 -2 28 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Track (faint infinity outline) */}
      <path
        id={pathId}
        fill="none"
        stroke={trackColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 16c5 0 7-8 12-8a4 4 0 0 1 0 8c-5 0-7-8-12-8a4 4 0 1 0 0 8"
      />

      {/* Moving dot */}
      <circle r={dotSize} fill={color}>
        <animateMotion
          dur={`${speed}s`}
          repeatCount="indefinite"
          rotate="auto"
        >
          <mpath xlinkHref={`#${pathId}`} />
        </animateMotion>
      </circle>
    </svg>
  )
}
