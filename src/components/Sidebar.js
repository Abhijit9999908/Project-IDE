// Sidebar Component
import { eventBus } from '../utils/EventBus.js';
import { icons } from './Icons.js';

export class Sidebar {
  constructor() {
    this.activePanel = 'explorer';
    this.isCollapsed = false;
    this.el = null;
    this.contentEl = null;
  }

  renderActivityBar() {
    const el = document.createElement('div');
    el.className = 'activity-bar';
    el.id = 'activity-bar';

    const buttons = [
      { id: 'explorer', icon: 'files', tooltip: 'Explorer' },
      { id: 'search', icon: 'search', tooltip: 'Search' },
      { id: 'skills', icon: 'sparkles', tooltip: 'Agent Skills' },
      { id: 'git', icon: 'git', tooltip: 'Source Control' },
    ];

    const bottomButtons = [
      { id: 'ai', icon: 'sparkles', tooltip: 'AI Chat' },
      { id: 'settings', icon: 'settings', tooltip: 'Settings' },
    ];

    el.innerHTML = `
      <div class="activity-bar__top">
        ${buttons.map(b => `<button class="activity-bar__btn tooltip ${this.activePanel === b.id ? 'active' : ''}" data-panel="${b.id}" data-tooltip="${b.tooltip}" id="activity-${b.id}">${icons[b.icon]}</button>`).join('')}
      </div>
      <div class="activity-bar__bottom">
        ${bottomButtons.map(b => `<button class="activity-bar__btn tooltip ${this.activePanel === b.id ? 'active' : ''}" data-panel="${b.id}" data-tooltip="${b.tooltip}" id="activity-${b.id}">${icons[b.icon]}</button>`).join('')}
      </div>
    `;

    el.addEventListener('click', (e) => {
      const btn = e.target.closest('.activity-bar__btn');
      if (!btn) return;
      const panel = btn.dataset.panel;

      if (panel === 'ai') {
        eventBus.emit('shortcut', { action: 'toggle-ai-chat' });
        return;
      }

      if (this.activePanel === panel && !this.isCollapsed) {
        this.isCollapsed = true;
      } else {
        this.activePanel = panel;
        this.isCollapsed = false;
      }
      eventBus.emit('sidebar:changed', { panel: this.activePanel, collapsed: this.isCollapsed });
      this._updateButtons(el);
    });

    return el;
  }

  renderSidebar() {
    const el = document.createElement('div');
    el.className = 'sidebar';
    el.id = 'sidebar';
    this.el = el;
    return el;
  }

  setSidebarContent(title, content) {
    if (!this.el) return;
    this.el.innerHTML = `
      <div class="sidebar__header">
        <span class="sidebar__title">${title}</span>
        <div class="sidebar__actions">
          <button class="sidebar__action-btn" id="sidebar-new-file" title="New File">${icons.plus}</button>
          <button class="sidebar__action-btn" id="sidebar-new-folder" title="New Folder">${icons.folder}</button>
          <button class="sidebar__action-btn" id="sidebar-refresh" title="Refresh">${icons.refresh}</button>
        </div>
      </div>
      <div class="sidebar__content" id="sidebar-content"></div>
    `;

    const contentEl = this.el.querySelector('#sidebar-content');
    if (content instanceof HTMLElement) {
      contentEl.appendChild(content);
    } else {
      contentEl.innerHTML = content;
    }

    this._attachSidebarEvents();
  }

  _attachSidebarEvents() {
    this.el.querySelector('#sidebar-new-file')?.addEventListener('click', () => eventBus.emit('shortcut', { action: 'new-file' }));
    this.el.querySelector('#sidebar-new-folder')?.addEventListener('click', () => eventBus.emit('shortcut', { action: 'new-folder' }));
    this.el.querySelector('#sidebar-refresh')?.addEventListener('click', () => eventBus.emit('filesystem:refresh'));
  }

  _updateButtons(activityBar) {
    activityBar.querySelectorAll('.activity-bar__btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.panel === this.activePanel && !this.isCollapsed);
    });
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    eventBus.emit('sidebar:changed', { panel: this.activePanel, collapsed: this.isCollapsed });
  }
}
