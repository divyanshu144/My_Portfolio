const MAX = 3
const TABS = ['about', 'portfolio', 'resume', 'blog', 'contact']

const list = (value) => (Array.isArray(value) ? value : [])

/**
 * Page-aware suggested questions, at most three.
 * Order of preference: the case study in view, then the current tab, then the About overview.
 * Reads only the named tab keys and `caseStudies`; any other key (such as `_todo`) is ignored.
 */
export function suggestionsFor(assistantData, { tab, caseStudyId = null } = {}) {
  const suggestions = assistantData?.suggestions
  if (!suggestions) return []
  const caseStudy = caseStudyId ? list(suggestions.caseStudies?.[caseStudyId]) : []
  const forTab = TABS.includes(tab) ? list(suggestions[tab]) : []
  const picked = caseStudy.length ? caseStudy : forTab.length ? forTab : list(suggestions.about)
  return picked.slice(0, MAX)
}
