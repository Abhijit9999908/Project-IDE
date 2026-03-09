// Editor Component — CodeMirror 6 with cursor tracking, font size support, light theme
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, highlightActiveLine, rectangularSelection, crosshairCursor } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { python } from '@codemirror/lang-python';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { eventBus } from '../utils/EventBus.js';
import { storage } from '../utils/storage.js';

const langMap = {
  javascript: javascript, html: html, css: css, json: json,
  markdown: markdown, python: python, typescript: () => javascript({ typescript: true }),
  jsx: () => javascript({ jsx: true }), tsx: () => javascript({ jsx: true, typescript: true }),
};

const vibeDarkTheme = EditorView.theme({
  '&': { backgroundColor: '#0a0e1a', color: '#e2e8f0', height: '100%' },
  '.cm-content': { caretColor: '#6366f1', fontFamily: "'JetBrains Mono', monospace" },
  '&.cm-focused .cm-cursor': { borderLeftColor: '#6366f1', borderLeftWidth: '2px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': { backgroundColor: 'rgba(139,92,246,0.2)' },
  '.cm-panels': { backgroundColor: '#111827', color: '#e2e8f0' },
  '.cm-searchMatch': { backgroundColor: 'rgba(99,102,241,0.3)' },
  '.cm-activeLine': { backgroundColor: 'rgba(99,102,241,0.06)' },
  '.cm-selectionMatch': { backgroundColor: 'rgba(99,102,241,0.15)' },
  '.cm-matchingBracket, .cm-nonmatchingBracket': { backgroundColor: 'rgba(99,102,241,0.25)', outline: 'none' },
  '.cm-gutters': { backgroundColor: '#0a0e1a', color: '#4a5568', borderRight: '1px solid rgba(255,255,255,0.06)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(99,102,241,0.06)', color: '#94a3b8' },
  '.cm-foldPlaceholder': { backgroundColor: '#1e2541', border: 'none', color: '#94a3b8' },
  '.cm-tooltip': { backgroundColor: '#1e2541', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' },
  '.cm-tooltip-autocomplete': { '& > ul > li[aria-selected]': { backgroundColor: 'rgba(99,102,241,0.15)', color: '#e2e8f0' } },
}, { dark: true });

const vibeLightTheme = EditorView.theme({
  '&': { backgroundColor: '#ffffff', color: '#1e293b', height: '100%' },
  '.cm-content': { caretColor: '#6366f1', fontFamily: "'JetBrains Mono', monospace" },
  '&.cm-focused .cm-cursor': { borderLeftColor: '#6366f1', borderLeftWidth: '2px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': { backgroundColor: 'rgba(99,102,241,0.15)' },
  '.cm-panels': { backgroundColor: '#f8fafc', color: '#1e293b' },
  '.cm-searchMatch': { backgroundColor: 'rgba(99,102,241,0.2)' },
  '.cm-activeLine': { backgroundColor: 'rgba(99,102,241,0.04)' },
  '.cm-selectionMatch': { backgroundColor: 'rgba(99,102,241,0.1)' },
  '.cm-matchingBracket, .cm-nonmatchingBracket': { backgroundColor: 'rgba(99,102,241,0.15)', outline: 'none' },
  '.cm-gutters': { backgroundColor: '#f8fafc', color: '#94a3b8', borderRight: '1px solid rgba(0,0,0,0.08)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(99,102,241,0.06)', color: '#64748b' },
  '.cm-foldPlaceholder': { backgroundColor: '#f1f5f9', border: 'none', color: '#64748b' },
  '.cm-tooltip': { backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px' },
}, { dark: false });

export class Editor {
  constructor(fileSystem) {
    this.fs = fileSystem;
    this.views = {};
    this.activeFile = null;
    this.containerEl = null;
    this.fontSize = storage.get('editor-font-size', 13);
    this.tabSize = storage.get('editor-tab-size', 2);
  }

  mount(container) {
    this.containerEl = container;
  }

  openFile(path) {
    const content = this.fs.readFile(path);
    if (content === null) return;

    if (this.views[this.activeFile]) {
      this.views[this.activeFile].dom.style.display = 'none';
    }

    if (this.views[path]) {
      this.views[path].dom.style.display = '';
      this.activeFile = path;
      this._updateCursorInfo(this.views[path]);
      return;
    }

    const isDark = document.documentElement.dataset.theme !== 'light';
    const language = this.fs.getLanguage(path);
    const langExt = langMap[language];

    const extensions = [
      lineNumbers(), highlightActiveLineGutter(), highlightSpecialChars(),
      history(), foldGutter(), drawSelection(), highlightActiveLine(),
      indentOnInput(), bracketMatching(), closeBrackets(),
      autocompletion(), rectangularSelection(), crosshairCursor(),
      highlightSelectionMatches(), syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, indentWithTab]),
      isDark ? vibeDarkTheme : vibeLightTheme,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          this.fs.writeFile(path, update.state.doc.toString());
          eventBus.emit('editor:changed', { path });
          // word count
          const words = update.state.doc.toString().trim().split(/\s+/).filter(Boolean).length;
          const lines = update.state.doc.lines;
          eventBus.emit('editor:stats', { words, lines });
        }
        if (update.selectionSet || update.docChanged) {
          this._updateCursorInfo(update.view);
        }
      }),
      EditorView.theme({
        '.cm-content': { fontSize: this.fontSize + 'px' },
        '.cm-gutters': { fontSize: this.fontSize + 'px' },
        '.cm-scroller': { lineHeight: '1.7' },
      }),
    ];

    if (langExt) extensions.push(typeof langExt === 'function' ? langExt() : langExt());

    const state = EditorState.create({ doc: content, extensions });
    const view = new EditorView({ state, parent: this.containerEl });
    this.views[path] = view;
    this.activeFile = path;

    Object.entries(this.views).forEach(([p, v]) => {
      if (p !== path) v.dom.style.display = 'none';
    });

    this._updateCursorInfo(view);
  }

  _updateCursorInfo(view) {
    const state = view.state;
    const pos = state.selection.main.head;
    const line = state.doc.lineAt(pos);
    const lineNum = line.number;
    const col = pos - line.from + 1;
    const words = state.doc.toString().trim().split(/\s+/).filter(Boolean).length;
    eventBus.emit('editor:cursor', { line: lineNum, col, words, chars: state.doc.length });
  }

  closeFile(path) {
    if (this.views[path]) {
      this.views[path].destroy();
      delete this.views[path];
    }
    if (this.activeFile === path) {
      this.activeFile = null;
    }
  }

  getContent(path) {
    if (this.views[path]) return this.views[path].state.doc.toString();
    return this.fs.readFile(path);
  }

  setContent(path, content) {
    if (this.views[path]) {
      const view = this.views[path];
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: content } });
    }
  }

  getActiveContent() {
    return this.activeFile ? this.getContent(this.activeFile) : '';
  }

  getActiveLanguage() {
    return this.activeFile ? this.fs.getLanguage(this.activeFile) : 'text';
  }

  setFontSize(size) {
    this.fontSize = size;
    storage.set('editor-font-size', size);
    // Update all open views
    Object.values(this.views).forEach(view => {
      view.dispatch({
        effects: EditorView.scrollIntoView(view.state.selection.main.head)
      });
      // Re-apply font size via DOM since we can't easily reconfigure
      const content = view.dom.querySelector('.cm-content');
      const gutters = view.dom.querySelector('.cm-gutters');
      if (content) content.style.fontSize = size + 'px';
      if (gutters) gutters.style.fontSize = size + 'px';
    });
  }

  setTabSize(size) {
    this.tabSize = size;
    storage.set('editor-tab-size', size);
  }

  // Reopen all files to apply new theme
  reloadTheme() {
    const openFiles = Object.keys(this.views);
    const active = this.activeFile;
    openFiles.forEach(path => this.closeFile(path));
    openFiles.forEach(path => this.openFile(path));
    if (active && this.views[active]) {
      Object.entries(this.views).forEach(([p, v]) => {
        v.dom.style.display = p === active ? '' : 'none';
      });
      this.activeFile = active;
    }
  }
}
