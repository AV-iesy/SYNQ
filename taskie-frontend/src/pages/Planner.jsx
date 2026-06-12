// import { useState } from 'react'
// import AppLayout from '../components/common/AppLayout'
// import { useTheme } from '../context/ThemeContext'

// const PRIORITY_COLORS = {
//   p1: { color: '#ff4d00', bg: 'rgba(255,77,0,0.12)', border: 'rgba(255,77,0,0.3)', label: 'P1' },
//   p2: { color: '#c9944a', bg: 'rgba(201,148,74,0.12)', border: 'rgba(201,148,74,0.3)', label: 'P2' },
//   p3: { color: '#4a90d9', bg: 'rgba(74,144,217,0.12)', border: 'rgba(74,144,217,0.3)', label: 'P3' },
//   p4: { color: '#8b6bc7', bg: 'rgba(139,107,199,0.12)', border: 'rgba(139,107,199,0.3)', label: 'P4' },
// }

// const TIME_SLOTS = ['Early morning', 'Morning', 'Afternoon', 'Evening', 'Night', 'Flexible']

// const TAG_COLORS = {
//   sleep:    { color: '#8b6bc7', bg: 'rgba(139,107,199,0.15)', border: 'rgba(139,107,199,0.3)' },
//   wake:     { color: '#c9944a', bg: 'rgba(201,148,74,0.15)',  border: 'rgba(201,148,74,0.3)' },
//   gym:      { color: '#ff4d00', bg: 'rgba(255,77,0,0.15)',    border: 'rgba(255,77,0,0.3)' },
//   work:     { color: '#4a90d9', bg: 'rgba(74,144,217,0.15)', border: 'rgba(74,144,217,0.3)' },
//   meal:     { color: '#5aad7a', bg: 'rgba(90,173,122,0.15)', border: 'rgba(90,173,122,0.3)' },
//   study:    { color: '#8b6bc7', bg: 'rgba(139,107,199,0.15)', border: 'rgba(139,107,199,0.3)' },
//   personal: { color: '#c9944a', bg: 'rgba(201,148,74,0.15)', border: 'rgba(201,148,74,0.3)' },
//   break:    { color: '#555',    bg: 'rgba(100,100,100,0.1)',  border: 'rgba(100,100,100,0.2)' },
//   default:  { color: '#888',    bg: 'rgba(100,100,100,0.1)',  border: 'rgba(100,100,100,0.2)' },
// }

// function getTag(label) {
//   const l = label.toLowerCase()
//   if (l.includes('gym') || l.includes('workout') || l.includes('run')) return 'gym'
//   if (l.includes('office') || l.includes('work') || l.includes('meeting') || l.includes('job')) return 'work'
//   if (l.includes('study') || l.includes('dsa') || l.includes('read') || l.includes('learn')) return 'study'
//   if (l.includes('breakfast') || l.includes('lunch') || l.includes('dinner') || l.includes('eat') || l.includes('meal')) return 'meal'
//   if (l.includes('shop') || l.includes('personal') || l.includes('errand')) return 'personal'
//   if (l.includes('break') || l.includes('rest') || l.includes('nap')) return 'break'
//   return 'default'
// }

// function generateSchedule(tasks, wakeTime, sleepTime) {
//   const blocks = []
//   const [wH, wM] = wakeTime.split(':').map(Number)
//   const [sH, sM] = sleepTime.split(':').map(Number)

//   const fmt = (h, m) => `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
//   const addBlock = (h, m, dur, label, tag) => {
//     const endH = Math.floor((h * 60 + m + dur) / 60)
//     const endM = (h * 60 + m + dur) % 60
//     blocks.push({ time: fmt(h, m), endTime: fmt(endH, endM), label, tag })
//     return endH * 60 + endM
//   }

//   // Wake up
//   blocks.push({ time: fmt(wH, wM), endTime: fmt(wH, wM + 15), label: 'Wake up', tag: 'wake', special: true })

//   // Morning routine
//   let cursor = wH * 60 + wM + 15
//   cursor = addBlock(Math.floor(cursor/60), cursor%60, 30, 'Morning routine & freshen up', 'personal')

