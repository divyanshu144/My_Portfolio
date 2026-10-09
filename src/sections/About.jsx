import portfolioData from '../../data/portfolioData.json'

const { about, aboutCards, projects } = portfolioData

const About = () => (
  <div className="about-layout">
    <section className="about-hero" aria-labelledby="about-headline">
      <p className="about-eyebrow">{about.eyebrow}</p>
      <h3 id="about-headline">{about.headline}<br /><span>{about.highlight}</span></h3>
      <p className="about-intro">{about.intro}</p>
      <div className="about-location"><ion-icon name="location-outline" aria-hidden="true" />Exeter, UK</div>
    </section>

    <section className="about-journey" aria-label="My background">
      {about.journey.map(({ value, label, detail }) => (
        <div className="about-milestone" key={label}>
          <strong>{value}</strong>
          <h3>{label}</h3>
          <p>{detail}</p>
        </div>
      ))}
    </section>

    <section className="about-work" aria-labelledby="about-work-title">
      <div className="about-section-heading">
        <div><p className="about-eyebrow">Ideas into applications</p><h3 id="about-work-title">What that looks like</h3></div>
        <span className="about-section-note">Explore the code <span aria-hidden="true">↗</span></span>
      </div>
      <ul className="about-project-grid">
        {about.projects.map(({ name, icon, label, text }) => (
          <li key={name}>
            <a className="about-project" href={projects.find((project) => project.name === name)?.repo} target="_blank" rel="noreferrer" aria-label={`${name}: ${label} (GitHub, opens in a new tab)`}>
              <span className="about-project-icon"><ion-icon name={icon} aria-hidden="true" /></span>
              <div><span className="about-project-name">{name}</span><h4>{label}</h4><p>{text}</p></div>
              <span className="about-project-arrow" aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </section>

    <section aria-labelledby="about-approach-title">
      <div className="about-section-heading"><div><p className="about-eyebrow">The person behind the projects</p><h3 id="about-approach-title">How I work. How I unwind.</h3></div></div>
      <ul className="about-approach-grid">
        {aboutCards.map(({ title, text, icon }, index) => (
          <li className={`about-approach-card${index === 2 ? ' about-personal-card' : ''}`} key={title}>
            <img src={`/assets/vcard/${icon}.svg`} alt="" width="28" height="28" />
            <div><h4>{title}</h4><p>{text}</p></div>
          </li>
        ))}
      </ul>
    </section>
  </div>
)

export default About
