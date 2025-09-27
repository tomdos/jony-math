import { defineStore } from 'pinia'
import { wordProblemBank, type WordProblemDefinition } from '../data/wordProblems'

type SessionPhase = 'setup' | 'quiz' | 'summary' | 'review'

export interface WordProblem extends WordProblemDefinition {
  instanceId: string
}

export interface WordSettings {
  count: number
}

export interface WordResponse {
  a: number | null
  op: '+' | '-' | null
  b: number | null
  result: number | null
}

interface WordSessionState {
  phase: SessionPhase
  settings: WordSettings
  problems: WordProblem[]
  order: number[]
  pointer: number
  responses: WordResponse[]
  reviewResponses: Record<number, WordResponse>
  wrongIndices: number[]
  lastRunWasReview: boolean
  attempts: number
  reviewError: boolean
  mistakeIndices: number[]
  mistakeRecords: Record<number, WordResponse>
}

function cloneProblem(base: WordProblemDefinition, suffix: number): WordProblem {
  return {
    ...base,
    instanceId: `${base.id}-${suffix}`,
  }
}

function buildProblemSet(count: number): WordProblem[] {
  if (!wordProblemBank.length) {
    return []
  }
  const shuffled = [...wordProblemBank]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }

  const problems: WordProblem[] = []
  for (let i = 0; i < count; i += 1) {
    const template = shuffled[i % shuffled.length]!
    problems.push(cloneProblem(template, i))
  }
  return problems
}

function emptyResponse(): WordResponse {
  return { a: null, op: null, b: null, result: null }
}

function responsesWithLength(length: number): WordResponse[] {
  return Array.from({ length }, () => emptyResponse())
}

function compareResponse(problem: WordProblem, response: WordResponse): boolean {
  if (response.op !== problem.op) {
    return false
  }
  if (response.a !== problem.a) {
    return false
  }
  if (response.b !== problem.b) {
    return false
  }
  if (response.result !== problem.result) {
    return false
  }
  return true
}

function evaluateWrongIndices(state: WordSessionState) {
  state.wrongIndices = state.problems
    .map((problem, index) => ({
      index,
      problem,
      response: state.responses[index] ?? emptyResponse(),
    }))
    .filter(({ response, problem }) => !compareResponse(problem, response))
    .map(({ index }) => index)
}

export const wordDefaultSettings: WordSettings = {
  count: 3,
}

export const useWordStore = defineStore('word-problems', {
  state: (): WordSessionState => ({
    phase: 'setup',
    settings: { ...wordDefaultSettings },
    problems: [],
    order: [],
    pointer: 0,
    responses: [],
    reviewResponses: {},
    wrongIndices: [],
    lastRunWasReview: false,
    attempts: 0,
    reviewError: false,
    mistakeIndices: [],
    mistakeRecords: {},
  }),
  getters: {
    currentProblem(state): WordProblem | null {
      if (!state.order.length) {
        return null
      }
      const index = state.order[state.pointer]
      if (index === undefined) {
        return null
      }
      return state.problems[index] ?? null
    },
    totalInRun(state): number {
      return state.order.length
    },
    currentStepNumber(state): number {
      return state.order.length ? state.pointer + 1 : 0
    },
    totalProblems(state): number {
      return state.problems.length
    },
    correctCount(state): number {
      const total = state.problems.length
      const mistakes = new Set(state.mistakeIndices).size
      const correct = total - mistakes
      return correct >= 0 ? correct : 0
    },
  },
  actions: {
    configure(settings: WordSettings) {
      this.settings = { ...settings }
    },
    startSession(settings: WordSettings) {
      this.settings = { ...settings }
      this.problems = buildProblemSet(this.settings.count)
      this.responses = responsesWithLength(this.problems.length)
      this.order = this.problems.map((_, index) => index)
      this.pointer = 0
      this.reviewResponses = {}
      this.wrongIndices = []
      this.phase = 'quiz'
      this.lastRunWasReview = false
      this.attempts = 1
      this.reviewError = false
      this.mistakeIndices = []
      this.mistakeRecords = {}
    },
    submitResponse(payload: WordResponse) {
      if (this.phase !== 'quiz' && this.phase !== 'review') {
        return
      }
      const currentIndex = this.order[this.pointer]
      if (currentIndex === undefined) {
        return
      }
      const problem = this.problems[currentIndex]
      if (!problem) {
        return
      }
      const isAccurate = compareResponse(problem, payload)
      if (this.phase === 'quiz') {
        this.responses[currentIndex] = payload
        if (!isAccurate) {
          this.recordMistake(currentIndex, payload)
        }
        this.reviewError = false
        if (this.pointer < this.order.length - 1) {
          this.pointer += 1
        } else {
          this.finishRun()
        }
        return
      }

      this.reviewResponses[currentIndex] = payload
      if (isAccurate) {
        this.responses[currentIndex] = payload
        this.reviewError = false
        if (this.pointer < this.order.length - 1) {
          this.pointer += 1
        } else {
          this.finishRun()
        }
      } else {
        this.reviewError = true
        this.recordMistake(currentIndex, payload)
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
      this.problems = []
      this.order = []
      this.pointer = 0
      this.responses = []
      this.reviewResponses = {}
      this.wrongIndices = []
      this.lastRunWasReview = false
      this.attempts = 0
      this.reviewError = false
      this.mistakeIndices = []
      this.mistakeRecords = {}
    },
    clearReviewError() {
      this.reviewError = false
    },
    recordMistake(index: number, payload: WordResponse) {
      if (!this.mistakeIndices.includes(index)) {
        this.mistakeIndices.push(index)
        this.mistakeRecords[index] = { ...payload }
      }
    },
  },
})
