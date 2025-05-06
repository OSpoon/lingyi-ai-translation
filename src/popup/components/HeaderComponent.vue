<template>
  <div class="header-container">
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
  </div>
</template>

<script setup>

// 定义传递给父组件的事件
const emit = defineEmits(['resetConversation', 'openSettings']);

// 重置对话的处理函数
function resetConversation() {
  // 触发事件，通知父组件进行重置对话操作
  emit('resetConversation');
}

// 打开设置页面的处理函数
function openSettings() {
  // 触发事件，通知父组件打开设置页面
  emit('openSettings');
}
</script>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 24px;
  height: 24px;
  background-image: url('data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgcj0iNjAiIGZpbGw9InVybCgjZ3JhZGllbnQpIiAvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2LCAyNikgc2NhbGUoMC42KSI+PHBhdGggZD0iTTEwIDMwSDYwQzYzLjMxMzcgMzAgNjYgMzIuNjg2MyA2NiAzNlY4NEM2NiA4Ny4zMTM3IDYzLjMxMzcgOTAgNjAgOTBIMTBDNi42ODYyOSA5MCA0IDg3LjMxMzcgNCA4NFYzNkM0IDMyLjY4NjMgNi42ODY2MyAzMCAxMCAzMFoiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjkiLz48cGF0aCBkPSJNNjggMzhIMTE4QzEyMS4zMTQgMzggMTI0IDQwLjY4NjMgMTI0IDQ0VjkyQzEyNCA5NS4zMTM3IDEyMS4zMTQgOTggMTE4IDk4SDY4QzY0LjY4NjMgOTggNjIgOTUuMzEzNyA2MiA5MlY0NEM2MiA0MC42ODY2MyA2NC42ODY2MyAzOCAzOCA2OCAzOFoiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjkiLz48cGF0aCBkPSJNMjIgNTVINDE4TTM1IDQ4VjYyIiBzdHJva2U9IiMxMGEzN2YiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwIDcwSDUwIiBzdHJva2U9IiMxMGEzN2YiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTgwIDY1SDEwNU04MCA2NVY4MEgxMDUiIHN0cm9rZT0iIzEwYTM3ZiIgc3Ryb2tlLXdpZHRoPSI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNNTUgNDVMNzUgNjJMNTUgNzkiIHN0cm9rZT0iIzEwYTM3ZiIgc3Ryb2tlLXdpZHRoPSI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L2c+PGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgcj0iNTgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWRhc2hhcnJheT0iNCA0IiBvcGFjaXR5PSIwLjYiIC8+PGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgcj0iNTQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWRhc2hhcnJheT0iNCA0IiBvcGFjaXR5PSIwLjQiIC8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzEzQzc5QyIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwRDhDNkQiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+');
  background-size: contain;
  background-repeat: no-repeat;
}

.header-container h1 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.actions {
  display: flex;
  gap: 8px;
}

.icon-button {
  background-color: transparent;
  color: var(--text-light);
  padding: 6px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  border: none;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-button:hover {
  background-color: var(--secondary-color);
  color: var(--text-color);
}

.icon-button svg {
  width: 18px;
  height: 18px;
}
</style>