<template>
  <div class="output-component">
    <div class="result-header">
      <div class="translation-direction">{{ translationDirection }}</div>
      <button @click="handleCopy" class="icon-button" title="复制结果">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
        </svg>
      </button>
    </div>
    <div class="result-container" :class="{ 'loading': isLoading }" ref="resultContainer">
      <TypewriterComponent
        v-if="!isLoading"
        :text="translationResult"
        :speed="25"
        @typing="handleTyping"
        @finished="handleFinished"
      />
      <div v-else class="loading-indicator">翻译中...</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TypewriterComponent from './TypewriterComponent.vue';

const props = defineProps({
  translationResult: {
    type: String,
    default: '翻译结果将显示在这里'
  },
  translationDirection: {
    type: String,
    default: '翻译结果'
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['copy']);
const resultContainer = ref(null);

function handleTyping() {
  if (resultContainer.value) {
    resultContainer.value.scrollTop = resultContainer.value.scrollHeight;
  }
}

function handleFinished() {
  if (resultContainer.value) {
    resultContainer.value.scrollTop = resultContainer.value.scrollHeight;
  }
}

async function handleCopy() {
  const text = props.translationResult;
  if (text && text !== '翻译结果将显示在这里' && text !== '翻译中...') {
    emit('copy', text);
  }
}
</script>

<style scoped>
.output-component {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 16px; /* Adjusted padding */
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.translation-direction {
  font-size: 14px;
  color: var(--text-light);
  font-weight: 500;
}

.result-container {
  width: 100%;
  max-height: 200px; /* Adjusted max-height */
  overflow-y: auto;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color);
  background-color: #ffffff; /* Fixed background-color */
  transition: all 0.2s ease;
  scroll-behavior: smooth; /* 添加平滑滚动效果 */
}

.result-container.loading {
  opacity: 0.7;
  background-image: linear-gradient(
    to right,
    #ffffff 0%, /* Fixed background-color */
    var(--secondary-color) 50%,
    #ffffff 100% /* Fixed background-color */
  );
  background-size: 200% auto;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  color: var(--text-light);
}

.icon-button {
  background-color: transparent;
  color: var(--text-light);
  padding: 6px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  border: none;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-button:hover {
  background-color: var(--secondary-color);
  color: var(--text-color);
}

.icon-button svg {
  width: 16px;
  height: 16px;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .result-container {
    background-color: #40414f; /* Maintain dark mode background-color */
    color: var(--text-color);
  }

  .result-container.loading {
    background-image: linear-gradient(
      to right,
      #40414f 0%, /* Maintain dark mode background-color */
      #4a4b5a 50%,
      #40414f 100% /* Maintain dark mode background-color */
    );
  }
}
</style>