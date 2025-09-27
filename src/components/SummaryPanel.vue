<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '../stores/session'

const props = defineProps<{
  total: number
  correct: number
  attempt: number
  wrongCount: number
  modeLabel: string
  maxNumber: number
  wrongDetails: Array<{ question: Question; answer: number | null }>
  justReviewed: boolean
}>()

const headline = computed(() => {
  if (!props.wrongCount) {
    return 'Great job! Every answer was correct.'
  }
  if (props.justReviewed) {
    return `Keep going! ${props.wrongCount} question${props.wrongCount === 1 ? '' : 's'} still need attention.`
  }
  return `You solved ${props.correct} out of ${props.total}. Let’s retry the rest.`
})

const subline = computed(() => {
  if (!props.wrongCount) {
    return `All ${props.total} answers are spot on. You can start a new exercise any time.`
  }
  const retryLabel = props.justReviewed ? 'Give them another shot.' : 'Tap "Retry Mistakes" to see them again.'
  return `${props.wrongCount} question${props.wrongCount === 1 ? '' : 's'} still need a correct answer. ${retryLabel}`
})
</script>

<template>
  <div class="summary-panel">
    <p class="headline">{{ headline }}</p>
    <p class="subline">{{ subline }}</p>

    <div class="stats">
      <div class="stat">
        <span class="label">Exercise</span>
        <span class="value">{{ modeLabel }} · {{ total }} questions · up to {{ maxNumber }}</span>
      </div>
      <div class="stat">
        <span class="label">Attempts</span>
        <span class="value">{{ attempt }}</span>
      </div>
      <div class="stat">
        <span class="label">Correct</span>
        <span class="value">{{ correct }}</span>
      </div>
      <div class="stat" v-if="wrongCount">
        <span class="label">Still to solve</span>
        <span class="value highlight">{{ wrongCount }}</span>
      </div>
    </div>

    <div v-if="wrongDetails.length" class="trouble-list">
      <p class="list-title">You’ll see these again:</p>
      <ul>
        <li v-for="item in wrongDetails" :key="item.question.id">
          <span class="expression">
            {{ item.question.a }}
            {{ item.question.op }}
            {{ item.question.b }}
            = {{ item.question.correct }}
          </span>
          <span v-if="item.answer !== null" class="answer-note">Your answer: {{ item.answer }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.summary-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 1.25rem;
  box-shadow: 0 20px 45px rgba(32, 56, 120, 0.12);
}

.headline {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1f2540;
  margin: 0;
}

.subline {
  margin: 0;
  color: #4a5570;
  font-size: 0.95rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1rem;
}

.stat {
  background: #f2f6ff;
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.label {
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #5f6b85;
}

.value {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1f2540;
}

.value.highlight {
  color: #d9480f;
}

.trouble-list {
  border-top: 1px solid #e0e7ff;
  padding-top: 1rem;
}

.list-title {
  margin: 0 0 0.75rem;
  font-weight: 600;
  color: #23304d;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

li {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.75rem 1rem;
  border-radius: 0.85rem;
  background: #f9fbff;
}

.expression {
  font-weight: 600;
  color: #1f2540;
}

.answer-note {
  font-size: 0.85rem;
  color: #5f6b85;
}
</style>
