import portfolioData from '../../data/portfolioData.json'

const About = () => (
  <>
    <section className="about-text">
      <p>{portfolioData.summary}</p>
    </section>

    <section className="service">
      <h3 className="h3 service-title">More about me</h3>

      <ul className="service-list">
        {portfolioData.aboutCards.map(({ title, text, icon }) => (
          <li className="service-item" key={title}>
            <div className="service-icon-box">
              <img src={`/assets/vcard/${icon}.svg`} alt="" width="40" />
            </div>
            <div className="service-content-box">
              <h4 className="h4 service-item-title">{title}</h4>
              <p className="service-item-text">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  </>
)

export default About
