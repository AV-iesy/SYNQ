import { useState, useRef, useEffect, useCallback } from 'react'
import AppLayout from '../components/common/AppLayout'
import { useTheme } from '../context/ThemeContext'

// ── Minimal scroll wheel ───────────────────────────────────────
function WheelPicker({ value, onChange, options, width = 56 }) {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const itemH = 36
  const ref = useRef(null)
  const text = dark ? '#f0f0f0' : '#0a0a0a'
  const subtle = dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'
  const faint = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const currentIndex = options.indexOf(value)

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = currentIndex * itemH
    }
  }, [])

  const handleScroll = () => {
    if (!ref.current) return
    const index = Math.round(ref.current.scrollTop / itemH)
    const clamped = Math.max(0, Math.min(options.length - 1, index))
    if (options[clamped] !== value) onChange(options[clamped])
  }

  return (
    <div style={{ position: 'relative', width, flexShrink: 0 }}>
      {/* top fade */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: itemH * 2, zIndex: 2, pointerEvents: 'none',
        background: dark
          ? 'linear-gradient(to bottom, rgba(14,14,14,1) 0%, transparent 100%)'
          : 'linear-gradient(to bottom, rgba(250,250,250,1) 0%, transparent 100%)',
      }} />
      {/* bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: itemH * 2, zIndex: 2, pointerEvents: 'none',
        background: dark
          ? 'linear-gradient(to top, rgba(14,14,14,1) 0%, transparent 100%)'
          : 'linear-gradient(to top, rgba(250,250,250,1) 0%, transparent 100%)',
      }} />
      {/* selection line */}
      <div style={{
        position: 'absolute', top: itemH * 2, left: 0, right: 0, height: itemH,
        borderTop: `1px solid ${faint}`,
        borderBottom: `1px solid ${faint}`,
        zIndex: 1, pointerEvents: 'none',
      }} />
      {/* scroll */}
      <div
        ref={ref}
        onScroll={handleScroll}
        style={{
          height: itemH * 5,
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
        }}
      >
        <style>{`.synq-wheel::-webkit-scrollbar{display:none}`}</style>
        <div className="synq-wheel" style={{ height: itemH * 2 }} />
        {options.map((opt, i) => {
          const dist = Math.abs(i - currentIndex)
          return (
            <div
              key={opt}
              onClick={() => {
                onChange(opt)
                if (ref.current) ref.current.scrollTo({ top: i * itemH, behavior: 'smooth' })
              }}
              style={{
                height: itemH,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: dist === 0 ? 500 : 400,
                color: dist === 0 ? text : subtle,
                opacity: dist === 0 ? 1 : dist === 1 ? 0.6 : 0.25,
                scrollSnapAlign: 'center',
                cursor: 'pointer',
                transition: 'opacity 0.1s',
                letterSpacing: '-0.3px',
              }}
            >
              {opt}
            </div>
          )
        })}
        <div style={{ height: itemH * 2 }} />
      </div>
    </div>
  )
}

// ── Time Picker ────────────────────────────────────────────────
function TimePicker({ label, value, onChange }) {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const faint = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const subtle = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
  const text = dark ? '#f0f0f0' : '#0a0a0a'

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
  const periods = ['AM', 'PM']

  const parse = (v) => {
    const [h24, m] = v.split(':').map(Number)
    const period = h24 >= 12 ? 'PM' : 'AM'
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12
    return { hour: String(h12).padStart(2, '0'), minute: String(m).padStart(2, '0'), period }
  }

  const to24 = (hour, minute, period) => {
    let h = parseInt(hour)
    if (period === 'AM' && h === 12) h = 0
    if (period === 'PM' && h !== 12) h += 12
    return `${String(h).padStart(2, '0')}:${minute}`
  }

  const { hour, minute, period } = parse(value)

  return (
    <div>
      <div style={{
        fontSize: '10px', fontFamily: 'Inter, sans-serif', color: subtle,
        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px',
      }}>
        {label}
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0px',
        border: `1px solid ${faint}`,
        borderRadius: '12px',
        padding: '4px 12px',
        backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        overflow: 'hidden',
      }}>
        <WheelPicker value={hour} options={hours} width={44}
          onChange={h => onChange(to24(h, minute, period))} />
        <div style={{ fontSize: '16px', color: subtle, paddingBottom: '2px', userSelect: 'none' }}>:</div>
        <WheelPicker value={minute} options={minutes} width={44}
          onChange={m => onChange(to24(hour, m, period))} />
        <div style={{ width: '1px', height: '24px', backgroundColor: faint, margin: '0 6px' }} />
        <WheelPicker value={period} options={periods} width={40}
          onChange={p => onChange(to24(hour, minute, p))} />
      </div>
    </div>
  )
}

