import { useRef } from 'react'
import { useAmbient } from '../components/useAmbient'
import SystemMap from '../components/SystemMap'
import portfolioData from '../../data/portfolioData.json'

const { about, aboutCards, projects } = portfolioData

const About = ({ onNavigate }) => {
  const heroRef = useRef(null)
  useAmbient(heroRef)

  return (
  <div className="about-layout">
    <div className="workspace-intro">
    <section className="about-hero" aria-labelledby="about-headline" ref={heroRef}>
      <div className="hero-ambient" aria-hidden="true"><span className="hero-glow ambient-anim" /><span className="hero-grid ambient-anim" /></div>
      <p className="about-eyebrow"><span className="hero-rule" aria-hidden="true" /> APPLIED AI / SOFTWARE ENGINEERING</p>
      <h2 id="about-headline">{about.headline}<br /><span className="ambient-anim">{about.highlight}</span></h2>
      <p className="about-intro">{about.intro}</p>
      <div className="hero-actions">
        <button className="portfolio-action portfolio-action-primary" onClick={() => onNavigate('portfolio')}>View my work <span aria-hidden="true">↗</span></button>
        {portfolioData.cv && <a className="portfolio-action" href={portfolioData.cv} download>Download CV <span aria-hidden="true">↓</span></a>}
        <button className="portfolio-action portfolio-action-text" onClick={() => onNavigate('contact')}>Contact me <span aria-hidden="true">→</span></button>
      </div>
      <div className="about-location"><ion-icon name="location-outline" aria-hidden="true" />Exeter, UK</div>
    </section>
    <SystemMap onNavigate={onNavigate} />
    </div>

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
        <div><p className="about-eyebrow">01 / Selected systems</p><h3 id="about-work-title">Built for the real world.</h3></div>
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
      <div className="about-section-heading"><div><p className="about-eyebrow">02 / Engineering philosophy</p><h3 id="about-approach-title">How I work. How I unwind.</h3></div></div>
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
}

export default About