//   // Sort tasks by priority and time preference
//   const sorted = [...tasks].sort((a, b) => {
//     const pOrder = { p1: 0, p2: 1, p3: 2, p4: 3 }
//     return pOrder[a.priority] - pOrder[b.priority]
//   })

//   // Place tasks based on time preference
//   const morning = sorted.filter(t => ['Early morning', 'Morning'].includes(t.timeSlot))
//   const afternoon = sorted.filter(t => t.timeSlot === 'Afternoon')
//   const evening = sorted.filter(t => ['Evening'].includes(t.timeSlot))
//   const night = sorted.filter(t => t.timeSlot === 'Night')
//   const flexible = sorted.filter(t => t.timeSlot === 'Flexible')

//   const placeTasks = (taskList, startCursor) => {
//     let c = startCursor
//     taskList.forEach(task => {
//       const dur = task.priority === 'p1' ? 90 : task.priority === 'p2' ? 75 : 60
//       c = addBlock(Math.floor(c/60), c%60, dur, task.label, getTag(task.label))
//       // Add a short break after p1/p2 tasks
//       if (task.priority === 'p1' || task.priority === 'p2') {
//         c = addBlock(Math.floor(c/60), c%60, 15, 'Short break', 'break')
//       }
//     })
//     return c
//   }

//   // Morning tasks
//   cursor = placeTasks(morning, cursor)

//   // Breakfast around 8-9am
//   const breakfastTime = Math.max(cursor, wH * 60 + wM + 90)
//   cursor = addBlock(Math.floor(breakfastTime/60), breakfastTime%60, 30, 'Breakfast', 'meal')

//   // Flexible tasks in first half
//   const firstHalfFlex = flexible.slice(0, Math.ceil(flexible.length / 2))
//   cursor = placeTasks(firstHalfFlex, cursor)

//   // Afternoon tasks
//   const afternoonStart = Math.max(cursor, 13 * 60)
//   cursor = addBlock(Math.floor(afternoonStart/60), afternoonStart%60, 30, 'Lunch', 'meal')
//   cursor = placeTasks(afternoon, cursor)

//   // Second half flexible
//   const secondHalfFlex = flexible.slice(Math.ceil(flexible.length / 2))
//   cursor = placeTasks(secondHalfFlex, cursor)

//   // Evening tasks
//   const eveningStart = Math.max(cursor, 17 * 60)
//   cursor = placeTasks(evening, eveningStart)

//   // Dinner
//   const dinnerTime = Math.max(cursor, 19 * 60)
//   cursor = addBlock(Math.floor(dinnerTime/60), dinnerTime%60, 45, 'Dinner', 'meal')

//   // Night tasks
//   cursor = placeTasks(night, cursor)

//   // Wind down
//   const windDownTime = Math.max(cursor, sH * 60 + sM - 45)
//   cursor = addBlock(Math.floor(windDownTime/60), windDownTime%60, 30, 'Wind down & prepare for sleep', 'personal')

//   // Sleep
//   blocks.push({ time: fmt(sH, sM), endTime: fmt(sH + 8, sM), label: 'Sleep', tag: 'sleep', special: true })

//   return blocks
// }

// // ── Sleep arc visual (inspired by the sleep tracker) ──────────
// function SleepArc({ wakeTime, sleepTime, dark }) {
//   const subtle = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
//   const faint = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

//   const [wH, wM] = wakeTime.split(':').map(Number)
//   const [sH, sM] = sleepTime.split(':').map(Number)

//   const sleepMins = sH * 60 + sM
//   const wakeMins = wH * 60 + wM
//   const awakeHours = ((wakeMins + 1440 - sleepMins) % 1440) / 60
//   const sleepHours = 24 - awakeHours

//   const size = 120
//   const stroke = 10
//   const r = (size / 2) - stroke
//   const c = 2 * Math.PI * r
//   const sleepPct = sleepHours / 24
//   const sleepOffset = c - sleepPct * c

