// AI Provider Configurations
export const providers = {
  antigravity: {
    id: 'antigravity',
    name: 'Antigravity',
    icon: '⚡',
    models: [
      { id: 'antigravity-max', name: 'Antigravity Max', description: 'Most capable model', maxTokens: 32000 },
      { id: 'antigravity-fast', name: 'Antigravity Fast', description: 'Optimized for speed', maxTokens: 16000 },
    ],
    defaultModel: 'antigravity-max',
    apiEndpoint: 'https://api.antigravity.ai/v1/chat/completions',
    requiresKey: true,
    docsUrl: 'https://antigravity.ai',
  },
  orchids: {
    id: 'orchids',
    name: 'Orchids.app AI',
    icon: '🌸',
    models: [
      { id: 'orchids-pro', name: 'Orchids Pro', description: 'Full-featured', maxTokens: 32000 },
      { id: 'orchids-lite', name: 'Orchids Lite', description: 'Lightweight', maxTokens: 8000 },
    ],
    defaultModel: 'orchids-pro',
    apiEndpoint: 'https://api.orchids.app/v1/chat/completions',
    requiresKey: true,
    docsUrl: 'https://orchids.app',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Latest flagship model', maxTokens: 128000 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable', maxTokens: 128000 },
      { id: 'o1', name: 'o1', description: 'Advanced reasoning', maxTokens: 128000 },
    ],
    defaultModel: 'gpt-4o',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    requiresKey: true,
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🧠',
    models: [
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Best balance', maxTokens: 200000 },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Most capable', maxTokens: 200000 },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fastest', maxTokens: 200000 },
    ],
    defaultModel: 'claude-3-5-sonnet',
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    requiresKey: true,
    docsUrl: 'https://console.anthropic.com/keys',
  },
  google: {
    id: 'google',
    name: 'Google Gemini',
    icon: '💎',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Latest fast model', maxTokens: 1048576 },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Advanced multimodal', maxTokens: 2097152 },
    ],
    defaultModel: 'gemini-2.0-flash',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    requiresKey: true,
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral AI',
    icon: '🌊',
    models: [
      { id: 'mistral-large', name: 'Mistral Large', description: 'Most capable', maxTokens: 128000 },
      { id: 'codestral', name: 'Codestral', description: 'Code-specialized', maxTokens: 32000 },
    ],
    defaultModel: 'mistral-large',
    apiEndpoint: 'https://api.mistral.ai/v1/chat/completions',
    requiresKey: true,
    docsUrl: 'https://console.mistral.ai/api-keys',
  },
  local: {
    id: 'local',
    name: 'Local (Ollama)',
    icon: '🏠',
    models: [
      { id: 'llama3', name: 'Llama 3', description: 'Open source', maxTokens: 8192 },
      { id: 'codellama', name: 'Code Llama', description: 'Code generation', maxTokens: 16000 },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'Coding specialist', maxTokens: 16000 },
    ],
    defaultModel: 'llama3',
    apiEndpoint: 'http://localhost:11434/api/chat',
    requiresKey: false,
    docsUrl: 'https://ollama.ai',
  }
};

export function getAllModels() {
  const models = [];
  for (const provider of Object.values(providers)) {
    for (const model of provider.models) {
      models.push({ ...model, provider: provider.id, providerName: provider.name, icon: provider.icon });
    }
  }
  return models;
}

export function getProvider(providerId) {
  return providers[providerId] || null;
}

export function getModelInfo(modelId) {
  for (const provider of Object.values(providers)) {
    const model = provider.models.find(m => m.id === modelId);
    if (model) return { ...model, provider: provider.id, providerName: provider.name };
  }
  return null;
}
