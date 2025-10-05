import { defineStore } from 'pinia'

export interface DiceSettings {
  diceCount: 2 | 3
  throwsCount: 3 | 5 | 6
}

export interface DiceExercise {
  id: string
  values: number[]
  sum: number
}

interface DiceState {
  phase: 'setup' | 'quiz' | 'summary'
  settings: DiceSettings
  exercises: DiceExercise[]
  pointer: number
  answers: Array<number | null>
  results: boolean[]
}

const defaultSettings: DiceSettings = {
  diceCount: 2,
  throwsCount: 5,
}

function randomDie() {
  return Math.floor(Math.random() * 6) + 1
}

function buildExercise(count: number): DiceExercise {
  const values = Array.from({ length: count }, () => randomDie())
  const sum = values.reduce((acc, value) => acc + value, 0)
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    values,
    sum,
  }
}

function generateExercises(settings: DiceSettings): DiceExercise[] {
  return Array.from({ length: settings.throwsCount }, () => buildExercise(settings.diceCount))
}

export const useDiceStore = defineStore('dice-lab', {
  state: (): DiceState => ({
    phase: 'setup',
    settings: { ...defaultSettings },
    exercises: [],
    pointer: 0,
    answers: [],
    results: [],
  }),
  getters: {
    currentExercise(state): DiceExercise | null {
      return state.exercises[state.pointer] ?? null
    },
    totalExercises(state): number {
      return state.exercises.length
    },
    currentStep(state): number {
      return state.exercises.length ? state.pointer + 1 : 0
    },
    correctCount(state): number {
      return state.results.filter(Boolean).length
    },
  },
  actions: {
    reset() {
      this.phase = 'setup'
      this.exercises = []
      this.pointer = 0
      this.answers = []
      this.results = []
      this.settings = { ...defaultSettings }
    },
    start(settings: DiceSettings) {
      this.settings = { ...settings }
      this.exercises = generateExercises(this.settings)
      this.pointer = 0
      this.answers = Array.from({ length: this.exercises.length }, () => null)
      this.results = Array.from({ length: this.exercises.length }, () => false)
      this.phase = 'quiz'
    },
    submit(answer: number) {
      if (this.phase !== 'quiz') {
        return
      }
      const exercise = this.exercises[this.pointer]
      if (!exercise) {
        return
      }
      this.answers[this.pointer] = answer
      this.results[this.pointer] = answer === exercise.sum
    },
    next() {
      if (this.phase !== 'quiz') {
        return
      }
      if (this.pointer < this.exercises.length - 1) {
        this.pointer += 1
        return
      }
      this.phase = 'summary'
    },
  },
})
