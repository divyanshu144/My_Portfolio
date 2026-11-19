import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import About from './sections/About'
import Resume from './sections/Resume'
import Portfolio from './sections/Portfolio'
import Blog from './sections/Blog'
import Contact from './sections/Contact'
import AIAssistant from './components/AIAssistant'
import { transition } from './lib/motionTokens'
import portfolioData from '../data/portfolioData.json'

const pages = [
  { id: 'about', label: 'Overview', title: 'Overview', Page: About },
  { id: 'portfolio', label: 'Projects', title: 'Selected projects', Page: Portfolio },
  { id: 'resume', label: 'Experience', title: 'Experience', Page: Resume },
  { id: 'blog', label: 'Notes', title: 'Notes & ideas', Page: Blog },
  { id: 'contact', label: 'Contact', title: 'Start a conversation', Page: Contact },
]

const App = () => {
  const [active, setActive] = useState('about')
  const focusPage = useRef(false)
  useEffect(() => {
    if (focusPage.current) {
      document.getElementById(`${active}-title`)?.focus({ preventScroll: true })
      focusPage.current = false
    }
  }, [active])
  const select = (id) => {
    focusPage.current = true
    setActive(id)
    window.scrollTo(0, 0)
  }
  const targetTimer = useRef(null)
  const targetEl = useRef(null)
  const clearTarget = () => {
    clearTimeout(targetTimer.current)
    targetEl.current?.classList.remove('is-targeted')
    targetEl.current = null
  }
  useEffect(() => clearTarget, [])
  // Select a tab and, once it has rendered, bring one element on it into view and highlight it briefly.
  const goTo = (tab, anchorId) => {
    select(tab)
    if (!anchorId) return
    requestAnimationFrame(() => {
      const el = document.getElementById(anchorId)
      if (!el) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      clearTarget()
      el.classList.add('is-targeted')
      targetEl.current = el
      el.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' })
      targetTimer.current = setTimeout(clearTarget, 1600)
    })
  }
  return (
    <div className="workspace">
      <a className="skip-link" href="#workspace-main">Skip to content</a>
      <header className="workspace-header">
        <button className="workspace-brand" onClick={() => select('about')} aria-label="Divyanshu Charak, overview"><span className="brand-mark" aria-hidden="true">dc<span>.</span></span><span className="brand-copy">Divyanshu Charak<small>APPLIED AI ENGINEER</small></span></button>
        <motion.nav className="workspace-nav" aria-label="Main navigation" layoutScroll>
          {pages.map(({ id, label }, i) => (
            <button key={id} onClick={() => select(id)} aria-current={active === id ? 'page' : undefined}>
              {active === id && <motion.span layoutId="nav-highlight" className="nav-highlight" transition={transition('normal')} aria-hidden="true" />}
              <span className="nav-number" aria-hidden="true">0{i + 1}</span>{label}
            </button>
          ))}
        </motion.nav>
        <a className="workspace-github" href={portfolioData.contact.github} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
      </header>
      <main id="workspace-main" className="workspace-main" tabIndex={-1}>
        <div className="workspace-path"><span><span className="status-dot" aria-hidden="true" /> PORTFOLIO / {active === 'about' ? 'OVERVIEW' : pages.find((page) => page.id === active).label.toUpperCase()}</span><span>{portfolioData.location} <span aria-hidden="true">·</span> 50.72° N</span></div>
        <div className="main-content">
          {pages.map(({ id, title, Page }) => <article key={id} className={`${id}${active === id ? ' active' : ''}`}>
            <header className={id === 'about' ? 'overview-title' : 'workspace-page-heading'}><p className="about-eyebrow">Divyanshu Charak / {id === 'portfolio' ? 'Engineering in practice' : title}</p><h1 className="article-title" id={`${id}-title`} tabIndex={-1}>{title}</h1></header>
            <Page onNavigate={select} />
          </article>)}
        </div>
        <footer className="workspace-footer"><span>Divyanshu Charak <span aria-hidden="true">/</span> Built with intent.</span><div><a href={portfolioData.contact.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={`mailto:${portfolioData.contact.email}`}>Email ↗</a>{portfolioData.cv && <a href={portfolioData.cv} download>CV ↓</a>}</div></footer>
      </main>
      <AIAssistant active={active} goTo={goTo} />
    </div>
  )
}
export default App
