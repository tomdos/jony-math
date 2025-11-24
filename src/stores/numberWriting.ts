import { defineStore } from 'pinia'

export interface NumberWritingSettings {
  count: number
}

interface NumberWritingExercise {
  id: string
  tens: number
  units: number
  total: number
}

type NumberWritingPhase = 'setup' | 'quiz' | 'summary'

interface NumberWritingState {
  phase: NumberWritingPhase
  settings: NumberWritingSettings
  exercises: NumberWritingExercise[]
  pointer: number
  mistakes: boolean[]
}

export const numberWritingDefaultSettings: NumberWritingSettings = {
  count: 10,
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function createExercise(): NumberWritingExercise {
  const tens = randomInt(0, 10)
  let units = randomInt(0, 9)
  if (tens === 10) {
    units = 0
  }
  const total = tens * 10 + units
  return {
    id: `${tens}-${units}-${Math.random().toString(36).slice(2, 7)}`,
    tens,
    units,
    total,
  }
}

function generateExercises(count: number): NumberWritingExercise[] {
  return Array.from({ length: count }, () => createExercise())
}

export const useNumberWritingStore = defineStore('number-writing', {
  state: (): NumberWritingState => ({
    phase: 'setup',
    settings: { ...numberWritingDefaultSettings },
    exercises: [],
    pointer: 0,
    mistakes: [],
  }),
  getters: {
    currentExercise(state): NumberWritingExercise | null {
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
      this.settings = { ...numberWritingDefaultSettings }
      this.exercises = []
      this.pointer = 0
      this.mistakes = []
    },
    start(settings: NumberWritingSettings) {
      this.settings = { ...settings }
      this.exercises = generateExercises(this.settings.count)
      this.pointer = 0
      this.mistakes = Array.from({ length: this.exercises.length }, () => false)
      this.phase = 'quiz'
    },
    evaluateAnswer(answer: number) {
      if (this.phase !== 'quiz') {
        return { correct: false }
      }
      const exercise = this.currentExercise
      if (!exercise) {
        return { correct: false }
      }
      const correct = answer === exercise.total
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
