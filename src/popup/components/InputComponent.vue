<template>
  <div class="input-component">
    <textarea
      v-model="inputText"
      placeholder="请输入要翻译的文本..."
      autofocus
      @input="onInputChange"
      ref="textarea"
    ></textarea>
    <div class="input-actions">
      <button @click="handlePaste" class="secondary-button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        粘贴
      </button>
      <button @click="handleClear" class="secondary-button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
        清空
      </button>
      <button @click="handleTranslate" class="primary-button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
        </svg>
        翻译
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'paste', 'clear', 'translate']);

const textarea = ref(null);
const inputText = ref(props.modelValue);

// 监听modelValue变化，更新内部inputText
watch(() => props.modelValue, (newValue) => {
  inputText.value = newValue;
});

// 监听inputText变化，发送update事件
watch(() => inputText.value, (newValue) => {
  emit('update:modelValue', newValue);
});

// 处理输入变化并调整文本区域高度
function onInputChange() {
  adjustTextareaHeight();
  emit('update:modelValue', inputText.value);
}

// 调整文本区域高度
function adjustTextareaHeight() {
  nextTick(() => {
    if (textarea.value) {
      // 先重置高度, 以便正确计算
      textarea.value.style.height = 'auto';

      // 计算新高度, 但不超过最大高度
      const newHeight = Math.min(textarea.value.scrollHeight, 100);
      textarea.value.style.height = `${newHeight}px`;
    }
  });
}

// 处理粘贴
async function handlePaste() {
  try {
    // 首先尝试使用现代Clipboard API
    const text = await navigator.clipboard.readText();
    inputText.value = text;
    emit('update:modelValue', text);

    // 粘贴后调整高度
    adjustTextareaHeight();

    // 发送粘贴事件
    emit('paste', text);
  } catch (error) {
    console.error('粘贴失败:', error);
    // 通知父组件处理错误
    emit('paste', null, error);
  }
}

// 处理清空
function handleClear() {
  inputText.value = '';
  emit('update:modelValue', '');
  emit('clear');
}

// 处理翻译
function handleTranslate() {
  if (inputText.value.trim()) {
    emit('translate', inputText.value);
  }
}

// 初始化时调整文本区域高度
nextTick(() => {
  adjustTextareaHeight();
});
</script>

<style scoped>
.input-component {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  flex: 1;
  padding: 16px; /* Added padding */
}

textarea {
  width: 100%;
  height: 100%;
  min-height: 60px; /* Modified min-height */
  max-height: 100px; /* Modified max-height */
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  resize: none;
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-color);
  flex: 1;
  overflow-y: auto;
}

textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.2);
}

.input-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.secondary-button {
  background-color: var(--secondary-color);
  color: var(--text-color);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  gap: 6px;
  border: 1px solid var(--border-color); /* Added border */
  transition: border-color 0.2s ease, background-color 0.2s ease; /* Added transition */
}

.secondary-button:hover {
  background-color: #e5e5e6;
}

.secondary-button svg {
  width: 16px;
  height: 16px;
}

.primary-button {
  background-color: var(--primary-color);
  color: white;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  gap: 8px;
  border: 1px solid var(--primary-color); /* Added border matching background */
  transition: border-color 0.2s ease, background-color 0.2s ease; /* Added transition */
}

.primary-button:hover {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover); /* Maintain border color matching background on hover */
}

.primary-button svg {
  width: 16px;
  height: 16px;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  textarea {
    background-color: #40414f;
    color: var(--text-color);
  }

  .secondary-button {
    background-color: #40414f;
    border-color: var(--border-color); /* Ensure border color is correct in dark mode */
  }

  .secondary-button:hover {
    background-color: #4a4b5a;
  }

  .primary-button {
     border-color: var(--primary-color); /* Ensure border color is correct in dark mode */
  }

  .primary-button:hover {
     border-color: var(--primary-hover); /* Ensure border color is correct in dark mode */
  }
}
</style>