import portfolioData from '../../data/portfolioData.json'

// Cards come straight from data/portfolioData.json. `repo` and `demo` are optional:
// a project without `repo` renders as a card that is not clickable.
const Portfolio = () => (
  <section className="projects">
    <ul className="project-list">
      {portfolioData.projects.map((p) => {
        const linkProps = p.repo ? { href: p.repo, target: '_blank', rel: 'noreferrer' } : {}
        return (
          <li className="project-item active" key={p.name}>
            <a {...linkProps}>
              <figure className="project-img">
                {p.repo && (
                  <div className="project-item-icon-box"><ion-icon name="logo-github"></ion-icon></div>
                )}
                {p.image ? (
                  <img src={p.image} alt={p.name} loading="lazy" />
                ) : (
                  <div className="project-placeholder">{p.name}</div>
                )}
              </figure>

              <h3 className="project-title">{p.name}</h3>
              <p className="project-summary">{p.summary}</p>
              {p.tech?.length > 0 && (
                <ul className="chip-list project-chips">
                  {p.tech.map((t) => <li className="chip" key={t}>{t}</li>)}
                </ul>
              )}
            </a>
            {p.demo && (
              <div className="project-links">
                <a className="project-live" href={p.demo} target="_blank" rel="noreferrer">Live demo →</a>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  </section>
)

export default Portfolio
