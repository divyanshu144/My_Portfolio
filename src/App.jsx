import { useEffect, useState } from 'react'
import * as m from 'motion/react-m'
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
  const [navigation, setNavigation] = useState(null)
  const active = navigation?.tab ?? 'about'
  const select = (tab, anchorId) => {
    setNavigation({ tab, anchorId })
    window.scrollTo(0, 0)
  }
  useEffect(() => {
    if (!navigation) return
    const { tab, anchorId } = navigation
    document.getElementById(`${tab}-title`)?.focus({ preventScroll: true })
    if (!anchorId) return
    let el
    let timer
    const frame = requestAnimationFrame(() => {
      el = document.getElementById(anchorId)
      if (!el) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.classList.add('is-targeted')
      el.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' })
      timer = setTimeout(() => el.classList.remove('is-targeted'), 1600)
    })
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      el?.classList.remove('is-targeted')
    }
  }, [navigation])
  return (
    <div className="workspace">
      <a className="skip-link" href="#workspace-main">Skip to content</a>
      <header className="workspace-header">
        <button className="workspace-brand" onClick={() => select('about')} aria-label="Divyanshu Charak, overview"><span className="brand-mark" aria-hidden="true">dc<span>.</span></span><span className="brand-copy">Divyanshu Charak<small>APPLIED AI ENGINEER</small></span></button>
        <m.nav className="workspace-nav" aria-label="Main navigation" layoutScroll>
          {pages.map(({ id, label }, i) => (
            <button key={id} onClick={() => select(id)} aria-current={active === id ? 'page' : undefined}>
              {active === id && <m.span layoutId="nav-highlight" className="nav-highlight" transition={transition('normal')} aria-hidden="true" />}
              <span className="nav-number" aria-hidden="true">0{i + 1}</span>{label}
            </button>
          ))}
        </m.nav>
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
      <AIAssistant active={active} goTo={select} />
    </div>
  )
}
export default App
