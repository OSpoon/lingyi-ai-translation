// 弹出窗口脚本

// DOM元素
const sourceTextElem = document.getElementById('sourceText');
const translateBtn = document.getElementById('translateBtn');
const pasteBtn = document.getElementById('pasteBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const settingsBtn = document.getElementById('settingsBtn');
const resetConversationBtn = document.getElementById('resetConversationBtn');

// 当前对话ID
let currentConversationId = 'default';
const resultSection = document.getElementById('resultSection');
const translationResult = document.getElementById('translationResult');
const translationDirection = document.getElementById('translationDirection');
const statusMessage = document.getElementById('statusMessage');

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 不再在这里尝试自动获取剪贴板内容

  // 绑定事件
  translateBtn.addEventListener('click', handleTranslate);
  pasteBtn.addEventListener('click', handlePaste);
  clearBtn.addEventListener('click', handleClear);
  copyBtn.addEventListener('click', handleCopy);
  settingsBtn.addEventListener('click', openSettings);
  
  // 如果存在重置对话按钮，则绑定事件
  if (resetConversationBtn) {
    resetConversationBtn.addEventListener('click', handleResetConversation);
  }
  
  // 当页面获得焦点时尝试读取剪贴板
  window.addEventListener('focus', async () => {
    const hasClipboardText = await tryGetClipboardContent();
    if (hasClipboardText && sourceTextElem.value.trim()) {
      handleTranslate();
    }
  });
  
  // 初次加载页面后，模拟一次点击操作以请求剪贴板权限
  setTimeout(() => {
    pasteBtn.dispatchEvent(new MouseEvent('click'));
  }, 100);
});

// 尝试获取剪贴板内容 - 此函数保留但不再自动调用
async function tryGetClipboardContent() {
  try {
    const text = await navigator.clipboard.readText();
    if (text && text.trim()) {
      sourceTextElem.value = text;
      return true;
    }
    return false;
  } catch (error) {
    console.log('无法读取剪贴板:', error);
    return false;
  }
}

// 处理翻译
async function handleTranslate() {
  const text = sourceTextElem.value.trim();
  
  if (!text) {
    return;
  }
  
  translationResult.textContent = '';
  translationResult.classList.add('loading');
  
  translationDirection.textContent = '处理中...';
  
  try {
    // 添加流式回调处理
    const result = await translate(text, {
      onUpdate: (partialText) => {
        // 如果是第一次更新，移除加载状态
        if (translationResult.classList.contains('loading')) {
          translationResult.classList.remove('loading');
        }
        translationResult.textContent = partialText;
      }
    });
    
    if (result.error) {
      translationResult.classList.remove('loading');
      translationResult.textContent = `错误: ${result.error}`;
      return;
    }
    
    // 最终结果显示
    translationResult.classList.remove('loading');
    translationResult.textContent = result.translatedText;
    
    // 显示翻译方向
    const directionText = result.sourceLang === 'zh' ? '中文 → 英文' : '英文 → 中文';
    translationDirection.textContent = directionText;
    
  } catch (error) {
    translationResult.classList.remove('loading');
    translationResult.textContent = '翻译失败';
  }
}

// 调用后台脚本进行翻译
async function translate(text, options = {}) {
  try {
    // 注册一个更新处理器，接收流式翻译结果
    if (options.onUpdate) {
      const messageListener = function(message) {
        if (message.action === 'translationUpdate') {
          options.onUpdate(message.fullText);
        }
      };
      
      chrome.runtime.onMessage.addListener(messageListener);
      
      // 设置清理函数
      setTimeout(() => {
        chrome.runtime.onMessage.removeListener(messageListener);
      }, 60000); // 1分钟后自动清理
    }
    
    // 调用后台脚本
    const result = await chrome.runtime.sendMessage({
      action: 'translate',
      text: text,
      conversationId: currentConversationId,
      stream: true // 告诉后台脚本启用流式输出
    });
    
    return result;
  } catch (error) {
    console.error('翻译请求失败:', error);
    return { error: error.message };
  }
}

// 重置当前对话
async function resetConversation() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'clearConversation', conversationId: currentConversationId },
      (response) => {
        resolve(response);
      }
    );
  });
}

// 处理粘贴
async function handlePaste() {
  try {
    // 首先尝试使用现代Clipboard API
    const text = await navigator.clipboard.readText();
    sourceTextElem.value = text;
  } catch (error) {
    // 如果现代API失败，尝试使用execCommand作为备选方案
    // 聚焦到文本区域
    sourceTextElem.focus();
    // 使用execCommand执行粘贴操作
    document.execCommand('paste');
  }
}

// 处理清空
function handleClear() {
  sourceTextElem.value = '';
  translationResult.textContent = '翻译结果将显示在这里';
  translationDirection.textContent = '翻译结果';
}

// 处理重置对话
async function handleResetConversation() {
  await resetConversation();
  // 生成新的对话ID
  currentConversationId = 'conversation_' + Date.now();
  translationResult.textContent = '翻译结果将显示在这里';
  translationDirection.textContent = '翻译结果';
}

// 处理复制结果
async function handleCopy() {
  const text = translationResult.textContent;
  
  if (text && text !== '翻译结果将显示在这里' && text !== '翻译中...') {
    await navigator.clipboard.writeText(text);
  }
}

// 打开设置页面
function openSettings() {
  chrome.runtime.openOptionsPage();
}