//   return (
//     <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
//       <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
//         <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
//           <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={faint} strokeWidth={stroke} />
//           <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#8b6bc7" strokeWidth={stroke}
//             strokeDasharray={c} strokeDashoffset={sleepOffset}
//             strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
//           <circle cx={size/2} cy={size/2} r={r - stroke - 4} fill="none" stroke={faint} strokeWidth={6} />
//           <circle cx={size/2} cy={size/2} r={r - stroke - 4} fill="none" stroke="#c9944a" strokeWidth={6}
//             strokeDasharray={2 * Math.PI * (r - stroke - 4)}
//             strokeDashoffset={2 * Math.PI * (r - stroke - 4) * (1 - awakeHours/24)}
//             strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
//         </svg>
//         <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
//           <div style={{ fontSize: '18px', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, color: '#8b6bc7', lineHeight: 1 }}>
//             {sleepHours.toFixed(1)}h
//           </div>
//           <div style={{ fontSize: '9px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>sleep</div>
//         </div>
//       </div>
//       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//         <div>
//           <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Bedtime</div>
//           <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '20px', fontWeight: 700, color: '#8b6bc7', letterSpacing: '-0.5px' }}>{sleepTime}</div>
//         </div>
//         <div>
//           <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Wake up</div>
//           <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '20px', fontWeight: 700, color: '#c9944a', letterSpacing: '-0.5px' }}>{wakeTime}</div>
//         </div>
//         <div>
//           <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Active hours</div>
//           <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '20px', fontWeight: 700, color: '#c9944a', letterSpacing: '-0.5px' }}>{awakeHours.toFixed(1)}h</div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default function Planner() {
//   const { theme } = useTheme()
//   const dark = theme === 'dark'

//   const [tasks, setTasks] = useState([
//     { id: 1, label: 'Gym', priority: 'p1', timeSlot: 'Morning' },
//     { id: 2, label: 'Office work', priority: 'p2', timeSlot: 'Afternoon' },
//   ])
//   const [newLabel, setNewLabel] = useState('')
//   const [newPriority, setNewPriority] = useState('p1')
//   const [newTimeSlot, setNewTimeSlot] = useState('Flexible')
//   const [wakeTime, setWakeTime] = useState('06:00')
//   const [sleepTime, setSleepTime] = useState('22:30')
//   const [schedule, setSchedule] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [saved, setSaved] = useState(false)

//   const text = dark ? '#f0f0f0' : '#0a0a0a'
//   const subtle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
//   const faint = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
//   const cardBg = dark ? '#161616' : '#ffffff'
//   const hoverBorder = dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)'
//   const inputBg = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'

//   const inputStyle = {
//     padding: '10px 14px', borderRadius: '10px', fontSize: '13px',
//     fontFamily: 'Inter, sans-serif', backgroundColor: inputBg,
//     border: `1px solid ${faint}`, color: text, outline: 'none',
//   }

//   const addTask = (e) => {
//     e.preventDefault()
//     if (!newLabel.trim()) return
//     setTasks(prev => [...prev, { id: Date.now(), label: newLabel.trim(), priority: newPriority, timeSlot: newTimeSlot }])
//     setNewLabel('')
//   }

//   const removeTask = (id) => setTasks(prev => prev.filter(t => t.id !== id))

//   const generate = async () => {
//     if (tasks.length === 0) return
//     setLoading(true)
//     await new Promise(r => setTimeout(r, 1200))
//     setSchedule(generateSchedule(tasks, wakeTime, sleepTime))
//     setLoading(false)
//   }

//   const card = (extra = {}) => ({
//     backgroundColor: cardBg, border: `1px solid ${faint}`,
//     borderRadius: '16px', padding: '24px', ...extra,
//   })

//   return (
//     <AppLayout>
//       <div style={{ marginBottom: '28px' }}>
//         <p style={{ fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>AI Schedule Generator</p>
//         <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '36px', fontWeight: 700, color: text, letterSpacing: '-1px' }}>
//           Plan your day
//         </h1>
//       </div>

//       {!schedule ? (
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

//           {/* LEFT — Tasks */}
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

