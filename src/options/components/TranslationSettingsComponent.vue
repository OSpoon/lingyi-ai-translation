<template>
  <div class="translation-settings-component">
    <h2>翻译设置</h2>
    
    <div class="form-group">
      <label for="targetLanguage">默认目标语言</label>
      <select id="targetLanguage" v-model="targetLanguageModel">
        <option value="auto">自动检测(中英互译)</option>
        <option value="zh">始终翻译为中文</option>
        <option value="en">始终翻译为英文</option>
      </select>
      <div class="form-hint">选择默认的翻译目标语言</div>
    </div>
    
    <!-- 为将来添加更多翻译设置预留的位置 -->
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:config']);

// 使用计算属性实现双向绑定目标语言设置
const targetLanguageModel = computed({
  get: () => props.config.targetLanguage,
  set: (value) => {
    emit('update:config', { ...props.config, targetLanguage: value });
  }
});

// 监视配置变化，可以在这里添加额外的验证或处理逻辑
watch(() => props.config, (newConfig) => {
  // 可以在这里添加实时验证逻辑或其他操作
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

.translation-settings-component {
  margin-bottom: 1rem;
}

/* 重用App.vue中已存在的表单样式 */
</style>