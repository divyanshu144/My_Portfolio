import { useMemo, useState } from 'react';
import portfolioData from '../../data/portfolioData.json';

const tabs = [
  { id: 'chat', label: 'Chat' },
  { id: 'resume', label: 'Resume' },
  { id: 'explainer', label: 'Explainer' },
  { id: 'coach', label: 'Coach' },
];

const defaultRepo = portfolioData.projects?.[0]?.repo || '';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');

  const [chatInput, setChatInput] = useState('');
  const [resumeInput, setResumeInput] = useState('');
  const [resumeFocus, setResumeFocus] = useState('');
  const [resumeTone, setResumeTone] = useState('professional');
  const [repoUrl, setRepoUrl] = useState(defaultRepo);
  const [repoQuestion, setRepoQuestion] = useState('');
  const [coachRole, setCoachRole] = useState('');
  const [coachCompany, setCoachCompany] = useState('');
  const [coachFocus, setCoachFocus] = useState('');

  const projectOptions = useMemo(() => portfolioData.projects || [], []);

  const resetOutput = () => setOutput('');

  const callApi = async (endpoint, payload) => {
    setLoading(true);
    resetOutput();
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const raw = await response.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }
      if (!response.ok) {
        throw new Error(data?.error || 'Request failed. Is the AI server running?');
      }
      if (!data) {
        throw new Error('Empty response from server. Is the AI server running?');
      }
      setOutput(data.text || '');
    } catch (error) {
      setOutput(error?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    callApi('/api/chat', { message: chatInput.trim() });
  };

  const onResume = (e) => {
    e.preventDefault();
    callApi('/api/resume', {
      jobDescription: resumeInput.trim(),
      focus: resumeFocus.trim(),
      tone: resumeTone,
    });
  };

  const onExplain = (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    callApi('/api/explain', { repoUrl: repoUrl.trim(), question: repoQuestion.trim() });
  };

  const onCoach = (e) => {
    e.preventDefault();
    callApi('/api/coach', {
      role: coachRole.trim(),
      company: coachCompany.trim(),
      focus: coachFocus.trim(),
    });
  };

  return (
    <>
      <button className="ai-fab" onClick={() => setIsOpen(true)}>
        Ask Div
      </button>
      {isOpen && (
        <div className="ai-modal">
          <div className="ai-modal_overlay" onClick={() => setIsOpen(false)} />
          <div className="ai-modal_panel">
            <div className="ai-modal_header">
              <div>
                <p className="ai-modal_title">AI Assistant</p>
                <p className="ai-modal_subtitle">Chat, Resume, Explainer, Coach</p>
              </div>
              <button className="ai-close" onClick={() => setIsOpen(false)}>
                Close
              </button>
            </div>

            <div className="ai-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`ai-tab ${activeTab === tab.id ? 'ai-tab_active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    resetOutput();
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="ai-body">
              {activeTab === 'chat' && (
                <form onSubmit={onChat} className="ai-form">
                  <label className="ai-label">Ask about my portfolio</label>
                  <textarea
                    className="ai-input"
                    rows={5}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about skills, experience, projects, or education."
                  />
                  <button className="ai-btn" type="submit" disabled={loading}>
                    {loading ? 'Thinking...' : 'Send'}
                  </button>
                </form>
              )}

              {activeTab === 'resume' && (
                <form onSubmit={onResume} className="ai-form">
                  <label className="ai-label">Job description</label>
                  <textarea
                    className="ai-input"
                    rows={6}
                    value={resumeInput}
                    onChange={(e) => setResumeInput(e.target.value)}
                    placeholder="Paste the job description here."
                  />
                  <label className="ai-label">Focus (optional)</label>
                  <input
                    className="ai-input"
                    value={resumeFocus}
                    onChange={(e) => setResumeFocus(e.target.value)}
                    placeholder="e.g., data science, frontend, ML, product"
                  />
                  <label className="ai-label">Tone</label>
                  <select className="ai-input" value={resumeTone} onChange={(e) => setResumeTone(e.target.value)}>
                    <option value="professional">Professional</option>
                    <option value="concise">Concise</option>
                    <option value="bold">Bold</option>
                  </select>
                  <button className="ai-btn" type="submit" disabled={loading}>
                    {loading ? 'Generating...' : 'Generate'}
                  </button>
                </form>
              )}

              {activeTab === 'explainer' && (
                <form onSubmit={onExplain} className="ai-form">
                  <label className="ai-label">Select a project</label>
                  <select className="ai-input" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)}>
                    {projectOptions.map((project) => (
                      <option key={project.repo} value={project.repo}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <label className="ai-label">Question (optional)</label>
                  <input
                    className="ai-input"
                    value={repoQuestion}
                    onChange={(e) => setRepoQuestion(e.target.value)}
                    placeholder="e.g., Explain architecture and key features"
                  />
                  <button className="ai-btn" type="submit" disabled={loading}>
                    {loading ? 'Explaining...' : 'Explain'}
                  </button>
                </form>
              )}

              {activeTab === 'coach' && (
                <form onSubmit={onCoach} className="ai-form">
                  <label className="ai-label">Role</label>
                  <input
                    className="ai-input"
                    value={coachRole}
                    onChange={(e) => setCoachRole(e.target.value)}
                    placeholder="e.g., Data Scientist, Frontend Engineer"
                  />
                  <label className="ai-label">Company (optional)</label>
                  <input
                    className="ai-input"
                    value={coachCompany}
                    onChange={(e) => setCoachCompany(e.target.value)}
                    placeholder="e.g., Google, Amazon"
                  />
                  <label className="ai-label">Focus (optional)</label>
                  <input
                    className="ai-input"
                    value={coachFocus}
                    onChange={(e) => setCoachFocus(e.target.value)}
                    placeholder="e.g., ML systems, product sense, leadership"
                  />
                  <button className="ai-btn" type="submit" disabled={loading}>
                    {loading ? 'Coaching...' : 'Generate'}
                  </button>
                </form>
              )}
            </div>

            <div className="ai-output">
              <label className="ai-label">Output</label>
              <pre className="ai-output_box">{output || 'Results will appear here.'}</pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