//             {/* Add task */}
//             <div style={card()}>
//               <div style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
//                 Add Tasks
//               </div>
//               <form onSubmit={addTask} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//                 <input
//                   value={newLabel} onChange={e => setNewLabel(e.target.value)}
//                   placeholder="What do you need to do today?"
//                   style={{ ...inputStyle, width: '100%' }}
//                   onFocus={e => e.target.style.borderColor = '#ff4d00'}
//                   onBlur={e => e.target.style.borderColor = faint}
//                 />
//                 <div style={{ display: 'flex', gap: '8px' }}>
//                   {/* Priority */}
//                   <div style={{ display: 'flex', gap: '4px' }}>
//                     {Object.entries(PRIORITY_COLORS).map(([key, val]) => (
//                       <button key={key} type="button" onClick={() => setNewPriority(key)} style={{
//                         padding: '7px 12px', borderRadius: '8px', fontSize: '11px',
//                         fontFamily: 'Inter, sans-serif', fontWeight: 600, cursor: 'pointer',
//                         border: `1px solid ${newPriority === key ? val.border : faint}`,
//                         backgroundColor: newPriority === key ? val.bg : 'transparent',
//                         color: newPriority === key ? val.color : subtle,
//                         transition: 'all 0.15s',
//                       }}>
//                         {val.label}
//                       </button>
//                     ))}
//                   </div>

//                   {/* Time slot */}
//                   <select
//                     value={newTimeSlot} onChange={e => setNewTimeSlot(e.target.value)}
//                     style={{ ...inputStyle, flex: 1, cursor: 'pointer' }}
//                   >
//                     {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
//                   </select>
//                 </div>
//                 <button type="submit" style={{
//                   padding: '11px', borderRadius: '10px', fontSize: '13px',
//                   fontFamily: 'Inter, sans-serif', fontWeight: 600,
//                   backgroundColor: '#ff4d00', color: 'white',
//                   border: 'none', cursor: 'pointer',
//                 }}>
//                   Add task
//                 </button>
//               </form>
//             </div>

//             {/* Task list */}
//             <div style={card({ padding: '20px' })}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
//                 <div style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>
//                   Tasks — {tasks.length}
//                 </div>
//                 {tasks.length > 0 && (
//                   <button onClick={() => setTasks([])} style={{ fontSize: '11px', color: subtle, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
//                     Clear all
//                   </button>
//                 )}
//               </div>

//               {tasks.length === 0 ? (
//                 <div style={{ textAlign: 'center', padding: '32px 0', color: subtle, fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
//                   No tasks yet — add some above
//                 </div>
//               ) : (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
//                   {tasks.map((task, i) => {
//                     const p = PRIORITY_COLORS[task.priority]
//                     return (
//                       <div key={task.id} style={{
//                         display: 'flex', alignItems: 'center', gap: '10px',
//                         padding: '10px 14px', borderRadius: '10px',
//                         backgroundColor: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
//                         border: `1px solid ${faint}`, transition: 'border-color 0.15s',
//                       }}
//                         onMouseEnter={e => e.currentTarget.style.borderColor = hoverBorder}
//                         onMouseLeave={e => e.currentTarget.style.borderColor = faint}
//                       >
//                         <span style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', minWidth: '16px' }}>
//                           {i + 1}
//                         </span>
//                         <span style={{
//                           fontSize: '10px', padding: '3px 8px', borderRadius: '6px',
//                           color: p.color, backgroundColor: p.bg, border: `1px solid ${p.border}`,
//                           fontFamily: 'Inter, sans-serif', fontWeight: 600, flexShrink: 0,
//                         }}>
//                           {p.label}
//                         </span>
//                         <span style={{ flex: 1, fontSize: '13px', fontFamily: 'Inter, sans-serif', color: text }}>{task.label}</span>
//                         <span style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif' }}>{task.timeSlot}</span>
//                         <button onClick={() => removeTask(task.id)} style={{
//                           background: 'none', border: 'none', color: subtle,
//                           cursor: 'pointer', fontSize: '16px', opacity: 0.4, padding: 0, lineHeight: 1,
//                         }}>×</button>
//                       </div>
//                     )
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* RIGHT — Sleep + Generate */}
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

//             {/* Sleep tracker card */}
//             <div style={card()}>
//               <div style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
//                 Sleep Schedule
//               </div>

//               <SleepArc wakeTime={wakeTime} sleepTime={sleepTime} dark={dark} />

