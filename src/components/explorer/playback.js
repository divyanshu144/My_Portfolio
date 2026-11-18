// Pure playback state for the System explorer demo: which project is showing and which of its steps.

export const STEP_MS = 1800

export const initialState = (order) => ({ project: order[0], step: 0 })

export function advance(state, order, stepCount) {
  if (state.step < stepCount - 1 && order.includes(state.project)) return { ...state, step: state.step + 1 }
  const next = order[(order.indexOf(state.project) + 1) % order.length]
  return { project: next, step: 0 }
}

export const jumpToProject = (_state, project) => ({ project, step: 0 })

export const jumpToStep = (state, step) => ({ ...state, step })

// A run is a list of beats; each beat belongs to one workflow stage (`step`), and a run may revisit
// a stage (a retry). For the beat being shown, work out what each stage looks like.
export function stageView(beats, beatIndex, stageCount) {
  const seen = beats.slice(0, beatIndex + 1)
  const current = beats[beatIndex]?.step
  return Array.from({ length: stageCount }, (_, stage) => {
    const mine = seen.filter((beat) => beat.step === stage)
    const latest = mine[mine.length - 1]
    const status = stage === current ? 'current' : mine.length ? 'done' : 'idle'
    return { status, readout: latest?.readout ?? '', tone: latest?.tone }
  })
}

export function firstBeatOf(beats, stage) {
  const index = beats.findIndex((beat) => beat.step === stage)
  return index === -1 ? 0 : index
}
export const DEEP_STEP_MS = 1800
