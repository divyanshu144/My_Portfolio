// Sizing rules for the assistant console. Plain JavaScript so it can be unit tested.

export const MIN_HEIGHT = 220
export const MAX_FRACTION = 0.8
export const FIT_FRACTION = 0.55

// The minimum wins on a viewport too short for it.
export function clampHeight(px, viewportHeight) {
  return Math.max(MIN_HEIGHT, Math.min(px, viewportHeight * MAX_FRACTION))
}

// How tall the console grows when the Fit check tab has something to show.
export function fitHeight(viewportHeight) {
  return clampHeight(viewportHeight * FIT_FRACTION, viewportHeight)
}
