// StatusBar Component — live cursor, word count, encoding, model
import { eventBus } from '../utils/EventBus.js';
import { icons } from './Icons.js';

export class StatusBar {
  constructor() {
    this.language = 'Plain Text';
    this.line = 1;
    this.col = 1;
    this.words = 0;
    this.chars = 0;
    this.encoding = 'UTF-8';
    this.eol = 'LF';
    this.model = 'GPT-4o';
    this.branch = 'main';
    this.errors = 0;
    this.warnings = 0;
    this.el = null;

    eventBus.on('editor:cursor', ({ line, col, words, chars }) => {
      this.line = line;
      this.col = col;
      this.words = words;
      this.chars = chars;
      this._update();
    });
  }

  render() {
    const el = document.createElement('div');
    el.className = 'status-bar';
    el.id = 'status-bar';
    this.el = el;
    this._update();
    return el;
  }

  setInfo(info) {
    Object.assign(this, info);
    this._update();
  }

  _update() {
    if (!this.el) return;
    this.el.innerHTML = `
      <div class="status-bar__left">
        <span class="status-bar__item status-bar__item--btn tooltip" data-tooltip="Source Control">${icons.git} ${this.branch}</span>
        <span class="status-bar__sep"></span>
        ${this.errors > 0
          ? `<span class="status-bar__item status-bar__item--error">${icons.close} ${this.errors} error${this.errors !== 1 ? 's' : ''}</span>`
          : `<span class="status-bar__item">${icons.close} 0</span>`}
        ${this.warnings > 0
          ? `<span class="status-bar__item status-bar__item--warning">${icons.alert} ${this.warnings} warning${this.warnings !== 1 ? 's' : ''}</span>`
          : ''}
      </div>
      <div class="status-bar__right">
        <span class="status-bar__item status-bar__item--btn tooltip" data-tooltip="AI Model">${icons.sparkles} ${this.model}</span>
        <span class="status-bar__sep"></span>
        <span class="status-bar__item tooltip" data-tooltip="Go to Line/Column">Ln ${this.line}, Col ${this.col}</span>
        <span class="status-bar__item tooltip" data-tooltip="Words">${this.words}W</span>
        <span class="status-bar__sep"></span>
        <span class="status-bar__item">${this.encoding}</span>
        <span class="status-bar__item">${this.eol}</span>
        <span class="status-bar__item status-bar__item--lang status-bar__item--btn">${this.language}</span>
      </div>
    `;
  }
}
