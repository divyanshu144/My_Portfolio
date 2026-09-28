import portfolioData from '../../data/portfolioData.json'
import { skillGroups } from '../constants'

const About = () => (
  <>
    <section className="about-text">
      <p>{portfolioData.summary}</p>
    </section>

    <section className="service">
      <h3 className="h3 service-title">What I&apos;m doing</h3>

      <ul className="service-list">
        {Object.entries(portfolioData.skills).map(([key, items]) => {
          const group = skillGroups[key] ?? { title: key, icon: 'icon-dev' }
          return (
            <li className="service-item" key={key}>
              <div className="service-icon-box">
                <img src={`/assets/vcard/${group.icon}.svg`} alt="" width="40" />
              </div>
              <div className="service-content-box">
                <h4 className="h4 service-item-title">{group.title}</h4>
                <p className="service-item-text">{items.slice(0, 5).join(', ')}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  </>
)

export default About
