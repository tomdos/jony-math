<script setup lang="ts">

interface ResultEntry {
  id: string
  prompt?: string
  expression: string
  hadMistake: boolean
  firstWrong?: string | null
}

defineProps<{
  total: number
  correct: number
  mistakes: number
  results: ResultEntry[]
}>()

function formatExampleLabel(count: number) {
  if (count === 1) {
    return 'příklad'
  }
  if (count >= 2 && count <= 4) {
    return 'příklady'
  }
  return 'příkladů'
}
</script>

<template>
  <div class="summary-panel">
    <div class="totals">
      <div class="total-block success">
        <span class="label">Správně</span>
        <span class="value">{{ correct }}</span>
      </div>
      <div class="total-block error">
        <span class="label">Chyby</span>
        <span class="value">{{ mistakes }}</span>
      </div>
    </div>

    <ul class="results-list">
      <li v-for="item in results" :key="item.id" :class="['result-row', item.hadMistake ? 'wrong' : 'correct']">
        <div class="row-main">
          <div class="row-text">
            <span v-if="item.prompt" class="prompt-text">{{ item.prompt }}</span>
            <span class="expression">{{ item.expression }}</span>
          </div>
          <span class="status">
            {{ item.hadMistake ? 'Chyba v průběhu' : 'Správně napoprvé' }}
          </span>
        </div>
        <span v-if="item.hadMistake && item.firstWrong" class="answer">
          První odpověď: {{ item.firstWrong }}
        </span>
      </li>
    </ul>

    <p class="total-note">Celkem: {{ total }} {{ formatExampleLabel(total) }}</p>
  </div>
</template>

<style scoped>
.summary-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 1.25rem;
  box-shadow: 0 20px 45px rgba(32, 56, 120, 0.12);
}

.totals {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.total-block {
  flex: 1 1 12rem;
  min-width: 12rem;
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.total-block .label {
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-weight: 600;
}

.total-block .value {
  font-size: 2.4rem;
  font-weight: 700;
}

.total-block.success {
  background: #ecfdf3;
  color: #1a7f3c;
}

.total-block.error {
  background: #fff1f0;
  color: #b42318;
}

.results-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.85rem 1rem;
  border-radius: 0.95rem;
  border: 1px solid transparent;
}

.result-row.correct {
  background: #f0f9ff;
  border-color: #9ed2ff;
}

.result-row.wrong {
  background: #fff4f2;
  border-color: #f3b7ac;
}

.row-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.row-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.prompt-text {
  font-size: 0.9rem;
  color: #4a5570;
}

.expression {
  font-weight: 600;
  color: #1f2540;
}

.status {
  font-weight: 600;
  font-size: 0.95rem;
}

.result-row.correct .status {
  color: #1a7f3c;
}

.result-row.wrong .status {
  color: #b42318;
}

.answer {
  font-size: 0.85rem;
  color: #4a5570;
}

.total-note {
  margin: 0.5rem 0 0;
  text-align: center;
  font-weight: 500;
  color: #4a5570;
}

@media (max-width: 540px) {
  .total-block {
    min-width: auto;
    flex: 1 1 100%;
  }

  .total-block .value {
    font-size: 2rem;
  }
}
</style>
