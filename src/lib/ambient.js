// Ambient effects only run while someone can see them.
export function shouldAnimate({ inView, pageVisible }) {
  return Boolean(inView && pageVisible)
}
