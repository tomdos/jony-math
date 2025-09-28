import { defineStore } from 'pinia'

type ClockPhase = 'setup' | 'quiz' | 'summary'

export interface ClockSettings {
  count: number
}

export interface ClockExercise {
  id: string
  hours: number
  minutes: number
}

export interface ClockResponse {
  hours: number | null
  minutes: number | null
}

interface ClockState {
  phase: ClockPhase
  settings: ClockSettings
  exercises: ClockExercise[]
  pointer: number
  responses: ClockResponse[]
  results: boolean[]
}

const defaultSettings: ClockSettings = {
  count: 3,
}

function randomTime(): { hours: number; minutes: number } {
  const hours = Math.floor(Math.random() * 12) || 12
  const minuteSlots = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
  const minutes = minuteSlots[Math.floor(Math.random() * minuteSlots.length)]!
  return { hours, minutes }
}

function generateExercises(count: number): ClockExercise[] {
  const exercises: ClockExercise[] = []
  for (let i = 0; i < count; i += 1) {
    const time = randomTime()
    exercises.push({ id: `clock-${i}-${Date.now()}-${Math.random()}`, ...time })
  }
  return exercises
}

function emptyResponse(): ClockResponse {
  return { hours: null, minutes: null }
}

export const useClockStore = defineStore('clock-lab', {
  state: (): ClockState => ({
    phase: 'setup',
    settings: { ...defaultSettings },
    exercises: [],
    pointer: 0,
    responses: [],
    results: [],
  }),
  getters: {
    currentExercise(state): ClockExercise | null {
      return state.exercises[state.pointer] ?? null
    },
    totalExercises(state): number {
      return state.exercises.length
    },
    correctCount(state): number {
      return state.results.filter(Boolean).length
    },
  },
  actions: {
    reset() {
      this.phase = 'setup'
      this.settings = { ...defaultSettings }
      this.exercises = []
      this.pointer = 0
      this.responses = []
      this.results = []
    },
    start(settings: ClockSettings) {
      this.settings = { ...settings }
      this.exercises = generateExercises(this.settings.count)
      this.responses = Array.from({ length: this.exercises.length }, () => emptyResponse())
      this.results = Array.from({ length: this.exercises.length }, () => false)
      this.pointer = 0
      this.phase = 'quiz'
    },
    submitResponse(payload: ClockResponse) {
      if (this.phase !== 'quiz') {
        return
      }
      const exercise = this.exercises[this.pointer]
      if (!exercise) {
        return
      }
      const normalizedHours = payload.hours ?? null
      const normalizedMinutes = payload.minutes ?? null
      this.responses[this.pointer] = {
        hours: normalizedHours,
        minutes: normalizedMinutes,
      }
      const isCorrect =
        normalizedHours === exercise.hours && normalizedMinutes === exercise.minutes
      this.results[this.pointer] = Boolean(isCorrect)

    },
    advance() {
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
