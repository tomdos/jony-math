<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import ProblemCard from './components/ProblemCard.vue'
import SummaryPanel from './components/SummaryPanel.vue'
import WordProblemCard from './components/WordProblemCard.vue'
import {
  defaultSettings,
  type SessionSettings,
  useSessionStore,
} from './stores/session'
import {
  useWordStore,
  wordDefaultSettings,
  type WordSettings,
  type WordProblem,
  type WordResponse as WordModuleResponse,
} from './stores/word'
import ClockFace from './components/ClockFace.vue'
import { useClockStore, type ClockSettings } from './stores/clock'
import DiceDisplay from './components/DiceDisplay.vue'
import { useDiceStore, type DiceSettings } from './stores/dice'
import { usePyramidStore, type PyramidSettings } from './stores/pyramid'
import {
  useMultiplicationStore,
  multiplicationDefaultSettings,
  type MultiplicationSettings,
} from './stores/multiplication'
import { useWordLabStore, type WordLabSettings } from './stores/words'
import {
  useComparisonStore,
  comparisonDefaultSettings,
  type ComparisonSettings,
  type ComparisonOperator,
} from './stores/comparison'
import {
  useDecompositionStore,
  decompositionDefaultSettings,
  type DecompositionSettings,
} from './stores/decomposition'
import {
  useNumberWritingStore,
  numberWritingDefaultSettings,
  type NumberWritingSettings,
} from './stores/numberWriting'

const session = useSessionStore()
const {
  phase,
  currentQuestion,
  totalInRun,
  currentStepNumber,
  pointer,
  correctCount,
  settings,
  questions,
  reviewError,
  mistakeIndices,
  mistakeAnswers,
} = storeToRefs(session)

const wordStore = useWordStore()
const {
  phase: wordPhase,
  currentProblem: wordCurrentProblem,
  totalInRun: wordTotalInRun,
  currentStepNumber: wordCurrentStep,
  pointer: wordPointer,
  correctCount: wordCorrectCount,
  problems: wordProblems,
  reviewError: wordReviewError,
  mistakeIndices: wordMistakeIndices,
  mistakeRecords: wordMistakeRecords,
} = storeToRefs(wordStore)

const clockStore = useClockStore()
const {
  phase: clockPhase,
  currentExercise: clockCurrentExercise,
  totalExercises: clockTotalExercises,
  pointer: clockPointer,
  correctCount: clockCorrectCount,
} = storeToRefs(clockStore)

const multiplicationStore = useMultiplicationStore()
const {
  phase: multiplicationPhase,
  currentQuestion: multiplicationCurrentQuestion,
  totalInRun: multiplicationTotalInRun,
  currentStepNumber: multiplicationCurrentStep,
  pointer: multiplicationPointer,
  correctCount: multiplicationCorrectCount,
  settings: multiplicationSettings,
  questions: multiplicationQuestions,
  mistakeAnswers: multiplicationMistakeAnswers,
  mistakeIndices: multiplicationMistakeIndices,
  reviewError: multiplicationReviewError,
} = storeToRefs(multiplicationStore)

const wordLabStore = useWordLabStore()
const {
  phase: wordLabPhase,
  currentWord: currentReadingWord,
  totalWords: readingTotalWords,
  currentStep: readingCurrentStep,
} = storeToRefs(wordLabStore)

const diceStore = useDiceStore()
const {
  phase: dicePhase,
  currentExercise: currentDiceExercise,
  totalExercises: diceTotalExercises,
  currentStep: diceCurrentStep,
  correctCount: diceCorrectCount,
} = storeToRefs(diceStore)

const pyramidStore = usePyramidStore()
const {
  phase: pyramidPhase,
  totalExercises: pyramidTotalExercises,
  currentStep: pyramidCurrentStep,
  correctCount: pyramidCorrectCount,
  currentEntries: pyramidEntries,
  exercises: pyramidExercises,
} = storeToRefs(pyramidStore)

const comparisonStore = useComparisonStore()
const {
  phase: comparisonPhase,
  totalExercises: comparisonTotalExercises,
  currentStep: comparisonCurrentStep,
  correctCount: comparisonCorrectCount,
  currentExercise: comparisonCurrentExercise,
} = storeToRefs(comparisonStore)

const decompositionStore = useDecompositionStore()
const {
  phase: decompositionPhase,
  totalExercises: decompositionTotalExercises,
  currentStep: decompositionCurrentStep,
  correctCount: decompositionCorrectCount,
  currentExercise: decompositionCurrentExercise,
} = storeToRefs(decompositionStore)

const numberWritingStore = useNumberWritingStore()
const {
  phase: numberWritingPhase,
  totalExercises: numberWritingTotalExercises,
  currentStep: numberWritingCurrentStep,
  correctCount: numberWritingCorrectCount,
  currentExercise: numberWritingCurrentExercise,
} = storeToRefs(numberWritingStore)

const setupState = reactive<SessionSettings>({ ...defaultSettings })
Object.assign(setupState, settings.value)

const wordSetupState = reactive<WordSettings>({ ...wordDefaultSettings })
Object.assign(wordSetupState, wordStore.settings)
const clockSetupState = reactive<ClockSettings>({ count: 3 })
clockSetupState.count = clockStore.settings.count
const multiplicationSetupState = reactive<MultiplicationSettings>({ ...multiplicationDefaultSettings })
Object.assign(multiplicationSetupState, multiplicationSettings.value)
const wordLabSetupState = reactive<WordLabSettings>({ letters: 3, count: 5 })
Object.assign(wordLabSetupState, wordLabStore.settings)
const diceSetupState = reactive<DiceSettings>({ diceCount: 2, throwsCount: 5 })
Object.assign(diceSetupState, diceStore.settings)
const pyramidSetupState = reactive<PyramidSettings>({ count: 3, max: 20 })
Object.assign(pyramidSetupState, pyramidStore.settings)
const comparisonSetupState = reactive<ComparisonSettings>({ ...comparisonDefaultSettings })
Object.assign(comparisonSetupState, comparisonStore.settings)
const decompositionSetupState = reactive<DecompositionSettings>({ ...decompositionDefaultSettings })
Object.assign(decompositionSetupState, decompositionStore.settings)
const numberWritingSetupState = reactive<NumberWritingSettings>({ ...numberWritingDefaultSettings })
Object.assign(numberWritingSetupState, numberWritingStore.settings)

const answerBuffer = ref('')
const cardRef = ref<InstanceType<typeof ProblemCard> | null>(null)
const activeModule = ref<
  | 'home'
  | 'math'
  | 'arithmetic'
  | 'multiplication'
  | 'word'
  | 'hour'
  | 'czech'
  | 'wordLab'
  | 'dice'
  | 'pyramid'
  | 'comparison'
  | 'decomposition'
  | 'numberWriting'
>('home')
const wordCardRef = ref<InstanceType<typeof WordProblemCard> | null>(null)
const wordAnswer = ref<WordModuleResponse>({ a: null, op: null, b: null, result: null })
const clockAnswer = ref<{ hours: string; minutes: string }>({ hours: '', minutes: '' })
const clockFeedback = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const clockAwaitingNext = ref(false)
const diceAnswer = ref('')
const diceFeedback = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const diceAwaitingNext = ref(false)
const diceInputRef = ref<HTMLInputElement | null>(null)
const pyramidAwaitingNext = ref(false)
const lastCheckWasFailure = ref(false)
const comparisonSelection = ref<ComparisonOperator | null>(null)
const comparisonFeedback = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const comparisonAwaitingNext = ref(false)
const decompositionInputA = ref('')
const decompositionInputB = ref('')
const decompositionFeedback = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const decompositionAwaitingNext = ref(false)
const numberWritingInput = ref('')
const numberWritingFeedback = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const numberWritingAwaitingNext = ref(false)

const wordCountOptions = [1, 2, 3, 4, 5]
const clockCountOptions = [1, 2, 3, 4, 5]
const multiplicationModeOptions: Array<{ value: MultiplicationSettings['mode']; label: string }> = [
  { value: 'mul', label: 'Násobení (×)' },
  { value: 'div', label: 'Dělení (÷)' },
  { value: 'mix', label: 'Smíšené (× / ÷)' },
]
const multiplicationMaxOptions = [10, 20, 30]
const wordLabLetterOptions: Array<{ value: WordLabSettings['letters']; label: string }> = [
  { value: 3, label: '3 písmena' },
  { value: 4, label: '4 písmena' },
  { value: 5, label: '5 písmen' },
]
const wordLabCountOptions = [5, 10, 15]
const diceCountOptions: Array<{ value: DiceSettings['diceCount']; label: string }> = [
  { value: 2, label: '2 kostky' },
  { value: 3, label: '3 kostky' },
]
const diceThrowOptions: Array<{ value: DiceSettings['throwsCount']; label: string }> = [
  { value: 3, label: '3 hody' },
  { value: 5, label: '5 hodů' },
  { value: 6, label: '6 hodů' },
]
const pyramidCountOptions = [1, 2, 3, 4, 5]
const pyramidMaxOptions = [20, 30, 40, 50]
const limitedMaxOptions = [10, 20, 50, 100]
const comparisonCountOptions = [1, 2, 5, 10, 15, 20]
const comparisonOperators: ComparisonOperator[] = ['>', '<', '=']
const decompositionCountOptions = [1, 2, 5, 10, 15, 20]
const numberWritingCountOptions = [1, 2, 5, 10, 15, 20]

const pyramidIsCurrentQuiz = computed(() => pyramidPhase.value === 'quiz')
const pyramidIsLastExercise = computed(() => {
  if (!pyramidTotalExercises.value) {
    return true
  }
  return pyramidCurrentStep.value === pyramidTotalExercises.value
})
const pyramidNextLabel = computed(() =>
  pyramidIsLastExercise.value ? 'Dokončit' : 'Další pyramida',
)

const modeOptions: Array<{ value: SessionSettings['mode']; label: string }> = [
  { value: 'add', label: 'Sčítání (+)' },
  { value: 'sub', label: 'Odčítání (-)' },
  { value: 'mix', label: 'Smíšené (+ / -)' },
]

const countOptions = [1, 2, 5, 10, 15, 20, 25]
const maxOptions = [20, 30, 50, 70, 100]

const isQuizPhase = computed(() => phase.value === 'quiz' || phase.value === 'review')
const isReview = computed(() => phase.value === 'review')
const canSubmit = computed(() => answerBuffer.value.trim().length > 0)
const isLastQuestion = computed(
  () => totalInRun.value > 0 && currentStepNumber.value === totalInRun.value,
)
const progressPercent = computed(() => {
  if (!totalInRun.value) {
    return 0
  }
  return Math.round((pointer.value / totalInRun.value) * 100)
})

const mistakeSet = computed(() => new Set(mistakeIndices.value))

const arithmeticSummaryResults = computed(() =>
  questions.value.map((question, index) => {
    const hadMistake = mistakeSet.value.has(index)
    const firstWrong = hadMistake ? mistakeAnswers.value[index] ?? null : null
    return {
      id: question.id,
      expression: `${question.a} ${question.op} ${question.b} = ${question.correct}`,
      hadMistake,
      firstWrong: firstWrong !== null ? firstWrong.toString() : null,
    }
  }),
)

