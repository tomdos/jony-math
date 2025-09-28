import { defineStore } from 'pinia'

export type MultiplicationMode = 'mul' | 'div' | 'mix'

export interface MultiplicationSettings {
  mode: MultiplicationMode
  count: number
  max: number
}

export interface MultiplicationQuestion {
  id: string
  a: number
  b: number
  op: '×' | '÷'
  correct: number
}

type MultiplicationPhase = 'setup' | 'quiz' | 'summary' | 'review'

interface MultiplicationState {
  phase: MultiplicationPhase
  settings: MultiplicationSettings
  questions: MultiplicationQuestion[]
  order: number[]
  pointer: number
  answers: Array<number | null>
  reviewResponses: Record<number, number | null>
  wrongIndices: number[]
  lastRunWasReview: boolean
  attempts: number
  mistakeIndices: number[]
  mistakeAnswers: Record<number, number>
  reviewError: boolean
}

const UNIQUE_ATTEMPT_MULTIPLIER = 12
const FACTOR_LIMIT = 10

export const multiplicationDefaultSettings: MultiplicationSettings = {
  mode: 'mul',
  count: 10,
  max: 20,
}

const modeLabels: Record<MultiplicationMode, string> = {
  mul: 'Násobení',
  div: 'Dělení',
  mix: 'Smíšené × / ÷',
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function createMultiplicationPair(maxResult: number) {
  const maxAttempts = 100
  for (let i = 0; i < maxAttempts; i += 1) {
    const a = randomInt(1, FACTOR_LIMIT)
    const b = randomInt(1, FACTOR_LIMIT)
    const product = a * b
    if (product <= maxResult) {
      return { a, b, product }
    }
  }
  // Fallback: find smallest pair deterministically
  for (let a = 1; a <= FACTOR_LIMIT; a += 1) {
    for (let b = 1; b <= FACTOR_LIMIT; b += 1) {
      const product = a * b
      if (product <= maxResult) {
        return { a, b, product }
      }
    }
  }
  return { a: 1, b: 1, product: 1 }
}

function createMultiplicationQuestion(max: number): MultiplicationQuestion {
  const pair = createMultiplicationPair(max)
  return {
    id: `mul-${pair.a}x${pair.b}-${Math.random().toString(36).slice(2, 8)}`,
    a: pair.a,
    b: pair.b,
    op: '×',
    correct: pair.product,
  }
}

function createDivisionQuestion(max: number): MultiplicationQuestion {
  const pair = createMultiplicationPair(max)
  const dividend = pair.product
  const useFirst = Math.random() < 0.5
  const divisor = useFirst ? pair.a : pair.b
  const quotient = useFirst ? pair.b : pair.a
  return {
    id: `div-${dividend}:${divisor}-${Math.random().toString(36).slice(2, 8)}`,
    a: dividend,
    b: divisor,
    op: '÷',
    correct: quotient,
  }
}

function buildQuestion(mode: MultiplicationMode, max: number): MultiplicationQuestion {
  if (mode === 'mul') {
    return createMultiplicationQuestion(max)
  }
  if (mode === 'div') {
    return createDivisionQuestion(max)
  }
  return Math.random() < 0.5
    ? createMultiplicationQuestion(max)
    : createDivisionQuestion(max)
}

function generateQuestions(settings: MultiplicationSettings): MultiplicationQuestion[] {
  const { mode, count, max } = settings
  const questions: MultiplicationQuestion[] = []
  const uniqueKeys = new Set<string>()
  const maxAttempts = count * UNIQUE_ATTEMPT_MULTIPLIER
  let attempts = 0

  while (questions.length < count && attempts < maxAttempts) {
    const question = buildQuestion(mode, max)
    const key = `${question.a}|${question.op}|${question.b}`
    attempts += 1
    if (uniqueKeys.has(key)) {
      continue
    }
    uniqueKeys.add(key)
    questions.push(question)
  }

  while (questions.length < count) {
    questions.push(buildQuestion(mode, max))
  }

  return questions
}

function evaluateWrongIndices(state: MultiplicationState) {
  state.wrongIndices = state.questions
    .map((question, index) => ({ index, correct: question.correct, answer: state.answers[index] }))
    .filter((item) => item.answer !== item.correct)
    .map((item) => item.index)
}

export const useMultiplicationStore = defineStore('multiplication', {
  state: (): MultiplicationState => ({
    phase: 'setup',
    settings: { ...multiplicationDefaultSettings },
    questions: [],
    order: [],
    pointer: 0,
    answers: [],
    reviewResponses: {},
    wrongIndices: [],
    lastRunWasReview: false,
    attempts: 0,
    mistakeIndices: [],
    mistakeAnswers: {},
    reviewError: false,
  }),
  getters: {
    currentQuestion(state): MultiplicationQuestion | null {
      if (!state.order.length) {
        return null
      }
      const index = state.order[state.pointer]
      if (index === undefined) {
        return null
      }
      return state.questions[index] ?? null
    },
    totalInRun(state): number {
      return state.order.length
    },
    currentStepNumber(state): number {
      return state.order.length ? state.pointer + 1 : 0
    },
    totalQuestions(state): number {
      return state.questions.length
    },
    correctCount(state): number {
      const total = state.questions.length
      const mistakes = new Set(state.mistakeIndices).size
      const correct = total - mistakes
      return correct >= 0 ? correct : 0
    },
    modeLabel(state): string {
      return modeLabels[state.settings.mode]
    },
  },
  actions: {
    startSession(payload: MultiplicationSettings) {
      this.settings = { ...payload }
      this.questions = generateQuestions(this.settings)
      this.answers = Array.from({ length: this.questions.length }, () => null)
      this.order = this.questions.map((_, index) => index)
      this.pointer = 0
      this.reviewResponses = {}
      this.wrongIndices = []
      this.phase = 'quiz'
      this.lastRunWasReview = false
      this.attempts = 1
      this.mistakeIndices = []
      this.mistakeAnswers = {}
      this.reviewError = false
    },
    submitAnswer(answer: number) {
      if (this.phase !== 'quiz' && this.phase !== 'review') {
        return
      }
      const currentIndex = this.order[this.pointer]
      if (currentIndex === undefined) {
        return
      }
      const question = this.questions[currentIndex]
      if (!question) {
        return
      }
      if (this.phase === 'quiz') {
        this.answers[currentIndex] = answer
        if (answer !== question.correct) {
          this.recordMistake(currentIndex, answer)
        }
        this.reviewError = false
        if (this.pointer < this.order.length - 1) {
          this.pointer += 1
        } else {
          this.finishRun()
        }
        return
      }
      this.reviewResponses[currentIndex] = answer
      if (answer === question.correct) {
        this.answers[currentIndex] = answer
        this.reviewError = false
        if (this.pointer < this.order.length - 1) {
          this.pointer += 1
        } else {
          this.finishRun()
        }
      } else {
        this.recordMistake(currentIndex, answer)
        this.reviewError = true
      }
    },
    finishRun() {
      const wasReview = this.phase === 'review'
      this.order = []
      this.pointer = 0
      this.reviewResponses = {}
      evaluateWrongIndices(this)
      this.wrongIndices.forEach((index) => {
        const recorded = this.answers[index]
        if (recorded !== null && recorded !== undefined) {
          this.recordMistake(index, recorded)
        }
      })

      if (!wasReview && this.wrongIndices.length) {
        this.beginRetry()
        return
      }

      this.phase = 'summary'
      this.lastRunWasReview = wasReview
    },
    beginRetry() {
      if (!this.wrongIndices.length) {
        return
      }
      this.order = [...this.wrongIndices]
      this.pointer = 0
      this.reviewResponses = {}
      this.phase = 'review'
      this.lastRunWasReview = false
      this.attempts += 1
      this.reviewError = false
    },
    resetSession() {
      this.phase = 'setup'
      this.questions = []
      this.order = []
      this.pointer = 0
      this.answers = []
      this.reviewResponses = {}
      this.wrongIndices = []
      this.lastRunWasReview = false
      this.attempts = 0
      this.mistakeIndices = []
      this.mistakeAnswers = {}
      this.reviewError = false
    },
    recordMistake(index: number, answer: number) {
      if (!this.mistakeIndices.includes(index)) {
        this.mistakeIndices.push(index)
        this.mistakeAnswers[index] = answer
      }
    },
    clearReviewError() {
      this.reviewError = false
    },
  },
})
