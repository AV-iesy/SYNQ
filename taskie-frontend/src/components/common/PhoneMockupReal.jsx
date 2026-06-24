import phoneMockup from '../../assets/phone-mockup.png'

export default function PhoneMockupReal({ width = 320, children }) {
  const aspectRatio = 855 / 700
  const height = width * aspectRatio

  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Screen content sits behind the phone+hand image */}
      <div style={{
        position: 'absolute',
        left: '28%',
        top: '11.5%',
        width: '46%',
        height: '72%',
        borderRadius: `${width * 0.045}px`,
        overflow: 'hidden',
        backgroundColor: '#000',
        zIndex: 1,
      }}>
        {children}
      </div>

      {/* Hand + phone frame on top, transparent background, transparent screen cutout */}
      <img
        src={phoneMockup}
        alt=""
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