const wordIsQuizPhase = computed(
  () => wordPhase.value === 'quiz' || wordPhase.value === 'review',
)
const wordIsReview = computed(() => wordPhase.value === 'review')
const wordCanSubmit = computed(() => {
  const answer = wordAnswer.value
  return (
    answer.a !== null &&
    answer.op !== null &&
    answer.b !== null &&
    answer.result !== null
  )
})
const wordIsLastQuestion = computed(() =>
  wordTotalInRun.value > 0 && wordCurrentStep.value === wordTotalInRun.value,
)
const wordProgressPercent = computed(() => {
  if (!wordTotalInRun.value) {
    return 0
  }
  return Math.round((wordPointer.value / wordTotalInRun.value) * 100)
})

const wordMistakeSet = computed(() => new Set(wordMistakeIndices.value))
const wordQuestionLabel = computed(() =>
  wordIsReview.value ? 'Opakování chyb' : 'Nová slovní úloha',
)
const wordSummaryResults = computed(() =>
  wordProblems.value.map((problem, index) => {
    const hadMistake = wordMistakeSet.value.has(index)
    const firstWrongRecord = hadMistake
      ? wordMistakeRecords.value[index] ?? null
      : null
    return {
      id: problem.instanceId,
      prompt: problem.text,
      expression: formatWordEquation(problem, null, true),
      hadMistake,
      firstWrong: firstWrongRecord
        ? formatWordEquation(problem, firstWrongRecord, false)
        : null,
    }
  }),
)

const clockIsQuiz = computed(() => clockPhase.value === 'quiz')
const clockCanSubmit = computed(() => {
  return (
    !clockAwaitingNext.value &&
    clockAnswer.value.hours.trim().length > 0 &&
    clockAnswer.value.minutes.trim().length > 0
  )
})
const clockIsFinalExercise = computed(() => {
  if (!clockTotalExercises.value) {
    return true
  }
  return clockPointer.value === clockTotalExercises.value - 1
})
const clockNextLabel = computed(() => (clockIsFinalExercise.value ? 'Zobrazit výsledky' : 'Další úloha'))

const multiplicationProgressPercent = computed(() => {
  if (!multiplicationTotalInRun.value) {
    return 0
  }
  return Math.round((multiplicationPointer.value / multiplicationTotalInRun.value) * 100)
})

const multiplicationMistakeSet = computed(() => new Set(multiplicationMistakeIndices.value))
const multiplicationSummaryResults = computed(() =>
  multiplicationQuestions.value.map((question, index) => {
    const hadMistake = multiplicationMistakeSet.value.has(index)
    return {
      id: question.id,
      expression: `${question.a} ${question.op} ${question.b} = ${question.correct}`,
      hadMistake,
      firstWrong: hadMistake
        ? multiplicationMistakeAnswers.value[index]?.toString() ?? null
        : null,
    }
  }),
)

const wordLabIsQuiz = computed(() => wordLabPhase.value === 'quiz')
const wordLabProgressPercent = computed(() => {
  if (!readingTotalWords.value) {
    return 0
  }
  return Math.round(((readingCurrentStep.value - 1) / readingTotalWords.value) * 100)
})

const diceIsQuiz = computed(() => dicePhase.value === 'quiz')
const diceCanSubmit = computed(
  () => !diceAwaitingNext.value && diceAnswer.value.trim().length > 0,
)
const diceIsLastExercise = computed(() => {
  if (!diceTotalExercises.value) {
    return true
  }
  return diceCurrentStep.value === diceTotalExercises.value
})
const diceNextLabel = computed(() => (diceIsLastExercise.value ? 'Zobrazit výsledky' : 'Další hod'))
const diceSummaryResults = computed(() =>
  diceStore.exercises.map((exercise, index) => ({
    id: exercise.id,
    expression: `${exercise.values.join(' + ')} = ${exercise.sum}`,
    hadMistake: diceStore.results[index] === false,
    firstWrong:
      diceStore.results[index] === false && diceStore.answers[index] !== null
        ? diceStore.answers[index]!.toString()
        : null,
  })),
)

const pyramidIncorrectCount = computed(() => {
  if (!pyramidTotalExercises.value) {
    return 0
  }
  return pyramidTotalExercises.value - pyramidCorrectCount.value
})

const comparisonIncorrectCount = computed(() => {
  if (!comparisonTotalExercises.value) {
    return 0
  }
  return comparisonTotalExercises.value - comparisonCorrectCount.value
})

const comparisonIsLastExercise = computed(() => {
  if (!comparisonTotalExercises.value) {
    return true
  }
  return comparisonCurrentStep.value === comparisonTotalExercises.value
})

const comparisonNextLabel = computed(() =>
  comparisonIsLastExercise.value ? 'Zobrazit výsledky' : 'Další úloha',
)

const decompositionIncorrectCount = computed(() => {
  if (!decompositionTotalExercises.value) {
    return 0
  }
  return decompositionTotalExercises.value - decompositionCorrectCount.value
})

const decompositionIsLastExercise = computed(() => {
  if (!decompositionTotalExercises.value) {
    return true
  }
  return decompositionCurrentStep.value === decompositionTotalExercises.value
})

const decompositionNextLabel = computed(() =>
  decompositionIsLastExercise.value ? 'Zobrazit výsledky' : 'Další úloha',
)

const numberWritingIncorrectCount = computed(() => {
  if (!numberWritingTotalExercises.value) {
    return 0
  }
  return numberWritingTotalExercises.value - numberWritingCorrectCount.value
})

const numberWritingIsLastExercise = computed(() => {
  if (!numberWritingTotalExercises.value) {
    return true
  }
  return numberWritingCurrentStep.value === numberWritingTotalExercises.value
})

const numberWritingNextLabel = computed(() =>
  numberWritingIsLastExercise.value ? 'Zobrazit výsledky' : 'Další úloha',
)

watch(
  () => phase.value,
  (newPhase) => {
    if (activeModule.value !== 'arithmetic') {
      return
    }
    if (newPhase === 'quiz' || newPhase === 'review') {
      answerBuffer.value = ''
      nextTick(() => {
        cardRef.value?.focus()
      })
    } else {
      answerBuffer.value = ''
    }
    session.clearReviewError()
  },
)

watch(
  () => pointer.value,
  () => {
    if (activeModule.value !== 'arithmetic') {
      return
    }
    if (phase.value === 'quiz' || phase.value === 'review') {
      answerBuffer.value = ''
      nextTick(() => {
        cardRef.value?.focus()
      })
    }
    session.clearReviewError()
  },
)

watch(
  () => reviewError.value,
  (hasError) => {
    if (activeModule.value !== 'arithmetic') {
      return
    }
    if (isReview.value && hasError) {
      answerBuffer.value = ''
      nextTick(() => {
        cardRef.value?.focus()
      })
    }
  },
)

watch(
  () => multiplicationPhase.value,
  (newPhase) => {
    if (activeModule.value !== 'multiplication') {
      return
    }
    if (newPhase === 'quiz' || newPhase === 'review') {
      answerBuffer.value = ''
      nextTick(() => {
        cardRef.value?.focus()
      })
    } else {
      answerBuffer.value = ''
    }
    multiplicationStore.clearReviewError()
  },
)

watch(
  () => multiplicationPointer.value,
  () => {
    if (activeModule.value !== 'multiplication') {
      return
    }
    if (multiplicationPhase.value === 'quiz' || multiplicationPhase.value === 'review') {
      answerBuffer.value = ''
      nextTick(() => {
        cardRef.value?.focus()
      })
    }
    multiplicationStore.clearReviewError()
  },
)

watch(
  () => dicePhase.value,
  (newPhase) => {
    if (activeModule.value !== 'dice') {
      return
    }
    if (newPhase === 'quiz') {
      diceAnswer.value = ''
      diceFeedback.value = null
      diceAwaitingNext.value = false
      focusDiceInput()
    } else if (newPhase === 'summary') {
      diceAnswer.value = ''
      diceAwaitingNext.value = false
    }
  },
)

watch(
  () => diceCurrentStep.value,
  () => {
    if (activeModule.value !== 'dice') {
      return
    }
    diceAnswer.value = ''
    diceAwaitingNext.value = false
    diceFeedback.value = null
    focusDiceInput()
  },
)

watch(
  () => comparisonPhase.value,
  (newPhase) => {
    if (activeModule.value !== 'comparison') {
      return
    }
    if (newPhase === 'quiz') {
      comparisonSelection.value = null
      comparisonFeedback.value = null
      comparisonAwaitingNext.value = false
    } else if (newPhase === 'summary') {
      comparisonAwaitingNext.value = false
    }
  },
)

watch(
  () => comparisonCurrentStep.value,
  () => {
    if (activeModule.value !== 'comparison') {
      return
    }
    comparisonSelection.value = null
    comparisonFeedback.value = null
    comparisonAwaitingNext.value = false
  },
)

watch(
  () => decompositionPhase.value,
  (newPhase) => {
    if (activeModule.value !== 'decomposition') {
      return
    }
    if (newPhase === 'quiz') {
      decompositionInputA.value = ''
      decompositionInputB.value = ''
      decompositionFeedback.value = null
      decompositionAwaitingNext.value = false
    } else if (newPhase === 'summary') {
      decompositionAwaitingNext.value = false
    }
  },
)

watch(
  () => decompositionCurrentStep.value,
  () => {
    if (activeModule.value !== 'decomposition') {
      return
    }
    decompositionInputA.value = ''
    decompositionInputB.value = ''
    decompositionFeedback.value = null
    decompositionAwaitingNext.value = false
  },
)

watch(
  () => numberWritingPhase.value,
  (newPhase) => {
    if (activeModule.value !== 'numberWriting') {
      return
    }
    if (newPhase === 'quiz') {
      numberWritingInput.value = ''
      numberWritingFeedback.value = null
      numberWritingAwaitingNext.value = false
    } else if (newPhase === 'summary') {
      numberWritingAwaitingNext.value = false
    }
  },
)

watch(
  () => numberWritingCurrentStep.value,
  () => {
    if (activeModule.value !== 'numberWriting') {
      return
    }
    numberWritingInput.value = ''
    numberWritingFeedback.value = null
    numberWritingAwaitingNext.value = false
  },
)

watch(
  () => pyramidPhase.value,
  (newPhase) => {
    if (activeModule.value !== 'pyramid') {
      return
    }
    if (newPhase === 'quiz') {
      pyramidAwaitingNext.value = false
      lastCheckWasFailure.value = false
    } else if (newPhase === 'summary') {
      pyramidAwaitingNext.value = false
      lastCheckWasFailure.value = false
    }
  },
)

watch(
  () => pyramidCurrentStep.value,
  () => {
    if (activeModule.value !== 'pyramid') {
      return
    }
    pyramidAwaitingNext.value = false
    lastCheckWasFailure.value = false
  },
)

watch(
  () => wordPhase.value,
  (newPhase) => {
    if (activeModule.value !== 'word') {
      return
    }
    const problem = wordCurrentProblem.value ?? null
    resetWordAnswer(problem)
    if (newPhase === 'quiz' || newPhase === 'review') {
      nextTick(() => {
        wordCardRef.value?.focus()
      })
    }
    wordStore.clearReviewError()
  },
)

