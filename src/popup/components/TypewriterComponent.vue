<template>
  <div class="typewriter-container">
    <div ref="outputElement" class="typewriter-output">{{ displayedText }}</div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true,
    default: ''
  },
  speed: {
    type: Number,
    default: 30
  },
  autoStart: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['finished', 'typing']);
const displayedText = ref('');
const outputElement = ref(null);

// 核心打字机逻辑
const typeText = async () => {
  displayedText.value = '';
  
  for (let i = 0; i < props.text.length; i++) {
    displayedText.value += props.text[i];
    emit('typing', displayedText.value);
    await new Promise(resolve => setTimeout(resolve, props.speed));
  }
  
  emit('finished');
};

// 监听文本变化
watch(() => props.text, (newText) => {
  if (props.autoStart && newText) {
    typeText();
  }
});

// 组件挂载时启动
onMounted(() => {
  if (props.autoStart && props.text) {
    typeText();
  }
});
</script>

<style scoped>
.typewriter-container {
  width: 100%;
  height: 100%;
}

.typewriter-output {
  width: 100%;
  height: 100%;
  white-space: pre-wrap;
  line-height: 1.6;
}

.typewriter-output::after {
  content: '|';
  animation: cursor-blink 1s infinite;
  opacity: 0;
}

@keyframes cursor-blink {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}
</style>