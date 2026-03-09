// Settings Component — with working font size, tab size, API key management
import { eventBus } from '../utils/EventBus.js';
import { icons } from './Icons.js';
import { providers } from '../ai/providers.js';
import { storage } from '../utils/storage.js';

export class Settings {
  constructor(aiService) {
    this.ai = aiService;
    this.el = null;
    this.showKeys = {};
    this.fontSize = storage.get('editor-font-size', 13);
    this.tabSize = storage.get('editor-tab-size', 2);
  }

  render() {
    const el = document.createElement('div');
    el.className = 'settings';
    el.id = 'settings-panel';
    this.el = el;
    this._update();
    return el;
  }

  _update() {
    if (!this.el) return;
    const isDark = document.documentElement.dataset.theme !== 'light';

    this.el.innerHTML = `
      <div class="settings__section">
        <h3 class="settings__section-title">${icons.sparkles} AI Configuration</h3>
        ${Object.values(providers).map(p => `
          <div class="settings__field">
            <label class="settings__label">${p.icon} ${p.name}${!p.requiresKey ? ' <span style="color:var(--color-success);font-size:10px;">(No key required)</span>' : ''}</label>
            <div class="settings__key-row">
              <input class="settings__input ${p.requiresKey ? 'settings__input--password' : ''}"
                type="${this.showKeys[p.id] ? 'text' : 'password'}"
                placeholder="${p.requiresKey ? 'sk-... Enter API key' : 'No key required'}"
                data-provider="${p.id}"
                value="${this.ai.getApiKey(p.id)}"
                ${!p.requiresKey ? 'disabled' : ''} />
              ${p.requiresKey ? `<button class="settings__eye-btn" data-eye="${p.id}" title="Show/hide">${this.showKeys[p.id] ? icons.eye : icons.eyeOff || icons.eye}</button>` : ''}
            </div>
            ${p.docsUrl ? `<a href="${p.docsUrl}" target="_blank" style="font-size:var(--text-xs);color:var(--color-text-accent);">Get API key →</a>` : ''}
          </div>
        `).join('')}
      </div>

      <div class="settings__section">
        <h3 class="settings__section-title">${icons.layout} Editor Settings</h3>

        <div class="settings__toggle">
          <label class="settings__label" style="margin:0;">Dark Theme</label>
          <div class="settings__toggle-switch ${isDark ? 'active' : ''}" id="theme-toggle"></div>
        </div>

        <div class="settings__field" style="margin-top:var(--space-3);">
          <label class="settings__label">Font Size</label>
          <div class="settings__slider-row">
            <input type="range" class="settings__slider" id="font-size-slider" min="10" max="20" value="${this.fontSize}" step="1" />
            <span class="settings__slider-value" id="font-size-value">${this.fontSize}px</span>
          </div>
        </div>

        <div class="settings__field">
          <label class="settings__label">Tab Size</label>
          <select class="settings__select" id="tab-size-select">
            <option value="2" ${this.tabSize === 2 ? 'selected' : ''}>2 spaces</option>
            <option value="4" ${this.tabSize === 4 ? 'selected' : ''}>4 spaces</option>
            <option value="8" ${this.tabSize === 8 ? 'selected' : ''}>8 spaces</option>
          </select>
        </div>

        <div class="settings__toggle">
          <label class="settings__label" style="margin:0;">Word Wrap</label>
          <div class="settings__toggle-switch ${storage.get('word-wrap', true) ? 'active' : ''}" id="word-wrap-toggle" data-key="word-wrap"></div>
        </div>

        <div class="settings__toggle">
          <label class="settings__label" style="margin:0;">Line Numbers</label>
          <div class="settings__toggle-switch active" id="line-numbers-toggle" data-key="line-numbers"></div>
        </div>
      </div>

      <div class="settings__section">
        <h3 class="settings__section-title">${icons.terminal} Terminal</h3>
        <div class="settings__field">
          <label class="settings__label">Shell</label>
          <select class="settings__select">
            <option selected>/bin/bash</option>
            <option>/bin/zsh</option>
            <option>PowerShell</option>
          </select>
        </div>
      </div>

      <div class="settings__section">
        <h3 class="settings__section-title">${icons.info} About</h3>
        <div class="settings__about">
          <div class="settings__about-logo">V</div>
          <div>
            <div style="font-weight:var(--weight-semibold);color:var(--color-text-primary);">Vibe Code IDE</div>
            <div style="color:var(--color-text-muted);font-size:var(--text-xs);">v2.0.0 · AI-Powered Coding Environment</div>
          </div>
        </div>
        <div style="display:flex;gap:var(--space-2);margin-top:var(--space-3);flex-wrap:wrap;">
          <button class="btn btn--secondary btn--sm" id="reset-workspace-btn">${icons.refresh} Reset Workspace</button>
          <button class="btn btn--secondary btn--sm" id="export-data-btn">${icons.download} Export Data</button>
        </div>
      </div>
    `;

    this._attachEvents();
  }

  _attachEvents() {
    // API key inputs
    this.el.querySelectorAll('.settings__input[data-provider]').forEach(input => {
      input.addEventListener('change', (e) => {
        const provider = e.target.dataset.provider;
        this.ai.setApiKey(provider, e.target.value);
        eventBus.emit('notification', { type: 'success', text: `${provider} API key saved` });
      });
    });

    // Show/hide key buttons
    this.el.querySelectorAll('.settings__eye-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.eye;
        this.showKeys[id] = !this.showKeys[id];
        this._update();
      });
    });

    // Theme toggle
    const themeToggle = this.el.querySelector('#theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        eventBus.emit('shortcut', { action: 'toggle-theme' });
        setTimeout(() => this._update(), 50);
      });
    }

    // Font size slider
    const fontSlider = this.el.querySelector('#font-size-slider');
    const fontValue = this.el.querySelector('#font-size-value');
    if (fontSlider) {
      fontSlider.addEventListener('input', (e) => {
        const size = parseInt(e.target.value);
        this.fontSize = size;
        if (fontValue) fontValue.textContent = size + 'px';
        storage.set('editor-font-size', size);
        eventBus.emit('editor:font-size', { size });
      });
    }

    // Tab size
    const tabSizeSelect = this.el.querySelector('#tab-size-select');
    if (tabSizeSelect) {
      tabSizeSelect.addEventListener('change', (e) => {
        const size = parseInt(e.target.value);
        this.tabSize = size;
        storage.set('editor-tab-size', size);
        eventBus.emit('editor:tab-size', { size });
      });
    }

    // Toggle switches
    this.el.querySelectorAll('.settings__toggle-switch').forEach(toggle => {
      if (toggle.id === 'theme-toggle') return;
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        const key = toggle.dataset.key;
        if (key) storage.set(key, toggle.classList.contains('active'));
      });
    });

    // Reset workspace
    const resetBtn = this.el.querySelector('#reset-workspace-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        eventBus.emit('shortcut', { action: 'reset-workspace' });
      });
    }

    // Export data
    const exportBtn = this.el.querySelector('#export-data-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith('vibe-ide-')) data[key] = localStorage.getItem(key);
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vibe-ide-data.json';
        a.click();
        URL.revokeObjectURL(url);
        eventBus.emit('notification', { type: 'success', text: 'Data exported' });
      });
    }
  }
}
