import { useEffect, useRef, useState } from 'react';
import { clamp } from './motion';

const parseInline = (str) =>
  str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e4e4e6">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:#3A3A49;padding:1px 5px;border-radius:4px;font-size:0.75em;font-family:monospace">$1</code>');

export const MarkdownText = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let listType = null;

  const flushList = (key) => {
    if (!listItems.length) return;
    const Tag = listType === 'ol' ? 'ol' : 'ul';
    elements.push(
      <Tag key={`list-${key}`} className={listType === 'ol' ? 'ai-md-list ai-md-list--ol' : 'ai-md-list'}>
        {listItems.map((item, i) => (
          <li key={i} className="ai-md-item" dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
        ))}
      </Tag>
    );
    listItems = [];
    listType = null;
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) { flushList(i); elements.push(<div key={i} className="ai-md-gap" />); return; }

    if (/^#{1,3}\s/.test(trimmed)) {
      flushList(i);
      elements.push(<p key={i} className="ai-md-heading" dangerouslySetInnerHTML={{ __html: parseInline(trimmed.replace(/^#{1,3}\s/, '')) }} />);
      return;
    }
    if (/^[-*]\s/.test(trimmed)) { listType = 'ul'; listItems.push(trimmed.replace(/^[-*]\s/, '')); return; }
    if (/^\d+\.\s/.test(trimmed)) { listType = 'ol'; listItems.push(trimmed.replace(/^\d+\.\s/, '')); return; }

    flushList(i);
    elements.push(<p key={i} className="ai-md-p" dangerouslySetInnerHTML={{ __html: parseInline(trimmed) }} />);
  });
  flushList('end');
  return <div className="ai-md">{elements}</div>;
};

export const TypingDots = () => (
  <div className="ai-dots">
    {[0, 1, 2].map(i => (
      <span key={i} className="ai-dot" style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

export const DivAvatar = ({ className }) => {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div className={className}>
      {!imgFailed ? (
        <img
          src="/assets/div-avatar.jpg"
          alt="Div"
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '9999px' }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span style={{ fontWeight: 700 }}>DC</span>
      )}
    </div>
  );
};

const GREETING = {
  role: 'assistant',
  content: "Hey! I'm an AI trained on Divyanshu's portfolio. Ask about his projects, tech stack, or whether he needs UK sponsorship 🤙",
};

// Chat state lives in AIAssistant (not in the popup) so the conversation survives closing and reopening.
// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with the popup it feeds
export function useChat() {
  const [messages, setMessages] = useState([GREETING]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;
    const userContent = chatInput.trim();
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: 'user', content: userContent }]);
    setChatInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userContent, history }),
      });
      const raw = await res.text();
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { /* non-JSON proxy error */ }
      if (!res.ok || !data) throw new Error(data?.error || 'AI assistant is temporarily unavailable. Please try again shortly.');
      setMessages((prev) => [...prev, { role: 'assistant', content: data.text || '' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${err?.message || 'Something went wrong.'}` }]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, chatInput, setChatInput, loading, send };
}

const POPUP_W = 340;

export default function ChatPopup({ chat, anchorX, onClose }) {
  const { messages, chatInput, setChatInput, loading, send } = chat;
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => {
    // Move focus into the chat, and give it back to whatever had it (usually the avatar button) on close.
    const previous = document.activeElement;
    inputRef.current?.focus();
    return () => { if (previous && previous !== document.body) previous.focus?.({ preventScroll: true }); };
  }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); }
  };

  const left = anchorX == null ? 8 : clamp(anchorX - POPUP_W / 2, 8, window.innerWidth - POPUP_W - 8);

  return (
    <>
      <div className="wa-backdrop" onClick={onClose} />
      <div className="wa-popup" role="dialog" aria-label="Chat with Div" style={{ '--wa-left': `${left}px` }}>
        <div className="ai-accent-bar" />

        <div className="ai-modal_header">
          <div className="ai-row">
            <DivAvatar className="ai-avatar" />
            <div>
              <p className="ai-modal_title">Chat with Div</p>
              <p className="ai-modal_subtitle">Divyanshu&apos;s personal AI · ask me anything</p>
            </div>
          </div>
          <button className="ai-close" onClick={onClose} aria-label="Close chat">✕</button>
        </div>

        <div className="ai-chat">
          <div className="ai-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`ai-message ${msg.role === 'user' ? 'ai-message--user' : 'ai-message--assistant'}`}>
                {msg.role === 'assistant' && <DivAvatar className="ai-message_avatar" />}
                <div className={`ai-message_bubble ${msg.role === 'user' ? 'ai-bubble--user' : 'ai-bubble--assistant'}`}>
                  {msg.role === 'assistant'
                    ? <MarkdownText text={msg.content} />
                    : <p className="ai-user-text">{msg.content}</p>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="ai-message ai-message--assistant">
                <DivAvatar className="ai-message_avatar" />
                <div className="ai-bubble--assistant ai-bubble--typing"><TypingDots /></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="ai-chat_input-row">
            <textarea
              ref={inputRef}
              className="ai-input ai-chat_textarea"
              rows={1}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about skills, projects, visa, availability... (Enter to send)"
              disabled={loading}
            />
            <button className="ai-send" type="submit" disabled={loading || !chatInput.trim()} aria-label="Send">↑</button>
          </form>
        </div>
      </div>
    </>
  );
}
