import { defineStore } from 'pinia'

export interface DecompositionSettings {
  count: number
  max: number
}

interface DecompositionExercise {
  id: string
  total: number
}

type DecompositionPhase = 'setup' | 'quiz' | 'summary'

interface DecompositionState {
  phase: DecompositionPhase
  settings: DecompositionSettings
  exercises: DecompositionExercise[]
  pointer: number
  mistakes: boolean[]
}

export const decompositionDefaultSettings: DecompositionSettings = {
  count: 10,
  max: 50,
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function createExercise(max: number): DecompositionExercise {
  const clampedMax = Math.max(1, Math.min(100, Math.floor(max)))
  const total = randomInt(1, clampedMax)
  return {
    id: `${total}-${Math.random().toString(36).slice(2, 7)}`,
    total,
  }
}

function generateExercises(count: number, max: number): DecompositionExercise[] {
  return Array.from({ length: count }, () => createExercise(max))
}

export const useDecompositionStore = defineStore('decomposition', {
  state: (): DecompositionState => ({
    phase: 'setup',
    settings: { ...decompositionDefaultSettings },
    exercises: [],
    pointer: 0,
    mistakes: [],
  }),
  getters: {
    currentExercise(state): DecompositionExercise | null {
      return state.exercises[state.pointer] ?? null
    },
    totalExercises(state): number {
      return state.exercises.length
    },
    currentStep(state): number {
      return state.exercises.length ? state.pointer + 1 : 0
    },
    correctCount(state): number {
      const mistakes = state.mistakes.filter((flag) => flag).length
      const total = state.exercises.length
      const correct = total - mistakes
      return correct >= 0 ? correct : 0
    },
  },
  actions: {
    reset() {
      this.phase = 'setup'
      this.settings = { ...decompositionDefaultSettings }
      this.exercises = []
      this.pointer = 0
      this.mistakes = []
    },
    start(settings: DecompositionSettings) {
      this.settings = { ...settings }
      this.exercises = generateExercises(this.settings.count, this.settings.max)
      this.pointer = 0
      this.mistakes = Array.from({ length: this.exercises.length }, () => false)
      this.phase = 'quiz'
    },
    evaluateParts(parts: { a: number; b: number }) {
      if (this.phase !== 'quiz') {
        return { correct: false }
      }
      const exercise = this.currentExercise
      if (!exercise) {
        return { correct: false }
      }
      const correct = parts.a + parts.b === exercise.total
      if (!correct) {
        this.mistakes[this.pointer] = true
      }
      return { correct }
    },
    next() {
      if (this.phase !== 'quiz') {
        return
      }
      if (this.pointer < this.exercises.length - 1) {
        this.pointer += 1
      } else {
        this.phase = 'summary'
      }
    },
  },
})
