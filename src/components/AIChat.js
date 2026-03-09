// AI Chat Panel Component — with markdown, copy buttons, clear history, streaming sim
import { eventBus } from '../utils/EventBus.js';
import { icons } from './Icons.js';
import { getAllModels } from '../ai/providers.js';
import { agentSkills, skillCategories } from '../ai/agents.js';

export class AIChat {
  constructor(aiService) {
    this.ai = aiService;
    this.messages = [];
    this.isLoading = false;
    this.el = null;
    this._streamTimeout = null;
  }

  render() {
    const el = document.createElement('div');
    el.className = 'ai-chat';
    el.id = 'ai-chat';
    this.el = el;
    this._update();
    return el;
  }

  _update() {
    if (!this.el) return;
    const models = getAllModels();
    const modelOptions = models.map(m =>
      `<option value="${m.id}" ${m.id === this.ai.currentModel ? 'selected' : ''}>${m.icon} ${m.name}</option>`
    ).join('');

    // Quick action buttons — top skills
    const quickSkills = skillCategories.slice(0, 10).map(cat => cat.skills[0]);

    this.el.innerHTML = `
      <div class="ai-chat__header">
        <span class="ai-chat__header-title">${icons.sparkles} Vibe AI</span>
        <div class="ai-chat__header-actions">
          <button class="ai-chat__header-btn tooltip" data-tooltip="Clear conversation" id="chat-clear" title="Clear">${icons.trash}</button>
          <select class="ai-chat__model-select" id="model-select">${modelOptions}</select>
        </div>
      </div>
      <div class="ai-chat__messages" id="chat-messages">
        ${this.messages.length === 0 ? this._renderWelcome() : this.messages.map(m => this._renderMessage(m)).join('')}
        ${this.isLoading ? this._renderTyping() : ''}
      </div>
      <div class="agent-actions" id="agent-actions">
        ${quickSkills.map(s => `<button class="agent-action-btn" data-skill="${s.id}" title="${s.description}">${s.icon} ${s.name}</button>`).join('')}
      </div>
      <div class="ai-chat__input-area">
        <div class="ai-chat__input-wrapper">
          <textarea class="ai-chat__textarea" id="chat-input" placeholder="Ask Vibe AI anything... (Enter to send, Shift+Enter for newline)" rows="1"></textarea>
          <button class="ai-chat__send-btn tooltip" data-tooltip="Send (Enter)" id="chat-send" ${this.isLoading ? 'disabled' : ''}>${icons.send}</button>
        </div>
        <div class="ai-chat__input-hint">Enter ↵ send · Shift+Enter new line · Ctrl+L clear</div>
      </div>
    `;

    this._attachEvents();
    this._scrollToBottom();
  }

  _renderWelcome() {
    return `<div class="ai-chat__welcome">
      <div class="ai-chat__welcome-icon">${icons.sparkles}</div>
      <div class="ai-chat__welcome-title">Vibe AI</div>
      <div class="ai-chat__welcome-subtitle">Powered by 68+ agent skills. Generate, explain, debug, test, secure and deploy code with the most capable AI models.</div>
      <div class="ai-chat__welcome-tips">
        <div class="ai-chat__tip"><kbd>Ctrl+Shift+I</kbd> Generate code</div>
        <div class="ai-chat__tip"><kbd>Ctrl+K</kbd> Explain code</div>
        <div class="ai-chat__tip"><kbd>Ctrl+L</kbd> Toggle panel</div>
      </div>
    </div>`;
  }

  _renderMessage(msg) {
    const isUser = msg.role === 'user';
    const content = isUser ? this._escapeHtml(msg.content) : this._renderMarkdown(msg.content);
    return `<div class="ai-chat__message ${isUser ? 'ai-chat__message--user' : 'ai-chat__message--ai'}">
      <div class="ai-chat__avatar ${isUser ? 'ai-chat__avatar--user' : 'ai-chat__avatar--ai'}">${isUser ? icons.user || 'U' : icons.sparkles}</div>
      <div class="ai-chat__bubble ${isUser ? 'ai-chat__bubble--user' : 'ai-chat__bubble--ai'}">${content}</div>
    </div>`;
  }

  _renderTyping() {
    return `<div class="ai-chat__message ai-chat__message--ai">
      <div class="ai-chat__avatar ai-chat__avatar--ai">${icons.sparkles}</div>
      <div class="ai-chat__bubble ai-chat__bubble--ai">
        <div class="ai-chat__typing">
          <span class="ai-chat__typing-dot"></span>
          <span class="ai-chat__typing-dot"></span>
          <span class="ai-chat__typing-dot"></span>
        </div>
      </div>
    </div>`;
  }

