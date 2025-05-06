<template>
  <div class="footer-buttons">
    <button type="button" @click="handleResetSettings" class="secondary-button">恢复默认设置</button>
    <button type="button" @click="handleSaveSettings" class="primary-button">保存设置</button>
  </div>
</template>

<script setup>

// 定义传递给父组件的事件
const emit = defineEmits(['saveSettings', 'resetSettings']);

// 处理恢复默认设置按钮点击事件
function handleResetSettings() {
  // 触发重置设置事件，通知父组件处理
  emit('resetSettings');
}

// 处理保存设置按钮点击事件
function handleSaveSettings() {
  // 触发保存设置事件，通知父组件处理
  emit('saveSettings');
}
</script>

<style scoped>
.footer-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 12px;
}

.primary-button {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
}

.primary-button:hover {
  background-color: var(--primary-hover);
}

.secondary-button {
  padding: 8px 12px;
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.secondary-button:hover {
  background-color: var(--secondary-color);
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .secondary-button {
    background-color: #40414f;
  }
  
  .secondary-button:hover {
    background-color: #4a4b5a;
  }
}
</style>