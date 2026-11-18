import { useEffect, useRef } from 'react'
import portfolioData from '../../../data/portfolioData.json'
import { buildCatalog } from '../../lib/assistantCatalog'
import { suggestionsFor } from '../../lib/assistantSuggestions'
import { playDemo } from '../../lib/assistantEvents'

const catalog = buildCatalog(portfolioData)
const EMPTY_ASK = 'Ask about my projects, experience or fit for a role'
const QUESTION_MAX = 500 // matches the server's limit
const TABS = [
  { id: 'ask', label: 'ASK' },
  { id: 'fit', label: 'FIT CHECK' },
]

function ActionButton({ action, primary, goTo }) {
  const className = `console-action${primary ? ' is-primary' : ''}`
  if (action.kind === 'navigate') {
    const target = catalog.byId.get(action.target)
    if (!target) return null
    return <button type="button" className={className} onClick={() => goTo(target.tab, target.anchor)}>{action.label}</button>
  }
  if (action.kind === 'play') {
    // Both in the same click: goTo switches tab and scrolls, then the demo on that case study starts.
    const play = () => { goTo('portfolio', action.target); playDemo(action.target) }
    return <button type="button" className={className} onClick={play}>{action.label}</button>
  }
  if (action.kind === 'link') {
    return action.download
      ? <a className={className} href={action.href} download>{action.label}</a>
      : <a className={className} href={action.href} target="_blank" rel="noreferrer">{action.label}</a>
  }
  if (action.kind === 'email') return <a className={className} href={action.href}>{action.label}</a>
  return null
}

function Answer({ message, goTo }) {
  if (message.error) return <p className="console-answer is-error">{message.text}</p>
  const sources = (message.sources || []).map((id) => catalog.byId.get(id)).filter((t) => t && t.tab)
  const actions = (message.actions || []).map((id) => catalog.byId.get(id)).filter((a) => a && a.kind)
  return (
    <div className="console-answer">
      <p>{message.text}</p>
      {sources.length > 0 && (
        <p className="console-sources">
          <span>Based on:</span>
          {sources.map((t) => <button key={t.id} type="button" onClick={() => goTo(t.tab, t.anchor)}>{t.label}</button>)}
        </p>
      )}
      {actions.length > 0 && (
        <div className="console-actions">
          {actions.map((a, i) => <ActionButton key={a.id} action={a} primary={i === 0} goTo={goTo} />)}
        </div>
      )}
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
          {chips.map((q) => <li key={q}><button type="button" onClick={() => ask(q, page)} disabled={loading}>{q}</button></li>)}
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

export default function AssistantConsole({ open, onClose, tab, onTab, active, goTo, assistant, caseStudyId }) {
  const askInput = useRef(null)
  const tabRefs = useRef({})
  const page = { tab: active, caseStudyId }

  useEffect(() => {
    if (open && tab === 'ask') askInput.current?.focus({ preventScroll: true })
  }, [open, tab])

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
    <section id="assistant-console" className="assistant-console" aria-label="Portfolio assistant" hidden={!open} onKeyDown={onKeyDown}>
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
        <p className="console-empty">Fit check is coming soon.</p>
      </div>
    </section>
  )
}
