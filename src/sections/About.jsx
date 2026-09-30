import portfolioData from '../../data/portfolioData.json'

const About = () => (
  <section className="about-text">
    <p>{portfolioData.summary}</p>
  </section>
)

export default About