watch(
  () => wordPointer.value,
  () => {
    if (activeModule.value !== 'word') {
      return
    }
    const problem = wordCurrentProblem.value ?? null
    resetWordAnswer(problem)
    if (wordPhase.value === 'quiz' || wordPhase.value === 'review') {
      nextTick(() => {
        wordCardRef.value?.focus()
      })
    }
    wordStore.clearReviewError()
  },
)

watch(
  () => wordReviewError.value,
  (hasError) => {
    if (activeModule.value !== 'word') {
      return
    }
    if (wordPhase.value === 'review' && hasError) {
      const problem = wordCurrentProblem.value ?? null
      resetWordAnswer(problem)
      nextTick(() => {
        wordCardRef.value?.focus()
      })
    }
  },
)

function startSession() {
  session.startSession({
    mode: setupState.mode,
    count: setupState.count,
    max: setupState.max,
  })
}

function startMultiplicationSession() {
  multiplicationStore.startSession({
    mode: multiplicationSetupState.mode,
    count: multiplicationSetupState.count,
    max: multiplicationSetupState.max,
  })
}

function handleSubmit() {
  if (!canSubmit.value) {
    return
  }
  session.submitAnswer(Number(answerBuffer.value))
  if (phase.value === 'quiz' || phase.value === 'review') {
    nextTick(() => {
      cardRef.value?.focus()
    })
  }
}

function handleMultiplicationSubmit() {
  if (!canSubmit.value) {
    return
  }
  multiplicationStore.submitAnswer(Number(answerBuffer.value))
  if (multiplicationPhase.value === 'quiz' || multiplicationPhase.value === 'review') {
    nextTick(() => {
      cardRef.value?.focus()
    })
  }
}

const questionLabel = computed(() =>
  isReview.value ? 'Opakování chyb' : 'Nové cvičení',
)

function handleAnswerInput(value: string) {
  answerBuffer.value = value
  if (reviewError.value) {
    session.clearReviewError()
  }
  if (multiplicationReviewError.value) {
    multiplicationStore.clearReviewError()
  }
}

function startWordSession() {
  wordStore.startSession({ count: wordSetupState.count })
}

function handleWordAnswerUpdate(value: WordModuleResponse) {
  wordAnswer.value = { ...value }
  if (wordReviewError.value) {
    wordStore.clearReviewError()
  }
}

function handleWordSubmit() {
  if (!wordCanSubmit.value) {
    return
  }
  wordStore.submitResponse({ ...wordAnswer.value })
  if (wordPhase.value === 'quiz' || wordPhase.value === 'review') {
    nextTick(() => {
      wordCardRef.value?.focus()
    })
  }
}

function handleClockStart() {
  clockStore.start({ count: clockSetupState.count })
  syncClockSetupFromStore()
  clockAnswer.value = { hours: '', minutes: '' }
  clockFeedback.value = null
  clockAwaitingNext.value = false
}

function handleClockSubmit() {
  if (!clockCanSubmit.value) {
    return
  }
  const hoursInput = Number(clockAnswer.value.hours)
  const minutesInput = Number(clockAnswer.value.minutes)
  const normalizedHours = normalizeHoursInput(Number.isNaN(hoursInput) ? null : hoursInput)
  const normalizedMinutes = normalizeMinutesInput(Number.isNaN(minutesInput) ? null : minutesInput)
  const exercise = clockCurrentExercise.value
  if (exercise) {
    if (normalizedHours === exercise.hours && normalizedMinutes === exercise.minutes) {
      clockFeedback.value = {
        type: 'success',
        text: `Správně! Čas je ${formatClockTime(exercise.hours, exercise.minutes)}.`,
      }
    } else {
      clockFeedback.value = {
        type: 'error',
        text: `Správný čas byl ${formatClockTime(exercise.hours, exercise.minutes)}.`,
      }
    }
  }
  clockStore.submitResponse({
    hours: normalizedHours,
    minutes: normalizedMinutes,
  })
  clockAnswer.value = { hours: '', minutes: '' }
  clockAwaitingNext.value = true
}

function handleClockNext() {
  if (clockStore.phase !== 'quiz') {
    return
  }
  clockStore.advance()
  clockAwaitingNext.value = false
  clockFeedback.value = null
  clockAnswer.value = { hours: '', minutes: '' }
}

function handleWordLabStart() {
  wordLabStore.start({
    letters: wordLabSetupState.letters,
    count: wordLabSetupState.count,
  })
}

function handleWordLabNext() {
  wordLabStore.next()
}

function startPyramidSession() {
  pyramidStore.start({
    count: pyramidSetupState.count,
    max: pyramidSetupState.max,
  })
  pyramidAwaitingNext.value = false
  lastCheckWasFailure.value = false
}

function handlePyramidInput(row: number, col: number, event: Event) {
  const input = event.target as HTMLInputElement
  const sanitized = sanitizeNumeric(input.value).slice(0, 3)
  input.value = sanitized
  const numeric = sanitized === '' ? null : Number(sanitized)
  pyramidStore.updateEntry(row, col, numeric)
  if (lastCheckWasFailure.value) {
    lastCheckWasFailure.value = false
  }
}

function handlePyramidCheck() {
  const allCorrect = pyramidStore.checkCurrent()
  lastCheckWasFailure.value = !allCorrect
  if (allCorrect) {
    pyramidAwaitingNext.value = true
  }
}

function handlePyramidNext() {
  const phase = pyramidStore.next()
  pyramidAwaitingNext.value = false
  lastCheckWasFailure.value = false
  if (phase === 'quiz') {
    nextTick(() => {
      const firstEditableRow = pyramidEntries.value.findIndex((row, index, rows) =>
        index !== rows.length - 1 && row.some((entry) => !entry.readOnly),
      )
      if (firstEditableRow < 0) {
        return
      }
      const selector = `.pyramid .row:nth-child(${firstEditableRow + 1}) .cell:not(.locked)`
      const firstEditableCell = document.querySelector<HTMLInputElement>(selector)
      firstEditableCell?.focus()
    })
  } else {
    nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }
}

function handleComparisonStart() {
  comparisonStore.start({
    count: comparisonSetupState.count,
    max: comparisonSetupState.max,
  })
  comparisonSelection.value = null
  comparisonFeedback.value = null
  comparisonAwaitingNext.value = false
}

function handleComparisonSelect(operator: ComparisonOperator) {
  if (comparisonPhase.value !== 'quiz') {
    return
  }
  if (comparisonAwaitingNext.value) {
    return
  }
  comparisonSelection.value = operator
  const result = comparisonStore.evaluateSelection(operator)
  const exercise = comparisonCurrentExercise.value
  if (result.correct) {
    comparisonFeedback.value = {
      type: 'success',
      text: exercise
        ? `${exercise.left} ${exercise.correct} ${exercise.right} — správně!`
        : 'Správně!'
    }
    comparisonAwaitingNext.value = true
  } else {
    comparisonFeedback.value = {
      type: 'error',
      text: 'To není správně, zkuste jiný znak.',
    }
  }
}

function handleComparisonNext() {
  comparisonStore.next()
  comparisonSelection.value = null
  comparisonFeedback.value = null
  comparisonAwaitingNext.value = false
}

function handleDecompositionStart() {
  decompositionStore.start({
    count: decompositionSetupState.count,
    max: decompositionSetupState.max,
  })
  decompositionInputA.value = ''
  decompositionInputB.value = ''
  decompositionFeedback.value = null
  decompositionAwaitingNext.value = false
}

function handleDecompositionInput(field: 'a' | 'b', event: Event) {
  const input = event.target as HTMLInputElement
  const sanitized = sanitizeNumeric(input.value).slice(0, 3)
  input.value = sanitized
  if (field === 'a') {
    decompositionInputA.value = sanitized
  } else {
    decompositionInputB.value = sanitized
  }
}

function handleDecompositionSubmit() {
  if (decompositionAwaitingNext.value || decompositionPhase.value !== 'quiz') {
    return
  }
  const valueA = decompositionInputA.value.trim()
  const valueB = decompositionInputB.value.trim()
  if (!valueA || !valueB) {
    return
  }
  const a = Number(valueA)
  const b = Number(valueB)
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return
  }
  const result = decompositionStore.evaluateParts({ a, b })
  const exercise = decompositionCurrentExercise.value
  if (result.correct) {
    decompositionFeedback.value = {
      type: 'success',
      text: exercise ? `${exercise.total} = ${a} + ${b}` : 'Správně!',
    }
    decompositionAwaitingNext.value = true
  } else {
    decompositionFeedback.value = {
      type: 'error',
      text: exercise ? `${exercise.total} ≠ ${a} + ${b}. Zkuste to znovu.` : 'Zkuste to znovu.',
    }
    decompositionInputA.value = ''
    decompositionInputB.value = ''
  }
}

function handleDecompositionNext() {
  decompositionStore.next()
  decompositionInputA.value = ''
  decompositionInputB.value = ''
  decompositionFeedback.value = null
  decompositionAwaitingNext.value = false
}

function handleNumberWritingStart() {
  numberWritingStore.start({ count: numberWritingSetupState.count })
  numberWritingInput.value = ''
  numberWritingFeedback.value = null
  numberWritingAwaitingNext.value = false
}

function handleNumberWritingInput(event: Event) {
  const input = event.target as HTMLInputElement
  const sanitized = sanitizeNumeric(input.value).slice(0, 3)
  input.value = sanitized
  numberWritingInput.value = sanitized
}

function handleNumberWritingSubmit() {
  if (numberWritingAwaitingNext.value || numberWritingPhase.value !== 'quiz') {
    return
  }
  const trimmed = numberWritingInput.value.trim()
  if (!trimmed) {
    return
  }
  const numeric = Number(trimmed)
  if (Number.isNaN(numeric)) {
    return
  }
  const result = numberWritingStore.evaluateAnswer(numeric)
  const exercise = numberWritingCurrentExercise.value
  if (result.correct) {
    numberWritingFeedback.value = {
      type: 'success',
      text: exercise
        ? `${exercise.tens} ${formatTensLabel(exercise.tens)} a ${exercise.units} ${formatUnitsLabel(
            exercise.units,
          )} = ${exercise.total}`
        : 'Správně!',
    }
    numberWritingAwaitingNext.value = true
  } else {
    numberWritingFeedback.value = {
      type: 'error',
      text: 'To není správné číslo, zkuste to znovu.',
    }
    numberWritingInput.value = ''
  }
}

function handleNumberWritingNext() {
  numberWritingStore.next()
  numberWritingInput.value = ''
  numberWritingFeedback.value = null
  numberWritingAwaitingNext.value = false
}

function openCzechLanding() {
  wordLabStore.reset()
  syncWordLabSetupFromStore()
  activeModule.value = 'czech'
}

function openWordLab() {
  wordLabStore.reset()
  syncWordLabSetupFromStore()
  activeModule.value = 'wordLab'
}

function returnToCzechLanding() {
  wordLabStore.reset()
  syncWordLabSetupFromStore()
  activeModule.value = 'czech'
}

function openDiceLab() {
  diceStore.reset()
  syncDiceSetupFromStore()
  diceAnswer.value = ''
  diceFeedback.value = null
  diceAwaitingNext.value = false
  activeModule.value = 'dice'
}

function openPyramid() {
  pyramidStore.reset()
  Object.assign(pyramidSetupState, pyramidStore.settings)
  activeModule.value = 'pyramid'
}

