import { createContext, useContext, useEffect, useRef, useState } from 'react'
import portfolioData from '../../../data/portfolioData.json'
import { buildCatalog, emailHref } from '../../lib/assistantCatalog'
import { clampHeight, fitHeight, MIN_HEIGHT } from '../../lib/consoleSize'
import { suggestionsFor } from '../../lib/assistantSuggestions'
import { playDemo } from '../../lib/assistantEvents'

const catalog = buildCatalog(portfolioData)
const EMPTY_ASK = 'Ask about my projects, experience or fit for a role'
const QUESTION_MAX = 500 // matches the server's limit
const JOB_DESCRIPTION_MAX = 8000 // matches the server's limit
const FIT_NOTE = "Your description is sent to the AI to compare against this portfolio. It isn't stored."
const RESIZE_STEP = 24
const LEVELS = {
  strong: 'STRONG',
  partial: 'PARTIAL',
  not_shown: 'NOT SHOWN',
}
const TABS = [
  { id: 'ask', label: 'ASK' },
  { id: 'fit', label: 'FIT CHECK' },
]

// The demo is taller than the space above the console, so playing it closes the console (the conversation is kept),
// scrolls to the demo itself and starts it, all in the same click.
const PlayContext = createContext(() => {})

function ActionButton({ action, primary, goTo }) {
  const playFromConsole = useContext(PlayContext)
  const className = `console-action${primary ? ' is-primary' : ''}`
  if (action.kind === 'navigate') {
    const target = catalog.byId.get(action.target)
    if (!target) return null
    return <button type="button" className={className} onClick={() => goTo(target.tab, target.anchor)}>{action.label}</button>
  }
  if (action.kind === 'play') {
    return <button type="button" className={className} onClick={() => playFromConsole(action.target)}>{action.label}</button>
  }
  if (action.kind === 'link') {
    return action.download
      ? <a className={className} href={action.href} download>{action.label}</a>
      : <a className={className} href={action.href} target="_blank" rel="noreferrer">{action.label}</a>
  }
  if (action.kind === 'email') return <a className={className} href={action.href}>{action.label}</a>
  return null
}

// "Based on:" links for catalog ids; unknown ids are dropped.
function Sources({ ids, goTo }) {
  const sources = (ids || []).map((id) => catalog.byId.get(id)).filter((t) => t && t.tab)
  if (sources.length === 0) return null
  return (
    <p className="console-sources">
      <span>Based on:</span>
      {sources.map((t) => <button key={t.id} type="button" onClick={() => goTo(t.tab, t.anchor)}>{t.label}</button>)}
    </p>
  )
}

// Action buttons for catalog ids. `emailSubject` replaces the catalog email subject (the fit check names the role).
function Actions({ ids, goTo, emailSubject }) {
  const actions = (ids || []).map((id) => catalog.byId.get(id)).filter((a) => a && a.kind)
    .map((a) => (a.kind === 'email' && emailSubject
      ? { ...a, href: emailHref(portfolioData.contact.email, { subject: emailSubject, body: '' }) }
      : a))
  if (actions.length === 0) return null
  return (
    <div className="console-actions">
      {actions.map((a, i) => <ActionButton key={a.id} action={a} primary={i === 0} goTo={goTo} />)}
    </div>
  )
}

function Answer({ message, goTo }) {
  if (message.error) return <p className="console-answer is-error">{message.text}</p>
  return (
    <div className="console-answer">
      <p>{message.text}</p>
      <Sources ids={message.sources} goTo={goTo} />
      <Actions ids={message.actions} goTo={goTo} />
    </div>
  )
}

