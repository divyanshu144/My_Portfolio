import { test } from 'node:test'
import assert from 'node:assert/strict'
import { advance, jumpToProject, jumpToStep, initialState } from './playback.js'

const order = ['DocChat', 'JobFit', 'SuperOps']

test('starts on the first project at step one', () => {
  assert.deepEqual(initialState(order), { project: 'DocChat', step: 0 })
})

test('advances through the steps of a project', () => {
  assert.deepEqual(advance({ project: 'DocChat', step: 0 }, order, 4), { project: 'DocChat', step: 1 })
  assert.deepEqual(advance({ project: 'DocChat', step: 2 }, order, 4), { project: 'DocChat', step: 3 })
})

test('moves to the next project after the last step', () => {
  assert.deepEqual(advance({ project: 'DocChat', step: 3 }, order, 4), { project: 'JobFit', step: 0 })
  assert.deepEqual(advance({ project: 'JobFit', step: 3 }, order, 4), { project: 'SuperOps', step: 0 })
})

test('loops back to the first project after the last one', () => {
  assert.deepEqual(advance({ project: 'SuperOps', step: 3 }, order, 4), { project: 'DocChat', step: 0 })
})

test('jumping to a project starts it from step one', () => {
  assert.deepEqual(jumpToProject({ project: 'DocChat', step: 2 }, 'SuperOps'), { project: 'SuperOps', step: 0 })
})

test('jumping to a step keeps the current project', () => {
  assert.deepEqual(jumpToStep({ project: 'JobFit', step: 0 }, 2), { project: 'JobFit', step: 2 })
})

test('an unknown current project restarts from the first one', () => {
  assert.deepEqual(advance({ project: 'Gone', step: 3 }, order, 4), { project: 'DocChat', step: 0 })
})

test('every demo script (Overview and deep) fits its case study workflow', async () => {
  const { demoScripts, DEMO_ORDER } = await import('./demoScripts.js')
  const { deepScripts } = await import('./deepScripts.js')
  const { readFile } = await import('node:fs/promises')
  const data = JSON.parse(await readFile(new URL('../../../data/portfolioData.json', import.meta.url)))
  for (const [label, scripts] of [['overview', demoScripts], ['deep', deepScripts]]) {
    for (const name of DEMO_ORDER) {
      const study = data.projects.find((p) => p.name === name)?.caseStudy
      assert.ok(study, `${name} has a caseStudy`)
      assert.equal(study.workflowDetails.length, study.workflow.length, `${name} details count`)
      const stages = scripts[name].beats.map((beat) => beat.step)
      assert.ok(stages.every((s) => Number.isInteger(s) && s >= 0 && s < study.workflow.length), `${label} ${name} stages in range`)
      assert.equal(new Set(stages).size, study.workflow.length, `${label} ${name} visits every stage`)
    }
  }
})

// Runs can have more moments ("beats") than workflow stages, and can return to an earlier stage.
const beats = [
  { step: 0, readout: 'plan' },
  { step: 1, readout: 'retrieve' },
  { step: 2, readout: 'draft' },
  { step: 3, readout: 'critic: poor', tone: 'fail' },
  { step: 0, readout: 'replan' },
  { step: 3, readout: 'critic: good', tone: 'ok' },
]

test('stage view marks the current stage, visited stages and untouched ones', async () => {
  const { stageView } = await import('./playback.js')
  assert.deepEqual(stageView(beats, 1, 4).map((s) => s.status), ['done', 'current', 'idle', 'idle'])
})

test('stage view shows the latest readout and failure for each stage', async () => {
  const { stageView } = await import('./playback.js')
  const atFailure = stageView(beats, 3, 4)
  assert.equal(atFailure[3].readout, 'critic: poor')
  assert.equal(atFailure[3].tone, 'fail')
  const afterRetry = stageView(beats, 5, 4)
  assert.equal(afterRetry[3].readout, 'critic: good')
  assert.equal(afterRetry[3].tone, 'ok')
  assert.equal(afterRetry[0].readout, 'replan')
})

test('going back to an earlier stage makes it current again', async () => {
  const { stageView } = await import('./playback.js')
  assert.deepEqual(stageView(beats, 4, 4).map((s) => s.status), ['current', 'done', 'done', 'done'])
})

test('a stage jump lands on the first beat of that stage', async () => {
  const { firstBeatOf } = await import('./playback.js')
  assert.equal(firstBeatOf(beats, 3), 3)
  assert.equal(firstBeatOf(beats, 0), 0)
  assert.equal(firstBeatOf(beats, 9), 0)
})