//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
//                 {[
//                   { label: 'Wake up time', value: wakeTime, setter: setWakeTime, color: '#c9944a' },
//                   { label: 'Bedtime', value: sleepTime, setter: setSleepTime, color: '#8b6bc7' },
//                 ].map(({ label, value, setter, color }) => {
//                   const [h, m] = value.split(':').map(Number)
//                   const adjustH = (delta) => {
//                     const newH = (h + delta + 24) % 24
//                     setter(`${String(newH).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
//                   }
//                   const adjustM = (delta) => {
//                     const totalM = h * 60 + m + delta
//                     const newH = ((Math.floor(totalM / 60)) % 24 + 24) % 24
//                     const newM = ((totalM % 60) + 60) % 60
//                     setter(`${String(newH).padStart(2,'0')}:${String(newM).padStart(2,'0')}`)
//                   }
//                   const period = h >= 12 ? 'PM' : 'AM'
//                   const h12 = h % 12 === 0 ? 12 : h % 12
//                   return (
//                     <div key={label}>
//                       <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
//                         {label}
//                       </div>
//                       <div style={{
//                         display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                         padding: '12px 14px', borderRadius: '12px',
//                         backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
//                         border: `1px solid ${faint}`,
//                         gap: '8px',
//                       }}>
//                         {/* Hours */}
//                         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
//                           <button onClick={() => adjustH(1)} style={{ background: 'none', border: 'none', color: subtle, cursor: 'pointer', fontSize: '14px', padding: '2px 8px', borderRadius: '6px' }}
//                             onMouseEnter={e => e.currentTarget.style.color = text}
//                             onMouseLeave={e => e.currentTarget.style.color = subtle}>▲</button>
//                           <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '26px', fontWeight: 700, color, lineHeight: 1, minWidth: '32px', textAlign: 'center' }}>
//                             {String(h12).padStart(2,'0')}
//                           </div>
//                           <button onClick={() => adjustH(-1)} style={{ background: 'none', border: 'none', color: subtle, cursor: 'pointer', fontSize: '14px', padding: '2px 8px', borderRadius: '6px' }}
//                             onMouseEnter={e => e.currentTarget.style.color = text}
//                             onMouseLeave={e => e.currentTarget.style.color = subtle}>▼</button>
//                         </div>

//                         <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '26px', fontWeight: 700, color: subtle, marginBottom: '2px' }}>:</div>

//                         {/* Minutes */}
//                         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
//                           <button onClick={() => adjustM(5)} style={{ background: 'none', border: 'none', color: subtle, cursor: 'pointer', fontSize: '14px', padding: '2px 8px', borderRadius: '6px' }}
//                             onMouseEnter={e => e.currentTarget.style.color = text}
//                             onMouseLeave={e => e.currentTarget.style.color = subtle}>▲</button>
//                           <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '26px', fontWeight: 700, color, lineHeight: 1, minWidth: '32px', textAlign: 'center' }}>
//                             {String(m).padStart(2,'0')}
//                           </div>
//                           <button onClick={() => adjustM(-5)} style={{ background: 'none', border: 'none', color: subtle, cursor: 'pointer', fontSize: '14px', padding: '2px 8px', borderRadius: '6px' }}
//                             onMouseEnter={e => e.currentTarget.style.color = text}
//                             onMouseLeave={e => e.currentTarget.style.color = subtle}>▼</button>
//                         </div>

//                         {/* AM/PM toggle */}
//                         <button
//                           onClick={() => adjustH(h >= 12 ? -12 : 12)}
//                           style={{
//                             padding: '6px 10px', borderRadius: '8px', fontSize: '12px',
//                             fontFamily: 'Inter, sans-serif', fontWeight: 600, cursor: 'pointer',
//                             backgroundColor: `${color}22`, border: `1px solid ${color}44`,
//                             color, transition: 'all 0.15s', alignSelf: 'center',
//                           }}
//                         >
//                           {period}
//                         </button>
//                       </div>
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>

//             {/* Priority guide */}
//             <div style={card({ padding: '20px' })}>
//               <div style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
//                 Priority Guide
//               </div>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                 {[
//                   { key: 'p1', desc: 'Critical — scheduled first, 90 min block' },
//                   { key: 'p2', desc: 'Important — 75 min block, prime time' },
//                   { key: 'p3', desc: 'Normal — 60 min block' },
//                   { key: 'p4', desc: 'Low — scheduled in available gaps' },
//                 ].map(({ key, desc }) => {
//                   const p = PRIORITY_COLORS[key]
//                   return (
//                     <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                       <span style={{
//                         fontSize: '10px', padding: '3px 8px', borderRadius: '6px',
//                         color: p.color, backgroundColor: p.bg, border: `1px solid ${p.border}`,
//                         fontFamily: 'Inter, sans-serif', fontWeight: 600, flexShrink: 0,
//                       }}>{p.label}</span>
//                       <span style={{ fontSize: '12px', color: subtle, fontFamily: 'Inter, sans-serif' }}>{desc}</span>
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>

