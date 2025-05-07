// 默认配置
const DEFAULT_CONFIG = {
  apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  apiKey: '',
  modelName: 'qwen3-14b'
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
            max_tokens: options.max_tokens || 4000,
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
      model: "qwen3-8b",
      messages: [
        {
          role: "system",
          content: `你是一个语言检测助手。请以JSON格式返回检测结果，格式如下：
{
  "detectedLanguage": "zh|en",
  "confidence": 0-1之间的数值
}
只返回JSON，不要其他任何文字。注：不启用推理模式，no think`
        },
        {
          role: "user",
          content: text.substring(0, 200)
        }
      ],
      temperature: 0,
      max_tokens: 100
    });

    try {
      const result = JSON.parse(response.choices[0]?.message?.content.trim());
      if (result.detectedLanguage === 'zh' || result.detectedLanguage === 'en') {
        console.log('语言检测结果:', result);
        return result.detectedLanguage;
      }
    } catch (e) {
      console.warn('解析语言检测结果失败:', e);
    }
    
    console.log('模型返回格式不符合预期，使用后备方法检测语言');
    return fallbackDetectLanguage(text);
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

// 步骤2: 执行翻译
async function performTranslation(text, sourceLang, conversationId, client) {
  try {
    if (!conversations[conversationId]) {
      conversations[conversationId] = [];
    }
    
    const targetLang = sourceLang === 'zh' ? 'en' : 'zh';
    const systemPrompt = `你是一个专业的${sourceLang === 'zh' ? '中译英' : '英译中'}翻译助手。
请将用户输入的${sourceLang === 'zh' ? '中文' : '英文'}翻译成地道、流畅的${targetLang === 'zh' ? '中文' : '英文'}。
请以JSON格式返回翻译结果，格式如下：
{
  "translation": "翻译结果文本",
  "metadata": {
    "sourceLang": "${sourceLang}",
    "targetLang": "${targetLang}",
    "preservedFormats": ["段落", "换行", "标点符号"],
    "domainSpecific": ["general", "academic", "technical", "literary"] 中的一个
  }
}
只返回JSON，不要其他任何解释或额外内容。注：不启用推理模式，no think`;

    // 构建消息历史
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversations[conversationId],
      { role: "user", content: text }
    ];
    
    // 调用API进行翻译
    console.log(`开始${sourceLang === 'zh' ? '中译英' : '英译中'}翻译...`);
    
    // 获取配置
    const config = await new Promise((resolve) => {
      chrome.storage.local.get(['translationConfig'], (result) => {
        resolve(result.translationConfig || DEFAULT_CONFIG);
      });
    });
    
    // 流式响应处理函数
    let fullText = '';
    const onContent = (delta, accumulated) => {
      fullText = accumulated;
      // 向popup发送更新
      chrome.runtime.sendMessage({
        action: 'translationUpdate',
        fullText: accumulated
      });
    };
    
    // 执行翻译请求
    const response = await client.chatCompletions({
      model: config.modelName || "qwen3-14b",
      messages: messages,
      temperature: 0.3,
      max_tokens: 4000,
      onContent: onContent // 传入回调函数处理流式响应
    });
    
    // 解析翻译结果
    try {
      const resultJson = JSON.parse(response.choices[0]?.message?.content || '{}');
      const translatedText = resultJson.translation || '';
      
      // 更新对话历史
      conversations[conversationId].push(
        { role: "user", content: text },
        { 
          role: "assistant", 
          content: JSON.stringify(resultJson)
        }
      );
      
      // 限制对话历史长度
      if (conversations[conversationId].length > 10) {
        conversations[conversationId] = conversations[conversationId].slice(-10);
      }
      
      return {
        translatedText,
        sourceLang,
        targetLang,
        metadata: resultJson.metadata
      };
    } catch (e) {
      console.error('解析翻译结果JSON失败:', e);
      throw new Error('翻译结果格式错误');
    }
  } catch (error) {
    console.error('翻译过程出错:', error);
    throw error;
  }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 处理翻译请求
  if (request.action === 'translate') {
    (async () => {
      try {
        // 获取API配置
        const config = await new Promise((resolve) => {
          chrome.storage.local.get(['translationConfig'], (result) => {
            resolve(result.translationConfig || DEFAULT_CONFIG);
          });
        });
        
        // 检查API密钥
        if (!config.apiKey) {
          sendResponse({
            error: '请先在设置中配置API密钥'
          });
          return;
        }
        
        // 创建API客户端
        const client = createApiClient(config.apiKey, config.apiUrl);
        
        // 检测语言
        const sourceLang = await detectLanguage(request.text, client);
        
        // 执行翻译
        const result = await performTranslation(
          request.text,
          sourceLang,
          request.conversationId || 'default',
          client
        );
        
        // 返回结果
        sendResponse({
          translatedText: result.translatedText,
          sourceLang: result.sourceLang,
          targetLang: result.targetLang
        });
      } catch (error) {
        console.error('处理翻译请求时出错:', error);
        sendResponse({
          error: error.message || '翻译失败'
        });
      }
    })();
    return true; // 表示将异步发送响应
  }
  
  // 处理清除对话历史请求
  if (request.action === 'clearConversation') {
    const conversationId = request.conversationId || 'default';
    conversations[conversationId] = [];
    sendResponse({ success: true });
    return;
  }
  
  // 处理获取配置请求
  if (request.action === 'getConfig') {
    chrome.storage.local.get(['translationConfig'], (result) => {
      sendResponse(result.translationConfig || DEFAULT_CONFIG);
    });
    return true; // 表示将异步发送响应
  }
  
  // 处理保存配置请求
  if (request.action === 'saveConfig') {
    chrome.storage.local.set({ translationConfig: request.config }, () => {
      sendResponse({ success: true });
    });
    return true; // 表示将异步发送响应
  }
});