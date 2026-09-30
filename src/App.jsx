import { useState } from 'react'
import Sidebar from './sections/Sidebar'
import About from './sections/About'
import Resume from './sections/Resume'
import Portfolio from './sections/Portfolio'
import Blog from './sections/Blog'
import Contact from './sections/Contact'
import AIAssistant from './components/AIAssistant'

const pages = [
  { id: 'about', label: 'About', title: 'About me', Page: About },
  { id: 'resume', label: 'Experience', title: 'Experience', Page: Resume },
  { id: 'portfolio', label: 'Portfolio', title: 'Portfolio', Page: Portfolio },
  { id: 'blog', label: 'Blog', title: 'Blog', Page: Blog },
  { id: 'contact', label: 'Contact', title: 'Contact', Page: Contact },
]

const App = () => {
  const [active, setActive] = useState('about')

  const select = (id) => {
    setActive(id)
    window.scrollTo(0, 0)
  }

  return (
    <>
      <main>
        <Sidebar />

        <div className="main-content">
          <nav className="navbar">
            <ul className="navbar-list">
              {pages.map(({ id, label }) => (
                <li className="navbar-item" key={id}>
                  <button
                    className={`navbar-link${active === id ? ' active' : ''}`}
                    onClick={() => select(id)}
                    aria-current={active === id ? 'page' : undefined}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {pages.map(({ id, title, Page }) => (
            <article key={id} className={`${id}${active === id ? ' active' : ''}`}>
              <header>
                <h2 className="h2 article-title">{title}</h2>
              </header>
              <Page />
            </article>
          ))}
        </div>
      </main>

      <AIAssistant />
    </>
  )
}

export default App
