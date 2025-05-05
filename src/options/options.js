// 设置页面脚本

// DOM元素
const configForm = document.getElementById('configForm');
const apiUrlInput = document.getElementById('apiUrl');
const apiKeyInput = document.getElementById('apiKey');
const modelNameSelect = document.getElementById('modelName');
const targetLanguageSelect = document.getElementById('targetLanguage');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const statusMessage = document.getElementById('statusMessage');
const toggleApiKeyBtn = document.getElementById('toggleApiKey');

const DEFAULT_CONFIG = {
  apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  apiKey: '',
  targetLanguage: 'auto',
  modelName: 'qwen3-235b-a22b'
};

// 初始化
document.addEventListener('DOMContentLoaded', loadSettings);

// 绑定事件
configForm.addEventListener('submit', saveSettings);
resetBtn.addEventListener('click', resetSettings);
toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);

// 初始化密钥显示状态
function initializeApiKeyVisibility() {
  apiKeyInput.type = 'password';
  toggleApiKeyBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
    </svg>
  `;
}

// 加载设置
function loadSettings() {
  chrome.storage.local.get(['translationConfig'], (result) => {
    const config = result.translationConfig || DEFAULT_CONFIG;
    apiKeyInput.value = config.apiKey || '';
    apiUrlInput.value = config.apiUrl || DEFAULT_CONFIG.apiUrl;
    modelNameSelect.value = config.modelName || DEFAULT_CONFIG.modelName;
    targetLanguageSelect.value = config.targetLanguage || DEFAULT_CONFIG.targetLanguage;
    
    initializeApiKeyVisibility();
  });
}

// 保存设置
function saveSettings(event) {
  event.preventDefault();
  
  const config = {
    apiKey: apiKeyInput.value.trim(),
    apiUrl: apiUrlInput.value.trim() || DEFAULT_CONFIG.apiUrl,
    modelName: modelNameSelect.value,
    targetLanguage: targetLanguageSelect.value
  };

  chrome.storage.local.set({ translationConfig: config }, () => {
    showStatus('设置已保存', 'success');
  });
}

// 重置设置
function resetSettings() {
  chrome.storage.local.set({ translationConfig: DEFAULT_CONFIG }, () => {
    loadSettings();
    showStatus('已恢复默认设置', 'info');
  });
}

// 显示状态消息
function showStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = 'status-message ' + type;
  
  // 3秒后自动清除消息
  setTimeout(() => {
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
  }, 3000);
}

// 切换API密钥可见性
function toggleApiKeyVisibility() {
  if (apiKeyInput.type === 'password') {
    apiKeyInput.type = 'text';
    toggleApiKeyBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    `;
    toggleApiKeyBtn.title = "隐藏密钥";
  } else {
    apiKeyInput.type = 'password';
    toggleApiKeyBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
      </svg>
    `;
    toggleApiKeyBtn.title = "显示密钥";
  }
  
  // 保持输入框焦点
  apiKeyInput.focus();
}

// 输入验证
apiKeyInput.addEventListener('input', function() {
  if (!this.value.trim()) {
    this.classList.add('error');
  } else {
    this.classList.remove('error');
  }
});