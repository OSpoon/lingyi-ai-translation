// 默认配置
const DEFAULT_CONFIG = {
  apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  apiKey: '',
  targetLanguage: 'auto',
  modelName: 'qwen3-235b-a22b'
};

// 维护对话历史
const conversations = {};

// 初始化配置
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['translationConfig'], (result) => {
    if (!result.translationConfig) {
      chrome.storage.local.set({ translationConfig: DEFAULT_CONFIG });
    }
  });
});

// 创建API客户端 - 使用OpenAI兼容API
function createApiClient(apiKey, apiUrl) {
  return {
    // 封装通义千问聊天完成API（使用OpenAI兼容格式）
    chatCompletions: async (options) => {
      try {
        // 准备API请求
        const response = await fetch(`${apiUrl}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: options.model,
            messages: options.messages,
            temperature: options.temperature || 0,
            max_tokens: options.max_tokens || 2000,
            stream: true // 启用流式响应
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API请求失败: ${response.status} ${errorData.code || errorData.message || response.statusText}`);
        }

        // 读取流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullContent = '';
        let buffer = '';
        
        // 处理流式响应
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // 解码接收到的数据
          buffer += decoder.decode(value, { stream: true });
          
          // 处理接收到的数据块
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.startsWith('data: ')) {
              const content = line.substring(6).trim();
              
              // 特殊处理 [DONE] 标记
              if (content === '[DONE]') {
                console.log('流式响应完成，收到[DONE]标记');
                continue;
              }
              
              try {
                // 解析JSON数据
                const data = JSON.parse(content);
                
                // 检查是否是有效消息
                if (data.choices && data.choices.length > 0) {
                  // 从delta或message中获取内容（支持不同的API响应格式）
                  const delta = data.choices[0].delta?.content || 
                               data.choices[0].message?.content || '';
                  
                  // 累积内容
                  fullContent += delta;
                  
                  // 如果提供了回调函数，则调用
                  if (options.onContent && delta) {
                    options.onContent(delta, fullContent);
                  }
                }
                
                // 检查是否是完成标志
                if (data.choices && data.choices[0].finish_reason === 'stop') {
                  console.log('收到完成标志：stop');
                }
              } catch (e) {
                console.warn('解析流数据时出错:', e, `内容: "${content}"`);
              }
            } else {
              console.log('忽略非data行:', line);
            }
          }
        }
        
        // 处理最后可能剩余的缓冲区内容
        if (buffer.trim()) {
          const remainingLines = buffer.split('\n');
          for (const line of remainingLines) {
            if (line.trim() === '' || !line.startsWith('data: ')) continue;
            
            const content = line.substring(6).trim();
            if (content === '[DONE]') continue;
            
            try {
              const data = JSON.parse(content);
              if (data.choices && data.choices.length > 0) {
                const delta = data.choices[0].delta?.content || 
                             data.choices[0].message?.content || '';
                fullContent += delta;
              }
            } catch (e) {
              // 忽略最后部分的解析错误
            }
          }
        }

        // 确保响应完成后解码剩余内容
        buffer += decoder.decode();
        
        console.log('流式响应处理完成，总共收到字符数:', fullContent.length);

        // 返回完整的响应内容
        return {
          choices: [
            {
              message: {
                content: fullContent || '',
                role: 'assistant'
              }
            }
          ]
        };
      } catch (error) {
        console.error("API请求错误:", error);
        throw error;
      }
    }
  };
}

// 多轮对话翻译实现
// 步骤1: 检测语言
async function detectLanguage(text, client) {
  try {
    console.log('开始检测语言类型...');
    
    const response = await client.chatCompletions({
      model: "qwen-max", // 默认使用通义千问Max
      messages: [
        {
          role: "system",
          content: "你是一个语言检测助手。你的任务是判断用户输入的文本是什么语言。只回复'zh'表示中文或'en'表示英文，不要包含任何其他字符或解释。"
        },
        {
          role: "user",
          content: text.substring(0, 200) // 只取前200个字符用于检测
        }
      ],
      temperature: 0,
      max_tokens: 10
    });

    const detectedLang = response.choices[0]?.message?.content.trim().toLowerCase();

    // 严格检查返回的结果是否为zh或en，否则使用后备方法
    if (detectedLang === 'zh' || detectedLang === 'en') {
      console.log('语言检测结果:', detectedLang);
      return detectedLang;
    } else {
      console.log('模型返回格式不符合预期，使用后备方法检测语言');
      return fallbackDetectLanguage(text);
    }
  } catch (error) {
    console.error('AI语言检测失败，使用后备方法:', error);
    return fallbackDetectLanguage(text);
  }
}

