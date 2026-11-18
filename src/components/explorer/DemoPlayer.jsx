import { useEffect, useRef, useState } from 'react'
import { advance, firstBeatOf, initialState, jumpToProject, jumpToStep, stageView } from './playback'

// Self-playing walkthrough of a project: what the user sees (left), the workflow stages (right) and,
// for the deep variant, a trace of what ran. Shared by the Overview's System explorer and the case studies.

function FrontItem({ item }) {
  switch (item.type) {
    case 'msg': return <div className={`demo-bubble demo-bubble-${item.from}`}>{item.text}</div>
    case 'chips': return <div className="demo-chips">{item.items.map((chip) => <span key={chip}>{chip}</span>)}</div>
    case 'passage': return <div className="demo-passage">{item.text}</div>
    case 'note': return <div className="demo-note">{item.text}</div>
    case 'alert': return <div className={`demo-alert demo-alert-${item.tone}`}>{item.text}</div>
    case 'sources': return <div className="demo-sources"><span>Sources:</span>{item.items.map((source) => <span key={source}>[{source}]</span>)}</div>
    case 'score': return <div className="demo-score"><span>{item.label}</span><div className="demo-score-bar"><i style={{ width: `${item.value}%` }} /></div><strong>{item.value}%</strong></div>
    case 'checklist': return <ul className="demo-checklist">{item.items.map((entry) => <li key={entry}>{entry}</li>)}</ul>
    default: return null
  }
}

function useInView(ref, enabled) {
  const [inView, setInView] = useState(!enabled)
  useEffect(() => {
    if (!enabled || !ref.current || typeof IntersectionObserver === 'undefined') { setInView(true); return undefined }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref, enabled])
  return inView
}

export default function DemoPlayer({ variant = 'overview', order, scripts, studies, stepMs, title, playWhenVisible = false, autoplay = true, loop = true, children }) {
  const deep = variant === 'deep'
  const rootRef = useRef(null)
  const [state, setState] = useState(() => initialState(order))
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [stopped, setStopped] = useState(!autoplay)
  const [finished, setFinished] = useState(false)
  const [userDriven, setUserDriven] = useState(false)
  const inView = useInView(rootRef, playWhenVisible)

  const project = state.project
  const study = studies[project]
  const { beats, window: windowTitle } = scripts[project]
  const beat = beats[state.step]
  const stages = stageView(beats, state.step, study.workflow.length)
  const playing = inView && !stopped && !hovered && !focused
  const detailId = `demo-detail-${variant}-${project}`

  useEffect(() => {
    if (!playing) return undefined
    const timer = setTimeout(() => {
      setUserDriven(false)
      if (!loop && order.length === 1 && state.step === scripts[state.project].beats.length - 1) {
        setStopped(true)
        setFinished(true)
        return
      }
      setState((current) => advance(current, order, scripts[current.project].beats.length))
    }, stepMs)
    return () => clearTimeout(timer)
  }, [playing, state, order, scripts, stepMs, loop])

  const toggle = () => {
    if (finished) { setFinished(false); setState(initialState(order)); setStopped(false); return }
    setStopped((value) => !value)
  }
  const toggleLabel = finished ? 'Replay' : stopped ? 'Play' : 'Pause'

  const choose = (next) => { setUserDriven(true); setFinished(false); setState(next) }
  const shown = beats.slice(0, state.step + 1)
  const trace = deep ? shown.flatMap((b, bi) => (b.trace ?? []).map((line, li) => ({ ...line, key: `${bi}-${li}`, fresh: bi === state.step }))).slice(-7) : []

  return (
    <section
      ref={rootRef}
      className={`system-map${deep ? ' demo-deep' : ''}${playing ? ' is-playing' : ''}`}
      aria-label={deep ? `${project} example run` : undefined}
      aria-labelledby={deep ? undefined : 'system-map-title'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false) }}
    >
      <div className="system-map-bar">
        <h3 id={deep ? undefined : 'system-map-title'}>{title}</h3>
        <span className="demo-badge">EXAMPLE DATA</span>
        <button className={`demo-toggle${deep ? ' demo-toggle-labelled' : ''}${deep && stopped ? ' is-waiting' : ''}`} onClick={toggle} aria-label={deep ? undefined : `${toggleLabel} demo`}>
          <span className={stopped ? 'demo-icon-play' : 'demo-icon-pause'} aria-hidden="true" />
          {deep && <span>{toggleLabel === 'Play' && state.step === 0 ? 'Play example run' : toggleLabel}</span>}
        </button>
      </div>

      {order.length > 1 && (
        <div className="system-projects" role="group" aria-label="Choose a project">
          {order.map((name) => <button key={name} aria-pressed={project === name} onClick={() => choose(jumpToProject(state, name))}>{name}</button>)}
        </div>
      )}

      <div className="demo-stage">
        <div className="demo-front" key={project} aria-hidden="true">
          <div className="demo-window-bar"><span className="demo-window-dots"><i /><i /><i /></span>{windowTitle}</div>
          <div className="demo-feed">
            {shown.flatMap((b, bi) => (b.front ?? []).map((item, i) => <FrontItem key={`${bi}-${i}`} item={item} />))}
            {beat.pending && <div className="demo-typing"><i /><i /><i /></div>}
          </div>
        </div>

        <ol className="demo-steps" aria-label={`${project} workflow stages`}>
          {study.workflow.map((name, i) => {
            const stage = stages[i]
            return (
              <li key={name}>
                <button
                  className={`demo-step is-${stage.status}${stage.tone ? ` tone-${stage.tone}` : ''}`}
                  aria-current={stage.status === 'current' ? 'step' : undefined}
                  aria-controls={detailId}
                  onClick={() => choose(jumpToStep(state, firstBeatOf(beats, i)))}
                >
                  <span className="demo-step-head"><span className="system-node-index">0{i + 1}</span>{name}</span>
                  <span className="demo-readout" key={`${project}-${i}-${stage.readout}`}>{stage.readout}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      {deep && (
        <div className="demo-trace" aria-hidden="true">
          {trace.map((line) => <div key={line.key} className={`demo-trace-line${line.fresh ? ' is-fresh' : ''}${line.tone ? ` tone-${line.tone}` : ''}`}><span className="demo-trace-src">{line.src}</span><span>{line.text}</span></div>)}
        </div>
      )}

      <div className="demo-progress" aria-hidden="true"><i key={`${project}-${state.step}-${playing}`} className={playing ? 'is-running' : ''} style={{ '--step-ms': `${stepMs}ms`, '--from': `${(state.step / beats.length) * 100}%`, '--to': `${((state.step + 1) / beats.length) * 100}%` }} /></div>

      <div className="system-detail" id={detailId} aria-live={userDriven ? 'polite' : 'off'} aria-atomic="true">
        <span className="system-detail-label">{project} · 0{beat.step + 1} / {study.workflow[beat.step]}</span>
        <p>{deep && beat.readout ? `${beat.readout}. ` : ''}{study.workflowDetails[beat.step]}</p>
      </div>
      {children}
    </section>
  )
}
