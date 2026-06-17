import { useState } from 'react'
import AppLayout from '../components/common/AppLayout'
import { useTheme } from '../context/ThemeContext'

const TAG_COLORS = {
  sleep:    { color: '#8b6bc7', bg: 'rgba(139,107,199,0.15)', border: 'rgba(139,107,199,0.3)' },
  wake:     { color: '#c9944a', bg: 'rgba(201,148,74,0.15)',  border: 'rgba(201,148,74,0.3)' },
  gym:      { color: '#ff4d00', bg: 'rgba(255,77,0,0.15)',    border: 'rgba(255,77,0,0.3)' },
  workout:  { color: '#ff4d00', bg: 'rgba(255,77,0,0.15)',    border: 'rgba(255,77,0,0.3)' },
  work:     { color: '#4a90d9', bg: 'rgba(74,144,217,0.15)',  border: 'rgba(74,144,217,0.3)' },
  meal:     { color: '#5aad7a', bg: 'rgba(90,173,122,0.15)',  border: 'rgba(90,173,122,0.3)' },
  study:    { color: '#8b6bc7', bg: 'rgba(139,107,199,0.15)', border: 'rgba(139,107,199,0.3)' },
  personal: { color: '#c9944a', bg: 'rgba(201,148,74,0.15)',  border: 'rgba(201,148,74,0.3)' },
  break:    { color: '#666',    bg: 'rgba(100,100,100,0.12)', border: 'rgba(100,100,100,0.25)' },
  health:   { color: '#5aad7a', bg: 'rgba(90,173,122,0.15)',  border: 'rgba(90,173,122,0.3)' },
  default:  { color: '#888',    bg: 'rgba(100,100,100,0.10)', border: 'rgba(100,100,100,0.2)' },
}

const EXAMPLES = [
  "Wake up at 6am, gym for an hour, office from 9 to 5, need to study DSA for 2 hours, sleep by 11pm",
  "I have college from 10am-4pm, want to go shopping in the evening, finish my React project, drink 3L water, sleep at 11",
  "Work from home today 9-6, gym in morning, read for 30 mins, call with client at 3pm, cook dinner",
]

export default function Planner() {
  const { theme } = useTheme()
  const dark = theme === 'dark'

  const [input, setInput] = useState('')
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const text = dark ? '#f0f0f0' : '#0a0a0a'
  const subtle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
  const faint = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const cardBg = dark ? '#161616' : '#ffffff'
  const hoverBorder = dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)'

  const card = (extra = {}) => ({
    backgroundColor: cardBg,
    border: `1px solid ${faint}`,
    borderRadius: '16px',
    padding: '24px',
    ...extra,
  })

  const generate = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setSchedule(null)

    try {
      const Groq = (await import('groq-sdk')).default
      const groq = new Groq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        dangerouslyAllowBrowser: true,
      })

      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are SYNQ's AI scheduling assistant. The user describes their day in plain English. Create an optimized, realistic hourly schedule.

Return ONLY a valid JSON array. No explanation. No markdown. No code fences. Just the raw JSON array.

Each item must have exactly these fields:
- time: string in "HH:MM" 24-hour format (e.g. "06:00")
- endTime: string in "HH:MM" 24-hour format
- label: string — the activity name
- tag: one of: wake, sleep, gym, workout, work, study, meal, personal, break, health

