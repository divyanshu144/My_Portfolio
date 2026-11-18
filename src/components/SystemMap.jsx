import { useState } from 'react'
import portfolioData from '../../data/portfolioData.json'

const projects = portfolioData.projects.filter((project) => project.caseStudy)

export default function SystemMap({ onNavigate }) {
  const [selected, setSelected] = useState('DocChat')
  const [stage, setStage] = useState(0)
  const project = projects.find((item) => item.name === selected) ?? projects[0]
  const study = project.caseStudy

  return (
    <section className="system-map" aria-labelledby="system-map-title">
      <div className="system-map-bar"><h3 id="system-map-title">System explorer</h3><span>INTERACTIVE / 01</span></div>
      <div className="system-projects" role="group" aria-label="Choose a project">
        {projects.map((item) => <button key={item.name} aria-pressed={selected === item.name} onClick={() => { setSelected(item.name); setStage(0) }}>{item.name}</button>)}
      </div>
      <div className="system-canvas">
        <div className="system-orbit system-orbit-one" aria-hidden="true" />
        <div className="system-orbit system-orbit-two" aria-hidden="true" />
        <div className="system-core"><span aria-hidden="true">◇</span><strong>{project.name}</strong><small>{study.category}</small></div>
        <div className="system-node-grid" role="group" aria-label={`${project.name} workflow stages`}>
          {study.workflow.map((step, i) => <button className={`system-node system-node-${i}`} key={step} aria-pressed={stage === i} aria-controls="system-detail" onClick={() => setStage(i)}><span className="system-node-index">0{i + 1}</span><span>{step}</span><span className="system-node-dot" aria-hidden="true" /></button>)}
        </div>
        <span className="system-canvas-label" aria-hidden="true">ARCHITECTURE / SELECT A NODE</span>
      </div>
      <div className="system-detail" id="system-detail" aria-live="polite" aria-atomic="true"><span className="system-detail-label">0{stage + 1} / {study.workflow[stage]}</span><p>{study.workflowDetails[stage]}</p></div>
      <button className="system-open" onClick={() => onNavigate('portfolio')}>Explore the case studies <span aria-hidden="true">↗</span></button>
    </section>
  )
}
