<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <HeaderComponent />

    <!-- 主设置区域 -->
    <div class="settings-container">
      <div :class="['status-message', statusType]" v-if="statusMessage">{{ statusMessage }}</div>
      
      <form @submit.prevent="saveSettings">
        <ApiSettingsComponent
          :config="config"
          :api-key-visible="apiKeyVisible"
          :is-validating="isValidating"
          @update:config="handleConfigUpdate"
          @toggle-api-key-visibility="toggleApiKeyVisibility"
        />
        
        <TranslationSettingsComponent
          :config="config"
          @update:config="handleConfigUpdate"
        />
        
        <FooterButtonsComponent
          @reset-settings="resetSettings"
          @save-settings="saveSettings" 
        />
      </form>
    </div>
    
    <FooterComponent />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import HeaderComponent from './components/HeaderComponent.vue';
import ApiSettingsComponent from './components/ApiSettingsComponent.vue';
import TranslationSettingsComponent from './components/TranslationSettingsComponent.vue';
import FooterButtonsComponent from './components/FooterButtonsComponent.vue';
import FooterComponent from './components/FooterComponent.vue';

const DEFAULT_CONFIG = {
  apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  apiKey: '',
  targetLanguage: 'auto',
  modelName: 'qwen3-235b-a22b'
};

const config = reactive({ ...DEFAULT_CONFIG });
const apiKeyVisible = ref(false);
const statusMessage = ref('');
const statusType = ref(''); // Can be 'success', 'error', 'info'
const isValidating = ref(false); // Used to show validation errors only after first save attempt

// 加载设置
function loadSettings() {
  chrome.storage.local.get(['translationConfig'], (result) => {
    if (result.translationConfig) {
      // Merge stored config with defaults to ensure all keys are present
      Object.assign(config, DEFAULT_CONFIG, result.translationConfig);
    }
  });
}

// 处理子组件更新config的事件
function handleConfigUpdate(newConfig) {
  Object.assign(config, newConfig);
}

// 保存设置
function saveSettings() {
  isValidating.value = true; // Enable validation feedback
  
  if (!config.apiKey || !config.apiKey.trim()) {
    showStatus('请输入API密钥', 'error');
    return;
  }
  
  // Save a plain copy of the config to avoid Proxy issues with chrome.storage
  chrome.storage.local.set({ translationConfig: { ...config } }, () => {
    showStatus('设置已保存', 'success');
    isValidating.value = false; // Reset validation state after successful save
  });
}

// 重置设置
function resetSettings() {
  chrome.storage.local.set({ translationConfig: { ...DEFAULT_CONFIG } }, () => {
    Object.assign(config, DEFAULT_CONFIG);
    apiKeyVisible.value = false; // Reset API key visibility as well
    isValidating.value = false; // Reset validation state
    showStatus('已恢复默认设置', 'info');
  });
}

// 显示状态消息
function showStatus(message, type = 'info') {
  statusMessage.value = message;
  statusType.value = type;
  
  setTimeout(() => {
    statusMessage.value = '';
    statusType.value = '';
  }, 3000);
}

// 切换API密钥可见性
function toggleApiKeyVisibility() {
  apiKeyVisible.value = !apiKeyVisible.value;
}

// 生命周期钩子
onMounted(() => {
  loadSettings();
});
</script>

<style>
/* Global styles for options page are typically in a separate CSS file imported in main.js or here */
/* For this example, specific styles from original App.vue that are still relevant might be here or in options.css */

/* Styles from the original App.vue that might be global or apply to new structure */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.settings-container {
  flex-grow: 1;
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}

.status-message {
  padding: 10px 15px;
  margin-bottom: 15px;
  border-radius: var(--radius-md);
  font-size: 14px;
  text-align: center;
}

.status-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-message.info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

/* Form styles - these were originally in App.vue, now components might have them or rely on global styles */
/* It's good practice to have these in a global options.css or scoped within components if specific */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 14px;
}

.form-group input[type="text"],
.form-group input[type="password"],
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  background-color: var(--input-bg);
  color: var(--text-color);
}

.form-group input[type="text"].error,
.form-group input[type="password"].error {
  border-color: #dc3545; /* Bootstrap danger color for error */
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.2);
}

.form-hint {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 0.5rem;
}

.input-with-action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-with-action input {
  flex-grow: 1;
}

.icon-button {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: var(--text-light);
  border-radius: var(--radius-sm);
}

.icon-button:hover {
  background-color: var(--secondary-color);
}

.icon-button svg {
  width: 20px;
  height: 20px;
  display: block;
}

button.primary-button,
button.secondary-button {
  padding: 10px 15px;
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: none;
}

/* Ensure these styles are in options.css or defined here if not already present in child components' scoped styles */
/* Some button styles might conflict if FooterButtonsComponent also defines them. The ones here would be more global. */
</style>
