import { useEffect, useRef, useState } from 'react'
import { postAssistant } from '../../lib/assistantClient'

// Conversation and fit-check state. It lives in AIAssistant, so closing and reopening the console keeps it.
export function useAssistant() {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [fit, setFit] = useState({ result: null, error: null })
  const [fitLoading, setFitLoading] = useState(false)
  // Refs so a call from an event listener never sees a stale conversation or loading flag.
  const messagesRef = useRef(messages)
  const busy = useRef({ ask: false, fit: false })
  useEffect(() => { messagesRef.current = messages }, [messages])

  const ask = async (question, page) => {
    const text = typeof question === 'string' ? question.trim() : ''
    if (!text || busy.current.ask) return { ok: false }
    busy.current.ask = true
    const history = messagesRef.current
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.text }))
    setMessages((prev) => [...prev, { role: 'user', text }])
    setDraft('')
    setLoading(true)
    const res = await postAssistant({ mode: 'ask', message: text, history, page })
    if (res.ok) {
      const { text: answer = '', sources = [], actions = [] } = res.data
      setMessages((prev) => [...prev, { role: 'assistant', text: answer, sources, actions }])
    } else {
      setMessages((prev) => [...prev, { role: 'assistant', text: res.error, error: true }])
      // Give the question back so the visitor can retry without retyping it.
      setDraft((current) => current || text)
    }
    busy.current.ask = false
    setLoading(false)
    return { ok: res.ok }
  }

  const runFit = async (jobDescription) => {
    const text = typeof jobDescription === 'string' ? jobDescription.trim() : ''
    if (!text || busy.current.fit) return { ok: false }
    busy.current.fit = true
    setFitLoading(true)
    const res = await postAssistant({ mode: 'fit', jobDescription: text })
    setFit(res.ok ? { result: res.data, error: null } : { result: null, error: res.error })
    busy.current.fit = false
    setFitLoading(false)
    return { ok: res.ok }
  }

  return { messages, ask, loading, draft, setDraft, fit, runFit, fitLoading }
}

const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20)

// The id of the case study taking up the most of the viewport on the Projects tab, or null elsewhere.
export function useCaseStudyInView(active) {
  const [inView, setInView] = useState(null)
  useEffect(() => {
    if (active !== 'portfolio' || typeof IntersectionObserver === 'undefined') return
    const visible = new Map()
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRect.height : 0)
      let best = null
      let most = 0
      for (const [id, px] of visible) if (px > most) { best = id; most = px }
      setInView(best)
    }, { rootMargin: '-15% 0px -35% 0px', threshold: THRESHOLDS })
    document.querySelectorAll('.case-study[id]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [active])
  return active === 'portfolio' ? inView : null
}
