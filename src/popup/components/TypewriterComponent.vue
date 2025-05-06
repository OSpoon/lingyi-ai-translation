<template>
  <div class="typewriter-container">
    <div
      ref="outputElement"
      class="typewriter-output"
    >{{ displayedText }}</div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  // 要显示的文本内容
  text: {
    type: String,
    required: true,
    default: ''
  },
  // 打字机效果的速度 (每个字符的毫秒数)
  speed: {
    type: Number,
    default: 30
  },
  // 是否自动开始
  autoStart: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['finished']);

// 当前显示的文本
const displayedText = ref('');
// 用于控制打字机效果的计时器
let typingTimer = null;
// 当前打字位置
let currentIndex = 0;
// 输出元素的引用
const outputElement = ref(null);

// 开始打字机效果
const startTypewriter = () => {
  // 清除可能存在的计时器
  if (typingTimer) {
    clearInterval(typingTimer);
  }
  
  // 重置显示文本和索引
  displayedText.value = '';
  currentIndex = 0;
  
  // 如果没有文本要显示，则直接返回
  if (!props.text) {
    return;
  }
  
  // 设置打字机效果的计时器
  typingTimer = setInterval(() => {
    // 如果已经显示完所有文本
    if (currentIndex >= props.text.length) {
      // 清除计时器
      clearInterval(typingTimer);
      typingTimer = null;
      // 确保最终内容可见
      nextTick(() => {
        setTimeout(() => {
          scrollToBottom();
          // 触发完成事件
          emit('finished');
        }, 50);
      });
      return;
    }
    
    // 添加下一个字符到显示文本
    displayedText.value += props.text.charAt(currentIndex);
    currentIndex++;
    
    // 自动滚动到底部，保持最新文本可见
    scrollToBottom();
  }, props.speed);
};

// 监听text属性的变化，当文本变化时重新启动打字机效果
watch(() => props.text, (newText, oldText) => {
  // 只在文本发生变化且自动启动选项开启时启动打字效果
  if (newText !== oldText && props.autoStart) {
    startTypewriter();
  }
});

// 优化的滚动到底部函数
const scrollToBottom = () => {
  // 使用nextTick确保DOM更新完成
  nextTick(() => {
    // 添加小延迟确保渲染完成
    setTimeout(() => {
      if (outputElement.value) {
        // 平滑滚动
        outputElement.value.scrollTo({
          top: outputElement.value.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 10);
  });
};

// 组件挂载后启动打字机效果
onMounted(() => {
  if (props.autoStart && props.text) {
    startTypewriter();
  }
});

// 在组件卸载前清理计时器
onUnmounted(() => {
  if (typingTimer) {
    clearInterval(typingTimer);
  }
});
</script>

<style scoped>
.typewriter-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.typewriter-output {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  white-space: pre-wrap;
  line-height: 1.6;
  scroll-behavior: smooth;
}

/* 光标闪烁效果 */
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