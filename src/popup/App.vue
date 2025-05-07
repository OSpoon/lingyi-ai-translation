<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <HeaderComponent
      @resetConversation="resetConversation"
      @openSettings="openSettings"
    />

    <!-- 状态消息 -->
    <div class="status-message" :class="{ 'show': statusMessage }">
      {{ statusMessage }}
    </div>

    <!-- 输入区域 -->
    <InputComponent
      v-model="sourceText"
      @translate="handleTranslate"
      @paste="handlePasteFromInput"
      @clear="handleClearInput"
    />

    <!-- 结果区域 -->
    <OutputComponent
      :translationResult="translationResult"
      :translationDirection="translationDirection"
      :isLoading="isLoading"
      @copy="handleCopy"
    />

    <footer class="app-footer">
      <span>由通义千问大模型提供支持</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import HeaderComponent from './components/HeaderComponent.vue';
import InputComponent from './components/InputComponent.vue';
import OutputComponent from './components/OutputComponent.vue';

// 响应式状态
const sourceText = ref('');
const translationResult = ref('翻译结果将显示在这里');
const translationDirection = ref('翻译结果');
const statusMessage = ref('');
const isLoading = ref(false);
const currentConversationId = ref('default');

// 处理翻译
async function handleTranslate(textToTranslate) {
  const text = textToTranslate || sourceText.value.trim();

  if (!text) {
    return;
  }

  translationResult.value = ''; // Clear previous result for typewriter effect
  isLoading.value = true;
  translationDirection.value = '处理中...';

  try {
    // 注册一个更新处理器，接收流式翻译结果
    const messageListener = function(message) {
      if (message.action === 'translationUpdate' && message.conversationId === currentConversationId.value) {
        // 如果是第一次更新，移除加载状态
        if (isLoading.value) {
          isLoading.value = false;
        }
        translationResult.value = message.fullText;
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // 设置清理函数
    const cleanupListener = () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
    setTimeout(cleanupListener, 60000); // 1分钟后自动清理

    // 调用后台脚本
    const result = await chrome.runtime.sendMessage({
      action: 'translate',
      text: text,
      conversationId: currentConversationId.value,
      stream: true // 告诉后台脚本启用流式输出
    });

    // Ensure listener is cleaned up if response is received before timeout
    cleanupListener();
    isLoading.value = false; // Stop loading indicator after stream ends or if no stream

    if (result.error) {
      translationResult.value = `错误: ${result.error}`;
      return;
    }

    // 最终结果显示 (if not streamed or to finalize)
    translationResult.value = result.translatedText;

    // 显示翻译方向
    const directionText = result.sourceLang === 'zh' ? '中文 → 英文' : (result.sourceLang ? `${result.sourceLang} → ${result.targetLang}` : '翻译结果');
    translationDirection.value = directionText;

  } catch (error) {
    isLoading.value = false;
    translationResult.value = `翻译失败: ${error.message}`;
  }
}

// 重置当前对话
async function resetConversation() {
  try {
    await chrome.runtime.sendMessage({
      action: 'clearConversation',
      conversationId: currentConversationId.value
    });

    // 生成新的对话ID
    currentConversationId.value = 'conversation_' + Date.now();
    sourceText.value = '';
    translationResult.value = '翻译结果将显示在这里';
    translationDirection.value = '翻译结果';
  } catch (error) {
    statusMessage.value = '重置对话失败';
    setTimeout(() => {
      statusMessage.value = '';
    }, 3000);
  }
}

// 处理从 InputComponent 粘贴事件
async function handlePasteFromInput(pastedText, error) {
  if (error) {
     console.error('粘贴失败:', error);
     statusMessage.value = '无法访问剪贴板，请检查权限';
     setTimeout(() => {
       statusMessage.value = '';
     }, 3000);
     return;
  }
  if (pastedText !== null) {
    sourceText.value = pastedText;
  }
}

// 处理来自InputComponent的清空事件
function handleClearInput() {
  sourceText.value = '';
  translationResult.value = '翻译结果将显示在这里';
  translationDirection.value = '翻译结果';
}

// 处理复制结果
async function handleCopy(textToCopy) {
  if (textToCopy && textToCopy !== '翻译结果将显示在这里' && textToCopy !== '翻译中...') {
    try {
      await navigator.clipboard.writeText(textToCopy);
      statusMessage.value = '已复制到剪贴板';
      setTimeout(() => {
        statusMessage.value = '';
      }, 2000);
    } catch (error) {
      statusMessage.value = '复制失败';
      setTimeout(() => {
        statusMessage.value = '';
      }, 2000);
    }
  }
}

// 打开设置页面
function openSettings() {
  chrome.runtime.openOptionsPage();
}

// // 示例：处理窗口焦点事件 (原代码中被注释，保持注释状态)
// const handleFocus = async () => {
//   // try {
//   //   const text = await navigator.clipboard.readText();
//   //   if (text && text.trim() && sourceText.value.trim()) {
//   //     // handleTranslate(); // Consider if auto-translate on focus is desired
//   //   } else if (text && text.trim() && !sourceText.value.trim()) {
//   //     // sourceText.value = text; // Consider if auto-paste on focus is desired
//   //   }
//   // } catch (error) {
//   //   console.log('无法读取剪贴板:', error);
//   // }
// };

// 生命周期钩子
onMounted(() => {
  // window.addEventListener('focus', handleFocus); // 原代码中被注释

  // 尝试在加载时自动粘贴剪贴板内容到输入框
  // This is handled by InputComponent's paste button now, or could be an explicit prop/feature if desired on load.
  // For now, we rely on user interaction or specific logic within InputComponent for initial paste.
  // If an automatic paste on load is strictly required from App.vue, it would need to call InputComponent's paste logic
  // or directly attempt clipboard read here and set sourceText.
  // Given InputComponent has paste, we'll remove the App.vue's direct `handlePaste()` call on mount to avoid conflicts.

  // 生成初始会话ID
  if (currentConversationId.value === 'default') {
     currentConversationId.value = 'conversation_' + Date.now();
  }
});

onUnmounted(() => {
  // window.removeEventListener('focus', handleFocus); // 原代码中被注释
});
</script>

<style>
@import './assets/main.css';
@import '../styles/variables.css';
@import '../styles/common.css';
.app-container {
  display: flex;
  flex-direction: column;
  height: 100%; /* Make sure app-container takes full height */
  gap: 16px; /* Added gap for overall spacing between major sections */
}


.status-message {
  position: fixed;
  bottom: 60px; /* Adjust based on footer height or desired position */
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 1000;
}


.status-message.show {
  opacity: 1;
  visibility: visible;
}


.app-footer {
  text-align: center;
  font-size: 12px;
  color: var(--text-light);
  padding: 8px 0;
  border-top: 1px solid var(--border-color);
  margin-top: auto; /* Pushes footer to the bottom if content is short */
}
</style>
