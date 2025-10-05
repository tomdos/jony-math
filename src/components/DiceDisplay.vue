<script setup lang="ts">
const props = defineProps<{
  values: number[]
}>()

const pipMap: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
}
</script>

<template>
  <div class="dice-wrapper">
    <div v-for="(value, index) in props.values" :key="`${value}-${index}`" class="dice">
      <span
        v-for="position in 9"
        :key="position"
        :class="['pip', `pos-${position}`, { active: (pipMap[value] ?? []).includes(position) }]"
      ></span>
    </div>
  </div>
</template>

<style scoped>
.dice-wrapper {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.dice {
  width: min(120px, 30vw);
  height: min(120px, 30vw);
  background: #ffffff;
  border-radius: 1.2rem;
  border: 4px solid #1f2540;
  position: relative;
  box-shadow: 0 16px 34px rgba(32, 56, 120, 0.18);
  padding: 0.6rem;
  box-sizing: border-box;
}

.pip {
  position: absolute;
  width: 14%;
  height: 14%;
  background: #1f2540;
  border-radius: 50%;
  opacity: 0;
}

.pip.active {
  opacity: 1;
}

.pos-1 {
  top: 15%;
  left: 15%;
}
.pos-2 {
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
}
.pos-3 {
  top: 15%;
  right: 15%;
}
.pos-4 {
  top: 50%;
  left: 15%;
  transform: translateY(-50%);
}
.pos-5 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.pos-6 {
  top: 50%;
  right: 15%;
  transform: translateY(-50%);
}
.pos-7 {
  bottom: 15%;
  left: 15%;
}
.pos-8 {
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
}
.pos-9 {
  bottom: 15%;
  right: 15%;
}
</style>
