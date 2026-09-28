import { useEffect, useState } from 'react'
import portfolioData from '../../data/portfolioData.json'
import { projectMeta } from '../lib/projectMeta'

// Static data renders immediately; live GitHub data replaces it when /api/projects answers.
const initial = portfolioData.projects.map((p) => ({ ...p, github: null }))

const Portfolio = () => {
  const [projects, setProjects] = useState(initial)

  useEffect(() => {
    let cancelled = false
    fetch('/api/projects')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (!cancelled && Array.isArray(data.projects) && data.projects.length) setProjects(data.projects)
      })
      .catch(() => {}) // keep the static cards
    return () => { cancelled = true }
  }, [])

  return (
    <section className="projects">
      <ul className="project-list">
        {projects.map((p) => {
          const meta = projectMeta(p)
          return (
            <li className="project-item active" key={p.repo}>
              <a href={p.repo} target="_blank" rel="noreferrer">
                <figure className="project-img">
                  <div className="project-item-icon-box"><ion-icon name="logo-github"></ion-icon></div>
                  {p.image ? (
                    <img src={p.image} alt={p.name} loading="lazy" />
                  ) : (
                    <div className="project-placeholder">{p.github?.language ?? p.tech?.[0] ?? p.name}</div>
                  )}
                </figure>

                <h3 className="project-title">{p.name}</h3>
                {meta && <p className="project-category">{meta}</p>}
                <p className="project-summary">{p.summary}</p>
                {p.tech?.length > 0 && (
                  <ul className="chip-list project-chips">
                    {p.tech.map((t) => <li className="chip" key={t}>{t}</li>)}
                  </ul>
                )}
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default Portfolio
