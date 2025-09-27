<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Question } from '../stores/session'

const props = defineProps<{
  question: Question
  modelValue: string
  canSubmit: boolean
  isLast: boolean
  isReview: boolean
  hasError: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit'): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)

const buttonLabel = computed(() => {
  if (props.isReview) {
    return props.isLast ? 'Dokončit opakování' : 'Zkontrolovat odpověď'
  }
  return props.isLast ? 'Dokončit' : 'Další'
})

const inputClasses = computed(() => ({
  'answer-input': true,
  error: props.hasError,
}))

function sanitize(value: string) {
  return value.replace(/\D/g, '')
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  const digits = sanitize(target.value)
  if (digits !== target.value) {
    target.value = digits
  }
  emit('update:modelValue', digits)
}

function onKeydown(event: KeyboardEvent) {
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
  if (/^\d$/.test(event.key)) {
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    if (props.canSubmit) {
      emit('submit')
    }
    return
  }
  if (!allowed.includes(event.key)) {
    event.preventDefault()
  }
}

function handleSubmit() {
  if (props.canSubmit) {
    emit('submit')
  }
}

defineExpose({
  focus: () => {
    inputRef.value?.focus()
  },
})
</script>

<template>
  <div class="problem-card" role="form" aria-label="Math question">
    <p class="prompt">
      {{ isReview ? 'Zkuste znovu:' : 'Vyřešte:' }}
      <span v-if="isReview" class="retry-tag">Kolo opakování</span>
    </p>
    <div class="equation">
      <span class="operand">{{ question.a }}</span>
      <span class="operator">{{ question.op }}</span>
      <span class="operand">{{ question.b }}</span>
      <span class="equals">=</span>
      <input
        ref="inputRef"
        :value="modelValue"
        :class="inputClasses"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        enterkeyhint="next"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        @input="onInput"
        @keydown="onKeydown"
        aria-label="Your answer"
      />
    </div>
    <p v-if="hasError" class="error-text">Stále to nesedí. Zkontrolujte čísla a zkuste to znovu.</p>
    <button
      v-if="canSubmit"
      type="button"
      class="next-button"
      @click="handleSubmit"
    >
      {{ buttonLabel }}
    </button>
  </div>
</template>

<style scoped>
.problem-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: center;
}

.prompt {
  font-size: 1rem;
  font-weight: 500;
  color: #3f4b5a;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.retry-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  background: #fff3d6;
  color: #b05c00;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.equation {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
  font-size: clamp(1.9rem, 10vw, 3.2rem);
  font-weight: 600;
  color: #1f2540;
  width: 100%;
}

.operand,
.operator,
.equals {
  min-width: 1.75rem;
  text-align: center;
}

.answer-input {
  width: clamp(4.75rem, 34vw, 7.25rem);
  border: 2px solid #3f82f8;
  border-radius: 0.75rem;
  padding: 0.4rem 0.5rem;
  font: inherit;
  text-align: center;
  color: #1f2540;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(15, 61, 172, 0.1);
}

.answer-input.error {
  border-color: #d9480f;
  box-shadow: 0 8px 18px rgba(217, 72, 15, 0.18);
}

.answer-input:focus {
  outline: 4px solid rgba(63, 130, 248, 0.2);
  outline-offset: 2px;
}

.answer-input.error:focus {
  outline-color: rgba(217, 72, 15, 0.2);
}

.error-text {
  margin: 0;
  color: #b23c02;
  font-size: 0.9rem;
  font-weight: 600;
}

.next-button {
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

.next-button:active {
  transform: scale(0.98);
}

.next-button:hover,
.next-button:focus-visible {
  box-shadow: 0 12px 24px rgba(63, 130, 248, 0.25);
  outline: none;
}

@media (max-width: 480px) {
  .problem-card {
    gap: 1rem;
  }

  .equation {
    gap: 0.5rem;
    font-size: clamp(1.6rem, 14vw, 2.6rem);
  }

  .answer-input {
    width: clamp(4.25rem, 42vw, 6.5rem);
  }
}
</style>
