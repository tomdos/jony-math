import { defineStore } from 'pinia'

export type OperationMode = 'add' | 'sub' | 'mix'

export interface SessionSettings {
  mode: OperationMode
  count: number
  max: number
}

export interface Question {
  id: string
  a: number
  b: number
  op: '+' | '-'
  correct: number
}

type SessionPhase = 'setup' | 'quiz' | 'summary' | 'review'

interface SessionState {
  phase: SessionPhase
  settings: SessionSettings
  questions: Question[]
  order: number[]
  pointer: number
  answers: Array<number | null>
  reviewResponses: Record<number, number | null>
  wrongIndices: number[]
  lastRunWasReview: boolean
  attempts: number
  reviewError: boolean
}

const UNIQUE_ATTEMPT_MULTIPLIER = 12

export const defaultSettings: SessionSettings = {
  mode: 'mix',
  count: 10,
  max: 20,
}

const operationLabels: Record<OperationMode, string> = {
  add: 'Addition',
  sub: 'Subtraction',
  mix: 'Mixed + / -',
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function createAddition(max: number) {
  const a = randomInt(0, max)
  const b = randomInt(0, max - a)
  return { a, b, op: '+' as const, correct: a + b }
}

function createSubtraction(max: number) {
  const a = randomInt(0, max)
  const b = randomInt(0, a)
  return { a, b, op: '-' as const, correct: a - b }
}

function buildQuestion(mode: OperationMode, max: number) {
  if (mode === 'add') {
    return createAddition(max)
  }
  if (mode === 'sub') {
    return createSubtraction(max)
  }
  const mixed = Math.random() < 0.5 ? 'add' : 'sub'
  return mixed === 'add' ? createAddition(max) : createSubtraction(max)
}

function shuffle<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = items[i]!
    items[i] = items[j]!
    items[j] = temp
  }
  return items
}

function generateQuestions(settings: SessionSettings): Question[] {
  const { mode, count, max } = settings
  const questions: Question[] = []
  const uniqueKeys = new Set<string>()
  const maxAttempts = count * UNIQUE_ATTEMPT_MULTIPLIER
  let attempts = 0
  let zeroOperandCount = 0
  let zeroResultCount = 0

  while (questions.length < count && attempts < maxAttempts) {
    const base = buildQuestion(mode, max)
    const key = `${base.a}|${base.op}|${base.b}`
    attempts += 1
    if (uniqueKeys.has(key)) {
      continue
    }
    const hasZeroOperand = base.a === 0 || base.b === 0
    const hasZeroResult = base.correct === 0
    if (hasZeroOperand && zeroOperandCount >= 1) {
      continue
    }
    if (hasZeroResult && zeroResultCount >= 1) {
      continue
    }
    uniqueKeys.add(key)
    questions.push({ ...base, id: `${key}-${Math.random().toString(36).slice(2, 8)}` })
    if (hasZeroOperand) {
      zeroOperandCount += 1
    }
    if (hasZeroResult) {
      zeroResultCount += 1
    }
  }

  while (questions.length < count) {
    const base = buildQuestion(mode, max)
    const key = `${base.a}|${base.op}|${base.b}`
    const hasZeroOperand = base.a === 0 || base.b === 0
    const hasZeroResult = base.correct === 0
    if (hasZeroOperand && zeroOperandCount >= 1) {
      continue
    }
    if (hasZeroResult && zeroResultCount >= 1) {
      continue
    }
    questions.push({ ...base, id: `${key}-${Math.random().toString(36).slice(2, 8)}` })
    if (hasZeroOperand) {
      zeroOperandCount += 1
    }
    if (hasZeroResult) {
      zeroResultCount += 1
    }
  }

  return shuffle(questions)
}

function evaluateWrongIndices(state: SessionState) {
  state.wrongIndices = state.questions
    .map((question, index) => ({ index, correct: question.correct, answer: state.answers[index] }))
    .filter((item) => item.answer !== item.correct)
    .map((item) => item.index)
}

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    phase: 'setup',
    settings: { ...defaultSettings },
    questions: [],
    order: [],
    pointer: 0,
    answers: [],
    reviewResponses: {},
    wrongIndices: [],
    lastRunWasReview: false,
    attempts: 0,
    reviewError: false,
  }),
  getters: {
    currentQuestion(state): Question | null {
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
      return state.questions.reduce((sum, question, index) => {
        return sum + (state.answers[index] === question.correct ? 1 : 0)
      }, 0)
    },
    wrongQuestions(state): Question[] {
      return state.wrongIndices
        .map((index) => state.questions[index])
        .filter((question): question is Question => question !== undefined)
    },
    modeLabel(state): string {
      return operationLabels[state.settings.mode]
    },
  },
  actions: {
    startSession(payload: SessionSettings) {
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
      if (this.phase === 'quiz') {
        this.answers[currentIndex] = answer
        this.reviewError = false
        if (this.pointer < this.order.length - 1) {
          this.pointer += 1
        } else {
          this.finishRun()
        }
        return
      }

      const question = this.questions[currentIndex]
      if (!question) {
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
        this.reviewError = true
      }
    },
    finishRun() {
      const wasReview = this.phase === 'review'
      this.order = []
      this.pointer = 0
      this.reviewResponses = {}
      evaluateWrongIndices(this)
      this.reviewError = false

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
      this.reviewError = false
    },
    clearReviewError() {
      this.reviewError = false
    },
  },
})
