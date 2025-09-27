<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WordProblem, WordResponse } from '../stores/word'

const props = defineProps<{
  problem: WordProblem
  modelValue: WordResponse
  canSubmit: boolean
  isLast: boolean
  hasError: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: WordResponse): void
  (e: 'submit'): void
}>()

const firstInputRef = ref<HTMLInputElement | null>(null)

const buttonLabel = computed(() => (props.isLast ? 'Dokončit' : 'Další'))

function sanitizeNumber(value: string) {
  return value.replace(/[^\d-]/g, '')
}

function updateField(field: keyof WordResponse, rawValue: string) {
  if (field === 'op') {
    const op = rawValue === '+' ? '+' : rawValue === '-' ? '-' : null
    emit('update:modelValue', { ...props.modelValue, op })
    return
  }
  const cleaned = sanitizeNumber(rawValue)
  const parsed = cleaned === '' || Number.isNaN(Number(cleaned)) ? null : Number(cleaned)
  emit('update:modelValue', { ...props.modelValue, [field]: parsed })
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && props.canSubmit) {
    event.preventDefault()
    emit('submit')
  }
}

function handleSubmit() {
  if (props.canSubmit) {
    emit('submit')
  }
}

defineExpose({
  focus: () => {
    firstInputRef.value?.focus()
  },
})
</script>

<template>
  <div class="word-card" role="form" aria-live="polite">
    <p class="prompt">{{ problem.text }}</p>

    <div class="equation-builder">
      <input
        ref="firstInputRef"
        class="number-input"
        type="text"
        inputmode="numeric"
        :value="modelValue.a ?? ''"
        @input="(event) => updateField('a', (event.target as HTMLInputElement).value)"
        @keydown="handleKeydown"
        placeholder="?"
        aria-label="První číslo"
      />
      <select
        class="op-select"
        :value="modelValue.op ?? ''"
        @change="(event) => updateField('op', (event.target as HTMLSelectElement).value)"
        aria-label="Operace"
      >
        <option value="">?</option>
        <option value="+">+</option>
        <option value="-">-</option>
      </select>
      <input
        class="number-input"
        type="text"
        inputmode="numeric"
        :value="modelValue.b ?? ''"
        @input="(event) => updateField('b', (event.target as HTMLInputElement).value)"
        @keydown="handleKeydown"
        placeholder="?"
        aria-label="Druhé číslo"
      />
      <span class="equals">=</span>
      <input
        class="number-input"
        type="text"
        inputmode="numeric"
        :value="modelValue.result ?? ''"
        @input="(event) => updateField('result', (event.target as HTMLInputElement).value)"
        @keydown="handleKeydown"
        placeholder="?"
        aria-label="Výsledek"
      />
    </div>

    <p v-if="hasError" class="error-text">
      Výsledek neodpovídá zadání. Zkontrolujte rovnici a zkuste to znovu.
    </p>

    <button
      v-if="canSubmit"
      type="button"
      class="submit-button"
      @click="handleSubmit"
    >
      {{ buttonLabel }}
    </button>
  </div>
</template>

<style scoped>
.word-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.prompt {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #2a3654;
}

.equation-builder {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
}

.number-input,
.op-select {
  border: 2px solid #3f82f8;
  border-radius: 0.75rem;
  padding: 0.55rem 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  color: #1f2540;
  background: #ffffff;
  min-width: 4rem;
  box-shadow: 0 8px 18px rgba(15, 61, 172, 0.1);
}

.number-input:focus,
.op-select:focus {
  outline: 4px solid rgba(63, 130, 248, 0.2);
  outline-offset: 2px;
}

.op-select {
  min-width: 3.5rem;
}

.equals {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1f2540;
}

.error-text {
  margin: 0;
  color: #b23c02;
  font-weight: 600;
  text-align: center;
}

.submit-button {
  align-self: stretch;
  border: none;
  border-radius: 0.85rem;
  background: linear-gradient(135deg, #3f82f8, #5aa9ff);
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 600;
  padding: 0.85rem 1rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.submit-button:hover,
.submit-button:focus-visible {
  box-shadow: 0 12px 24px rgba(63, 130, 248, 0.25);
  outline: none;
}

.submit-button:active {
  transform: scale(0.98);
}

@media (max-width: 520px) {
  .equation-builder {
    gap: 0.5rem;
  }

  .number-input,
  .op-select {
    min-width: 3.5rem;
  }
}
</style>
