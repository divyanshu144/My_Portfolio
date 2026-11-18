import portfolioData from '../../data/portfolioData.json'

const TechList = ({ items }) => (
  <ul className="chip-list">{items?.map((item) => <li className="chip" key={item}>{item}</li>)}</ul>
)

const CaseStudy = ({ project, index }) => {
  const study = project.caseStudy
  return (
    <li className="case-study" id={study.id}>
      <div className="case-study-heading">
        <p className="about-eyebrow">{String(index + 1).padStart(2, '0')} / {study.category}</p>
        <span className="case-study-name">{project.name}</span>
      </div>
      <h3>{study.headline}</h3>
      <p className="case-study-intro">{project.summary}</p>
      <div className="case-study-body">
        <div className="case-study-story">
          <h4>The problem</h4><p>{study.problem}</p>
          <h4>What I built</h4><p>{study.contribution}</p>
        </div>
        <figure className="project-workflow">
          <figcaption>How it works <span>Workflow diagram</span></figcaption>
          <ol>{study.workflow.map((step, i) => <li key={step}><span aria-hidden="true">{i + 1}</span>{step}</li>)}</ol>
          <div className="project-proof"><strong>{study.proofValue}</strong><span>{study.proofLabel}</span></div>
        </figure>
      </div>
      <details className="case-study-details">
        <summary>Engineering decisions &amp; evidence</summary>
        <div className="case-study-detail-grid">
          <div><h4>The technical decision</h4><p>{study.decision}</p></div>
          <div><h4>Result &amp; evidence</h4><p>{study.outcome}</p></div>
          <div className="case-study-limits"><h4>What this does not establish</h4><p>{study.limitation}</p></div>
        </div>
        <ul className="evidence-links">
          {study.evidence.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label} <span aria-hidden="true">↗</span></a></li>)}
        </ul>
      </details>
      <div className="case-study-footer">
        <TechList items={project.tech} />
        {project.repo && <a className="project-source" href={project.repo} target="_blank" rel="noreferrer">View repository <span aria-hidden="true">↗</span></a>}
      </div>
    </li>
  )
}

const Portfolio = () => {
  const featured = portfolioData.projects.filter((project) => project.caseStudy)
  const other = portfolioData.projects.filter((project) => !project.caseStudy)
  return (
    <div className="portfolio-layout">
      <section aria-labelledby="selected-work-title">
        <p className="about-eyebrow">Selected work</p>
        <h3 className="portfolio-heading" id="selected-work-title">The problem. The build. The evidence.</h3>
        <p className="portfolio-intro">Three projects exploring useful AI, from source-grounded answers to workflows that safely change real application state.</p>
        <ul className="case-study-list">{featured.map((project, index) => <CaseStudy key={project.name} project={project} index={index} />)}</ul>
      </section>
      <section aria-labelledby="more-work-title">
        <p className="about-eyebrow">Further exploration</p>
        <h3 className="portfolio-heading" id="more-work-title">More projects</h3>
        <ul className="more-projects">{other.map((project) => (
          <li className={`more-project${project.image ? ' more-project-visual' : ''}`} key={project.name}>
            {project.image && <figure className="project-capture"><a href={project.image} target="_blank" rel="noreferrer" aria-label={`Open full-size ${project.name} screenshot`}><img src={project.image} alt={`${project.name} evaluation dashboard comparing baseline and optimized offline replay runs`} loading="lazy" /></a><figcaption>{project.imageCaption}</figcaption></figure>}
            <h4>{project.name}</h4><p>{project.summary}</p>
            <TechList items={project.tech} />
            <div className="more-project-links">
              {project.repo && <a href={project.repo} target="_blank" rel="noreferrer">Repository ↗</a>}
              {project.demo && <a href={project.demo} target="_blank" rel="noreferrer">Live demo ↗</a>}
              {project.evidenceUrl && <a href={project.evidenceUrl} target="_blank" rel="noreferrer">Benchmark method ↗</a>}
            </div>
          </li>
        ))}</ul>
      </section>
      <div className="portfolio-contact"><h3>Want to talk through the decisions?</h3><a className="portfolio-action portfolio-action-primary" href={`mailto:${portfolioData.contact.email}`}>Get in touch <span aria-hidden="true">↗</span></a></div>
    </div>
  )
}

export default Portfolio
