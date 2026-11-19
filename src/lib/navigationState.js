const ACTIVE_TAB_KEY = 'portfolio.activeTab'

export function readActiveTab(validTabs, fallback = 'about', storage) {
  try {
    const target = storage ?? globalThis.sessionStorage
    const saved = target.getItem(ACTIVE_TAB_KEY)
    return validTabs.includes(saved) ? saved : fallback
  } catch {
    return fallback
  }
}

export function storeActiveTab(tab, storage) {
  try {
    const target = storage ?? globalThis.sessionStorage
    target.setItem(ACTIVE_TAB_KEY, tab)
  } catch {
    // Navigation still works when browser storage is unavailable.
  }
}
