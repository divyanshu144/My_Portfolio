import { useEffect } from 'react'
import { shouldAnimate } from '../lib/ambient.js'

// Keeps ref.current.dataset.ambient at 'on' or 'off' so CSS can pause ambient
// animations when the element is off screen or the tab is hidden. It writes to
// the DOM directly, so it never causes a re-render.
export function useAmbient(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    let inView = true
    const update = () => {
      const pageVisible = document.visibilityState === 'visible'
      el.dataset.ambient = shouldAnimate({ inView, pageVisible }) ? 'on' : 'off'
    }

    let observer
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          inView = entries[entries.length - 1].isIntersecting
          update()
        },
        { threshold: 0 }
      )
      observer.observe(el)
    }

    document.addEventListener('visibilitychange', update)
    update()

    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [ref])
}
