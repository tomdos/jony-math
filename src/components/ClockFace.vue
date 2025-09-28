<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  hours: number
  minutes: number
}>()

const hourAngle = computed(() => {
  const normalizedHour = props.hours % 12
  return (normalizedHour + props.minutes / 60) * 30
})

const minuteAngle = computed(() => props.minutes * 6)

const hourTransform = computed(() => `rotate(${hourAngle.value})`)
const minuteTransform = computed(() => `rotate(${minuteAngle.value})`)
</script>

<template>
  <svg class="clock" viewBox="0 0 200 200" role="presentation" aria-hidden="true">
    <circle class="clock-face" cx="100" cy="100" r="95" />

    <g class="minute-markers">
      <circle
        v-for="index in 60"
        :key="`minute-${index}`"
        :cx="100 + 85 * Math.sin((index * Math.PI) / 30)"
        :cy="100 - 85 * Math.cos((index * Math.PI) / 30)"
        r="index % 5 === 0 ? 1.8 : 1"
        class="marker"
      />
    </g>

    <g class="hour-numbers">
      <text
        v-for="index in 12"
        :key="`hour-${index}`"
        :x="100 + 70 * Math.sin((index * Math.PI) / 6)"
        :y="105 - 70 * Math.cos((index * Math.PI) / 6)"
        class="hour-number"
        dominant-baseline="middle"
        text-anchor="middle"
      >
        {{ index }}
      </text>
    </g>

    <line class="hand hour" x1="100" y1="100" x2="100" y2="55" :transform="hourTransform" />
    <line class="hand minute" x1="100" y1="100" x2="100" y2="35" :transform="minuteTransform" />

    <circle class="center-cap" cx="100" cy="100" r="4" />
  </svg>
</template>

<style scoped>
.clock {
  width: min(280px, 80vw);
  height: min(280px, 80vw);
}

.clock-face {
  fill: #ffffff;
  stroke: #1f2540;
  stroke-width: 2;
}

.marker {
  fill: #7a8ab6;
}

.hour-number {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 600;
  fill: #1f2540;
}

.hand {
  stroke: #1f2540;
  stroke-linecap: round;
  transform-origin: 100px 100px;
}

.hand.hour {
  stroke-width: 6;
}

.hand.minute {
  stroke-width: 4;
}

.center-cap {
  fill: #1f2540;
}
</style>