// 后备的语言检测方法
function fallbackDetectLanguage(text) {
  // 简单检测：如果包含中文字符，则认为是中文
  const chineseRegex = /[\u4e00-\u9fa5]/;
  const result = chineseRegex.test(text) ? 'zh' : 'en';
  console.log('后备语言检测结果:', result);
  return result;
}

// 步骤2: 翻译文本
async function translateText(text, sourceLang, targetLang, client, modelName) {
  try {
    console.log(`执行翻译: ${sourceLang} → ${targetLang}`);
    
    // 构建翻译提示词
    let prompt = '';
    if (sourceLang === 'zh' && targetLang === 'en') {
      prompt = `请将以下中文翻译成英文。直接返回英文翻译结果，不要添加任何解释或标记:\n\n${text}`;
    } else if (sourceLang === 'en' && targetLang === 'zh') {
      prompt = `请将以下英文翻译成中文。直接返回中文翻译结果，不要添加任何解释或标记:\n\n${text}`;
    } else {
      prompt = `请翻译以下内容。直接返回翻译结果，不要添加任何解释或标记:\n\n${text}`;
    }

    const response = await client.chatCompletions({
      model: modelName,
      messages: [
        {
          role: "system", 
          content: "你是一个专业的翻译助手，专注于中英文互译。请直接返回翻译结果，不要添加任何解释、引号、注释或标记。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0,
      max_tokens: 4000
    });

    return response.choices[0]?.message?.content || '翻译失败';
  } catch (error) {
    console.error('翻译过程出错:', error);
    throw new Error(`翻译失败: ${error.message}`);
  }
}

// 主翻译函数
async function translateWithQwen(text, conversationId = 'default') {
  try {
    // 获取配置
    const { translationConfig } = await chrome.storage.local.get(['translationConfig']);
    const { apiUrl, apiKey, targetLanguage, modelName } = translationConfig || DEFAULT_CONFIG;

    if (!apiKey) {
      return {
        success: false,
        error: '请先在设置中配置API密钥',
        translatedText: null,
        sourceLang: null,
        targetLang: null
      };
    }

    // 创建客户端
    const client = createApiClient(apiKey, apiUrl);

    // 初始化对话历史（如果不存在）
    if (!conversations[conversationId]) {
      conversations[conversationId] = [];
    }

    // 步骤1: 检测源语言
    const sourceLang = await detectLanguage(text, client);

    // 步骤2: 确定目标语言
    let targetLang = targetLanguage;
    if (targetLang === 'auto') {
      // 自动检测语言并翻译为相反语言
      targetLang = sourceLang === 'zh' ? 'en' : 'zh';
    }
    console.log(`翻译方向: ${sourceLang} → ${targetLang}`);

    // 步骤3: 执行翻译
    const translatedText = await translateText(text, sourceLang, targetLang, client, modelName);

    // 更新对话历史
    const currentMessages = conversations[conversationId];
    currentMessages.push(
      {
        role: "user",
        content: text
      },
      {
        role: "assistant",
        content: translatedText
      }
    );

    if (currentMessages.length > 10) {
      conversations[conversationId] = currentMessages.slice(-10);
    }

    return {
      success: true,
      translatedText,
      sourceLang,
      targetLang
    };
  } catch (error) {
    console.error('翻译错误:', error);
    return {
      success: false,
      error: `翻译失败: ${error.message}`,
      translatedText: null,
      sourceLang: null,
      targetLang: null
    };
  }
}

function clearConversation(conversationId) {
  if (conversations[conversationId]) {
    delete conversations[conversationId];
    return { success: true };
  }
  return { success: false, error: '对话不存在' };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request.action);

  if (request.action === 'translate') {
    translateWithQwen(request.text, request.conversationId || 'default')
      .then(result => {
        console.log('发送翻译结果');
        sendResponse(result);
      })
      .catch(error => {
        console.error('处理翻译请求时发生错误:', error);
        sendResponse({
          success: false,
          error: error.message,
          translatedText: null,
          sourceLang: null,
          targetLang: null
        });
      });
    return true;
  } else if (request.action === 'getConfig') {
    chrome.storage.local.get(['translationConfig'], (result) => {
      sendResponse(result.translationConfig || DEFAULT_CONFIG);
    });
    return true;
  } else if (request.action === 'saveConfig') {
    chrome.storage.local.set({ translationConfig: request.config }, () => {
      sendResponse({ success: true });
    });
    return true;
  } else if (request.action === 'clearConversation') {
    const result = clearConversation(request.conversationId || 'default');
    sendResponse(result);
    return false;
  }
});