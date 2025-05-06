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
        @finished="onTypewriterFinished"
      />
      <div v-else class="loading-indicator">翻译中...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import TypewriterComponent from './TypewriterComponent.vue';

const props = defineProps({
  // 要显示的翻译结果
  translationResult: {
    type: String,
    default: '翻译结果将显示在这里'
  },
  // 翻译方向文本
  translationDirection: {
    type: String,
    default: '翻译结果'
  },
  // 是否正在加载中
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['copy']);

// 结果容器的引用
const resultContainer = ref(null);

// 处理复制结果事件
async function handleCopy() {
  const text = props.translationResult;

  if (text && text !== '翻译结果将显示在这里' && text !== '翻译中...') {
    emit('copy', text);
  }
}

// 当打字机效果完成时的回调
function onTypewriterFinished() {
  // 可以在这里处理打字完成后的逻辑
  console.log('打字效果完成');
}

// 调整结果区域高度
function adjustResultHeight() {
  nextTick(() => {
    if (resultContainer.value) {
      // 根据内容自动调整结果区域的高度
      const contentHeight = resultContainer.value.scrollHeight;
      // 设置最小和最大高度限制
      const newHeight = Math.max(80, Math.min(contentHeight, 300));
      resultContainer.value.style.height = `${newHeight}px`;
    }
  });
}

// 监听翻译结果变化，调整结果区域高度
watch(() => props.translationResult, () => {
  adjustResultHeight();
});

// 监听加载状态变化，调整结果区域高度
watch(() => props.isLoading, () => {
  adjustResultHeight();
});
</script>

<style scoped>
.output-component {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 16px;
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
  min-height: 80px;
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--bg-light);
  transition: all 0.2s ease;
}

.result-container.loading {
  opacity: 0.7;
  background-image: linear-gradient(
    to right,
    var(--bg-light) 0%,
    var(--secondary-color) 50%,
    var(--bg-light) 100%
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
    background-color: #40414f;
    color: var(--text-color);
  }

  .result-container.loading {
    background-image: linear-gradient(
      to right,
      #40414f 0%,
      #4a4b5a 50%,
      #40414f 100%
    );
  }
}
</style>
