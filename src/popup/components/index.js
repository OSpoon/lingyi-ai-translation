/**
 * 组件索引文件
 * 集中导出所有组件，便于在应用中统一引用
 */

// 导入组件
import HeaderComponent from './HeaderComponent.vue';
import InputComponent from './InputComponent.vue';
import OutputComponent from './OutputComponent.vue';
import TypewriterComponent from './TypewriterComponent.vue';

// 导出组件
export {
  // 头部标题栏组件，包含logo和操作按钮
  HeaderComponent,
  
  // 输入区域组件，处理用户文本输入和操作
  InputComponent,
  
  // 输出结果区域组件，显示翻译结果
  OutputComponent,
  
  // 打字机效果组件，实现文本逐字显示和自动滚动
  TypewriterComponent
};

// 默认导出所有组件
export default {
  HeaderComponent,
  InputComponent,
  OutputComponent,
  TypewriterComponent
};