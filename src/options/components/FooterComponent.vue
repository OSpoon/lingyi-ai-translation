<template>
  <footer class="app-footer">
    <div class="footer-text">由通义千问大模型提供支持</div>
  </footer>
</template>

<script setup>
// 页面底部组件，不需要任何交互逻辑
// 只显示"由通义千问大模型提供支持"的文本
</script>

<style scoped>
.app-footer {
  flex-shrink: 0;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  background-color: #fff;
  text-align: center;
}

.footer-text {
  font-size: 12px;
  color: var(--text-light);
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .app-footer {
    background-color: #343541;
  }
}
</style>