Rules:
- Always start with wake up and end with sleep
- Add breakfast, lunch, dinner at appropriate times if not mentioned
- Add short breaks between long tasks
- Hard/important tasks in morning or early afternoon
- Be realistic with time estimates
- Add a wind-down block before sleep`,
          },
          {
            role: 'user',
            content: `Create a schedule for my day: ${input}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      })

      const raw = completion.choices[0]?.message?.content || ''
      const cleaned = raw.replace(/```json|```/g, '').trim()
      const blocks = JSON.parse(cleaned)

      if (!Array.isArray(blocks)) throw new Error('Invalid response')
      setSchedule(blocks)
    } catch (err) {
      setError('Could not generate schedule. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const saveToDashboard = () => {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem('synq-schedule', JSON.stringify({
      date: today,
      blocks: schedule,
    }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AppLayout>
      {/* HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '40px', fontWeight: 700, letterSpacing: '-1px' }}>
          <span style={{ color: '#ff4d00' }}>Planner</span>
        </h1>
      </div>

      {!schedule ? (
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* Main input card */}
          <div style={card({ marginBottom: '16px' })}>
            <div style={{ fontSize: '24px', color: text, fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 500, marginBottom: '14px', textAlign: 'center', letterSpacing: '1.5px' }}>
              Write about your day and let it <span style={{ color: '#ff4d00' }}>SYNQ</span>
            </div>

            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g. Wake up at 6am, gym in the morning, office from 9-5, study DSA for 2 hours in evening, sleep by 11pm..."
              rows={5}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '15px',
                fontFamily: 'Inter, sans-serif',
                lineHeight: '1.6',
                backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${faint}`,
                color: text,
                outline: 'none',
                resize: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#ff4d00'}
              onBlur={e => e.target.style.borderColor = faint}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate()
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <span style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif' }}>
                Press Cmd+Enter to generate
              </span>
              <button
                onClick={generate}
                disabled={loading || !input.trim()}
                style={{
                  padding: '12px 28px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  fontWeight: 700,
                  backgroundColor: !input.trim() ? faint : '#ff4d00',
                  color: !input.trim() ? subtle : 'white',
                  border: 'none',
                  cursor: !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '14px', height: '14px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Building schedule...
                  </>
                ) : 'Generate Schedule →'}
              </button>
            </div>

            {error && (
              <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.3)', fontSize: '13px', color: '#ff4d00', fontFamily: 'Inter, sans-serif' }}>
                {error}
              </div>
            )}
          </div>

          {/* Examples */}
          <div style={card({ padding: '20px' })}>
            <div style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              Try an example
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setInput(ex)}
                  style={{
                    textAlign: 'left',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    color: subtle,
                    backgroundColor: 'transparent',
                    border: `1px solid ${faint}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    lineHeight: '1.5',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = hoverBorder; e.currentTarget.style.color = text }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = faint; e.currentTarget.style.color = subtle }}
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* GENERATED SCHEDULE */
        <div>
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>
                AI-optimized · {schedule.length} blocks {editMode && '· editing'}
              </p>
              <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '24px', fontWeight: 700, color: text, letterSpacing: '-0.5px' }}>
                Today's Schedule
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { setSchedule(null); setEditMode(false) }}
                style={{
                  padding: '10px 18px', borderRadius: '10px', fontSize: '13px',
                  fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                  backgroundColor: 'transparent', border: `1px solid ${faint}`, color: subtle,
                }}
              >
                ← Start over
              </button>
              <button
                onClick={generate}
                style={{
                  padding: '10px 18px', borderRadius: '10px', fontSize: '13px',
                  fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                  backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${faint}`, color: text,
                }}
              >
                ↺ Regenerate
              </button>
              <button
                onClick={() => setEditMode(!editMode)}
                style={{
                  padding: '10px 18px', borderRadius: '10px', fontSize: '13px',
                  fontFamily: 'Inter, sans-serif', fontWeight: 500, cursor: 'pointer',
                  backgroundColor: editMode ? 'rgba(90,173,122,0.15)' : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                  border: `1px solid ${editMode ? 'rgba(90,173,122,0.4)' : faint}`,
                  color: editMode ? '#5aad7a' : text,
                }}
              >
                {editMode ? '✓ Done editing' : '✎ Edit schedule'}
              </button>
              <button
                onClick={saveToDashboard}
                style={{
                  padding: '10px 18px', borderRadius: '10px', fontSize: '13px',
                  fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: saved ? '#5aad7a' : '#ff4d00',
                  color: 'white', border: 'none',
                  transition: 'background-color 0.3s',
                }}
              >
                {saved ? '✓ Saved!' : 'Save to Dashboard'}
              </button>
            </div>
          </div>

          {/* Original input reminder */}
          <div style={{
            padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
            backgroundColor: dark ? 'rgba(255,77,0,0.06)' : 'rgba(255,77,0,0.05)',
            border: '1px solid rgba(255,77,0,0.15)',
            fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif',
            lineHeight: 1.5,
          }}>
            <span style={{ color: '#ff4d00', fontWeight: 500 }}>Your input: </span>
            {input}
          </div>

          {editMode && (
            <div style={{
              padding: '10px 16px', borderRadius: '10px', marginBottom: '16px',
              backgroundColor: 'rgba(90,173,122,0.08)', border: '1px solid rgba(90,173,122,0.25)',
              fontSize: '12px', color: '#5aad7a', fontFamily: 'Inter, sans-serif',
            }}>
              Edit mode on — change times, labels, tags, or remove blocks below. Click "Done editing" when finished.
            </div>
          )}

          {/* Schedule table */}
          <div style={{ ...card({ padding: '0', overflow: 'hidden' }) }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: editMode ? '90px 90px 1fr 130px 40px' : '100px 1fr 120px 100px',
              padding: '12px 20px',
              borderBottom: `1px solid ${faint}`,
              backgroundColor: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}>
              {(editMode ? ['Start', 'End', 'Activity', 'Tag', ''] : ['Time', 'Activity', 'Duration', 'Tag']).map(h => (
                <div key={h} style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            {schedule.map((block, i) => {
              const tc = TAG_COLORS[block.tag] || TAG_COLORS.default
              const isSpecial = !editMode && (block.tag === 'sleep' || block.tag === 'wake')

              const [sh, sm] = block.time.split(':').map(Number)
              const [eh, em] = block.endTime.split(':').map(Number)
              const durMins = (eh * 60 + em) - (sh * 60 + sm)
              const durText = durMins >= 60
                ? `${Math.floor(durMins/60)}h${durMins%60 > 0 ? ` ${durMins%60}m` : ''}`
                : `${durMins}m`

              const updateBlock = (field, value) => {
                setSchedule(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: value } : b))
              }

              const removeBlock = () => {
                setSchedule(prev => prev.filter((_, idx) => idx !== i))
              }

              const rowInputStyle = {
                padding: '6px 8px', borderRadius: '6px', fontSize: '13px',
                fontFamily: 'Inter, sans-serif', backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${faint}`, color: text, outline: 'none', width: '100%',
              }

              return (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: editMode ? '90px 90px 1fr 130px 40px' : '100px 1fr 120px 100px',
                    padding: '14px 20px',
                    borderBottom: i < schedule.length - 1 ? `1px solid ${faint}` : 'none',
                    backgroundColor: isSpecial ? tc.bg : 'transparent',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {editMode ? (
                    <>
                      <input type="time" value={block.time} onChange={e => updateBlock('time', e.target.value)} style={rowInputStyle} />
                      <input type="time" value={block.endTime} onChange={e => updateBlock('endTime', e.target.value)} style={rowInputStyle} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: tc.color, flexShrink: 0 }} />
                        <input type="text" value={block.label} onChange={e => updateBlock('label', e.target.value)} style={rowInputStyle} />
                      </div>
                      <select value={block.tag} onChange={e => updateBlock('tag', e.target.value)} style={{ ...rowInputStyle, cursor: 'pointer' }}>
                        {Object.keys(TAG_COLORS).filter(t => t !== 'default').map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <button
                        onClick={removeBlock}
                        style={{
                          width: '28px', height: '28px', borderRadius: '6px',
                          border: `1px solid ${faint}`, backgroundColor: 'transparent',
                          color: '#ff4d00', cursor: 'pointer', fontSize: '14px',
                        }}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <>
                      <div>
                        <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '15px', fontWeight: 600, color: isSpecial ? tc.color : text, lineHeight: 1 }}>
                          {block.time}
                        </div>
                        <div style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
                          {block.endTime}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: tc.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif', color: isSpecial ? tc.color : text, fontWeight: isSpecial ? 500 : 400 }}>
                          {block.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif' }}>
                        {durText}
                      </div>
                      <div>
                        <span style={{
                          fontSize: '10px', padding: '4px 10px', borderRadius: '100px',
                          color: tc.color, backgroundColor: tc.bg,
                          border: `1px solid ${tc.border}`,
                          fontFamily: 'Inter, sans-serif',
                        }}>
                          {block.tag}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )
            })}

            {editMode && (
              <div style={{ padding: '14px 20px' }}>
                <button
                  onClick={() => setSchedule(prev => [...prev, { time: '12:00', endTime: '13:00', label: 'New activity', tag: 'personal' }])}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '8px',
                    border: `1px dashed ${faint}`, backgroundColor: 'transparent',
                    color: subtle, cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  + Add block
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AppLayout>
  )
}