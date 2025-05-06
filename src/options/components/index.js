/**
 * 组件索引文件
 * 集中导出所有options组件，便于在应用中统一引用
 */

// 导入组件
import HeaderComponent from './HeaderComponent.vue';
import ApiSettingsComponent from './ApiSettingsComponent.vue';
import TranslationSettingsComponent from './TranslationSettingsComponent.vue';
import FooterButtonsComponent from './FooterButtonsComponent.vue';
import FooterComponent from './FooterComponent.vue';

// 导出组件
export {
  // 头部标题栏组件，显示logo和标题
  HeaderComponent,
  
  // API设置组件，处理API密钥、地址和模型选择
  ApiSettingsComponent,
  
  // 翻译设置组件，处理默认目标语言等翻译选项
  TranslationSettingsComponent,
  
  // 底部按钮组件，包含"保存设置"和"恢复默认设置"按钮
  FooterButtonsComponent,
  
  // 页脚组件，显示"由通义千问大模型提供支持"文本
  FooterComponent
};

// 默认导出所有组件
export default {
  HeaderComponent,
  ApiSettingsComponent,
  TranslationSettingsComponent,
  FooterButtonsComponent,
  FooterComponent
};