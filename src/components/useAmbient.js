import { useEffect } from 'react'
import { shouldAnimate } from '../lib/ambient.js'

// Lets the root and any selected descendants pause independently when off screen.
// Writing their ambient state directly to the DOM avoids React re-renders.
export function useAmbient(ref, childSelector) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const elements = [el, ...(childSelector ? el.querySelectorAll(childSelector) : [])]
    const canObserve = typeof IntersectionObserver !== 'undefined'
    const inView = new Map(elements.map((element) => [element, !canObserve]))
    const update = (element) => {
      const pageVisible = document.visibilityState === 'visible'
      element.dataset.ambient = shouldAnimate({ inView: inView.get(element), pageVisible }) ? 'on' : 'off'
    }
    const updateAll = () => elements.forEach(update)

    let observer
    if (canObserve) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const { target, isIntersecting } of entries) {
            inView.set(target, isIntersecting)
            update(target)
          }
        },
        { threshold: 0 }
      )
      elements.forEach((element) => observer.observe(element))
    }

    document.addEventListener('visibilitychange', updateAll)
    updateAll()

    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', updateAll)
    }
  }, [ref, childSelector])
}
