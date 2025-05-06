<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <header class="app-header">
      <div class="logo-container">
        <div class="logo-icon"></div>
        <h1>灵译-AI翻译大师设置</h1>
      </div>
    </header>

    <!-- 主设置区域 -->
    <div class="settings-container">
      <div :class="['status-message', statusType]" v-if="statusMessage">{{ statusMessage }}</div>
      
      <form @submit.prevent="saveSettings">
        <div class="settings-group">
          <h2>API 设置</h2>
          
          <div class="form-group">
            <label for="apiKey">API 密钥</label>
            <div class="input-with-action">
              <input :type="apiKeyVisible ? 'text' : 'password'" id="apiKey" v-model="config.apiKey" placeholder="请输入您的 API 密钥" :class="{ error: !config.apiKey.trim() && isValidating }">
              <button type="button" @click="toggleApiKeyVisibility" class="icon-button" :title="apiKeyVisible ? '隐藏密钥' : '显示密钥'">
                <svg v-if="!apiKeyVisible" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <div class="form-hint">在通义千问平台获取 API 密钥</div>
          </div>
          
          <div class="form-group">
            <label for="apiUrl">API 地址</label>
            <input type="text" id="apiUrl" v-model="config.apiUrl" placeholder="请输入 API 地址">
            <div class="form-hint">通义千问兼容 OpenAI 格式的 API 地址：https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions</div>
          </div>
          
          <div class="form-group">
            <label for="modelName">模型选择</label>
            <select id="modelName" v-model="config.modelName">
              <option value="qwen3-235b-a22b">通义千问3(最强)</option>
              <option value="qwen-max">通义千问 Max</option>
              <option value="qwen-turbo">通义千问 Turbo</option>
              <option value="qwen-plus">通义千问 Plus</option>
            </select>
            <div class="form-hint">选择所需要使用的大语言模型</div>
          </div>
        </div>
        
        <div class="settings-group">
          <h2>翻译设置</h2>
          
          <div class="form-group">
            <label for="targetLanguage">默认目标语言</label>
            <select id="targetLanguage" v-model="config.targetLanguage">
              <option value="auto">自动检测(中英互译)</option>
              <option value="zh">始终翻译为中文</option>
              <option value="en">始终翻译为英文</option>
            </select>
            <div class="form-hint">选择默认的翻译目标语言</div>
          </div>
        </div>
        
        <!-- 底部按钮区 -->
        <div class="footer-buttons">
          <button type="button" @click="resetSettings" class="secondary-button">恢复默认设置</button>
          <button type="submit" class="primary-button">保存设置</button>
        </div>
      </form>
    </div>
    
    <footer class="app-footer">
      <div class="footer-text">由通义千问大模型提供支持</div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'OptionsApp',
  data() {
    return {
      config: {
        apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        apiKey: '',
        targetLanguage: 'auto',
        modelName: 'qwen3-235b-a22b'
      },
      DEFAULT_CONFIG: {
        apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        apiKey: '',
        targetLanguage: 'auto',
        modelName: 'qwen3-235b-a22b'
      },
      apiKeyVisible: false,
      statusMessage: '',
      statusType: '',
      isValidating: false
    };
  },
  mounted() {
    this.loadSettings();
  },
  methods: {
    // 加载设置
    loadSettings() {
      chrome.storage.local.get(['translationConfig'], (result) => {
        if (result.translationConfig) {
          this.config = { ...this.DEFAULT_CONFIG, ...result.translationConfig };
        }
      });
    },
    
    // 保存设置
    saveSettings() {
      this.isValidating = true;
      
      // 简单验证
      if (!this.config.apiKey.trim()) {
        this.showStatus('请输入API密钥', 'error');
        return;
      }
      
      chrome.storage.local.set({ translationConfig: this.config }, () => {
        this.showStatus('设置已保存', 'success');
      });
    },
    
    // 重置设置
    resetSettings() {
      chrome.storage.local.set({ translationConfig: this.DEFAULT_CONFIG }, () => {
        this.config = { ...this.DEFAULT_CONFIG };
        this.showStatus('已恢复默认设置', 'info');
      });
    },
    
    // 显示状态消息
    showStatus(message, type = 'info') {
      this.statusMessage = message;
      this.statusType = type;
      
      // 3秒后自动清除消息
      setTimeout(() => {
        this.statusMessage = '';
        this.statusType = '';
      }, 3000);
    },
    
    // 切换API密钥可见性
    toggleApiKeyVisibility() {
      this.apiKeyVisible = !this.apiKeyVisible;
    }
  }
};
</script>