function openComparison() {
  comparisonStore.reset()
  Object.assign(comparisonSetupState, comparisonStore.settings)
  comparisonSelection.value = null
  comparisonFeedback.value = null
  comparisonAwaitingNext.value = false
  activeModule.value = 'comparison'
}

function openDecomposition() {
  decompositionStore.reset()
  Object.assign(decompositionSetupState, decompositionStore.settings)
  decompositionInputA.value = ''
  decompositionInputB.value = ''
  decompositionFeedback.value = null
  decompositionAwaitingNext.value = false
  activeModule.value = 'decomposition'
}

function openNumberWriting() {
  numberWritingStore.reset()
  Object.assign(numberWritingSetupState, numberWritingStore.settings)
  numberWritingInput.value = ''
  numberWritingFeedback.value = null
  numberWritingAwaitingNext.value = false
  activeModule.value = 'numberWriting'
}

function handleDiceStart() {
  diceStore.start({
    diceCount: diceSetupState.diceCount,
    throwsCount: diceSetupState.throwsCount,
  })
  diceAnswer.value = ''
  diceFeedback.value = null
  diceAwaitingNext.value = false
  focusDiceInput()
}

function handleDiceSubmit() {
  if (!diceCanSubmit.value) {
    return
  }
  const numeric = Number(diceAnswer.value.trim())
  if (Number.isNaN(numeric)) {
    return
  }
  const exercise = currentDiceExercise.value
  if (!exercise) {
    return
  }
  diceStore.submit(numeric)
  const isCorrect = numeric === exercise.sum
  diceFeedback.value = {
    type: isCorrect ? 'success' : 'error',
    text: isCorrect
      ? `Správně! Součet je ${exercise.sum}.`
      : `Součet byl ${exercise.sum}.`,
  }
  diceAwaitingNext.value = true
}

function handleDiceNext() {
  diceStore.next()
  diceAnswer.value = ''
  diceFeedback.value = null
  diceAwaitingNext.value = false
  focusDiceInput()
}

function focusDiceInput() {
  nextTick(() => {
    diceInputRef.value?.focus()
  })
}

function formatQuestionLabel(count: number) {
  if (count === 1) {
    return 'příklad'
  }
  if (count >= 2 && count <= 4) {
    return 'příklady'
  }
  return 'příkladů'
}

function formatCzechPlural(value: number, one: string, few: string, many: string) {
  if (value === 1) {
    return one
  }
  if (value >= 2 && value <= 4) {
    return few
  }
  return many
}

function formatTensLabel(value: number) {
  return formatCzechPlural(value, 'desítka', 'desítky', 'desítek')
}

function formatUnitsLabel(value: number) {
  return formatCzechPlural(value, 'jednotka', 'jednotky', 'jednotek')
}

function resetWordAnswer(_problem: WordProblem | null) {
  wordAnswer.value = {
    a: null,
    op: null,
    b: null,
    result: null,
  }
}

function sanitizeNumeric(value: string) {
  return value.replace(/[^0-9]/g, '')
}

function normalizeHoursInput(value: number | null): number | null {
  if (value === null || Number.isNaN(value)) {
    return null
  }
  const wrapped = ((value % 12) + 12) % 12
  return wrapped === 0 ? 12 : wrapped
}

function normalizeMinutesInput(value: number | null): number | null {
  if (value === null || Number.isNaN(value)) {
    return null
  }
  const wrapped = ((value % 60) + 60) % 60
  return wrapped
}

function handleClockHoursInput(event: Event) {
  const input = event.target as HTMLInputElement
  const sanitized = sanitizeNumeric(input.value).slice(0, 2)
  clockAnswer.value.hours = sanitized
  input.value = sanitized
}

function handleClockMinutesInput(event: Event) {
  const input = event.target as HTMLInputElement
  const sanitized = sanitizeNumeric(input.value).slice(0, 2)
  clockAnswer.value.minutes = sanitized
  input.value = sanitized
}

function formatClockTime(hours: number, minutes: number) {
  return `${hours}:${minutes.toString().padStart(2, '0')}`
}

function handleDiceInput(event: Event) {
  const input = event.target as HTMLInputElement
  const sanitized = sanitizeNumeric(input.value).slice(0, 3)
  diceAnswer.value = sanitized
  input.value = sanitized
}

function formatWordEquation(
  problem: WordProblem,
  response: WordModuleResponse | null,
  useFallback = false,
) {
  const formatNumber = (value: number | null, fallback: number) => {
    if (value === null) {
      return useFallback ? fallback : '?'
    }
    return value
  }
  const formatOperator = (value: WordModuleResponse['op'] | null, fallback: '+' | '-') => {
    if (value === '+' || value === '-') {
      return value
    }
    return useFallback ? fallback : '?'
  }

  const a = formatNumber(response?.a ?? null, problem.a)
  const b = formatNumber(response?.b ?? null, problem.b)
  const op = formatOperator(response?.op ?? null, problem.op)
  const result = formatNumber(response?.result ?? null, problem.result)

  return `${a} ${op} ${b} = ${result}`
}

function syncWordSetupFromStore() {
  Object.assign(wordSetupState, wordStore.settings)
}

function syncClockSetupFromStore() {
  clockSetupState.count = clockStore.settings.count
}

function syncWordLabSetupFromStore() {
  Object.assign(wordLabSetupState, wordLabStore.settings)
}

function syncDiceSetupFromStore() {
  diceSetupState.diceCount = diceStore.settings.diceCount
  diceSetupState.throwsCount = diceStore.settings.throwsCount
}

function openMathLanding() {
  session.resetSession()
  answerBuffer.value = ''
  Object.assign(setupState, settings.value)
  wordStore.resetSession()
  syncWordSetupFromStore()
  resetWordAnswer(null)
  multiplicationStore.resetSession()
  Object.assign(multiplicationSetupState, multiplicationSettings.value)
  clockStore.reset()
  syncClockSetupFromStore()
  clockFeedback.value = null
  clockAwaitingNext.value = false
  wordLabStore.reset()
  syncWordLabSetupFromStore()
  diceStore.reset()
  syncDiceSetupFromStore()
  diceAnswer.value = ''
  diceFeedback.value = null
  diceAwaitingNext.value = false
  activeModule.value = 'math'
}

function openArithmetic() {
  session.resetSession()
  Object.assign(setupState, settings.value)
  answerBuffer.value = ''
  activeModule.value = 'arithmetic'
}

function openMultiplication() {
  multiplicationStore.resetSession()
  Object.assign(multiplicationSetupState, multiplicationSettings.value)
  answerBuffer.value = ''
  activeModule.value = 'multiplication'
}

function openWordProblems() {
  session.resetSession()
  answerBuffer.value = ''
  wordStore.resetSession()
  syncWordSetupFromStore()
  resetWordAnswer(null)
  multiplicationStore.resetSession()
  Object.assign(multiplicationSetupState, multiplicationSettings.value)
  wordLabStore.reset()
  syncWordLabSetupFromStore()
  diceStore.reset()
  syncDiceSetupFromStore()
  diceAnswer.value = ''
  diceFeedback.value = null
  diceAwaitingNext.value = false
  activeModule.value = 'word'
}

function openHourLab() {
  session.resetSession()
  answerBuffer.value = ''
  wordStore.resetSession()
  resetWordAnswer(null)
  syncWordSetupFromStore()
  multiplicationStore.resetSession()
  Object.assign(multiplicationSetupState, multiplicationSettings.value)
  clockStore.reset()
  syncClockSetupFromStore()
  clockAnswer.value = { hours: '', minutes: '' }
  clockFeedback.value = null
  clockAwaitingNext.value = false
  wordLabStore.reset()
  syncWordLabSetupFromStore()
  diceStore.reset()
  syncDiceSetupFromStore()
  diceAnswer.value = ''
  diceFeedback.value = null
  diceAwaitingNext.value = false
  activeModule.value = 'hour'
}

function returnToMathLanding() {
  session.resetSession()
  answerBuffer.value = ''
  wordStore.resetSession()
  resetWordAnswer(null)
  syncWordSetupFromStore()
  multiplicationStore.resetSession()
  Object.assign(multiplicationSetupState, multiplicationSettings.value)
  clockStore.reset()
  syncClockSetupFromStore()
  clockAnswer.value = { hours: '', minutes: '' }
  clockFeedback.value = null
  clockAwaitingNext.value = false
  wordLabStore.reset()
  syncWordLabSetupFromStore()
  diceStore.reset()
  syncDiceSetupFromStore()
  diceAnswer.value = ''
  diceFeedback.value = null
  diceAwaitingNext.value = false
  pyramidStore.reset()
  Object.assign(pyramidSetupState, pyramidStore.settings)
  comparisonStore.reset()
  Object.assign(comparisonSetupState, comparisonStore.settings)
  comparisonSelection.value = null
  comparisonFeedback.value = null
  comparisonAwaitingNext.value = false
  decompositionStore.reset()
  Object.assign(decompositionSetupState, decompositionStore.settings)
  decompositionInputA.value = ''
  decompositionInputB.value = ''
  decompositionFeedback.value = null
  decompositionAwaitingNext.value = false
  numberWritingStore.reset()
  Object.assign(numberWritingSetupState, numberWritingStore.settings)
  numberWritingInput.value = ''
  numberWritingFeedback.value = null
  numberWritingAwaitingNext.value = false
  activeModule.value = 'math'
}

function returnToHome() {
  session.resetSession()
  answerBuffer.value = ''
  wordStore.resetSession()
  resetWordAnswer(null)
  syncWordSetupFromStore()
  multiplicationStore.resetSession()
  Object.assign(multiplicationSetupState, multiplicationSettings.value)
  clockStore.reset()
  syncClockSetupFromStore()
  clockAnswer.value = { hours: '', minutes: '' }
  clockFeedback.value = null
  clockAwaitingNext.value = false
  wordLabStore.reset()
  syncWordLabSetupFromStore()
  diceStore.reset()
  syncDiceSetupFromStore()
  diceAnswer.value = ''
  diceFeedback.value = null
  diceAwaitingNext.value = false
  comparisonStore.reset()
  Object.assign(comparisonSetupState, comparisonStore.settings)
  comparisonSelection.value = null
  comparisonFeedback.value = null
  comparisonAwaitingNext.value = false
  decompositionStore.reset()
  Object.assign(decompositionSetupState, decompositionStore.settings)
  decompositionInputA.value = ''
  decompositionInputB.value = ''
  decompositionFeedback.value = null
  decompositionAwaitingNext.value = false
  numberWritingStore.reset()
  Object.assign(numberWritingSetupState, numberWritingStore.settings)
  numberWritingInput.value = ''
  numberWritingFeedback.value = null
  numberWritingAwaitingNext.value = false
  activeModule.value = 'home'
}
</script>