//             {/* Generate */}
//             <button onClick={generate} disabled={loading || tasks.length === 0} style={{
//               width: '100%', padding: '18px', borderRadius: '14px',
//               fontSize: '16px', fontFamily: 'Bricolage Grotesque, sans-serif',
//               fontWeight: 700, letterSpacing: '-0.3px',
//               backgroundColor: tasks.length === 0 ? faint : '#ff4d00',
//               color: tasks.length === 0 ? subtle : 'white',
//               border: 'none', cursor: tasks.length === 0 ? 'not-allowed' : 'pointer',
//               opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
//             }}>
//               {loading ? 'Building your schedule...' : `Generate Schedule → ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
//             </button>
//           </div>
//         </div>
//       ) : (
//         /* GENERATED SCHEDULE */
//         <div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
//             <div>
//               <p style={{ fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>
//                 AI-generated · {tasks.length} tasks scheduled
//               </p>
//               <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '24px', fontWeight: 700, color: text, letterSpacing: '-0.5px' }}>
//                 Today's Schedule
//               </h2>
//             </div>
//             <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
//               {/* Sleep summary */}
//               <div style={{
//                 padding: '10px 16px', borderRadius: '12px',
//                 backgroundColor: cardBg, border: `1px solid ${faint}`,
//                 display: 'flex', alignItems: 'center', gap: '16px',
//               }}>
//                 <div style={{ textAlign: 'center' }}>
//                   <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bedtime</div>
//                   <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '16px', fontWeight: 700, color: '#8b6bc7' }}>{sleepTime}</div>
//                 </div>
//                 <div style={{ width: '1px', height: '28px', backgroundColor: faint }} />
//                 <div style={{ textAlign: 'center' }}>
//                   <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wake up</div>
//                   <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '16px', fontWeight: 700, color: '#c9944a' }}>{wakeTime}</div>
//                 </div>
//               </div>
//               <button onClick={() => setSchedule(null)} style={{
//                 padding: '10px 18px', borderRadius: '10px', fontSize: '13px',
//                 fontFamily: 'Inter, sans-serif', cursor: 'pointer',
//                 backgroundColor: 'transparent', border: `1px solid ${faint}`, color: subtle,
//               }}>
//                 ← Edit
//               </button>
//               <button onClick={generate} style={{
//                 padding: '10px 18px', borderRadius: '10px', fontSize: '13px',
//                 fontFamily: 'Inter, sans-serif', cursor: 'pointer',
//                 backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
//                 border: `1px solid ${faint}`, color: text,
//               }}>
//                 ↺ Regenerate
//               </button>
//               <button
//                 onClick={() => {
//                   const today = new Date().toISOString().split('T')[0]
//                   localStorage.setItem('synq-schedule', JSON.stringify({ date: today, blocks: schedule, wakeTime, sleepTime }))
//                   setSaved(true)
//                   setTimeout(() => setSaved(false), 2000)
//                 }}
//                 style={{
//                   padding: '10px 18px', borderRadius: '10px', fontSize: '13px',
//                   fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700,
//                   cursor: 'pointer',
//                   backgroundColor: saved ? '#5aad7a' : '#ff4d00',
//                   color: 'white', border: 'none', transition: 'background-color 0.3s',
//                 }}
//               >
//                 {saved ? '✓ Saved!' : 'Save to Dashboard'}
//               </button>
//             </div>
//           </div>

