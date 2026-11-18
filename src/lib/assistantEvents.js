// Tiny event bus between the assistant console and the page (ask a question, play a demo).
export const ASK_EVENT = 'assistant:ask'
export const PLAY_EVENT = 'demo:play'

const send = (name, detail, target) => target.dispatchEvent(new CustomEvent(name, { detail }))

export const askAssistant = (question, target = window) => send(ASK_EVENT, question, target)
export const playDemo = (caseStudyId, target = window) => send(PLAY_EVENT, caseStudyId, target)

// Subscribes `handler` to `name`; it receives event.detail. Returns an unsubscribe function.
export function onEvent(name, handler, target = window) {
  const listener = (event) => handler(event.detail)
  target.addEventListener(name, listener)
  return () => target.removeEventListener(name, listener)
}
