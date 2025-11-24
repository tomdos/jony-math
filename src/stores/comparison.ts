import { defineStore } from 'pinia'

export type ComparisonOperator = '>' | '<' | '='

export interface ComparisonSettings {
  count: number
  max: number
}

interface ComparisonExercise {
  id: string
  left: number
  right: number
  correct: ComparisonOperator
}

type ComparisonPhase = 'setup' | 'quiz' | 'summary'

interface ComparisonState {
  phase: ComparisonPhase
  settings: ComparisonSettings
  exercises: ComparisonExercise[]
  pointer: number
  mistakes: boolean[]
}

export const comparisonDefaultSettings: ComparisonSettings = {
  count: 10,
  max: 50,
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function createExercise(max: number): ComparisonExercise {
  const clampedMax = Math.max(0, Math.min(100, Math.floor(max)))
  let left = randomInt(0, clampedMax)
  let right = randomInt(0, clampedMax)
  // Increase likelihood of equality to make '=' appear occasionally
  if (Math.random() < 0.2) {
    const equalValue = randomInt(0, clampedMax)
    left = equalValue
    right = equalValue
  }
  let correct: ComparisonOperator = '='
  if (left > right) {
    correct = '>'
  } else if (left < right) {
    correct = '<'
  }
  return {
    id: `${left}-${right}-${Math.random().toString(36).slice(2, 7)}`,
    left,
    right,
    correct,
  }
}

function generateExercises(count: number, max: number): ComparisonExercise[] {
  return Array.from({ length: count }, () => createExercise(max))
}

export const useComparisonStore = defineStore('comparison', {
  state: (): ComparisonState => ({
    phase: 'setup',
    settings: { ...comparisonDefaultSettings },
    exercises: [],
    pointer: 0,
    mistakes: [],
  }),
  getters: {
    currentExercise(state): ComparisonExercise | null {
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
      this.settings = { ...comparisonDefaultSettings }
      this.exercises = []
      this.pointer = 0
      this.mistakes = []
    },
    start(settings: ComparisonSettings) {
      this.settings = { ...settings }
      this.exercises = generateExercises(this.settings.count, this.settings.max)
      this.pointer = 0
      this.mistakes = Array.from({ length: this.exercises.length }, () => false)
      this.phase = 'quiz'
    },
    evaluateSelection(op: ComparisonOperator) {
      if (this.phase !== 'quiz') {
        return { correct: false }
      }
      const exercise = this.currentExercise
      if (!exercise) {
        return { correct: false }
      }
      const correct = op === exercise.correct
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