// ── Mock generator ─────────────────────────────────────────────
const mockGenerate = (form) => {
  const blocks = []
  const [wH, wM] = form.wakeTime.split(':').map(Number)

  const addBlock = (hour, min, label, tag) => {
    const h = String(hour).padStart(2, '0')
    const m = String(min).padStart(2, '0')
    const endH = min >= 30 ? hour + 1 : hour
    const endM = min >= 30 ? '00' : '30'
    blocks.push({ time: `${h}:${m}`, endTime: `${String(endH).padStart(2, '0')}:${endM}`, label, tag })
  }

  if (form.gymEnabled && form.gymTime === 'morning') {
    addBlock(wH, wM, 'Morning Gym', 'workout')
    addBlock(wH + 1, 15, 'Breakfast', 'meal')
  } else {
    addBlock(wH, wM, 'Breakfast', 'meal')
  }
  if (form.classStart) {
    const [cH, cM] = form.classStart.split(':').map(Number)
    addBlock(cH, cM, form.classLabel || 'Classes / Office', 'work')
  }
  if (form.studyTopics) addBlock(17, 0, `Study — ${form.studyTopics}`, 'study')
  if (form.gymEnabled && form.gymTime === 'evening') addBlock(18, 30, 'Evening Gym', 'workout')
  addBlock(19, 30, 'Dinner', 'meal')
  if (form.waterGoal) addBlock(20, 30, `Water — ${form.waterGoal}L goal`, 'water')
  const [sH, sM] = form.sleepTime.split(':').map(Number)
  addBlock(sH, sM, 'Sleep', 'rest')
  return blocks
}

const tagColors = {
  workout: '#c9944a', meal: '#5aad7a', work: '#4a90d9',
  study: '#8b6bc7', water: '#4a9fd9', rest: '#555', free: '#888',
}

