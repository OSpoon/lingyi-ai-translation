<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <header class="app-header">
      <div class="logo-container">
        <div class="logo-icon"></div>
        <h1>灵译-AI翻译大师</h1>
      </div>
      <div class="actions">
        <button @click="resetConversation" class="icon-button" title="开始新对话">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
        <button @click="openSettings" class="icon-button" title="设置">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </button>
      </div>
    </header>

    <!-- 状态消息 -->
    <div class="status-message" :class="{ 'show': statusMessage }">
      {{ statusMessage }}
    </div>

    <!-- 输入区域 -->
    <div class="input-section">
      <textarea 
        v-model="sourceText" 
        placeholder="请输入要翻译的文本..." 
        autofocus
        @input="adjustTextareaHeight"
        ref="sourceTextarea"
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

    <!-- 结果区域 -->
    <div class="result-section">
      <div class="result-header">
        <div class="translation-direction">{{ translationDirection }}</div>
        <button @click="handleCopy" class="icon-button" title="复制结果">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
          </svg>
        </button>
      </div>
      <div 
        class="translation-result" 
        :class="{ 'loading': isLoading }"
        ref="resultDiv"
      >{{ translationResult }}</div>
    </div>

    <footer class="app-footer">
      <span>由通义千问大模型提供支持</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

// 响应式状态
const sourceText = ref('');
const translationResult = ref('翻译结果将显示在这里');
const translationDirection = ref('翻译结果');
const statusMessage = ref('');
const isLoading = ref(false);
const currentConversationId = ref('default');
const sourceTextarea = ref(null);
const resultDiv = ref(null);

// 调整文本区域高度
function adjustTextareaHeight() {
  nextTick(() => {
    if (sourceTextarea.value) {
      // 先重置高度，以便正确计算
      sourceTextarea.value.style.height = 'auto';
      
      // 计算新高度，但不超过最大高度
      const newHeight = Math.min(sourceTextarea.value.scrollHeight, 200);
      sourceTextarea.value.style.height = `${newHeight}px`;
    }
  });
}

// 调整结果区域高度
function adjustResultHeight() {
  nextTick(() => {
    if (resultDiv.value) {
      // 根据内容自动调整结果区域的高度
      const contentHeight = resultDiv.value.scrollHeight;
      // 设置最小和最大高度限制
      const newHeight = Math.max(80, Math.min(contentHeight, 300));
      resultDiv.value.style.height = `${newHeight}px`;
    }
  });
}

// 处理翻译
async function handleTranslate() {
  const text = sourceText.value.trim();
  
  if (!text) {
    return;
  }
  
  translationResult.value = '';
  isLoading.value = true;
  translationDirection.value = '处理中...';
  
  try {
    // 注册一个更新处理器，接收流式翻译结果
    const messageListener = function(message) {
      if (message.action === 'translationUpdate') {
        // 如果是第一次更新，移除加载状态
        if (isLoading.value) {
          isLoading.value = false;
        }
        translationResult.value = message.fullText;
        // 更新结果后调整高度
        adjustResultHeight();
      }
    };
    
    chrome.runtime.onMessage.addListener(messageListener);
    
    // 设置清理函数
    setTimeout(() => {
      chrome.runtime.onMessage.removeListener(messageListener);
    }, 60000); // 1分钟后自动清理
    
    // 调用后台脚本
    const result = await chrome.runtime.sendMessage({
      action: 'translate',
      text: text,
      conversationId: currentConversationId.value,
      stream: true // 告诉后台脚本启用流式输出
    });
    
    if (result.error) {
      translationResult.value = `错误: ${result.error}`;
      isLoading.value = false;
      return;
    }
    
    // 最终结果显示
    isLoading.value = false;
    translationResult.value = result.translatedText;
    
    // 调整结果区域高度
    adjustResultHeight();
    
    // 显示翻译方向
    const directionText = result.sourceLang === 'zh' ? '中文 → 英文' : '英文 → 中文';
    translationDirection.value = directionText;
    
  } catch (error) {
    isLoading.value = false;
    translationResult.value = '翻译失败';
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
    translationResult.value = '翻译结果将显示在这里';
    translationDirection.value = '翻译结果';
  } catch (error) {
    statusMessage.value = '重置对话失败';
    setTimeout(() => {
      statusMessage.value = '';
    }, 3000);
  }
}

// 处理粘贴
async function handlePaste() {
  try {
    // 首先尝试使用现代Clipboard API
    const text = await navigator.clipboard.readText();
    sourceText.value = text;
    // 粘贴后调整高度
    adjustTextareaHeight();
  } catch (error) {
    // 如果现代API失败，尝试使用execCommand作为备选方案
    // 这部分在Vue中可能不太适用，但保留逻辑
    console.error('粘贴失败:', error);
    statusMessage.value = '无法访问剪贴板，请检查权限';
    setTimeout(() => {
      statusMessage.value = '';
    }, 3000);
  }
}

// 处理清空
function handleClear() {
  sourceText.value = '';
  translationResult.value = '翻译结果将显示在这里';
  translationDirection.value = '翻译结果';
}

// 处理复制结果
async function handleCopy() {
  const text = translationResult.value;
  
  if (text && text !== '翻译结果将显示在这里' && text !== '翻译中...') {
    try {
      await navigator.clipboard.writeText(text);
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

// 生命周期钩子
onMounted(() => {
  // 当页面获得焦点时尝试读取剪贴板
  // const handleFocus = async () => {
  //   try {
  //     const text = await navigator.clipboard.readText();
  //     if (text && text.trim() && sourceText.value.trim()) {
  //       handleTranslate();
  //     } else if (text && text.trim() && !sourceText.value.trim()) {
  //       sourceText.value = text;
  //     }
  //   } catch (error) {
  //     console.log('无法读取剪贴板:', error);
  //   }
  // };
  
  window.addEventListener('focus', handleFocus);
  
  // 初次加载页面后，尝试请求剪贴板权限
  setTimeout(() => {
    handlePaste();
  }, 100);
  
  // 初始化时调整文本区域和结果区域高度
  adjustTextareaHeight();
  adjustResultHeight();
  
  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('focus', handleFocus);
  });
});
</script>

<style>
@import './assets/main.css';
</style>