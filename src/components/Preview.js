// Preview Panel Component
import { eventBus } from '../utils/EventBus.js';
import { icons } from './Icons.js';

export class Preview {
  constructor(fileSystem) {
    this.fs = fileSystem;
    this.el = null;
  }

  render() {
    const el = document.createElement('div');
    el.className = 'preview-panel';
    el.id = 'preview-panel';
    el.innerHTML = `
      <div class="preview-panel__toolbar">
        <button class="sidebar__action-btn" id="preview-refresh" title="Refresh">${icons.refresh}</button>
        <span class="preview-panel__url">localhost:5173</span>
        <button class="sidebar__action-btn" id="preview-open" title="Open in new window">${icons.download}</button>
      </div>
      <iframe class="preview-panel__iframe" id="preview-iframe" sandbox="allow-scripts allow-modals"></iframe>
    `;
    this.el = el;
    this._attachEvents();
    this.refresh();
    return el;
  }

  refresh() {
    const iframe = this.el?.querySelector('#preview-iframe');
    if (!iframe) return;
    const htmlContent = this.fs.readFile('/index.html');
    const cssContent = this.fs.readFile('/src/styles.css');
    const jsContent = this.fs.readFile('/src/main.js');

    const preview = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>${cssContent || ''}</style></head><body>
<div id="app"></div>
<script type="module">
try { ${jsContent || ''} } catch(e) { document.getElementById('app').innerHTML = '<pre style="color:red;padding:1rem;">'+e.message+'</pre>'; }
<\/script></body></html>`;

    iframe.srcdoc = preview;
  }

  _attachEvents() {
    this.el.querySelector('#preview-refresh')?.addEventListener('click', () => this.refresh());
    eventBus.on('editor:changed', () => { clearTimeout(this._timer); this._timer = setTimeout(() => this.refresh(), 1000); });
  }
}
