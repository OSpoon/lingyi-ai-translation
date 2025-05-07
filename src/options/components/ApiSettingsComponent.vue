<template>
  <div class="api-settings-component">
    <h2>API 设置</h2>
    
    <div class="form-group">
      <label for="apiKey">API 密钥</label>
      <div class="input-with-action">
        <input 
          :type="apiKeyVisible ? 'text' : 'password'" 
          id="apiKey" 
          v-model="apiKeyModel" 
          placeholder="请输入您的 API 密钥" 
          :class="{ error: !apiKeyModel.trim() && isValidating }"
        >
        <button 
          type="button" 
          @click="toggleApiKeyVisibility" 
          class="icon-button" 
          :title="apiKeyVisible ? '隐藏密钥' : '显示密钥'"
        >
          <svg 
            v-if="!apiKeyVisible" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
          >
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          <svg 
            v-else 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        </button>
      </div>
      <div class="form-hint">在通义千问平台获取 API 密钥</div>
    </div>
    
    <div class="form-group">
      <label for="apiUrl">API 地址</label>
      <input 
        type="text" 
        id="apiUrl" 
        v-model="apiUrlModel" 
        placeholder="请输入 API 地址"
      >
      <div class="form-hint">通义千问兼容 OpenAI 格式的 API 地址：https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions</div>
    </div>
    
    <div class="form-group">
      <label for="modelName">模型选择</label>
      <select id="modelName" v-model="modelNameModel">
        <option value="qwen3-32b">通义千问3-32B</option>
        <option value="qwen3-14b">通义千问3-14B</option>
        <option value="qwen3-8b">通义千问3-8B</option>
        <option value="qwen3-4b">通义千问3-4B</option>
      </select>
      <div class="form-hint">选择所需要使用的大语言模型</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  apiKeyVisible: {
    type: Boolean,
    default: false
  },
  isValidating: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:config', 'toggleApiKeyVisibility']);

// 使用计算属性实现双向绑定 API 密钥
const apiKeyModel = computed({
  get: () => props.config.apiKey,
  set: (value) => {
    emit('update:config', { ...props.config, apiKey: value });
  }
});

// 使用计算属性实现双向绑定 API 地址
const apiUrlModel = computed({
  get: () => props.config.apiUrl,
  set: (value) => {
    emit('update:config', { ...props.config, apiUrl: value });
  }
});

// 使用计算属性实现双向绑定模型名称
const modelNameModel = computed({
  get: () => props.config.modelName,
  set: (value) => {
    emit('update:config', { ...props.config, modelName: value });
  }
});

// 切换 API 密钥可见性
function toggleApiKeyVisibility() {
  emit('toggleApiKeyVisibility');
}

// 监视配置变化，可以在这里添加额外的验证逻辑
watch(() => props.config, (newConfig) => {
  // 可以在这里添加实时验证逻辑
}, { deep: true });
</script>

<style scoped>
/* 组件特定样式可以在这里添加 */
h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color);
}
</style>