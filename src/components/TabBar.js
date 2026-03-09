// Tab Bar Component
import { eventBus } from '../utils/EventBus.js';
import { icons } from './Icons.js';

export class TabBar {
  constructor() {
    this.tabs = [];
    this.activeTab = null;
    this.el = null;
  }

  render() {
    const el = document.createElement('div');
    el.className = 'tab-bar';
    el.id = 'tab-bar';
    this.el = el;
    this._update();
    return el;
  }

  addTab(path) {
    if (this.tabs.find(t => t.path === path)) {
      this.setActive(path);
      return;
    }
    const name = path.split('/').pop();
    const ext = name.split('.').pop();
    this.tabs.push({ path, name, ext, dirty: false });
    this.setActive(path);
    this._update();
  }

  removeTab(path) {
    const idx = this.tabs.findIndex(t => t.path === path);
    if (idx === -1) return;
    this.tabs.splice(idx, 1);
    if (this.activeTab === path) {
      this.activeTab = this.tabs.length > 0 ? this.tabs[Math.max(0, idx - 1)].path : null;
      if (this.activeTab) eventBus.emit('file:open', { path: this.activeTab });
    }
    eventBus.emit('tab:closed', { path });
    this._update();
  }

  setActive(path) {
    this.activeTab = path;
    this._update();
  }

  setDirty(path, dirty) {
    const tab = this.tabs.find(t => t.path === path);
    if (tab) { tab.dirty = dirty; this._update(); }
  }

  _getIconClass(ext) {
    const map = { js: 'file-icon--js', jsx: 'file-icon--js', ts: 'file-icon--ts', tsx: 'file-icon--ts', html: 'file-icon--html', css: 'file-icon--css', json: 'file-icon--json', md: 'file-icon--md', py: 'file-icon--py' };
    return map[ext] || '';
  }

  _update() {
    if (!this.el) return;
    this.el.innerHTML = this.tabs.map(tab => `
      <div class="tab ${tab.path === this.activeTab ? 'active' : ''}" data-path="${tab.path}" id="tab-${tab.name}">
        <span class="tab__icon ${this._getIconClass(tab.ext)}">${icons.file}</span>
        <span class="tab__name">${tab.name}</span>
        ${tab.dirty ? '<span class="tab__dot"></span>' : ''}
        <button class="tab__close" data-close="${tab.path}" title="Close">${icons.close}</button>
      </div>
    `).join('');

    // Events
    this.el.querySelectorAll('.tab').forEach(tabEl => {
      tabEl.addEventListener('click', (e) => {
        if (e.target.closest('.tab__close')) {
          const path = e.target.closest('.tab__close').dataset.close;
          this.removeTab(path);
        } else {
          eventBus.emit('file:open', { path: tabEl.dataset.path });
        }
      });
    });
  }
}
