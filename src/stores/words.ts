import { defineStore } from 'pinia'
import { wordsByLength, type WordLength } from '../data/words'

type WordPhase = 'setup' | 'quiz' | 'summary'

export interface WordLabSettings {
  letters: WordLength
  count: number
}

interface WordLabState {
  phase: WordPhase
  settings: WordLabSettings
  sequence: string[]
  pointer: number
}

const defaultSettings: WordLabSettings = {
  letters: 3,
  count: 5,
}

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = items[i]!
    items[i] = items[j]!
    items[j] = temp
  }
  return items
}

function buildSequence(length: WordLength, count: number): string[] {
  const bank = wordsByLength[length] ?? []
  if (!bank.length) {
    return []
  }
  const pool = shuffle([...bank])
  const result: string[] = []
  while (result.length < count) {
    const word = pool[result.length % pool.length]
    if (!word) {
      break
    }
    result.push(word)
  }
  return result
}

export const useWordLabStore = defineStore('word-lab', {
  state: (): WordLabState => ({
    phase: 'setup',
    settings: { ...defaultSettings },
    sequence: [],
    pointer: 0,
  }),
  getters: {
    currentWord(state): string | null {
      return state.sequence[state.pointer] ?? null
    },
    totalWords(state): number {
      return state.sequence.length
    },
    currentStep(state): number {
      return state.sequence.length ? state.pointer + 1 : 0
    },
  },
  actions: {
    reset() {
      this.phase = 'setup'
      this.sequence = []
      this.pointer = 0
    },
    start(settings: WordLabSettings) {
      this.settings = { ...settings }
      this.sequence = buildSequence(this.settings.letters, this.settings.count)
      this.pointer = 0
      this.phase = 'quiz'
    },
    next() {
      if (this.phase !== 'quiz') {
        return
      }
      if (this.pointer < this.sequence.length - 1) {
        this.pointer += 1
        return
      }
      this.phase = 'summary'
    },
  },
})