<template>
  <main v-if="activeModule === 'home'" class="app-shell landing-shell">
    <section class="card landing-card">
      <div class="landing-header">
        <h1>Mozkolaboratoř</h1>
        <p>Vyberte si laboratoř a pusťte se do objevování.</p>
      </div>
      <div class="landing-options">
        <button type="button" class="primary-action" @click="openMathLanding">
          Matematická laboratoř
        </button>
        <button type="button" class="secondary-action landing-secondary" @click="openHourLab">
          Hodinová laboratoř
        </button>
        <button type="button" class="secondary-action" @click="openCzechLanding">
          Česká laboratoř
        </button>
      </div>
    </section>
    <div class="below-window">
      <a
        class="feedback-link"
        href="https://docs.google.com/forms/d/e/1FAIpQLScEUCofIR6TYh0zuG04MQIXpQadXa5Tmd2hLWqS1aOdXoTFRA/viewform?usp=header"
        target="_blank"
        rel="noopener noreferrer"
      >
        Napište nám
      </a>
    </div>
  </main>
  <main v-else-if="activeModule === 'dice'" class="app-shell">
    <header class="app-header">
      <div class="title-block">
        <h1>Sečti kostky</h1>
        <p>Podívej se na kostky a spočítej jejich součet.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="header-button" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="header-button" @click="returnToMathLanding">
          Jiná matematická úloha
        </button>
      </div>
    </header>

    <section v-if="dicePhase === 'setup'" class="card">
      <form class="setup-form" @submit.prevent="handleDiceStart">
        <div class="field-row">
          <label class="field-label" for="dice-count">Počet kostek</label>
          <select id="dice-count" v-model.number="diceSetupState.diceCount" class="select">
            <option v-for="option in diceCountOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="field-row">
          <label class="field-label" for="dice-throws">Počet hodů</label>
          <select id="dice-throws" v-model.number="diceSetupState.throwsCount" class="select">
            <option v-for="option in diceThrowOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <button type="submit" class="primary-action">Začít házet</button>
      </form>
    </section>

    <section v-else-if="diceIsQuiz" class="card dice-card">
      <div class="session-meta">
        <span class="phase-badge">Součet</span>
        <div class="progress-wrapper">
          <div class="progress-text">
            Hod {{ diceCurrentStep }} z {{ diceTotalExercises }}
          </div>
        </div>
      </div>

      <DiceDisplay v-if="currentDiceExercise" :values="currentDiceExercise.values" />

      <div v-if="!diceAwaitingNext" class="dice-interaction">
        <label class="time-field">
          <span>Součet</span>
          <input
            type="text"
            inputmode="numeric"
            maxlength="3"
            :value="diceAnswer"
            @input="handleDiceInput"
            @keydown.enter.prevent="diceCanSubmit && handleDiceSubmit()"
            aria-label="Odhad součtu"
            ref="diceInputRef"
          />
        </label>
        <button type="button" class="primary-action" :disabled="!diceCanSubmit" @click="handleDiceSubmit">
          Zkontroluj
        </button>
      </div>

      <div v-else class="dice-feedback-block">
        <p v-if="diceFeedback" :class="['feedback-text', diceFeedback.type]">
          {{ diceFeedback.text }}
        </p>
        <button type="button" class="primary-action" @click="handleDiceNext">
          {{ diceNextLabel }}
        </button>
      </div>
    </section>

    <section v-else class="card dice-summary">
      <SummaryPanel
        :total="diceTotalExercises"
        :correct="diceCorrectCount"
        :mistakes="diceTotalExercises - diceCorrectCount"
        :results="diceSummaryResults"
      />
      <div class="summary-actions">
        <button type="button" class="primary-action" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="secondary-action" @click="returnToMathLanding">
          Jiná matematická úloha
        </button>
      </div>
    </section>
  </main>
  <main v-else-if="activeModule === 'czech'" class="app-shell landing-shell">
    <section class="card landing-card">
      <div class="landing-header">
        <h1>Česká laboratoř</h1>
        <p>Procvičte si čtení slov nahlas.</p>
      </div>
      <div class="landing-options">
        <button type="button" class="primary-action" @click="openWordLab">
          Slova
        </button>
        <button type="button" class="secondary-action" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
      </div>
    </section>
  </main>
  <main v-else-if="activeModule === 'math'" class="app-shell landing-shell">
    <section class="card landing-card">
      <div class="landing-header">
        <h1>Matematická laboratoř</h1>
        <p>Začněte s čísly nebo se pusťte do slovních úloh.</p>
      </div>
      <div class="landing-options">
        <button type="button" class="primary-action" @click="openArithmetic">
          Sčítání a odečítání
        </button>
        <button type="button" class="secondary-action landing-secondary" @click="openMultiplication">
          Násobení a dělení
        </button>
        <button type="button" class="secondary-action landing-secondary" @click="openComparison">
          Porovnávání čísel
        </button>
        <button type="button" class="secondary-action landing-secondary" @click="openDecomposition">
          Rozlož čísla
        </button>
        <button type="button" class="secondary-action landing-secondary" @click="openNumberWriting">
          Zapiš čísla
        </button>
        <button type="button" class="secondary-action landing-secondary" @click="openPyramid">
          Sčítací pyramida
        </button>
        <button type="button" class="secondary-action landing-secondary" @click="openDiceLab">
          Sečti kostky
        </button>
        <button type="button" class="secondary-action landing-secondary" @click="openWordProblems">
          Slovní úlohy
        </button>
        <button type="button" class="secondary-action" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
      </div>
    </section>
  </main>
  <main v-else-if="activeModule === 'arithmetic'" class="app-shell">
    <header class="app-header">
      <div class="title-block">
        <h1>Sčítání a odečítání</h1>
        <p>Blesková cvičení pro jistotu v počítání.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="header-button" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="header-button" @click="returnToMathLanding">
          Jiná matematická úloha
        </button>
      </div>
    </header>

    <section v-if="phase === 'setup'" class="card">
      <form class="setup-form" @submit.prevent="startSession">
        <div class="field-group">
          <span class="field-label">Vyberte dovednost</span>
          <div class="option-row">
            <button
              v-for="option in modeOptions"
              :key="option.value"
              type="button"
              :class="['toggle', { active: setupState.mode === option.value }]"
              @click="setupState.mode = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="field-row">
          <label class="field-label" for="question-count">Počet příkladů</label>
          <select
            id="question-count"
            v-model.number="setupState.count"
            class="select"
          >
            <option v-for="count in countOptions" :key="count" :value="count">
              {{ count }} {{ formatQuestionLabel(count) }}
            </option>
          </select>
        </div>

        <div class="field-row">
          <label class="field-label" for="max-number">Čísla do</label>
          <select id="max-number" v-model.number="setupState.max" class="select">
            <option v-for="value in maxOptions" :key="value" :value="value">
              {{ value }}
            </option>
          </select>
        </div>

        <button type="submit" class="primary-action">Začít procvičovat</button>
      </form>
    </section>

    <section v-else-if="isQuizPhase" class="card">
      <div class="session-meta">
        <span class="phase-badge" :class="{ review: isReview }">
          {{ questionLabel }}
        </span>
        <div class="progress-wrapper">
          <div class="progress-text">
            Příklad {{ currentStepNumber }} z {{ totalInRun }}
          </div>
          <div
            class="progress-bar"
            role="progressbar"
            :aria-valuemin="0"
            :aria-valuemax="totalInRun"
            :aria-valuenow="pointer"
          >
            <span class="progress-fill" :style="{ width: progressPercent + '%' }"></span>
          </div>
        </div>
      </div>

      <ProblemCard
        v-if="currentQuestion"
        ref="cardRef"
        :question="currentQuestion"
        :model-value="answerBuffer"
        :can-submit="canSubmit"
        :is-last="isLastQuestion"
        :is-review="isReview"
        :has-error="isReview && reviewError"
        @update:model-value="handleAnswerInput"
        @submit="handleSubmit"
      />
      <p v-if="isReview" class="retry-hint">
        Opravte všechny chyby, abyste viděli výsledky. Špatná odpověď zůstane, dokud nebude správná.
      </p>
    </section>

    <section v-else class="card">
      <SummaryPanel
        :total="questions.length"
        :correct="correctCount"
        :mistakes="mistakeIndices.length"
        :results="arithmeticSummaryResults"
      />
      <div class="summary-actions">
        <button type="button" class="primary-action" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="secondary-action" @click="returnToMathLanding">
          Jiná matematická úloha
        </button>
      </div>
    </section>
  </main>
  <main v-else-if="activeModule === 'multiplication'" class="app-shell">
    <header class="app-header">
      <div class="title-block">
        <h1>Násobení a dělení</h1>
        <p>Krátké příklady na procvičení tabulek násobení a dělení.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="header-button" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="header-button" @click="returnToMathLanding">
          Jiná matematická úloha
        </button>
      </div>
    </header>

    <section v-if="multiplicationPhase === 'setup'" class="card">
      <form class="setup-form" @submit.prevent="startMultiplicationSession">
        <div class="field-group">
          <span class="field-label">Vyberte dovednost</span>
          <div class="option-row">
            <button
              v-for="option in multiplicationModeOptions"
              :key="option.value"
              type="button"
              :class="['toggle', { active: multiplicationSetupState.mode === option.value }]"
              @click="multiplicationSetupState.mode = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="field-row">
          <label class="field-label" for="mult-count">Počet příkladů</label>
          <select
            id="mult-count"
            v-model.number="multiplicationSetupState.count"
            class="select"
          >
            <option v-for="count in countOptions" :key="count" :value="count">
              {{ count }} {{ formatQuestionLabel(count) }}
            </option>
          </select>
        </div>

        <div class="field-row">
          <label class="field-label" for="mult-max">Výsledek do</label>
          <select id="mult-max" v-model.number="multiplicationSetupState.max" class="select">
            <option v-for="value in multiplicationMaxOptions" :key="value" :value="value">
              {{ value }}
            </option>
          </select>
        </div>

        <button type="submit" class="primary-action">Start</button>
      </form>
    </section>

    <section v-else-if="multiplicationPhase === 'quiz' || multiplicationPhase === 'review'" class="card">
      <div class="session-meta">
        <span class="phase-badge" :class="{ review: multiplicationPhase === 'review' }">
          {{ multiplicationStore.phase === 'review' ? 'Opakování chyb' : 'Nové příklady' }}
        </span>
        <div class="progress-wrapper">
          <div class="progress-text">
            Příklad {{ multiplicationCurrentStep }} z {{ multiplicationTotalInRun }}
          </div>
          <div
            class="progress-bar"
            role="progressbar"
            :aria-valuemin="0"
            :aria-valuemax="multiplicationTotalInRun"
            :aria-valuenow="multiplicationPointer"
          >
            <span class="progress-fill" :style="{ width: multiplicationProgressPercent + '%' }"></span>
          </div>
        </div>
      </div>

      <ProblemCard
        v-if="multiplicationCurrentQuestion"
        ref="cardRef"
        :question="multiplicationCurrentQuestion"
        :model-value="answerBuffer"
        :can-submit="canSubmit"
        :is-last="multiplicationTotalInRun > 0 && multiplicationCurrentStep === multiplicationTotalInRun"
        :is-review="multiplicationPhase === 'review'"
        :has-error="multiplicationPhase === 'review' && multiplicationReviewError"
        @update:model-value="handleAnswerInput"
        @submit="handleMultiplicationSubmit"
      />
    </section>

    <section v-else class="card">
      <SummaryPanel
        :total="multiplicationQuestions.length"
        :correct="multiplicationCorrectCount"
        :mistakes="multiplicationMistakeIndices.length"
        :results="multiplicationSummaryResults"
      />
      <div class="summary-actions">
        <button type="button" class="primary-action" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="secondary-action" @click="returnToMathLanding">
          Jiná matematická úloha
        </button>
      </div>
    </section>
  </main>
  <main v-else-if="activeModule === 'pyramid'" class="app-shell">
    <header class="app-header">
      <div class="title-block">
        <h1>Sčítací pyramida</h1>
        <p>Vyplňte pyramidy správnými součty od základny až po vrchol.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="header-button" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="header-button" @click="returnToMathLanding">
          Zpět na Matematickou laboratoř
        </button>
      </div>
    </header>

    <section v-if="pyramidPhase === 'setup'" class="card pyramid-card">
      <form class="setup-form" @submit.prevent="startPyramidSession">
        <div class="field-row">
          <label class="field-label" for="pyramid-count">Počet pyramid</label>
          <select id="pyramid-count" v-model.number="pyramidSetupState.count" class="select">
            <option v-for="count in pyramidCountOptions" :key="count" :value="count">
              {{ count }} pyramid
            </option>
          </select>
        </div>

        <div class="field-row">
          <label class="field-label" for="pyramid-max">Čísla do</label>
          <select id="pyramid-max" v-model.number="pyramidSetupState.max" class="select">
            <option v-for="value in pyramidMaxOptions" :key="value" :value="value">
              {{ value }}
            </option>
          </select>
        </div>

        <button type="submit" class="primary-action">Začít pyramidy</button>
      </form>
    </section>

    <section
      v-else-if="pyramidIsCurrentQuiz"
      :key="
        pyramidCurrentStep > 0
          ? pyramidExercises[pyramidCurrentStep - 1]?.id ?? 'pyramid-quiz'
          : 'pyramid-quiz'
      "
      class="card pyramid-card"
    >
      <div class="session-meta">
        <span class="phase-badge">Pyramida</span>
        <div class="progress-wrapper">
          <div class="progress-text">
            Pyramida {{ pyramidCurrentStep }} z {{ pyramidTotalExercises }}
          </div>
        </div>
      </div>

      <div class="pyramid">
        <div v-for="(row, rowIndex) in pyramidEntries" :key="`row-${rowIndex}`" class="row" :class="{ base: rowIndex === pyramidEntries.length - 1 }">
          <input
            v-for="(entry, colIndex) in row"
            :key="`cell-${rowIndex}-${colIndex}`"
            class="cell"
            type="text"
            inputmode="numeric"
            maxlength="3"
            :value="entry.value ?? ''"
            :readonly="rowIndex === pyramidEntries.length - 1 || pyramidAwaitingNext"
            :class="{
              locked: rowIndex === pyramidEntries.length - 1,
              error:
                entry.value === null &&
                rowIndex !== pyramidEntries.length - 1 &&
                lastCheckWasFailure,
              success:
                entry.value === entry.correct &&
                rowIndex !== pyramidEntries.length - 1 &&
                pyramidAwaitingNext,
            }"
            @input="handlePyramidInput(rowIndex, colIndex, $event)"
          />
        </div>
      </div>

      <p v-if="lastCheckWasFailure" class="pyramid-note">
        Některé hodnoty nesedí, zkontrolujte zvýrazněná pole a zkuste to znovu.
      </p>

      <div class="pyramid-actions">
        <button v-if="!pyramidAwaitingNext" type="button" class="primary-action" @click="handlePyramidCheck">
          Zkontrolovat
        </button>
        <button v-else type="button" class="primary-action" @click="handlePyramidNext">
          {{ pyramidNextLabel }}
        </button>
      </div>
    </section>

    <section v-else class="card pyramid-card">
      <div class="pyramid-summary">
        <h2>Vyhodnocení pyramid</h2>
        <p>Celkem dokončeno: {{ pyramidTotalExercises }}.</p>
        <div class="pyramid-summary-stats">
          <div class="stat-block success">
            <span class="label">Správně</span>
            <span class="value">{{ pyramidCorrectCount }}</span>
          </div>
          <div class="stat-block error">
            <span class="label">Chybných</span>
            <span class="value">{{ pyramidIncorrectCount }}</span>
          </div>
        </div>
      </div>
      <div class="summary-actions">
        <button type="button" class="primary-action" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="secondary-action" @click="returnToMathLanding">
          Zpět na Matematickou laboratoř
        </button>
      </div>
    </section>
  </main>
  <main v-else-if="activeModule === 'comparison'" class="app-shell">
    <header class="app-header">
      <div class="title-block">
        <h1>Porovnej čísla</h1>
        <p>Vyberte správné znaménko mezi dvěma čísly.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="header-button" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="header-button" @click="returnToMathLanding">
          Jiná matematická úloha
        </button>
      </div>
    </header>

    <section v-if="comparisonPhase === 'setup'" class="card comparison-card">
      <form class="setup-form" @submit.prevent="handleComparisonStart">
        <div class="field-row">
          <label class="field-label" for="comparison-count">Počet úloh</label>
          <select id="comparison-count" v-model.number="comparisonSetupState.count" class="select">
            <option v-for="count in comparisonCountOptions" :key="count" :value="count">
              {{ count }} {{ formatQuestionLabel(count) }}
            </option>
          </select>
        </div>

        <div class="field-row">
          <label class="field-label" for="comparison-max">Čísla do</label>
          <select id="comparison-max" v-model.number="comparisonSetupState.max" class="select">
            <option v-for="value in limitedMaxOptions" :key="`cmp-max-${value}`" :value="value">
              {{ value }}
            </option>
          </select>
        </div>
        <button type="submit" class="primary-action">Začít porovnávat</button>
      </form>
    </section>

    <section v-else-if="comparisonPhase === 'quiz'" class="card comparison-card">
      <div class="session-meta">
        <span class="phase-badge">Porovnávání</span>
        <div class="progress-wrapper">
          <div class="progress-text">
            Úloha {{ comparisonCurrentStep }} z {{ comparisonTotalExercises }}
          </div>
        </div>
      </div>

      <div class="comparison-problem">
        <span class="comparison-number">{{ comparisonCurrentExercise?.left ?? '–' }}</span>
        <span class="comparison-placeholder" :class="{ filled: comparisonSelection }">
          {{ comparisonSelection ?? '?' }}
        </span>
        <span class="comparison-number">{{ comparisonCurrentExercise?.right ?? '–' }}</span>
      </div>

      <div class="comparison-options">
        <button
          v-for="operator in comparisonOperators"
          :key="operator"
          type="button"
          class="comparison-option"
          :class="{ active: comparisonSelection === operator && !comparisonAwaitingNext }"
          @click="handleComparisonSelect(operator)"
        >
          {{ operator }}
        </button>
      </div>

      <p v-if="comparisonFeedback" :class="['comparison-feedback', comparisonFeedback.type]">
        {{ comparisonFeedback.text }}
      </p>

      <div class="comparison-actions">
        <button
          type="button"
          class="primary-action"
          :disabled="!comparisonAwaitingNext"
          @click="handleComparisonNext"
        >
          {{ comparisonNextLabel }}
        </button>
      </div>
    </section>

    <section v-else class="card comparison-card">
      <div class="comparison-summary">
        <h2>Vyhodnocení porovnávání</h2>
        <div class="comparison-summary-stats">
          <div class="stat-block success">
            <span class="label">Správně</span>
            <span class="value">{{ comparisonCorrectCount }}</span>
          </div>
          <div class="stat-block error">
            <span class="label">Chybných</span>
            <span class="value">{{ comparisonIncorrectCount }}</span>
          </div>
        </div>
      </div>
      <div class="summary-actions">
        <button type="button" class="primary-action" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="secondary-action" @click="returnToMathLanding">
          Jiná matematická úloha
        </button>
      </div>
    </section>
  </main>
  <main v-else-if="activeModule === 'decomposition'" class="app-shell">
    <header class="app-header">
      <div class="title-block">
        <h1>Rozlož čísla</h1>
        <p>Rozdělte číslo na dvě částky, které dávají správný součet.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="header-button" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="header-button" @click="returnToMathLanding">
          Jiná matematická úloha
        </button>
      </div>
    </header>

    <section v-if="decompositionPhase === 'setup'" class="card decomposition-card">
      <form class="setup-form" @submit.prevent="handleDecompositionStart">
        <div class="field-row">
          <label class="field-label" for="decomposition-count">Počet úloh</label>
          <select
            id="decomposition-count"
            v-model.number="decompositionSetupState.count"
            class="select"
          >
            <option v-for="count in decompositionCountOptions" :key="count" :value="count">
              {{ count }} {{ formatQuestionLabel(count) }}
            </option>
          </select>
        </div>
        <div class="field-row">
          <label class="field-label" for="decomposition-max">Čísla do</label>
          <select
            id="decomposition-max"
            v-model.number="decompositionSetupState.max"
            class="select"
          >
            <option v-for="value in limitedMaxOptions" :key="`dec-max-${value}`" :value="value">
              {{ value }}
            </option>
          </select>
        </div>
        <button type="submit" class="primary-action">Začít rozkládat</button>
      </form>
    </section>

    <section v-else-if="decompositionPhase === 'quiz'" class="card decomposition-card">
      <div class="session-meta">
        <span class="phase-badge">Rozklad</span>
        <div class="progress-wrapper">
          <div class="progress-text">
            Úloha {{ decompositionCurrentStep }} z {{ decompositionTotalExercises }}
          </div>
        </div>
      </div>

      <div class="decomposition-problem">
        <span class="decomposition-total">{{ decompositionCurrentExercise?.total ?? '–' }}</span>
        <span class="decomposition-equals">=</span>
        <input
          type="text"
          inputmode="numeric"
          maxlength="3"
          class="decomposition-input"
          :value="decompositionInputA"
          :readonly="decompositionAwaitingNext"
          @input="handleDecompositionInput('a', $event)"
        />
        <span class="decomposition-plus">+</span>
        <input
          type="text"
          inputmode="numeric"
          maxlength="3"
          class="decomposition-input"
          :value="decompositionInputB"
          :readonly="decompositionAwaitingNext"
          @input="handleDecompositionInput('b', $event)"
        />
      </div>

      <p v-if="decompositionFeedback" :class="['decomposition-feedback', decompositionFeedback.type]">
        {{ decompositionFeedback.text }}
      </p>

      <div class="decomposition-actions">
        <button
          type="button"
          class="primary-action"
          :disabled="decompositionAwaitingNext"
          @click="handleDecompositionSubmit"
        >
          Zkontrolovat
        </button>
        <button
          type="button"
          class="primary-action"
          :disabled="!decompositionAwaitingNext"
          @click="handleDecompositionNext"
        >
          {{ decompositionNextLabel }}
        </button>
      </div>
    </section>

    <section v-else class="card decomposition-card">
      <div class="comparison-summary">
        <h2>Vyhodnocení rozkladů</h2>
        <div class="comparison-summary-stats">
          <div class="stat-block success">
            <span class="label">Správně</span>
            <span class="value">{{ decompositionCorrectCount }}</span>
          </div>
          <div class="stat-block error">
            <span class="label">Chybných</span>
            <span class="value">{{ decompositionIncorrectCount }}</span>
          </div>
        </div>
      </div>
      <div class="summary-actions">
        <button type="button" class="primary-action" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="secondary-action" @click="returnToMathLanding">
          Jiná matematická úloha
        </button>
      </div>
    </section>
  </main>
  <main v-else-if="activeModule === 'numberWriting'" class="app-shell">
    <header class="app-header">
      <div class="title-block">
        <h1>Zapiš čísla</h1>
        <p>Poskládejte číslo z desítek a jednotek.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="header-button" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="header-button" @click="returnToMathLanding">
          Jiná matematická úloha
        </button>
      </div>
    </header>

    <section v-if="numberWritingPhase === 'setup'" class="card number-writing-card">
      <form class="setup-form" @submit.prevent="handleNumberWritingStart">
        <div class="field-row">
          <label class="field-label" for="number-writing-count">Počet úloh</label>
          <select
            id="number-writing-count"
            v-model.number="numberWritingSetupState.count"
            class="select"
          >
            <option v-for="count in numberWritingCountOptions" :key="count" :value="count">
              {{ count }} {{ formatQuestionLabel(count) }}
            </option>
          </select>
        </div>
        <button type="submit" class="primary-action">Začít zapisovat</button>
      </form>
    </section>

    <section v-else-if="numberWritingPhase === 'quiz'" class="card number-writing-card">
      <div class="session-meta">
        <span class="phase-badge">Zápis</span>
        <div class="progress-wrapper">
          <div class="progress-text">
            Úloha {{ numberWritingCurrentStep }} z {{ numberWritingTotalExercises }}
          </div>
        </div>
      </div>

      <p class="number-writing-prompt">
        {{ numberWritingCurrentExercise?.tens ?? 0 }}
        {{ formatTensLabel(numberWritingCurrentExercise?.tens ?? 0) }}
        a
        {{ numberWritingCurrentExercise?.units ?? 0 }}
        {{ formatUnitsLabel(numberWritingCurrentExercise?.units ?? 0) }}
      </p>

      <input
        type="text"
        inputmode="numeric"
        maxlength="3"
        class="number-writing-input"
        :value="numberWritingInput"
        :readonly="numberWritingAwaitingNext"
        @input="handleNumberWritingInput($event)"
      />

      <p v-if="numberWritingFeedback" :class="['number-writing-feedback', numberWritingFeedback.type]">
        {{ numberWritingFeedback.text }}
      </p>

      <div class="number-writing-actions">
        <button
          type="button"
          class="primary-action"
          :disabled="numberWritingAwaitingNext"
          @click="handleNumberWritingSubmit"
        >
          Zkontrolovat
        </button>
        <button
          type="button"
          class="primary-action"
          :disabled="!numberWritingAwaitingNext"
          @click="handleNumberWritingNext"
        >
          {{ numberWritingNextLabel }}
        </button>
      </div>
    </section>

    <section v-else class="card number-writing-card">
      <div class="comparison-summary">
        <h2>Vyhodnocení zápisu</h2>
        <div class="comparison-summary-stats">
          <div class="stat-block success">
            <span class="label">Správně</span>
            <span class="value">{{ numberWritingCorrectCount }}</span>
          </div>
          <div class="stat-block error">
            <span class="label">Chybných</span>
            <span class="value">{{ numberWritingIncorrectCount }}</span>
          </div>
        </div>
      </div>
      <div class="summary-actions">
        <button type="button" class="primary-action" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="secondary-action" @click="returnToMathLanding">
          Jiná matematická úloha
        </button>
      </div>
    </section>
  </main>
  <main v-else-if="activeModule === 'wordLab'" class="app-shell">
    <header class="app-header">
      <div class="title-block">
        <h1>Čtení slov</h1>
        <p>Vyberte slova a čtěte je nahlas. Žádné hodnocení, jen trénink.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="header-button" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="header-button" @click="returnToCzechLanding">
          Zpět na Českou laboratoř
        </button>
      </div>
    </header>

    <section v-if="wordLabPhase === 'setup'" class="card">
      <form class="setup-form" @submit.prevent="handleWordLabStart">
        <div class="field-row">
          <label class="field-label" for="word-lab-length">Délka slov</label>
          <select id="word-lab-length" v-model.number="wordLabSetupState.letters" class="select">
            <option v-for="option in wordLabLetterOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="field-row">
          <label class="field-label" for="word-lab-count">Počet slov</label>
          <select id="word-lab-count" v-model.number="wordLabSetupState.count" class="select">
            <option v-for="count in wordLabCountOptions" :key="count" :value="count">
              {{ count }} slov
            </option>
          </select>
        </div>

        <button type="submit" class="primary-action">Začít číst</button>
      </form>
    </section>

    <section v-else-if="wordLabIsQuiz" class="card word-lab-card">
      <div class="session-meta">
        <span class="phase-badge">Čtení</span>
        <div class="progress-wrapper">
          <div class="progress-text">
            Slovo {{ readingCurrentStep }} z {{ readingTotalWords }}
          </div>
          <div class="progress-bar">
            <span class="progress-fill" :style="{ width: wordLabProgressPercent + '%' }"></span>
          </div>
        </div>
      </div>

      <div class="word-display">
        <span class="word-text">{{ currentReadingWord }}</span>
      </div>

      <button type="button" class="primary-action" @click="handleWordLabNext">
        Další slovo
      </button>
    </section>

    <section v-else class="card word-lab-summary">
      <h2>Hotovo!</h2>
      <p>Skvělé, všechna slova jsou přečtena. Můžete začít novou sérii kdykoli.</p>
      <div class="summary-actions">
        <button type="button" class="primary-action" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="secondary-action" @click="returnToCzechLanding">
          Zpět na Českou laboratoř
        </button>
      </div>
    </section>
  </main>
  <main v-else-if="activeModule === 'word'" class="app-shell">
    <header class="app-header">
      <div class="title-block">
        <h1>Slovní úlohy</h1>
        <p>Procvičte si porozumění zadání a převeďte text na rovnici.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="header-button" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="header-button" @click="returnToMathLanding">
          Jiná matematická úloha
        </button>
      </div>
    </header>

    <section v-if="wordPhase === 'setup'" class="card">
      <form class="setup-form" @submit.prevent="startWordSession">
        <div class="field-row">
          <label class="field-label" for="word-count">Počet úloh</label>
          <select id="word-count" v-model.number="wordSetupState.count" class="select">
            <option v-for="count in wordCountOptions" :key="count" :value="count">
              {{ count }} {{ formatQuestionLabel(count) }}
            </option>
          </select>
        </div>
        <button type="submit" class="primary-action">Začít procvičovat</button>
      </form>
    </section>

    <section v-else-if="wordIsQuizPhase" class="card">
      <div class="session-meta">
        <span class="phase-badge" :class="{ review: wordIsReview }">
          {{ wordQuestionLabel }}
        </span>
        <div class="progress-wrapper">
          <div class="progress-text">
            Úloha {{ wordCurrentStep }} z {{ wordTotalInRun }}
          </div>
          <div
            class="progress-bar"
            role="progressbar"
            :aria-valuemin="0"
            :aria-valuemax="wordTotalInRun"
            :aria-valuenow="wordPointer"
          >
            <span class="progress-fill" :style="{ width: wordProgressPercent + '%' }"></span>
          </div>
        </div>
      </div>

      <WordProblemCard
        v-if="wordCurrentProblem"
        ref="wordCardRef"
        :problem="wordCurrentProblem"
        :model-value="wordAnswer"
        :can-submit="wordCanSubmit"
        :is-last="wordIsLastQuestion"
        :has-error="wordIsReview && wordReviewError"
        @update:model-value="handleWordAnswerUpdate"
        @submit="handleWordSubmit"
      />
      <p v-if="wordIsReview" class="retry-hint">
        Opravte všechny části rovnice, aby odpovídala zadání.
      </p>
    </section>

    <section v-else class="card">
      <SummaryPanel
        :total="wordProblems.length"
        :correct="wordCorrectCount"
        :mistakes="wordMistakeIndices.length"
        :results="wordSummaryResults"
      />
      <div class="summary-actions">
        <button type="button" class="primary-action" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
        <button type="button" class="secondary-action" @click="returnToMathLanding">
          Jiná matematická úloha
        </button>
      </div>
    </section>
  </main>
  <main v-else class="app-shell">
    <header class="app-header">
      <div class="title-block">
        <h1>Hodinová laboratoř</h1>
        <p>Procvičte si čtení času z analogových hodin.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="header-button" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
      </div>
    </header>
    <section v-if="clockPhase === 'setup'" class="card">
      <form class="setup-form" @submit.prevent="handleClockStart">
        <div class="field-row">
          <label class="field-label" for="clock-count">Počet úloh</label>
          <select id="clock-count" v-model.number="clockSetupState.count" class="select">
            <option v-for="count in clockCountOptions" :key="count" :value="count">
              {{ count }} {{ formatQuestionLabel(count) }}
            </option>
          </select>
        </div>
        <button type="submit" class="primary-action">Začít procvičovat</button>
      </form>
    </section>
    <section v-else-if="clockIsQuiz" class="card clock-card">
      <div class="session-meta">
        <span class="phase-badge">Čtení času</span>
        <div class="progress-wrapper">
          <div class="progress-text">
            Úloha {{ clockPointer + 1 }} z {{ clockTotalExercises }}
          </div>
        </div>
      </div>
      <div class="clock-display">
        <ClockFace
          v-if="clockCurrentExercise"
          :hours="clockCurrentExercise.hours"
          :minutes="clockCurrentExercise.minutes"
        />
      </div>
      <div v-if="!clockAwaitingNext" class="clock-interaction">
        <div class="time-inputs">
          <label class="time-field">
            <span>Hodiny</span>
            <input
              type="text"
              inputmode="numeric"
              maxlength="2"
              :value="clockAnswer.hours"
              @input="handleClockHoursInput"
              aria-label="Odhad hodin"
            />
          </label>
          <label class="time-field">
            <span>Minuty</span>
            <input
              type="text"
              inputmode="numeric"
              maxlength="2"
              :value="clockAnswer.minutes"
              @input="handleClockMinutesInput"
              aria-label="Odhad minut"
            />
          </label>
        </div>
        <button type="button" class="primary-action" :disabled="!clockCanSubmit" @click="handleClockSubmit">
          Zkontrolovat
        </button>
        <p v-if="!clockCanSubmit" class="hint-text">Zadejte hodiny i minuty.</p>
      </div>
      <div v-else class="clock-feedback-block">
        <p v-if="clockFeedback" :class="['feedback-text', clockFeedback.type]">
          {{ clockFeedback.text }}
        </p>
        <button type="button" class="primary-action" @click="handleClockNext">
          {{ clockNextLabel }}
        </button>
      </div>
    </section>
    <section v-else class="card">
      <SummaryPanel
        :total="clockTotalExercises"
        :correct="clockCorrectCount"
        :mistakes="clockTotalExercises - clockCorrectCount"
        :results="[]"
      />
      <div class="summary-actions">
        <button type="button" class="primary-action" @click="returnToHome">
          Zpět na Mozkolaboratoř
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding: clamp(1.25rem, 4vw, 2.5rem);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 960px;
  margin: 0 auto;
}

