// Command Palette Component
import { eventBus } from '../utils/EventBus.js';
import { icons } from './Icons.js';
import { getShortcuts, getShortcutLabel } from '../utils/shortcuts.js';

const commands = [
  { id: 'new-file', label: 'New File', icon: 'plus', category: 'File' },
  { id: 'save-file', label: 'Save File', icon: 'check', category: 'File' },
  { id: 'close-tab', label: 'Close Tab', icon: 'close', category: 'File' },
  { id: 'toggle-sidebar', label: 'Toggle Sidebar', icon: 'layout', category: 'View' },
  { id: 'toggle-terminal', label: 'Toggle Terminal', icon: 'terminal', category: 'View' },
  { id: 'toggle-ai-chat', label: 'Toggle AI Chat', icon: 'sparkles', category: 'View' },
  { id: 'toggle-preview', label: 'Toggle Preview', icon: 'eye', category: 'View' },
  { id: 'open-settings', label: 'Open Settings', icon: 'settings', category: 'Settings' },
  { id: 'search-project', label: 'Search in Project', icon: 'search', category: 'Search' },
  { id: 'ai-generate', label: 'AI: Generate Code', icon: 'sparkles', category: 'AI' },
  { id: 'ai-explain', label: 'AI: Explain Code', icon: 'sparkles', category: 'AI' },
  { id: 'toggle-theme', label: 'Toggle Theme (Dark/Light)', icon: 'moon', category: 'Settings' },
  { id: 'reset-workspace', label: 'Reset Workspace', icon: 'refresh', category: 'Workspace' },
];

export class CommandPalette {
  constructor() {
    this.isOpen = false;
    this.query = '';
    this.activeIndex = 0;
    this.overlayEl = null;
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.query = '';
    this.activeIndex = 0;
    this._render();
  }

  close() {
    this.isOpen = false;
    if (this.overlayEl) {
      this.overlayEl.remove();
      this.overlayEl = null;
    }
  }

  _render() {
    if (this.overlayEl) this.overlayEl.remove();

    const overlay = document.createElement('div');
    overlay.className = 'command-palette-overlay';
    overlay.id = 'command-palette-overlay';

    const filtered = this._getFiltered();

    overlay.innerHTML = `
      <div class="command-palette" id="command-palette">
        <div class="command-palette__input-wrapper">
          ${icons.search}
          <input class="command-palette__input" id="command-palette-input" placeholder="Type a command..." value="${this.query}" autofocus />
        </div>
        <div class="command-palette__results" id="command-palette-results">
          ${filtered.length > 0 ? filtered.map((cmd, i) => `
            <div class="command-palette__item ${i === this.activeIndex ? 'active' : ''}" data-action="${cmd.id}">
              <span class="command-palette__item-icon">${icons[cmd.icon] || ''}</span>
              <span class="command-palette__item-label">${cmd.label}</span>
              <span class="command-palette__item-shortcut">${getShortcutLabel(cmd.id)}</span>
            </div>
          `).join('') : '<div class="command-palette__empty">No commands found</div>'}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlayEl = overlay;

    const input = overlay.querySelector('#command-palette-input');
    input.focus();

    input.addEventListener('input', (e) => {
      this.query = e.target.value;
      this.activeIndex = 0;
      this._updateResults();
    });

    input.addEventListener('keydown', (e) => {
      const filtered = this._getFiltered();
      if (e.key === 'ArrowDown') { e.preventDefault(); this.activeIndex = Math.min(this.activeIndex + 1, filtered.length - 1); this._updateResults(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); this.activeIndex = Math.max(this.activeIndex - 1, 0); this._updateResults(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (filtered[this.activeIndex]) { this._executeCommand(filtered[this.activeIndex].id); } }
      else if (e.key === 'Escape') { this.close(); }
    });

    overlay.addEventListener('click', (e) => {
      const item = e.target.closest('.command-palette__item');
      if (item) { this._executeCommand(item.dataset.action); return; }
      if (e.target === overlay) this.close();
    });
  }

  _getFiltered() {
    if (!this.query) return commands;
    const q = this.query.toLowerCase();
    return commands.filter(c => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
  }

  _updateResults() {
    const container = this.overlayEl?.querySelector('#command-palette-results');
    if (!container) return;
    const filtered = this._getFiltered();
    container.innerHTML = filtered.length > 0 ? filtered.map((cmd, i) => `
      <div class="command-palette__item ${i === this.activeIndex ? 'active' : ''}" data-action="${cmd.id}">
        <span class="command-palette__item-icon">${icons[cmd.icon] || ''}</span>
        <span class="command-palette__item-label">${cmd.label}</span>
        <span class="command-palette__item-shortcut">${getShortcutLabel(cmd.id)}</span>
      </div>
    `).join('') : '<div class="command-palette__empty">No commands found</div>';

    container.querySelectorAll('.command-palette__item').forEach(item => {
      item.addEventListener('click', () => this._executeCommand(item.dataset.action));
    });
  }

  _executeCommand(action) {
    this.close();
    eventBus.emit('shortcut', { action });
  }
}
