// Shared motion rhythm. Keep in step with --ease and --dur-* in workspace.css.
export const EASE = [0.2, 0.7, 0.2, 1]

// seconds (Motion uses seconds; the CSS variables use milliseconds)
export const DURATION = { quick: 0.15, normal: 0.25, slow: 0.4 }

export const STAGGER = 0.05

export function transition(name) {
  if (!Object.hasOwn(DURATION, name)) {
    throw new Error(`Unknown motion duration: ${name}`)
  }
  return { duration: DURATION[name], ease: EASE }
}
