import { useState } from 'react'
import ChatPopup, { useChat } from './avatar/ChatPopup'

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const chat = useChat()
  return (
    <div className="workspace-assistant">
      <button className="assistant-launcher" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((value) => !value)}><span className="assistant-symbol" aria-hidden="true">✧</span><span>Ask AI<small>ABOUT MY WORK</small></span><span aria-hidden="true">↗</span></button>
      {open && <ChatPopup chat={chat} onClose={() => setOpen(false)} />}
    </div>
  )
}
