import { defineStore } from 'pinia'

type PyramidPhase = 'setup' | 'quiz' | 'summary'

type BaseRow = [number, number, number, number]
type Level3Row = [number, number, number]
type Level2Row = [number, number]
type Level1Row = [number]

export interface PyramidSettings {
  count: number
  max: number
}

export interface PyramidEntry {
  value: number | null
  correct: number
  readOnly: boolean
}

interface PyramidExercise {
  id: string
  entries: PyramidEntry[][]
}

interface PyramidState {
  phase: PyramidPhase
  settings: PyramidSettings
  exercises: PyramidExercise[]
  pointer: number
  mistakes: boolean[]
}

const defaultSettings: PyramidSettings = {
  count: 3,
  max: 20,
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function buildBase(max: number): BaseRow {
  const upperBound = Math.max(8, max)
  const targetTop = randomInt(8, upperBound)
  const delta = targetTop - 8

  const maxTriplesForB = Math.floor(delta / 3)
  const y = maxTriplesForB > 0 ? randomInt(0, maxTriplesForB) : 0
  const afterB = delta - y * 3

  const maxTriplesForC = Math.floor(afterB / 3)
  const z = maxTriplesForC > 0 ? randomInt(0, maxTriplesForC) : 0
  const afterC = afterB - z * 3

  const x = afterC > 0 ? randomInt(0, afterC) : 0
  const w = afterC - x

  const a = 1 + x
  const b = 1 + y
  const c = 1 + z
  const d = 1 + w

  return [a, b, c, d]
}

function computeLayers(base: BaseRow) {
  const level3: Level3Row = [base[0] + base[1], base[1] + base[2], base[2] + base[3]]
  const level2: Level2Row = [level3[0] + level3[1], level3[1] + level3[2]]
  const level1: Level1Row = [level2[0] + level2[1]]
  return { level1, level2, level3 }
}

function createEntry(correct: number, readOnly = false): PyramidEntry {
  return {
    value: readOnly ? correct : null,
    correct,
    readOnly,
  }
}

function buildExercise(max: number): PyramidExercise {
  const base = buildBase(max)
  const { level1, level2, level3 } = computeLayers(base)
  const entries: PyramidEntry[][] = [
    level1.map((value) => createEntry(value)),
    level2.map((value) => createEntry(value)),
    level3.map((value) => createEntry(value)),
    base.map((value) => createEntry(value, true)),
  ]
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    entries,
  }
}

function generateExercises(settings: PyramidSettings): PyramidExercise[] {
  return Array.from({ length: settings.count }, () => buildExercise(settings.max))
}

export const usePyramidStore = defineStore('pyramid-lab', {
  state: (): PyramidState => ({
    phase: 'setup',
    settings: { ...defaultSettings },
    exercises: [],
    pointer: 0,
    mistakes: [],
  }),
  getters: {
    currentExercise(state): PyramidExercise | null {
      return state.exercises[state.pointer] ?? null
    },
    currentEntries(state): PyramidEntry[][] {
      return state.exercises[state.pointer]?.entries ?? []
    },
    totalExercises(state): number {
      return state.exercises.length
    },
    currentStep(state): number {
      return state.exercises.length ? state.pointer + 1 : 0
    },
    correctCount(state): number {
      if (!state.mistakes.length) {
        return 0
      }
      return state.mistakes.filter((flag) => !flag).length
    },
  },
  actions: {
    reset() {
      this.phase = 'setup'
      this.settings = { ...defaultSettings }
      this.exercises = []
      this.pointer = 0
      this.mistakes = []
    },
    start(settings: PyramidSettings) {
      this.settings = {
        count: settings.count,
        max: Math.max(8, settings.max),
      }
      this.exercises = generateExercises(this.settings)
      this.mistakes = Array.from({ length: this.exercises.length }, () => false)
      this.pointer = 0
      this.phase = 'quiz'
    },
    updateEntry(row: number, col: number, value: number | null) {
      if (this.phase !== 'quiz') {
        return
      }
      const entries = this.currentEntries
      if (row < 0 || row >= entries.length) {
        return
      }
      const rowEntries = entries[row]
      if (!rowEntries || col < 0 || col >= rowEntries.length) {
        return
      }
      const entry = rowEntries[col]
      if (!entry || entry.readOnly) {
        return
      }
      entry.value = value
    },
    checkCurrent() {
      if (this.phase !== 'quiz') {
        return false
      }
      const entries = this.currentEntries
      if (!entries.length) {
        return false
      }
      let allCorrect = true
      const lastRowIndex = entries.length - 1
      for (let row = 0; row < lastRowIndex; row += 1) {
        const rowEntries = entries[row] ?? []
        for (const entry of rowEntries) {
          if (!entry) {
            continue
          }
          if (entry.value === entry.correct) {
            entry.value = entry.correct
          } else {
            entry.value = null
            allCorrect = false
          }
        }
      }
      if (!allCorrect) {
        this.mistakes[this.pointer] = true
      }
      return allCorrect
    },
    next(): PyramidPhase {
      if (this.phase !== 'quiz') {
        return this.phase
      }
      if (this.pointer < this.exercises.length - 1) {
        this.pointer += 1
        return this.phase
      }
      this.phase = 'summary'
      return this.phase
    },
  },
})