export default function Planner() {
  const { theme } = useTheme()
  const dark = theme === 'dark'

  const [form, setForm] = useState({
    wakeTime: '06:00', sleepTime: '22:30',
    classStart: '09:00', classEnd: '17:00',
    classLabel: 'Classes / Office',
    gymEnabled: false, gymTime: 'morning',
    studyTopics: '', studyHours: '2',
    waterGoal: '3', mode: 'weekday',
  })
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(false)

  const text = dark ? '#f0f0f0' : '#0a0a0a'
  const subtle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
  const faint = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
  const hoverBorder = dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)'
  const inputBg = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'

  const handle = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const generate = async (e) => {
    e?.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setSchedule(mockGenerate(form))
    setLoading(false)
  }

  const card = (extra = {}) => ({
    backgroundColor: cardBg, border: `1px solid ${faint}`,
    borderRadius: '16px', padding: '24px', ...extra,
  })

  const labelStyle = {
    fontSize: '10px', fontFamily: 'Inter, sans-serif', color: subtle,
    textTransform: 'uppercase', letterSpacing: '1px',
    marginBottom: '8px', display: 'block',
  }

  const sectionTitle = {
    fontFamily: 'Inter, sans-serif', fontSize: '12px',
    fontWeight: 500, color: subtle, letterSpacing: '0.5px',
    textTransform: 'uppercase', marginBottom: '20px',
    paddingBottom: '10px', borderBottom: `1px solid ${faint}`,
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    fontSize: '13px', fontFamily: 'Inter, sans-serif',
    backgroundColor: inputBg, border: `1px solid ${faint}`,
    color: text, outline: 'none',
  }

  const chipBtn = (active) => ({
    flex: 1, padding: '10px 0', borderRadius: '10px',
    fontSize: '13px', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
    border: `1px solid ${active ? hoverBorder : faint}`,
    backgroundColor: active ? inputBg : 'transparent',
    color: active ? text : subtle, transition: 'all 0.15s',
  })

  return (
    <AppLayout>
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>
          AI Schedule Generator
        </p>
        <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '28px', fontWeight: 600, color: text, letterSpacing: '-0.5px' }}>
          Plan your day
        </h1>
      </div>

      {!schedule ? (
        <form onSubmit={generate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* LEFT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Sleep */}
              <div style={card()}>
                <div style={sectionTitle}>Sleep Schedule</div>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <TimePicker label="Wake up" value={form.wakeTime}
                    onChange={v => setForm(f => ({ ...f, wakeTime: v }))} />
                  <TimePicker label="Sleep time" value={form.sleepTime}
                    onChange={v => setForm(f => ({ ...f, sleepTime: v }))} />
                </div>
              </div>

              {/* Classes */}
              <div style={card()}>
                <div style={sectionTitle}>Classes / Work</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Label</label>
                    <input type="text" name="classLabel" value={form.classLabel}
                      onChange={handle} placeholder="e.g. College, Office" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = hoverBorder}
                      onBlur={e => e.target.style.borderColor = faint} />
                  </div>
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <TimePicker label="Start" value={form.classStart}
                      onChange={v => setForm(f => ({ ...f, classStart: v }))} />
                    <TimePicker label="End" value={form.classEnd}
                      onChange={v => setForm(f => ({ ...f, classEnd: v }))} />
                  </div>
                </div>
              </div>

              {/* Gym */}
              <div style={card()}>
                <div style={sectionTitle}>Gym</div>
                <div
                  onClick={() => setForm(f => ({ ...f, gymEnabled: !f.gymEnabled }))}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: form.gymEnabled ? '16px' : 0 }}
                >
                  <div style={{
                    width: '34px', height: '18px', borderRadius: '100px',
                    backgroundColor: form.gymEnabled ? '#5aad7a' : faint,
                    border: `1px solid ${form.gymEnabled ? '#5aad7a' : hoverBorder}`,
                    position: 'relative', transition: 'all 0.2s', flexShrink: 0,
                  }}>
                    <div style={{
                      width: '12px', height: '12px', borderRadius: '50%',
                      backgroundColor: 'white', position: 'absolute', top: '2px',
                      left: form.gymEnabled ? '18px' : '2px', transition: 'left 0.2s',
                    }} />
                  </div>
                  <span style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif', color: text }}>
                    Include gym session
                  </span>
                </div>
                {form.gymEnabled && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['morning', 'evening'].map(t => (
                      <button key={t} type="button"
                        onClick={() => setForm(f => ({ ...f, gymTime: t }))}
                        style={{ ...chipBtn(form.gymTime === t), textTransform: 'capitalize' }}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Study */}
              <div style={card()}>
                <div style={sectionTitle}>Study</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>What to study</label>
                    <input type="text" name="studyTopics" value={form.studyTopics}
                      onChange={handle} placeholder="e.g. DSA, Physics, React" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = hoverBorder}
                      onBlur={e => e.target.style.borderColor = faint} />
                  </div>
                  <div>
                    <label style={labelStyle}>Hours per day</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['1', '2', '3', '4', '5'].map(h => (
                        <button key={h} type="button"
                          onClick={() => setForm(f => ({ ...f, studyHours: h }))}
                          style={chipBtn(form.studyHours === h)}>
                          {h}h
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Water */}
              <div style={card()}>
                <div style={sectionTitle}>Water Goal</div>
                <label style={labelStyle}>Daily intake (litres)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['1.5', '2', '2.5', '3', '3.5'].map(w => (
                    <button key={w} type="button"
                      onClick={() => setForm(f => ({ ...f, waterGoal: w }))}
                      style={{ ...chipBtn(form.waterGoal === w), fontSize: '12px' }}>
                      {w}L
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode */}
              <div style={card()}>
                <div style={sectionTitle}>Schedule Mode</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['weekday', 'weekend'].map(m => (
                    <button key={m} type="button"
                      onClick={() => setForm(f => ({ ...f, mode: m }))}
                      style={{ ...chipBtn(form.mode === m), textTransform: 'capitalize', padding: '12px' }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate */}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '16px', borderRadius: '12px',
                fontSize: '15px', fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 600, letterSpacing: '-0.3px',
                backgroundColor: dark ? '#f0f0f0' : '#0a0a0a',
                color: dark ? '#080808' : '#fafafa',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
              }}>
                {loading ? 'Generating...' : 'Generate Schedule'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '2px' }}>
                {form.mode === 'weekday' ? 'Weekday' : 'Weekend'} schedule
              </p>
              <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '20px', fontWeight: 600, color: text, letterSpacing: '-0.5px' }}>
                Your AI-generated schedule
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setSchedule(null)} style={{
                padding: '10px 20px', borderRadius: '10px', fontSize: '13px',
                fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                backgroundColor: 'transparent', border: `1px solid ${faint}`, color: subtle,
              }}>
                Edit inputs
              </button>
              <button onClick={generate} style={{
                padding: '10px 20px', borderRadius: '10px', fontSize: '13px',
                fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                border: `1px solid ${faint}`, color: text,
              }}>
                Regenerate
              </button>
              <button style={{
                padding: '10px 20px', borderRadius: '10px', fontSize: '13px',
                fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: dark ? '#f0f0f0' : '#0a0a0a',
                color: dark ? '#080808' : '#fafafa', border: 'none',
              }}>
                Save to Dashboard
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {schedule.map((block, i) => (
              <div key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 20px', borderRadius: '14px',
                  backgroundColor: cardBg, border: `1px solid ${faint}`, transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = hoverBorder}
                onMouseLeave={e => e.currentTarget.style.borderColor = faint}
              >
                <div style={{ minWidth: '52px', flexShrink: 0 }}>
                  <div style={{ fontSize: '14px', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 500, color: text }}>{block.time}</div>
                  <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif' }}>{block.endTime}</div>
                </div>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, backgroundColor: tagColors[block.tag] || '#888' }} />
                <div style={{ flex: 1, fontSize: '14px', fontFamily: 'Inter, sans-serif', color: text }}>{block.label}</div>
                <span style={{
                  fontSize: '10px', padding: '3px 10px', borderRadius: '100px',
                  color: subtle, fontFamily: 'Inter, sans-serif',
                  backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${faint}`,
                }}>
                  {block.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  )
}