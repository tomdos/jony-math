<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import ProblemCard from './components/ProblemCard.vue'
import SummaryPanel from './components/SummaryPanel.vue'
import {
  defaultSettings,
  type SessionSettings,
  type Question,
  useSessionStore,
} from './stores/session'

const session = useSessionStore()
const {
  phase,
  currentQuestion,
  totalInRun,
  currentStepNumber,
  pointer,
  correctCount,
  wrongIndices,
  modeLabel,
  settings,
  attempts,
  lastRunWasReview,
  questions,
  answers,
  reviewError,
} = storeToRefs(session)

const setupState = reactive<SessionSettings>({ ...defaultSettings })
Object.assign(setupState, settings.value)

const answerBuffer = ref('')
const cardRef = ref<InstanceType<typeof ProblemCard> | null>(null)

const modeOptions: Array<{ value: SessionSettings['mode']; label: string }> = [
  { value: 'add', label: 'Addition (+)' },
  { value: 'sub', label: 'Subtraction (-)' },
  { value: 'mix', label: 'Mixed (+ / -)' },
]

const countOptions = [1, 2, 10, 20, 30]
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

const wrongDetails = computed(() =>
  wrongIndices.value
    .map((index) => {
      const question = questions.value[index]
      if (!question) {
        return null
      }
      return { question, answer: answers.value[index] ?? null }
    })
    .filter((item): item is { question: Question; answer: number | null } => item !== null),
)

watch(
  () => phase.value,
  (newPhase) => {
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
    if (phase.value === 'quiz' || phase.value === 'review') {
      answerBuffer.value = ''
      nextTick(() => {
        cardRef.value?.focus()
      })
    }
    session.clearReviewError()
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

function handleRetry() {
  session.beginRetry()
}

function handleRestart() {
  session.resetSession()
  answerBuffer.value = ''
  Object.assign(setupState, settings.value)
}

const questionLabel = computed(() =>
  isReview.value ? 'Retry mistakes' : 'New exercise',
)

function handleAnswerInput(value: string) {
  answerBuffer.value = value
  if (reviewError.value) {
    session.clearReviewError()
  }
}
</script>

<template>
  <main class="app-shell">
    <header class="app-header">
      <div class="title-block">
        <h1>Math Practice Lab</h1>
        <p>Quick drills to build confident number sense.</p>
      </div>
      <button type="button" class="header-button" @click="handleRestart">
        Start Over
      </button>
    </header>

    <section v-if="phase === 'setup'" class="card">
      <form class="setup-form" @submit.prevent="startSession">
        <div class="field-group">
          <span class="field-label">Choose a skill</span>
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
          <label class="field-label" for="question-count">Question count</label>
          <select
            id="question-count"
            v-model.number="setupState.count"
            class="select"
          >
            <option v-for="count in countOptions" :key="count" :value="count">
              {{ count }} {{ count === 1 ? 'question' : 'questions' }}
            </option>
          </select>
        </div>

        <div class="field-row">
          <label class="field-label" for="max-number">Numbers up to</label>
          <select id="max-number" v-model.number="setupState.max" class="select">
            <option v-for="value in maxOptions" :key="value" :value="value">
              {{ value }}
            </option>
          </select>
        </div>

        <button type="submit" class="primary-action">Start practice</button>
      </form>
    </section>

    <section v-else-if="isQuizPhase" class="card">
      <div class="session-meta">
        <span class="phase-badge" :class="{ review: isReview }">
          {{ questionLabel }}
        </span>
        <div class="progress-wrapper">
          <div class="progress-text">
            Question {{ currentStepNumber }} of {{ totalInRun }}
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
        Fix each mistake to see your results. Wrong answers stay on screen until they’re correct.
      </p>
    </section>

    <section v-else class="card">
      <SummaryPanel
        :total="questions.length"
        :correct="correctCount"
        :attempt="attempts"
        :wrong-count="wrongIndices.length"
        :mode-label="modeLabel"
        :max-number="settings.max"
        :wrong-details="wrongDetails"
        :just-reviewed="lastRunWasReview"
      />
      <div class="summary-actions">
        <button
          v-if="wrongIndices.length"
          type="button"
          class="secondary-action"
          @click="handleRetry"
        >
          Retry mistakes ({{ wrongIndices.length }})
        </button>
        <button type="button" class="primary-action" @click="handleRestart">
          Start a new exercise
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
}
</style>