function AskPanel({ assistant, page, goTo, inputRef }) {
  const { messages, ask, loading, draft, setDraft } = assistant
  const logRef = useRef(null)
  const chips = suggestionsFor(portfolioData.assistant, page)
  const lastAnswer = [...messages].reverse().find((m) => m.role === 'assistant')

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages, loading])

  const submit = (e) => { e.preventDefault(); ask(draft, page) }
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) submit(e)
  }

  return (
    <>
      <div className="console-log" ref={logRef}>
        {messages.length === 0 && <p className="console-empty">{EMPTY_ASK}</p>}
        {messages.map((m, i) => m.role === 'user'
          ? <p key={i} className="console-question"><span aria-hidden="true">›</span> {m.text}</p>
          : <Answer key={i} message={m} goTo={goTo} />)}
        {loading && <p className="console-thinking">Thinking<span aria-hidden="true">_</span></p>}
      </div>
      <p className="sr-only" aria-live="polite">{loading ? 'Thinking' : lastAnswer?.text || ''}</p>
      {chips.length > 0 && (
        <ul className="console-chips" aria-label="Suggested questions">
          {chips.map((q) => <li key={q}><button type="button" onClick={() => { ask(q, page); inputRef.current?.focus({ preventScroll: true }) }} disabled={loading}>{q}</button></li>)}
        </ul>
      )}
      <form className="console-form" onSubmit={submit}>
        <span className="console-prompt" aria-hidden="true">›</span>
        <textarea
          ref={inputRef}
          rows={1}
          maxLength={QUESTION_MAX}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask a question (Enter to send)"
          aria-label="Your question about Divyanshu's work"
        />
        <button type="submit" className="console-send" disabled={loading || !draft.trim()}>Send</button>
      </form>
    </>
  )
}

function FitResult({ result, goTo }) {
  const subject = result.role ? `Role: ${result.role} (from your portfolio)` : 'From your portfolio'
  return (
    <div className="console-fit-result">
      {result.role && <p className="console-fit-role"><span>ROLE</span> {result.role}</p>}
      {result.items.length === 0 && <p className="console-empty">No specific requirements were found in that text.</p>}
      <ul className="console-fit-items">
        {result.items.map((item, i) => (
          <li key={i} className="console-fit-item">
            <span className="console-level" data-level={item.level}>{LEVELS[item.level] || LEVELS.not_shown}</span>
            <div>
              <p className="console-fit-requirement">{item.requirement}</p>
              <p className="console-fit-reason">{item.reason}</p>
              <Sources ids={item.sources} goTo={goTo} />
            </div>
          </li>
        ))}
      </ul>
      <Actions ids={result.actions} goTo={goTo} emailSubject={subject} />
    </div>
  )
}

function FitPanel({ assistant, goTo, text, setText }) {
  const { fit, runFit, fitLoading } = assistant
  const submit = (e) => { e.preventDefault(); runFit(text) }
  const summary = fit.result
    ? `Fit check complete: ${fit.result.items.length} requirement${fit.result.items.length === 1 ? '' : 's'} checked.`
    : fit.error || ''

  return (
    <div className="console-fit">
      <form className="console-fit-form" onSubmit={submit}>
        <label htmlFor="console-fit-text" className="console-fit-label">Paste a job description</label>
        <textarea
          id="console-fit-text"
          rows={5}
          maxLength={JOB_DESCRIPTION_MAX}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the job description here"
          aria-describedby="console-fit-note"
        />
        <div className="console-fit-meta">
          <p id="console-fit-note" className="console-fit-note">{FIT_NOTE}</p>
          <span className="console-fit-count" aria-hidden="true">{text.length.toLocaleString('en-US')} / {JOB_DESCRIPTION_MAX.toLocaleString('en-US')}</span>
          <button type="submit" className="console-send" disabled={fitLoading || !text.trim()}>{fitLoading ? 'Checking' : 'Check fit'}</button>
        </div>
      </form>
      <p className="sr-only" aria-live="polite">{fitLoading ? 'Checking fit' : summary}</p>
      {fitLoading && <p className="console-thinking">Checking<span aria-hidden="true">_</span></p>}
      {!fitLoading && fit.error && <p className="console-answer is-error">{fit.error}</p>}
      {!fitLoading && fit.result && <FitResult result={fit.result} goTo={goTo} />}
    </div>
  )
}

