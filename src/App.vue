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

const setupState = reactive<SessionSettings>({ ...defaultSettings })
Object.assign(setupState, settings.value)

const wordSetupState = reactive<WordSettings>({ ...wordDefaultSettings })
Object.assign(wordSetupState, wordStore.settings)

const answerBuffer = ref('')
const cardRef = ref<InstanceType<typeof ProblemCard> | null>(null)
const activeModule = ref<'landing' | 'arithmetic' | 'word'>('landing')
const wordCardRef = ref<InstanceType<typeof WordProblemCard> | null>(null)
const wordAnswer = ref<WordModuleResponse>({ a: null, op: null, b: null, result: null })

const wordCountOptions = [1, 2, 3, 4, 5]

const modeOptions: Array<{ value: SessionSettings['mode']; label: string }> = [
  { value: 'add', label: 'Sčítání (+)' },
  { value: 'sub', label: 'Odčítání (-)' },
  { value: 'mix', label: 'Smíšené (+ / -)' },
]

const countOptions = [1, 2, 5, 10, 15, 20, 25]
const maxOptions = [20, 30, 40, 50]

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

function handleRestart() {
  session.resetSession()
  answerBuffer.value = ''
  Object.assign(setupState, settings.value)
}

const questionLabel = computed(() =>
  isReview.value ? 'Opakování chyb' : 'Nové cvičení',
)

function handleAnswerInput(value: string) {
  answerBuffer.value = value
  if (reviewError.value) {
    session.clearReviewError()
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

function handleWordRestart() {
  wordStore.resetSession()
  syncWordSetupFromStore()
  resetWordAnswer(null)
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

function resetWordAnswer(problem: WordProblem | null) {
  wordAnswer.value = {
    a: null,
    op: problem ? problem.op : null,
    b: null,
    result: null,
  }
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

function openArithmetic() {
  session.resetSession()
  Object.assign(setupState, settings.value)
  answerBuffer.value = ''
  activeModule.value = 'arithmetic'
}

function openWordProblems() {
  session.resetSession()
  answerBuffer.value = ''
  wordStore.resetSession()
  syncWordSetupFromStore()
  resetWordAnswer(null)
  activeModule.value = 'word'
}

function returnToLanding() {
  session.resetSession()
  answerBuffer.value = ''
  wordStore.resetSession()
  resetWordAnswer(null)
  syncWordSetupFromStore()
  activeModule.value = 'landing'
}
</script>

<template>
  <main v-if="activeModule === 'arithmetic'" class="app-shell">
    <header class="app-header">
      <div class="title-block">
        <h1>Sčítání a odečítání</h1>
        <p>Blesková cvičení pro jistotu v počítání.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="header-button" @click="handleRestart">
          Začít znovu
        </button>
        <button type="button" class="header-button" @click="returnToLanding">
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
        <button type="button" class="primary-action" @click="handleRestart">
          Začít nové cvičení
        </button>
        <button type="button" class="secondary-action" @click="returnToLanding">
          Jiná matematická úloha
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
        <button type="button" class="header-button" @click="handleWordRestart">
          Začít znovu
        </button>
        <button type="button" class="header-button" @click="returnToLanding">
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
        <button type="button" class="primary-action" @click="handleWordRestart">
          Začít nové procvičování
        </button>
        <button type="button" class="secondary-action" @click="returnToLanding">
          Jiná matematická úloha
        </button>
      </div>
    </section>
  </main>
  <main v-else class="app-shell landing-shell">
    <section class="card landing-card">
      <div class="landing-header">
        <h1>Matematická laboratoř</h1>
        <p>Začněte s čísly nebo se brzy pusťte do slovních úloh.</p>
      </div>
      <div class="landing-options">
        <button type="button" class="primary-action" @click="openArithmetic">
          Sčítání a odečítání
        </button>
        <button type="button" class="secondary-action landing-secondary" @click="openWordProblems">
          Slovní úlohy
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
  background: #ffffff;
  color: #3f82f8;
  border-radius: 0.75rem;
  padding: 0.6rem 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(63, 130, 248, 0.15);
}

.header-button:hover,
.header-button:focus-visible {
  box-shadow: 0 14px 28px rgba(63, 130, 248, 0.2);
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

.secondary-action {
  border: none;
  border-radius: 0.85rem;
  background: #f4f7ff;
  color: #30406b;
  font-weight: 600;
  padding: 0.85rem 1.1rem;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.secondary-action:hover,
.secondary-action:focus-visible {
  background: #e3ebff;
  box-shadow: 0 12px 24px rgba(63, 130, 248, 0.15);
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
  font-size: 1rem;
  padding: 0.95rem 1.1rem;
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