//           {/* Timeline */}
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
//             {schedule.map((block, i) => {
//               const tc = TAG_COLORS[block.tag] || TAG_COLORS.default
//               const isSpecial = block.special
//               return (
//                 <div key={i} style={{
//                   display: 'flex', alignItems: 'center', gap: '14px',
//                   padding: '14px 18px', borderRadius: '14px',
//                   backgroundColor: isSpecial ? tc.bg : cardBg,
//                   border: `1px solid ${isSpecial ? tc.border : faint}`,
//                   transition: 'border-color 0.15s',
//                 }}
//                   onMouseEnter={e => e.currentTarget.style.borderColor = isSpecial ? tc.border : hoverBorder}
//                   onMouseLeave={e => e.currentTarget.style.borderColor = isSpecial ? tc.border : faint}
//                 >
//                   <div style={{ minWidth: '52px', flexShrink: 0 }}>
//                     <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '15px', fontWeight: 600, color: isSpecial ? tc.color : text, lineHeight: 1 }}>
//                       {block.time}
//                     </div>
//                     <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>{block.endTime}</div>
//                   </div>
//                   <div style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, backgroundColor: tc.color }} />
//                   <div style={{ flex: 1, fontSize: '13px', fontFamily: 'Inter, sans-serif', color: isSpecial ? tc.color : text, fontWeight: isSpecial ? 500 : 400 }}>
//                     {block.label}
//                   </div>
//                   <span style={{
//                     fontSize: '10px', padding: '3px 10px', borderRadius: '100px',
//                     color: tc.color, backgroundColor: tc.bg,
//                     border: `1px solid ${tc.border}`,
//                     fontFamily: 'Inter, sans-serif', flexShrink: 0,
//                   }}>
//                     {block.tag}
//                   </span>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       )}
//     </AppLayout>
//   )
// }

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
        <p style={{ fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>
          SYNQ generator 
        </p>
        <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '36px', fontWeight: 700, color: text, letterSpacing: '-1px' }}>
          Plan your day
        </h1>
      </div>

      {!schedule ? (
        <div style={{ maxWidth: '720px' }}>

          {/* Main input card */}
          <div style={card({ marginBottom: '16px' })}>
            <div style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
              Tell AI what you want to do today
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
                AI-optimized · {schedule.length} blocks
              </p>
              <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '24px', fontWeight: 700, color: text, letterSpacing: '-0.5px' }}>
                Today's Schedule
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { setSchedule(null) }}
                style={{
                  padding: '10px 18px', borderRadius: '10px', fontSize: '13px',
                  fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                  backgroundColor: 'transparent', border: `1px solid ${faint}`, color: subtle,
                }}
              >
                ← Edit
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

          {/* Schedule table */}
          <div style={{
            ...card({ padding: '0', overflow: 'hidden' }),
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr 120px 100px',
              padding: '12px 20px',
              borderBottom: `1px solid ${faint}`,
              backgroundColor: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}>
              {['Time', 'Activity', 'Duration', 'Tag'].map(h => (
                <div key={h} style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            {schedule.map((block, i) => {
              const tc = TAG_COLORS[block.tag] || TAG_COLORS.default
              const isSpecial = block.tag === 'sleep' || block.tag === 'wake'

              // Calculate duration
              const [sh, sm] = block.time.split(':').map(Number)
              const [eh, em] = block.endTime.split(':').map(Number)
              const durMins = (eh * 60 + em) - (sh * 60 + sm)
              const durText = durMins >= 60
                ? `${Math.floor(durMins/60)}h${durMins%60 > 0 ? ` ${durMins%60}m` : ''}`
                : `${durMins}m`

              return (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr 120px 100px',
                    padding: '14px 20px',
                    borderBottom: i < schedule.length - 1 ? `1px solid ${faint}` : 'none',
                    backgroundColor: isSpecial
                      ? (dark ? `${tc.bg}` : tc.bg)
                      : 'transparent',
                    transition: 'background-color 0.15s',
                    alignItems: 'center',
                  }}
                  onMouseEnter={e => { if (!isSpecial) e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                  onMouseLeave={e => { if (!isSpecial) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  {/* Time */}
                  <div>
                    <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '15px', fontWeight: 600, color: isSpecial ? tc.color : text, lineHeight: 1 }}>
                      {block.time}
                    </div>
                    <div style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
                      {block.endTime}
                    </div>
                  </div>

                  {/* Activity */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: tc.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif', color: isSpecial ? tc.color : text, fontWeight: isSpecial ? 500 : 400 }}>
                      {block.label}
                    </span>
                  </div>

                  {/* Duration */}
                  <div style={{ fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif' }}>
                    {durText}
                  </div>

                  {/* Tag */}
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
                </div>
              )
            })}
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