export default function AssistantConsole({ open, onClose, tab, onTab, active, goTo, assistant, caseStudyId, focusToken }) {
  const askInput = useRef(null)
  const playFromConsole = (id) => { onClose(); goTo('portfolio', `${id}-demo`); playDemo(id) }
  const tabRefs = useRef({})
  const consoleRef = useRef(null)
  const drag = useRef(null)
  const page = { tab: active, caseStudyId }
  const [fitText, setFitText] = useState('')
  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight)
  const [userHeight, setUserHeight] = useState(null) // set once the visitor resizes; it then wins
  const [measured, setMeasured] = useState(0)
  const { fit, fitLoading } = assistant
  const fitHasContent = Boolean(fitText.trim() || fit.result || fit.error || fitLoading)

  // Grow for a fit check; otherwise the CSS default. Always within the clamp, and the visitor's own height wins.
  let height
  if (userHeight !== null) height = clampHeight(userHeight, viewportHeight)
  else if (tab === 'fit' && fitHasContent) height = fitHeight(viewportHeight)

  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // The handle reports the real height, whichever of the CSS default, the fit height or a drag produced it.
  useEffect(() => {
    const el = consoleRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => {
      const h = Math.round(el.getBoundingClientRect().height)
      if (h > 0) setMeasured(h)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Tell the page how much room to keep clear at its end: the console's height, its 12px inset and some breathing room.
  useEffect(() => {
    const root = document.documentElement
    if (open && measured > 0) root.style.setProperty('--console-reserve', `${measured + 12 + 24}px`)
    else root.style.removeProperty('--console-reserve')
    return () => root.style.removeProperty('--console-reserve')
  }, [open, measured])

  const currentHeight = () => consoleRef.current?.getBoundingClientRect().height || measured
  const resizeTo = (px) => setUserHeight(clampHeight(px, window.innerHeight))
  const onHandlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { startY: e.clientY, startHeight: currentHeight() }
  }
  const onHandlePointerMove = (e) => {
    if (drag.current) resizeTo(drag.current.startHeight + (drag.current.startY - e.clientY))
  }
  const endDrag = (e) => {
    drag.current = null
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }
  const onHandleKeyDown = (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()
    e.stopPropagation()
    resizeTo(currentHeight() + (e.key === 'ArrowUp' ? RESIZE_STEP : -RESIZE_STEP))
  }

  useEffect(() => {
    if (open && tab === 'ask') askInput.current?.focus({ preventScroll: true })
  }, [open, tab, focusToken])

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose() }
  }
  const onTabKey = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const i = TABS.findIndex((t) => t.id === tab)
    const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length].id
    onTab(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <PlayContext.Provider value={playFromConsole}>
    <section
      id="assistant-console"
      ref={consoleRef}
      className={`assistant-console${tab === 'fit' ? ' is-fit' : ''}`}
      style={height === undefined ? undefined : { '--console-h': `${Math.round(height)}px` }}
      aria-label="Portfolio assistant"
      hidden={!open}
      onKeyDown={onKeyDown}
    >
      <div
        className="console-resize"
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize assistant"
        aria-valuemin={MIN_HEIGHT}
        aria-valuemax={Math.round(clampHeight(Infinity, viewportHeight))}
        aria-valuenow={measured}
        tabIndex={0}
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onHandleKeyDown}
      />
      <div className="console-bar">
        <div className="console-tabs" role="tablist" aria-label="Assistant mode" onKeyDown={onTabKey}>
          {TABS.map((t) => (
            <button
              key={t.id}
              ref={(el) => { tabRefs.current[t.id] = el }}
              type="button"
              role="tab"
              id={`console-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`console-panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => onTab(t.id)}
            >{t.label}</button>
          ))}
        </div>
        <span className="console-hint" aria-hidden="true">CTRL+` · ESC</span>
        <button type="button" className="console-close" onClick={onClose} aria-label="Close assistant">✕</button>
      </div>
      <div className="console-panel" role="tabpanel" id="console-panel-ask" aria-labelledby="console-tab-ask" hidden={tab !== 'ask'}>
        <AskPanel assistant={assistant} page={page} goTo={goTo} inputRef={askInput} />
      </div>
      <div className="console-panel" role="tabpanel" id="console-panel-fit" aria-labelledby="console-tab-fit" hidden={tab !== 'fit'} tabIndex={0}>
        <FitPanel assistant={assistant} goTo={goTo} text={fitText} setText={setFitText} />
      </div>
    </section>
    </PlayContext.Provider>
  )
}