.below-window {
  text-align: center;
}

.feedback-link {
  color: #2f55a4;
  font-weight: 600;
  text-decoration: underline;
}

.feedback-link:hover,
.feedback-link:focus-visible {
  color: #1f2540;
  outline: none;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.title-block h1 {
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 2.4rem);
  color: #1f2540;
}

.title-block p {
  margin: 0.25rem 0 0;
  color: #4a5570;
  font-size: 0.95rem;
}

.header-button {
  border: none;
  background: linear-gradient(135deg, #3f82f8, #5aa9ff);
  color: #ffffff;
  border-radius: 0.75rem;
  padding: 0.6rem 1rem;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(63, 130, 248, 0.25);
}

.header-button:hover,
.header-button:focus-visible {
  box-shadow: 0 16px 32px rgba(63, 130, 248, 0.35);
  outline: none;
}

.card {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(6px);
  border-radius: 1.5rem;
  padding: clamp(1.25rem, 5vw, 2rem);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 20px 45px rgba(32, 56, 120, 0.12);
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 600;
  font-size: 0.95rem;
  color: #23304d;
}

.option-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.toggle {
  flex: 1 1 8rem;
  border-radius: 0.85rem;
  border: 1px solid #d5def5;
  background: #f4f7ff;
  padding: 0.7rem 0.75rem;
  font-weight: 600;
  font-size: 1.05rem;
  color: #30406b;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border 0.2s ease;
}

.toggle.active {
  background: linear-gradient(135deg, #3f82f8, #5aa9ff);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 12px 24px rgba(63, 130, 248, 0.25);
}

.select {
  border-radius: 0.85rem;
  border: 1px solid #d5def5;
  padding: 0.65rem 0.75rem;
  font-size: 1rem;
  color: #1f2540;
  background: #ffffff;
}

.primary-action {
  border: none;
  border-radius: 0.9rem;
  background: linear-gradient(135deg, #3f82f8, #5aa9ff);
  color: #ffffff;
  font-weight: 700;
  font-size: 1.05rem;
  padding: 0.9rem 1.2rem;
  cursor: pointer;
  text-align: center;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.primary-action:hover,
.primary-action:focus-visible {
  box-shadow: 0 16px 32px rgba(63, 130, 248, 0.25);
  outline: none;
}

.primary-action:active {
  transform: scale(0.98);
}

.primary-action:disabled {
  background: linear-gradient(135deg, #9fbdfd, #b9d0ff);
  cursor: not-allowed;
  box-shadow: none;
}

.secondary-action {
  border: none;
  border-radius: 0.85rem;
  background: linear-gradient(135deg, #3f82f8, #5aa9ff);
  color: #ffffff;
  font-weight: 600;
  font-size: 1.05rem;
  padding: 0.85rem 1.1rem;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.secondary-action:hover,
.secondary-action:focus-visible {
  box-shadow: 0 16px 32px rgba(63, 130, 248, 0.35);
  outline: none;
}

.landing-shell {
  justify-content: center;
  align-items: center;
}

.landing-card {
  align-items: center;
  text-align: center;
  gap: 2rem;
}

.landing-header h1 {
  margin: 0;
  font-size: clamp(1.9rem, 5vw, 2.6rem);
  color: #1f2540;
}

.landing-header p {
  margin: 0.75rem 0 0;
  color: #4a5570;
  font-size: 1rem;
}

.landing-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: min(320px, 100%);
}

.landing-secondary {
  font-size: 1.05rem;
  padding: 0.9rem 1.2rem;
}

.placeholder-card {
  gap: 1rem;
  text-align: left;
}

.placeholder-card h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #1f2540;
}

.placeholder-card p {
  margin: 0;
  color: #4a5570;
  line-height: 1.5;
}

.retry-hint {
  margin: 1rem 0 0;
  font-size: 0.9rem;
  color: #5f3312;
  background: #fff3d6;
  border-radius: 0.85rem;
  padding: 0.75rem 1rem;
  font-weight: 500;
}

.clock-card,
.dice-card {
  gap: 1.75rem;
  align-items: center;
  text-align: center;
}

.clock-interaction,
.clock-feedback-block,
.dice-interaction,
.dice-feedback-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.word-lab-card {
  gap: 2rem;
  align-items: center;
  text-align: center;
}

.word-display {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 6rem;
  border-radius: 1.1rem;
  background: #f4f7ff;
  border: 2px solid #d5def5;
  box-shadow: 0 12px 28px rgba(63, 130, 248, 0.15);
}

.word-text {
  font-size: clamp(2.5rem, 10vw, 4rem);
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #1f2540;
  text-transform: uppercase;
}

.word-lab-summary {
  gap: 1.5rem;
  text-align: center;
}

.word-lab-summary h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #1f2540;
}

.word-lab-summary p {
  margin: 0;
  color: #4a5570;
  font-size: 1rem;
}

.word-lab-summary .summary-actions {
  justify-content: center;
}

.dice-summary {
  gap: 1.5rem;
}

.dice-summary .summary-actions {
  justify-content: center;
}

.pyramid-card {
  gap: 2rem;
  align-items: center;
  text-align: center;
}

.pyramid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
}

.pyramid .row {
  display: flex;
  gap: 0.6rem;
}

.pyramid .cell {
  width: clamp(3.6rem, 17vw, 5.6rem);
  height: clamp(3.6rem, 17vw, 5.6rem);
  border-radius: 1.2rem;
  border: 2px solid #d5def5;
  background: #f4f7ff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: clamp(1.5rem, 5.5vw, 2.2rem);
  color: #1f2540;
  box-shadow: 0 12px 24px rgba(63, 130, 248, 0.12);
  text-align: center;
  font-family: inherit;
  outline: none;
}

.pyramid .cell.locked {
  background: #e9f0ff;
  border-color: #bbc7ed;
  pointer-events: none;
}

.pyramid .cell.success {
  border-color: #3f9c4a;
  background: #e4f8e7;
}

.pyramid .cell.error {
  border-color: #e2583e;
  background: #ffe7e1;
}

.pyramid .row.base .cell {
  background: #e9f0ff;
}

.pyramid-note {
  margin: 0;
  color: #4a5570;
  font-size: 0.95rem;
}

.pyramid-summary {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: center;
  text-align: center;
}

.pyramid-summary-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-block {
  min-width: 9rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 600;
}

.stat-block .label {
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.stat-block .value {
  font-size: 2.3rem;
}

.stat-block.success {
  background: #ecfdf3;
  color: #1a7f3c;
}

.stat-block.error {
  background: #fff1f0;
  color: #b42318;
}

.comparison-card {
  gap: 2rem;
  align-items: center;
  text-align: center;
}

.comparison-problem {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
  font-size: clamp(2rem, 10vw, 3.5rem);
  font-weight: 700;
  color: #1f2540;
}

.comparison-number {
  min-width: 4rem;
}

.comparison-placeholder {
  width: clamp(3.6rem, 14vw, 5rem);
  height: clamp(3.6rem, 14vw, 5rem);
  border-radius: 1.25rem;
  border: 2px dashed #c6d3f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(2rem, 9vw, 3rem);
  font-weight: 800;
  color: #8c96b7;
}

.comparison-placeholder.filled {
  border-style: solid;
  border-color: #3f82ff;
  color: #1f2540;
}

.comparison-options {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.comparison-option {
  min-width: 3.5rem;
  min-height: 3.5rem;
  border-radius: 1rem;
  border: 2px solid #d5def5;
  background: #f5f8ff;
  font-size: 1.6rem;
  font-weight: 700;
  color: #1f2540;
  transition: all 0.2s ease;
}

.comparison-option:hover,
.comparison-option.active {
  border-color: #3f82ff;
  background: #e6efff;
}

.comparison-feedback {
  margin: 0;
  font-weight: 600;
}

.comparison-feedback.success {
  color: #1a7f3c;
}

.comparison-feedback.error {
  color: #b42318;
}

.comparison-actions {
  display: flex;
  justify-content: center;
}

.comparison-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.comparison-summary-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.decomposition-card {
  gap: 2rem;
  align-items: center;
  text-align: center;
}

.decomposition-problem {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  font-size: clamp(1.5rem, 6vw, 2.5rem);
  font-weight: 700;
}

.decomposition-total {
  font-size: clamp(2rem, 7vw, 3rem);
}

.decomposition-input {
  width: clamp(3.6rem, 16vw, 5.4rem);
  height: clamp(3.4rem, 14vw, 5.2rem);
  border-radius: 1.2rem;
  border: 2px solid #d5def5;
  text-align: center;
  font-size: clamp(1.6rem, 5.5vw, 2.2rem);
  font-weight: 700;
  background: #f7f8ff;
  outline: none;
}

.decomposition-input:focus {
  border-color: #3f82ff;
  box-shadow: 0 0 0 3px rgba(63, 130, 255, 0.2);
}

.decomposition-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.decomposition-actions .primary-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.decomposition-feedback {
  margin: 0;
  font-weight: 600;
}

.decomposition-feedback.success {
  color: #1a7f3c;
}

.decomposition-feedback.error {
  color: #b42318;
}

.number-writing-card {
  gap: 2rem;
  align-items: center;
  text-align: center;
}

.number-writing-prompt {
  font-size: clamp(1.5rem, 5.5vw, 2.2rem);
  font-weight: 600;
  margin: 0;
}

.number-writing-input {
  width: clamp(4rem, 20vw, 6rem);
  height: clamp(3.6rem, 15vw, 5.2rem);
  border-radius: 1.3rem;
  border: 2px solid #d5def5;
  text-align: center;
  font-size: clamp(1.8rem, 6vw, 2.5rem);
  font-weight: 700;
  background: #f7f8ff;
}

.number-writing-input:focus {
  border-color: #3f82ff;
  box-shadow: 0 0 0 3px rgba(63, 130, 255, 0.2);
  outline: none;
}

.number-writing-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.number-writing-actions .primary-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.number-writing-feedback {
  margin: 0;
  font-weight: 600;
}

.number-writing-feedback.success {
  color: #1a7f3c;
}

.number-writing-feedback.error {
  color: #b42318;
}

.clock-display {
  display: flex;
  justify-content: center;
}

.time-inputs {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.time-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 600;
  color: #23304d;
}

.time-field input {
  border: 2px solid #3f82f8;
  border-radius: 0.75rem;
  padding: 0.55rem 0.65rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  width: 4.5rem;
  color: #1f2540;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(15, 61, 172, 0.1);
}

.time-field input:focus {
  outline: 4px solid rgba(63, 130, 248, 0.2);
  outline-offset: 2px;
}

.hint-text {
  margin: 0;
  color: #5f6b85;
  font-size: 0.9rem;
}

.feedback-text {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.feedback-text.success {
  color: #1a7f3c;
}

.feedback-text.error {
  color: #b42318;
}

.session-meta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
}

.phase-badge {
  align-self: flex-start;
  padding: 0.35rem 0.75rem;
  background: #e7f0ff;
  color: #2f55a4;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
}

.phase-badge.review {
  background: #fff3d6;
  color: #b05c00;
}

.progress-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.progress-text {
  font-weight: 600;
  color: #23304d;
}

.progress-bar {
  height: 0.65rem;
  border-radius: 999px;
  background: #e7edff;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: linear-gradient(135deg, #3f82f8, #6fc3ff);
  transition: width 0.2s ease;
}

.summary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .app-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-button {
    width: 100%;
  }

  .summary-actions {
    flex-direction: column;
  }

  .toggle {
    flex: 1 1 100%;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
  }

  .header-button {
    width: 100%;
  }
}
</style>