  _renderMarkdown(text) {
    // Process code blocks first with copy button
    let processed = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = this._escapeHtml(code.trim());
      const langLabel = lang || 'code';
      return `<div class="code-block">
        <div class="code-block__header">
          <span class="code-block__lang">${langLabel}</span>
          <button class="code-block__copy" data-code="${encodeURIComponent(code.trim())}">
            ${icons.check ? icons.check : 'Copy'}
          </button>
        </div>
        <pre><code class="language-${lang}">${escaped}</code></pre>
      </div>`;
    });

    // Inline code
    processed = processed.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

    // Bold + Italic
    processed = processed.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

    // Headings
    processed = processed.replace(/^#### (.+)$/gm, '<h5>$1</h5>');
    processed = processed.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    processed = processed.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    processed = processed.replace(/^# (.+)$/gm, '<h2>$1</h2>');

    // Blockquote
    processed = processed.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Horizontal rule
    processed = processed.replace(/^---$/gm, '<hr>');

    // Unordered lists
    processed = processed.replace(/^([*\-+]) (.+)$/gm, '<li>$2</li>');

    // Ordered lists
    processed = processed.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Wrap consecutive <li> in <ul>
    processed = processed.replace(/(<li>[\s\S]*?<\/li>)(?=\s*<li>|$)/g, '$1');
    processed = processed.replace(/((?:<li>[\s\S]*?<\/li>\s*)+)/g, '<ul>$1</ul>');

    // Links
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Paragraphs — split on double newlines not inside code blocks
    processed = processed.replace(/\n\n+/g, '</p><p>');
    processed = processed.replace(/\n(?!<)/g, '<br>');

    return `<div class="markdown">${processed}</div>`;
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  _scrollToBottom() {
    requestAnimationFrame(() => {
      const msgs = this.el?.querySelector('#chat-messages');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    });
  }

  _attachEvents() {
    const input = this.el.querySelector('#chat-input');
    const sendBtn = this.el.querySelector('#chat-send');
    const modelSelect = this.el.querySelector('#model-select');
    const clearBtn = this.el.querySelector('#chat-clear');

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._send(); }
        if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); this._clearHistory(); }
      });
      input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 150) + 'px';
      });
    }

    if (sendBtn) sendBtn.addEventListener('click', () => this._send());

    if (clearBtn) clearBtn.addEventListener('click', () => this._clearHistory());

    if (modelSelect) {
      modelSelect.addEventListener('change', (e) => {
        const modelId = e.target.value;
        const models = getAllModels();
        const model = models.find(m => m.id === modelId);
        if (model) {
          this.ai.setProvider(model.provider);
          this.ai.setModel(modelId);
          eventBus.emit('model:changed', { modelId, provider: model.provider });
          eventBus.emit('notification', { type: 'info', text: `Switched to ${model.name}` });
        }
      });
    }

    // Agent action buttons
    this.el.querySelectorAll('.agent-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const skillId = btn.dataset.skill;
        eventBus.emit('agent:execute', { skillId });
      });
    });

    // Copy code buttons
    this.el.querySelectorAll('.code-block__copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = decodeURIComponent(btn.dataset.code);
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = 'Copied!';
          btn.style.color = 'var(--color-success)';
          setTimeout(() => {
            btn.innerHTML = icons.check || 'Copy';
            btn.style.color = '';
          }, 2000);
        }).catch(() => {
          // Fallback
          const ta = document.createElement('textarea');
          ta.value = code;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.innerHTML = icons.check || 'Copy'; }, 2000);
        });
      });
    });
  }

  _clearHistory() {
    this.messages = [];
    this.ai.clearHistory();
    this._update();
  }

  async _send() {
    const input = this.el.querySelector('#chat-input');
    const text = input?.value.trim();
    if (!text || this.isLoading) return;

    this.messages.push({ role: 'user', content: text });
    input.value = '';
    input.style.height = 'auto';
    this.isLoading = true;
    this._update();

    try {
      const response = await this.ai.sendMessage(text, null);
      this.messages.push({ role: 'assistant', content: response });
    } catch (e) {
      this.messages.push({ role: 'assistant', content: `**Error:** ${e.message}\n\nPlease check your API key in Settings (Ctrl+,).` });
    }

    this.isLoading = false;
    this._update();
  }

  addAgentResponse(content) {
    this.messages.push({ role: 'assistant', content });
    this._update();
  }
}
