import { useEffect, useState } from 'react'
import { navLinks } from '../constants'

const NavItems = ({ activeSection }) => {
  return (
    <ul className="nav-ul">
      {navLinks.map((item) => {
        const sectionId = item.href.replace('#', '')
        const isActive = activeSection === sectionId
        return (
          <li key={item.id} className="nav-li">
            <a
              href={item.href}
              className={`nav-li_a relative transition-colors ${isActive ? 'text-sky-400' : ''}`}
            >
              {item.name}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-400" />
              )}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const sectionIds = navLinks.map(l => l.href.replace('#', ''))
    const getActive = () => {
      const scrollY = window.scrollY
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i])
        if (el && el.offsetTop - 120 <= scrollY) return sectionIds[i]
      }
      return sectionIds[0]
    }
    const onScroll = () => setActiveSection(getActive())
    window.addEventListener('scroll', onScroll, { passive: true })
    setActiveSection(getActive())
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleMenu = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen)
  }
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center py-5 mx-auto c-space">
                <a href="/" className="text-neutral-400 font-bold text-xl hover:text-white transition-colors">
                Divyanshu
                </a>
                <button onClick = {toggleMenu} className="text-neutral-400 hover: text-white
                 focus:outline-none sm:hidden flex" aria-label = "Toggle Menu">
                    <img src={ isOpen ? "assets/close.svg" : "assets/menu.svg"}
                    className="w-6 h-6"
                    alt="toggle" />
                </button>

                <nav className="sm:flex hidden items-center gap-4">
                  <NavItems activeSection={activeSection} />
                  <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
                    <a href="https://github.com/divyanshu144" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white transition-colors" aria-label="GitHub">
                      <img src="/assets/github.svg" alt="GitHub" className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" />
                    </a>
                    <a href="https://www.linkedin.com/in/divyanshu-charak-a1820516a/" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white transition-colors" aria-label="LinkedIn">
                      <img src="/assets/linkedin.png" alt="LinkedIn" className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </nav>
            </div>
        </div>

        <div className={`nav-sidebar ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
          <nav className="p-5">
            <NavItems activeSection={activeSection} />
          </nav>
        </div>
    </header>
  )
}

export default Navbar
