import { useEffect, useRef, useState } from 'react'
import AssistantConsole from './assistant/AssistantConsole'
import { useAssistant, useCaseStudyInView } from './assistant/useAssistant'
import { ASK_EVENT, onEvent } from '../lib/assistantEvents'

export default function AIAssistant({ active, goTo }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('ask')
  const [focusToken, setFocusToken] = useState(0)
  const assistant = useAssistant()
  const caseStudyId = useCaseStudyInView(active)
  const opener = useRef(null)
  const wasOpen = useRef(false)

  const show = () => {
    if (!open) opener.current = document.activeElement
    setOpen(true)
  }
  const close = () => setOpen(false)
  const toggle = () => (open ? close() : show())

  // On close, give focus back to whatever opened the console (the launcher, an "Ask about this" button...).
  useEffect(() => {
    if (wasOpen.current && !open) {
      const el = opener.current
      if (el && el !== document.body && el.isConnected) el.focus({ preventScroll: true })
      opener.current = null
    }
    wasOpen.current = open
  }, [open])

  // Ctrl+` toggles the console from anywhere on the page, like an editor terminal.
  const latest = useRef({})
  useEffect(() => {
    latest.current = { toggle, show, ask: assistant.ask, page: { tab: active, caseStudyId } }
  })
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && !e.altKey && !e.metaKey && (e.code === 'Backquote' || e.key === '`')) {
        e.preventDefault()
        latest.current.toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    const offAsk = onEvent(ASK_EVENT, (question) => {
      const { show: open, ask, page } = latest.current
      open()
      setTab('ask')
      setFocusToken((n) => n + 1) // re-focus the input even when the console is already open on Ask
      ask(question, page)
    })
    return () => { window.removeEventListener('keydown', onKey); offAsk() }
  }, [])

  return (
    <div className="workspace-assistant">
      <button className="assistant-launcher" aria-expanded={open} aria-controls="assistant-console" hidden={open} onClick={toggle}>
        <span className="assistant-symbol" aria-hidden="true">›_</span>
        <span>Ask AI<small>ABOUT MY WORK</small></span>
      </button>
      <AssistantConsole
        open={open}
        onClose={close}
        tab={tab}
        onTab={setTab}
        active={active}
        goTo={goTo}
        assistant={assistant}
        caseStudyId={caseStudyId}
        focusToken={focusToken}
      />
    </div>
  )
}
