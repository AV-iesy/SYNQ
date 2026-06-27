import phoneMockup from '../../assets/phone-mockup.png'

export default function PhoneMockupReal({ width = 320, children }) {
  const aspectRatio = 855 / 700
  const height = width * aspectRatio

  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Screen content sits behind the phone+hand image, visible through the real cutout */}
      <div style={{
        position: 'absolute',
        left: '28.3%',
        top: '11.6%',
        width: '45.2%',
        height: '71.5%',
        borderRadius: `${width * 0.05}px`,
        overflow: 'hidden',
        backgroundColor: '#000',
        zIndex: 1,
      }}>
        {children}
      </div>

      {/* Hand + phone frame with real transparent screen cutout */}
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