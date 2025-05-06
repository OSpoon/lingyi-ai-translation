<template>
  <div class="header-container">
    <div class="logo-container">
      <div class="logo-icon"></div>
      <h1>灵译-AI翻译大师设置</h1>
    </div>
  </div>
</template>

<script setup>
// Options页面的头部组件不需要处理任何事件
// 与popup页的头部组件不同，这里只显示标题，没有操作按钮
</script>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
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
  background-image: url('data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgcj0iNjAiIGZpbGw9InVybCgjZ3JhZGllbnQpIiAvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2LCAyNikgc2NhbGUoMC42KSI+PHBhdGggZD0iTTEwIDMwSDYwQzYzLjMxMzcgMzAgNjYgMzIuNjg2MyA2NiAzNlY4NEM2NiA4Ny4zMTM3IDYzLjMxMzcgOTAgNjAgOTBIMTBDNi42ODYyOSA5MCA0IDg3LjMxMzcgNCA4NFYzNkM0IDMyLjY4NjMgNi42ODYyOSAzMCAxMCAzMFoiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjkiLz48cGF0aCBkPSJNNjggMzhIMTE4QzEyMS4zMTQgMzggMTI0IDQwLjY4NjMgMTI0IDQ0VjkyQzEyNCA5NS4zMTM3IDEyMS4zMTQgOTggMTE4IDk4SDY4QzY0LjY4NjMgOTggNjIgOTUuMzEzNyA2MiA5MlY0NEM2MiA0MC42ODYzIDY0LjY4NjMgMzggNjggMzhaIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+PHBhdGggZD0iTTIyIDU1SDQ4TTM1IDQ4VjYyIiBzdHJva2U9IiMxMGEzN2YiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwIDcwSDUwIiBzdHJva2U9IiMxMGEzN2YiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTgwIDY1SDEwNU04MCA2NVY4MEgxMDUiIHN0cm9rZT0iIzEwYTM3ZiIgc3Ryb2tlLXdpZHRoPSI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNNTUgNDVMNzUgNjJMNTUgNzkiIHN0cm9rZT0iIzEwYTM3ZiIgc3Ryb2tlLXdpZHRoPSI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L2c+PGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgcj0iNTgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWRhc2hhcnJheT0iNCA0IiBvcGFjaXR5PSIwLjYiIC8+PGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgcj0iNTQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWRhc2hhcnJheT0iNCA0IiBvcGFjaXR5PSIwLjQiIC8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzEzQzc5QyIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwRDhDNkQiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+');
  background-size: contain;
  background-repeat: no-repeat;
}

.header-container h1 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
</style>