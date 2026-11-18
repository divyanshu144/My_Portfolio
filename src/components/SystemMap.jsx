import portfolioData from '../../data/portfolioData.json'
import DemoPlayer from './explorer/DemoPlayer'
import { demoScripts, DEMO_ORDER } from './explorer/demoScripts'
import { STEP_MS } from './explorer/playback'

const studies = Object.fromEntries(portfolioData.projects.filter((p) => p.caseStudy).map((p) => [p.name, p.caseStudy]))
const order = DEMO_ORDER.filter((name) => studies[name])

// The Overview's "System explorer": a short self-playing demo that cycles through the featured projects.
export default function SystemMap({ onNavigate }) {
  return (
    <DemoPlayer variant="overview" title="System explorer" order={order} scripts={demoScripts} studies={studies} stepMs={STEP_MS}>
      <button className="system-open" onClick={() => onNavigate('portfolio')}>Explore the case studies <span aria-hidden="true">↗</span></button>
    </DemoPlayer>
  )
}
