import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import portfolioData from '../../data/portfolioData.json'
import { skillGroups } from '../constants'
import { askAssistant } from '../lib/assistantEvents'

const Timeline = ({ icon, heading, id, headingId, listClassName = '', children }) => (
  <section className="timeline" id={id}>
    <div className="title-wrapper">
      <div className="icon-box"><ion-icon name={icon}></ion-icon></div>
      <h3 className="h3" id={headingId}>{heading}</h3>
    </div>
    <ol className={`timeline-list ${listClassName}`.trim()}>{children}</ol>
  </section>
)

const ExperienceTimeline = () => {
  const roles = portfolioData.experience
  const [selectedId, setSelectedId] = useState(roles[0]?.id)
  const selected = roles.find((role) => role.id === selectedId) ?? roles[0]
  const question = selected && portfolioData.assistant?.askAbout?.[selected.id]

  return (
    <section className="experience-timeline" aria-labelledby="experience-title">
      <div className="experience-timeline-heading">
        <p className="about-eyebrow">Career path / {String(roles.length).padStart(2, '0')} roles</p>
        <p>Choose a role to explore the work behind it.</p>
      </div>
      <div className="experience-timeline-layout">
        <ol className="experience-track" aria-label="Career timeline">
          {roles.map((role, index) => (
            <li className="experience-track-item" key={role.id}>
              <button
                type="button"
                id={role.id}
                className={`experience-selector${selected?.id === role.id ? ' is-selected' : ''}`}
                aria-pressed={selected?.id === role.id}
                aria-controls="experience-detail"
                onClick={() => setSelectedId(role.id)}
              >
                <span className="experience-track-index">0{index + 1}</span>
                <span className="experience-track-copy">
                  <strong>{role.title}</strong>
                  <span>{role.company}</span>
                  <small>{role.dates}</small>
                </span>
                <span className="experience-track-node" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
        {selected && (
          <div className="experience-detail" id="experience-detail" role="region" aria-live="polite" aria-labelledby="experience-detail-title">
            <p className="about-eyebrow">Selected role / {selected.dates}</p>
            <h4 id="experience-detail-title">{selected.title} <span>·</span> {selected.company}</h4>
            {selected.location && <p className="experience-detail-location">{selected.location}</p>}
            <ul className="timeline-text timeline-bullets">
              {selected.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
            </ul>
            {question && <button type="button" className="ask-about" aria-label={`Ask about this: ${selected.title} · ${selected.company}`} onClick={() => askAssistant(question)}>Ask about this <span aria-hidden="true">↗</span></button>}
          </div>
        )}
      </div>
    </section>
  )
}

const EducationTimeline = () => {
  const studies = portfolioData.education
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = studies[selectedIndex]

  return (
    <div className="experience-timeline education-timeline" aria-labelledby="education-title">
      <div className="experience-timeline-heading">
        <p className="about-eyebrow">Study path / {String(studies.length).padStart(2, '0')} qualifications</p>
        <p>Select a qualification to see the work behind it.</p>
      </div>
      <div className="experience-timeline-layout">
        <ol className="experience-track" aria-label="Education timeline">
          {studies.map((study, index) => (
            <li className="experience-track-item" key={`${study.degree}-${study.institution}`}>
              <button
                type="button"
                className={`experience-selector education-selector${selectedIndex === index ? ' is-selected' : ''}`}
                aria-pressed={selectedIndex === index}
                aria-controls="education-detail"
                onClick={() => setSelectedIndex(index)}
              >
                <span className="experience-track-index">0{index + 1}</span>
                <span className="experience-track-copy">
                  <strong>{study.degree}</strong>
                  <span>{study.institution}</span>
                  <small>{study.dates}</small>
                </span>
                <span className="experience-track-node" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
        {selected && (
          <div className="experience-detail education-detail" id="education-detail" role="region" aria-live="polite" aria-labelledby="education-detail-title">
            <p className="about-eyebrow">Selected qualification / {selected.dates}</p>
            <h4 id="education-detail-title">{selected.degree}</h4>
            <p className="experience-detail-location">{selected.institution}{selected.grade ? ` · ${selected.grade}` : ''}</p>
            {selected.dissertation && <p className="education-project"><span>FINAL PROJECT</span>{selected.dissertation}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

const skillDescriptions = {
  languages: 'The programming languages used across the portfolio projects and engineering work.',
  ai_ml: 'Model integration, retrieval, evaluation, and predictive modelling tools.',
  backend_apis: 'Service layers, API design, and the databases behind reliable applications.',
  data_etl: 'Tools for cleaning, moving, analysing, and tracking data workflows.',
  devops: 'Version control, deployment, orchestration, and infrastructure tools.',
  frontend: 'Frameworks and styling tools for building clear web interfaces.',
}

const SkillsExplorer = () => {
  const groups = Object.entries(portfolioData.skills)
  const reduceMotion = useReducedMotion()
  const groupsRef = useRef(null)
  const [selectedKey, setSelectedKey] = useState(groups[0]?.[0])
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [previewSkill, setPreviewSkill] = useState(null)
  const [enteredGroups, setEnteredGroups] = useState(() => new Set())
  const selectedGroupKey = selectedSkill?.key ?? selectedKey
  const activeGroupKey = previewSkill?.key ?? selectedGroupKey
  const displayedSkill = previewSkill ?? selectedSkill
  const selected = groups.find(([key]) => key === activeGroupKey) ?? groups[0]
  const selectedGroupTitle = skillGroups[selected?.[0]]?.title ?? selected?.[0]

  useEffect(() => {
    const root = groupsRef.current
    if (!root) return undefined
    const groupElements = [...root.querySelectorAll('.skill-group')]
    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      setEnteredGroups(new Set(groupElements.map((element) => element.dataset.skillGroup)))
      return undefined
    }
    const observer = new IntersectionObserver((entries) => {
      const newlyEntered = entries.filter((entry) => entry.isIntersecting)
      if (!newlyEntered.length) return
      setEnteredGroups((previous) => {
        const next = new Set(previous)
        newlyEntered.forEach((entry) => next.add(entry.target.dataset.skillGroup))
        return next
      })
      newlyEntered.forEach((entry) => observer.unobserve(entry.target))
    }, { threshold: 0.12 })
    groupElements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [reduceMotion])

  const selectGroup = (key) => {
    setSelectedKey(key)
    setSelectedSkill(null)
    setPreviewSkill(null)
  }
  const selectSkill = (key, skill) => {
    setSelectedKey(key)
    setSelectedSkill({ key, skill })
    setPreviewSkill(null)
  }

  return (
    <>
      {selected && (
        <div className="skills-context" id="skills-context" aria-live="polite" aria-labelledby="skills-context-title">
          <div><p className="about-eyebrow">{displayedSkill ? `${previewSkill ? 'Preview skill' : 'Selected skill'} / ${selectedGroupTitle}` : `Selected constellation / ${String(selected[1].length).padStart(2, '0')} skills`}</p><h4 id="skills-context-title">{displayedSkill?.skill ?? selectedGroupTitle}</h4></div>
          <p>{skillDescriptions[selected[0]] ?? 'Tools and techniques used across my engineering work.'}</p>
        </div>
      )}
      <p className="skills-instruction">Select a constellation or focus a skill node to explore its cluster.</p>
      <div className="skill-groups content-card" ref={groupsRef}>
        {groups.map(([key, items]) => {
          const active = key === activeGroupKey
          return (
            <section className={`skill-group${active ? ' is-active' : ''}${enteredGroups.has(key) ? ' has-entered' : ''}`} data-skill-group={key} key={key}>
              <button
                type="button"
                className="skill-group-selector"
                aria-pressed={key === selectedGroupKey}
                aria-controls={`skill-group-${key}`}
                onClick={() => selectGroup(key)}
              >
                <span className="skill-group-title">{skillGroups[key]?.title ?? key}</span>
                <span className="skill-group-count">{String(items.length).padStart(2, '0')}</span>
                <span className="skill-group-action" aria-hidden="true">{active ? 'SELECTED' : 'EXPLORE'} <span>↗</span></span>
              </button>
              <ul className="chip-list" id={`skill-group-${key}`}>
                {items.map((skill, index) => {
                  const isSelected = selectedSkill?.key === key && selectedSkill.skill === skill
                  const isPreviewed = previewSkill?.key === key && previewSkill.skill === skill
                  return (
                    <li className="skill-node-item" key={skill}>
                      <m.button
                        type="button"
                        className={`chip skill-chip skill-node${active ? ' is-emphasized' : ''}${isSelected ? ' is-node-selected' : ''}${isPreviewed ? ' is-node-preview' : ''}${enteredGroups.has(key) ? ' has-entered' : ''}`}
                        data-skill-group={key}
                        aria-pressed={isSelected}
                        aria-controls="skills-context"
                        whileHover={reduceMotion ? undefined : { scale: 1.05, y: -2 }}
                        whileFocus={reduceMotion ? undefined : { scale: 1.05, y: -2 }}
                        onFocus={() => selectSkill(key, skill)}
                        onClick={() => selectSkill(key, skill)}
                        onPointerEnter={() => setPreviewSkill({ key, skill })}
                        onPointerLeave={() => setPreviewSkill(null)}
                        style={{ '--node-index': index }}
                      >
                        <span className="skill-node-star" aria-hidden="true" />{skill}
                      </m.button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </>
  )
}

const Resume = () => (
  <>
    <Timeline icon="briefcase-outline" heading="Experience" headingId="experience-title" listClassName="experience-list">
      <li className="timeline-item experience-timeline-item"><ExperienceTimeline /></li>
    </Timeline>

    <Timeline icon="book-outline" heading="Education" id="education" headingId="education-title" listClassName="experience-list">
      <li className="timeline-item experience-timeline-item"><EducationTimeline /></li>
    </Timeline>

    <section className="skill">
      <h3 className="h3 skills-title" id="skills-title">My skills</h3>
      <SkillsExplorer />
    </section>
  </>
)

export default Resume
