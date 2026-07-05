import { useEffect, useMemo, useRef, useState } from 'react';
import portfolioData from '../../data/portfolioData.json';

const tabs = [
  { id: 'chat', label: 'Chat' },
  { id: 'explainer', label: 'Explainer' },
];

const defaultRepo = portfolioData.projects?.[0]?.repo || '';

const parseInline = (str) =>
  str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e4e4e6">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:#3A3A49;padding:1px 5px;border-radius:4px;font-size:0.75em;font-family:monospace">$1</code>');

const MarkdownText = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let listType = null;

  const flushList = (key) => {
    if (!listItems.length) return;
    const Tag = listType === 'ol' ? 'ol' : 'ul';
    elements.push(
      <Tag key={`list-${key}`} className={listType === 'ol' ? 'list-decimal ml-5 space-y-0.5 my-1' : 'list-disc ml-5 space-y-0.5 my-1'}>
        {listItems.map((item, i) => (
          <li key={i} className="text-white-600 text-sm" dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
        ))}
      </Tag>
    );
    listItems = [];
    listType = null;
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) { flushList(i); elements.push(<div key={i} className="h-1.5" />); return; }

    if (/^#{1,3}\s/.test(trimmed)) {
      flushList(i);
      elements.push(<p key={i} className="font-semibold text-white text-sm mt-2 mb-0.5" dangerouslySetInnerHTML={{ __html: parseInline(trimmed.replace(/^#{1,3}\s/, '')) }} />);
      return;
    }
    if (/^[-*]\s/.test(trimmed)) { listType = 'ul'; listItems.push(trimmed.replace(/^[-*]\s/, '')); return; }
    if (/^\d+\.\s/.test(trimmed)) { listType = 'ol'; listItems.push(trimmed.replace(/^\d+\.\s/, '')); return; }

    flushList(i);
    elements.push(<p key={i} className="text-white-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: parseInline(trimmed) }} />);
  });
  flushList('end');
  return <div className="space-y-1">{elements}</div>;
};

const TypingDots = () => (
  <div className="flex items-center gap-1 px-3 py-2.5">
    {[0, 1, 2].map(i => (
      <span key={i} className="w-1.5 h-1.5 rounded-full bg-white-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

const DivAvatar = ({ className }) => {
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

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');

  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! I'm an AI trained on Divyanshu's portfolio. Ask about his projects, tech stack, or whether he needs UK sponsorship 🤙" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null);

  const [repoUrl, setRepoUrl] = useState(defaultRepo);
  const [repoQuestion, setRepoQuestion] = useState('');

  const projectOptions = useMemo(() => portfolioData.projects || [], []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const onChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;
    const userContent = chatInput.trim();
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, { role: 'user', content: userContent }]);
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
      setMessages(prev => [...prev, { role: 'assistant', content: data.text || '' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${err?.message || 'Something went wrong.'}` }]);
    } finally {
      setLoading(false);
    }
  };

  const callApi = async (endpoint, payload) => {
    setLoading(true);
    setOutput('');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const raw = await res.text();
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { /* non-JSON proxy error */ }
      if (!res.ok || !data) throw new Error(data?.error || 'AI assistant is temporarily unavailable. Please try again shortly.');
      setOutput(data.text || '');
    } catch (err) {
      setOutput(`⚠️ ${err?.message || 'Something went wrong.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onChat(e); }
  };

  return (
    <>
      <button className="ai-fab" onClick={() => setIsOpen(true)}>
        <span className="ai-fab_pulse" />
        <DivAvatar className="ai-fab_avatar" />
        Ask Div
      </button>

      {isOpen && (
        <div className="ai-modal">
          <div className="ai-modal_overlay" onClick={() => setIsOpen(false)} />
          <div className="ai-modal_panel">
            <div className="ai-accent-bar" />

            <div className="ai-modal_header">
              <div className="flex items-center gap-3">
                <DivAvatar className="ai-avatar" />
                <div>
                  <p className="ai-modal_title">Chat with Div</p>
                  <p className="ai-modal_subtitle">Divyanshu's personal AI · ask me anything</p>
                </div>
              </div>
              <button className="ai-close" onClick={() => setIsOpen(false)} aria-label="Close">✕</button>
            </div>

            <div className="ai-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`ai-tab ${activeTab === tab.id ? 'ai-tab_active' : ''}`}
                  onClick={() => { setActiveTab(tab.id); setOutput(''); }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'chat' && (
              <div className="ai-chat">
                <div className="ai-messages">
                  {messages.map((msg, i) => (
                    <div key={i} className={`ai-message ${msg.role === 'user' ? 'ai-message--user' : 'ai-message--assistant'}`}>
                      {msg.role === 'assistant' && <DivAvatar className="ai-message_avatar" />}
                      <div className={`ai-message_bubble ${msg.role === 'user' ? 'ai-bubble--user' : 'ai-bubble--assistant'}`}>
                        {msg.role === 'assistant'
                          ? <MarkdownText text={msg.content} />
                          : <p className="text-sm text-white">{msg.content}</p>}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="ai-message ai-message--assistant">
                      <DivAvatar className="ai-message_avatar" />
                      <div className="ai-bubble--assistant rounded-2xl rounded-tl-sm"><TypingDots /></div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={onChat} className="ai-chat_input-row">
                  <textarea
                    className="ai-input ai-chat_textarea"
                    rows={1}
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    placeholder="Ask about skills, projects, visa, availability... (Enter to send)"
                    disabled={loading}
                  />
                  <button className="ai-send" type="submit" disabled={loading || !chatInput.trim()} aria-label="Send">↑</button>
                </form>
              </div>
            )}

            {activeTab !== 'chat' && (
              <div className="ai-body">
                {activeTab === 'explainer' && (
                  <form onSubmit={e => { e.preventDefault(); if (repoUrl.trim()) callApi('/api/explain', { repoUrl: repoUrl.trim(), question: repoQuestion.trim() }); }} className="ai-form">
                    <label className="ai-label">Select a project</label>
                    <select className="ai-input" value={repoUrl} onChange={e => setRepoUrl(e.target.value)}>
                      {projectOptions.map(p => <option key={p.repo} value={p.repo}>{p.name}</option>)}
                    </select>
                    <label className="ai-label">Question (optional)</label>
                    <input className="ai-input" value={repoQuestion} onChange={e => setRepoQuestion(e.target.value)} placeholder="e.g., Explain the architecture and key design decisions" />
                    <button className="ai-btn" type="submit" disabled={loading}>{loading ? 'Explaining...' : 'Explain'}</button>
                  </form>
                )}

                {(loading && !output) && (
                  <div className="mt-4 ai-output_box flex items-start gap-2"><TypingDots /></div>
                )}
                {output && (
                  <div className="ai-output">
                    <p className="ai-label mb-2">Output</p>
                    <div className="ai-output_box"><MarkdownText text={output} /></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
