import portfolioData from '../../data/portfolioData.json'
import { skillGroups } from '../constants'

const Timeline = ({ icon, heading, children }) => (
  <section className="timeline">
    <div className="title-wrapper">
      <div className="icon-box"><ion-icon name={icon}></ion-icon></div>
      <h3 className="h3">{heading}</h3>
    </div>
    <ol className="timeline-list">{children}</ol>
  </section>
)

const Resume = () => (
  <>
    <Timeline icon="book-outline" heading="Education">
      {portfolioData.education.map((e) => (
        <li className="timeline-item" key={e.degree + e.institution}>
          <h4 className="h4 timeline-item-title">{e.degree}</h4>
          <span>{[e.institution, e.dates, e.grade].filter(Boolean).join(' · ')}</span>
          {e.dissertation && <p className="timeline-text">{e.dissertation}</p>}
        </li>
      ))}
    </Timeline>

    <Timeline icon="briefcase-outline" heading="Experience">
      {portfolioData.experience.map((x) => (
        <li className="timeline-item" key={x.title + x.company + x.dates}>
          <h4 className="h4 timeline-item-title">{x.title} · {x.company}</h4>
          <span>{[x.dates, x.location].filter(Boolean).join(' · ')}</span>
          <ul className="timeline-text timeline-bullets">
            {x.highlights.map((h) => <li key={h}>{h}</li>)}
          </ul>
        </li>
      ))}
    </Timeline>

    <section className="skill">
      <h3 className="h3 skills-title">My skills</h3>
      <div className="skill-groups content-card">
        {Object.entries(portfolioData.skills).map(([key, items]) => (
          <div className="skill-group" key={key}>
            <h5 className="skill-group-title">{skillGroups[key]?.title ?? key}</h5>
            <ul className="chip-list">
              {items.map((s) => <li className="chip" key={s}>{s}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  </>
)

export default Resume
