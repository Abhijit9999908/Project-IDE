// Vibe Code IDE — Main Application Controller
import { eventBus } from './utils/EventBus.js';
import { FileSystem } from './utils/FileSystem.js';
import { storage } from './utils/storage.js';
import { initShortcuts } from './utils/shortcuts.js';
import { AIService } from './ai/AIService.js';
import { Sidebar } from './components/Sidebar.js';
import { FileExplorer } from './components/FileExplorer.js';
import { Editor } from './components/Editor.js';
import { TabBar } from './components/TabBar.js';
import { AIChat } from './components/AIChat.js';
import { Terminal } from './components/Terminal.js';
import { CommandPalette } from './components/CommandPalette.js';
import { Settings } from './components/Settings.js';
import { Preview } from './components/Preview.js';
import { StatusBar } from './components/StatusBar.js';
import { SkillsExplorer } from './components/SkillsExplorer.js';
import { icons } from './components/Icons.js';
import { getModelInfo } from './ai/providers.js';
import { getSkillById } from './ai/agents.js';
import { buildSkillPrompt } from './ai/prompts.js';

export class App {
  constructor() {
    this.fs = new FileSystem();
    this.ai = new AIService();
    this.sidebar = new Sidebar();
    this.fileExplorer = new FileExplorer(this.fs);
    this.editor = new Editor(this.fs);
    this.tabBar = new TabBar();
    this.aiChat = new AIChat(this.ai);
    this.terminal = new Terminal(this.fs);
    this.commandPalette = new CommandPalette();
    this.settings = new Settings(this.ai);
    this.preview = new Preview(this.fs);
    this.statusBar = new StatusBar();
    this.skillsExplorer = new SkillsExplorer();
    this.showAIChat = storage.get('show-ai-chat', true);
    this.showPanel = storage.get('show-panel', true);
    this.showPreview = false;
    this.theme = storage.get('theme', 'dark');
    this._notifCount = 0;
  }

  init() {
    if (this.theme === 'light') document.documentElement.dataset.theme = 'light';
    this._buildLayout();
    initShortcuts();
    this._bindEvents();
    this._setSidebarPanel('explorer');
  }

  _buildLayout() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    // Title Bar
    const titleBar = document.createElement('div');
    titleBar.className = 'title-bar';
    titleBar.innerHTML = `
      <div class="title-bar__logo">
        <div class="title-bar__logo-icon">${icons.sparkles}</div>
        <span class="title-bar__logo-name">Vibe Code</span>
        <span class="title-bar__version">v2.0</span>
      </div>
      <div class="title-bar__center">
        <div class="title-bar__search" id="title-search">
          ${icons.search}
          <span class="title-bar__search-text">Search commands and files...</span>
          <span class="title-bar__search-shortcut">Ctrl+Shift+P</span>
        </div>
      </div>
      <div class="title-bar__actions">
        <button class="title-bar__action-btn tooltip" data-tooltip="Toggle Preview (Ctrl+.)" id="preview-btn">${icons.eye}</button>
        <button class="title-bar__action-btn tooltip" data-tooltip="Toggle Theme" id="theme-btn">${this.theme === 'dark' ? icons.sun : icons.moon}</button>
      </div>
    `;
    app.appendChild(titleBar);

    // IDE Body
    const body = document.createElement('div');
    body.className = 'ide-body';

    // Sidebar resize handle
    body.appendChild(this.sidebar.renderActivityBar());
    body.appendChild(this.sidebar.renderSidebar());

    // Sidebar resize
    const sidebarResize = document.createElement('div');
    sidebarResize.className = 'resize-handle resize-handle--vertical';
    sidebarResize.id = 'sidebar-resize';
    body.appendChild(sidebarResize);

    // Main Area
    const mainArea = document.createElement('div');
    mainArea.className = 'main-area';

    // Editor Area
    const editorArea = document.createElement('div');
    editorArea.className = 'editor-area';
    editorArea.appendChild(this.tabBar.render());

    const editorContent = document.createElement('div');
    editorContent.className = 'editor-content';
    editorContent.id = 'editor-content';

    // Welcome screen
    const welcome = document.createElement('div');
    welcome.className = 'welcome-screen';
    welcome.id = 'welcome-screen';
    welcome.innerHTML = `
      <div class="welcome-screen__hero">
        <div class="welcome-screen__logo">${icons.sparkles}</div>
        <h1 class="welcome-screen__title">Vibe Code IDE</h1>
        <p class="welcome-screen__subtitle">AI-powered coding environment. Build anything with natural language using the most capable AI models.</p>
      </div>
      <div class="welcome-screen__shortcuts">
        <div class="welcome-shortcut" data-action="new-file">
          <span class="welcome-shortcut__icon">${icons.plus}</span>
          <div class="welcome-shortcut__content">
            <span class="welcome-shortcut__label">New File</span>
            <span class="welcome-shortcut__desc">Create a new file in the explorer</span>
          </div>
          <span class="welcome-shortcut__key">Ctrl+N</span>
        </div>
        <div class="welcome-shortcut" data-action="command-palette">
          <span class="welcome-shortcut__icon">${icons.search}</span>
          <div class="welcome-shortcut__content">
            <span class="welcome-shortcut__label">Command Palette</span>
            <span class="welcome-shortcut__desc">Search all commands and actions</span>
          </div>
          <span class="welcome-shortcut__key">Ctrl+Shift+P</span>
        </div>
        <div class="welcome-shortcut" data-action="toggle-ai-chat">
          <span class="welcome-shortcut__icon">${icons.sparkles}</span>
          <div class="welcome-shortcut__content">
            <span class="welcome-shortcut__label">AI Chat</span>
            <span class="welcome-shortcut__desc">Talk to Vibe AI assistant</span>
          </div>
          <span class="welcome-shortcut__key">Ctrl+L</span>
        </div>
        <div class="welcome-shortcut" data-action="toggle-terminal">
          <span class="welcome-shortcut__icon">${icons.terminal}</span>
          <div class="welcome-shortcut__content">
            <span class="welcome-shortcut__label">Terminal</span>
            <span class="welcome-shortcut__desc">Open integrated terminal</span>
          </div>
          <span class="welcome-shortcut__key">Ctrl+\`</span>
        </div>
        <div class="welcome-shortcut" data-action="open-settings">
          <span class="welcome-shortcut__icon">${icons.settings}</span>
          <div class="welcome-shortcut__content">
            <span class="welcome-shortcut__label">Settings</span>
            <span class="welcome-shortcut__desc">Configure editor and AI models</span>
          </div>
          <span class="welcome-shortcut__key">Ctrl+,</span>
        </div>
        <div class="welcome-shortcut" data-action="toggle-preview">
          <span class="welcome-shortcut__icon">${icons.eye}</span>
          <div class="welcome-shortcut__content">
            <span class="welcome-shortcut__label">Preview</span>
            <span class="welcome-shortcut__desc">Live preview your project</span>
          </div>
          <span class="welcome-shortcut__key">Ctrl+.</span>
        </div>
      </div>
    `;
    editorContent.appendChild(welcome);
    this.editor.mount(editorContent);
    editorArea.appendChild(editorContent);
    mainArea.appendChild(editorArea);

    // Resize Handle (panel)
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.id = 'panel-resize';
    mainArea.appendChild(resizeHandle);

    // Bottom Panel
    const bottomPanel = document.createElement('div');
    bottomPanel.className = `bottom-panel ${this.showPanel ? '' : 'collapsed'}`;
    bottomPanel.id = 'bottom-panel';

    const panelHeader = document.createElement('div');
    panelHeader.className = 'bottom-panel__header';
    panelHeader.innerHTML = `
      <button class="bottom-panel__tab active" data-panel-tab="terminal">Terminal</button>
      <button class="bottom-panel__tab" data-panel-tab="problems">Problems</button>
      <button class="bottom-panel__tab" data-panel-tab="output">Output</button>
      <span class="bottom-panel__spacer"></span>
      <button class="bottom-panel__close tooltip" data-tooltip="Close Panel" id="panel-close">${icons.close}</button>
    `;
    bottomPanel.appendChild(panelHeader);

    const panelContent = document.createElement('div');
    panelContent.className = 'bottom-panel__content';
    panelContent.id = 'panel-content';
    panelContent.appendChild(this.terminal.render());
    bottomPanel.appendChild(panelContent);
    mainArea.appendChild(bottomPanel);
    body.appendChild(mainArea);

    // Right Panel resize handle
    const rightResize = document.createElement('div');
    rightResize.className = 'resize-handle resize-handle--vertical';
    rightResize.id = 'right-resize';
    body.appendChild(rightResize);

    // Right Panel (AI Chat)
    const rightPanel = document.createElement('div');
    rightPanel.className = `right-panel ${this.showAIChat ? '' : 'collapsed'}`;
    rightPanel.id = 'right-panel';
    rightPanel.appendChild(this.aiChat.render());
    body.appendChild(rightPanel);

    app.appendChild(body);
    app.appendChild(this.statusBar.render());
  }

  _bindEvents() {
    // File open
    eventBus.on('file:open', ({ path }) => {
      this.tabBar.addTab(path);
      this.editor.openFile(path);
      const welcome = document.getElementById('welcome-screen');
      if (welcome) welcome.style.display = 'none';
      const lang = this.fs.getLanguage(path);
      const langNames = { javascript: 'JavaScript', html: 'HTML', css: 'CSS', json: 'JSON', markdown: 'Markdown', python: 'Python', typescript: 'TypeScript', text: 'Plain Text', xml: 'XML' };
      this.statusBar.setInfo({ language: langNames[lang] || lang });
    });

    // Tab closed
    eventBus.on('tab:closed', ({ path }) => {
      this.editor.closeFile(path);
      if (this.tabBar.tabs.length === 0) {
        const welcome = document.getElementById('welcome-screen');
        if (welcome) welcome.style.display = '';
        this.statusBar.setInfo({ language: 'Plain Text', line: 1, col: 1, words: 0 });
      }
    });

    // Sidebar changed
    eventBus.on('sidebar:changed', ({ panel, collapsed }) => {
      const sidebarEl = document.getElementById('sidebar');
      if (collapsed) {
        sidebarEl?.classList.add('collapsed');
      } else {
        sidebarEl?.classList.remove('collapsed');
        this._setSidebarPanel(panel);
      }
    });

    // Model changed
    eventBus.on('model:changed', ({ modelId }) => {
      const info = getModelInfo(modelId);
      if (info) this.statusBar.setInfo({ model: info.name });
    });

    // Agent execute
    eventBus.on('agent:execute', ({ skillId }) => {
      const code = this.editor.getActiveContent() || '';
      const language = this.editor.getActiveLanguage() || 'javascript';
      const skill = getSkillById(skillId);
      const prompt = buildSkillPrompt(skillId, code, language);
      const skillName = skill ? skill.name : skillId;

      this._showNotification('info', `Running ${skillName}...`);

      this.ai.sendMessage(prompt.user, null).then(response => {
        this.aiChat.addAgentResponse(`### ${skill?.icon || '✨'} ${skillName}\n\n${response}`);
        if (!this.showAIChat) {
          this.showAIChat = true;
          document.getElementById('right-panel')?.classList.remove('collapsed');
        }
      }).catch(err => {
        this.aiChat.addAgentResponse(`**${skillName} failed:** ${err.message}`);
      });
    });

    // New file/folder from context menu (with dir target)
    eventBus.on('request:new-file', ({ dirPath }) => this._newFile(dirPath || '/'));
    eventBus.on('request:new-folder', ({ dirPath }) => this._newFolder(dirPath || '/'));

    // Editor font/tab size from settings
    eventBus.on('editor:font-size', ({ size }) => this.editor.setFontSize(size));
    eventBus.on('editor:tab-size', ({ size }) => this.editor.setTabSize(size));

    // Shortcuts
    eventBus.on('shortcut', ({ action }) => {
      const handlers = {
        'command-palette': () => this.commandPalette.toggle(),
        'toggle-sidebar': () => this.sidebar.toggleCollapse(),
        'toggle-terminal': () => this._togglePanel(),
        'toggle-panel': () => this._togglePanel(),
        'toggle-ai-chat': () => this._toggleAIChat(),
        'toggle-preview': () => this._togglePreview(),
        'toggle-theme': () => this._toggleTheme(),
        'new-file': () => this._newFile('/'),
        'new-folder': () => this._newFolder('/'),
        'close-tab': () => { if (this.tabBar.activeTab) this.tabBar.removeTab(this.tabBar.activeTab); },
        'save-file': () => this._showNotification('success', 'File saved'),
        'open-settings': () => this._openSettings(),
        'search-project': () => this._openSearch(),
        'reset-workspace': () => this._resetWorkspace(),
        'ai-generate': () => eventBus.emit('agent:execute', { skillId: 'generate' }),
        'ai-explain': () => eventBus.emit('agent:execute', { skillId: 'explain' }),
      };
      if (handlers[action]) handlers[action]();
    });

    // Notifications
    eventBus.on('notification', ({ type, text }) => this._showNotification(type, text));

    // Title bar
    document.getElementById('title-search')?.addEventListener('click', () => this.commandPalette.open());
    document.getElementById('theme-btn')?.addEventListener('click', () => this._toggleTheme());
    document.getElementById('preview-btn')?.addEventListener('click', () => this._togglePreview());
    document.getElementById('panel-close')?.addEventListener('click', () => this._togglePanel());

    // Panel tabs
    document.querySelectorAll('[data-panel-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('[data-panel-tab]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });

    // Welcome shortcuts
    document.querySelectorAll('.welcome-shortcut').forEach(shortcut => {
      shortcut.addEventListener('click', () => {
        eventBus.emit('shortcut', { action: shortcut.dataset.action });
      });
    });

    // Panel resize
    this._initPanelResize();
    this._initSidebarResize();
    this._initRightPanelResize();
  }

  _setSidebarPanel(panel) {
    const contentMap = {
      explorer: () => this.sidebar.setSidebarContent('Explorer', this.fileExplorer.render()),
      search: () => this.sidebar.setSidebarContent('Search', this._createSearchPanel()),
      skills: () => this.sidebar.setSidebarContent('Agent Skills', this.skillsExplorer.render()),
      git: () => this.sidebar.setSidebarContent('Source Control', `<div class="sidebar__empty"><div class="sidebar__empty-icon">${icons.git}</div><p>No source control providers registered.</p><p>Initialize a repository to get started.</p><button class="btn btn--secondary btn--sm" style="margin-top:var(--space-3);" onclick="eventBus && eventBus.emit('notification',{type:'info',text:'Git integration coming soon!'})">${icons.git} Initialize Repository</button></div>`),
      settings: () => this.sidebar.setSidebarContent('Settings', this.settings.render()),
    };
    if (contentMap[panel]) contentMap[panel]();
  }

  _createSearchPanel() {
    const el = document.createElement('div');
    el.className = 'search-panel';
    el.innerHTML = `
      <div class="search-panel__input-wrapper">
        ${icons.search}
        <input class="search-panel__input" placeholder="Search in files..." id="search-input" />
        <button class="search-panel__options-btn tooltip" data-tooltip="Match Case" id="search-case" title="Aa">Aa</button>
        <button class="search-panel__options-btn tooltip" data-tooltip="Match Whole Word" id="search-word" title="W">W</button>
        <button class="search-panel__options-btn tooltip" data-tooltip="Regex" id="search-regex" title=".*">.*</button>
      </div>
      <div class="search-panel__results" id="search-results">
        <div style="padding:var(--space-4);color:var(--color-text-muted);font-size:var(--text-sm);">Type to search across all files</div>
      </div>
    `;

    // Wire up search
    setTimeout(() => {
      const input = el.querySelector('#search-input');
      const results = el.querySelector('#search-results');
      if (!input || !results) return;

      input.addEventListener('input', () => {
        const query = input.value.trim();
        if (!query) {
          results.innerHTML = `<div style="padding:var(--space-4);color:var(--color-text-muted);font-size:var(--text-sm);">Type to search across all files</div>`;
          return;
        }

        const allFiles = this._getAllFiles('/');
        const matches = [];
        allFiles.forEach(filePath => {
          const content = this.fs.readFile(filePath);
          if (!content) return;
          const lines = content.split('\n');
          lines.forEach((line, lineIdx) => {
            if (line.toLowerCase().includes(query.toLowerCase())) {
              matches.push({ filePath, line, lineNum: lineIdx + 1 });
            }
          });
        });

        if (!matches.length) {
          results.innerHTML = `<div style="padding:var(--space-4);color:var(--color-text-muted);font-size:var(--text-sm);">No results for "${query}"</div>`;
          return;
        }

        const grouped = {};
        matches.forEach(m => {
          if (!grouped[m.filePath]) grouped[m.filePath] = [];
          grouped[m.filePath].push(m);
        });

        results.innerHTML = Object.entries(grouped).map(([filePath, fileMatches]) => {
          const fileName = filePath.split('/').pop();
          const matchItems = fileMatches.slice(0, 10).map(m => {
            const escaped = m.line.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const highlighted = escaped.replace(new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), `<span class="search-result__highlight">$&</span>`);
            return `<div class="search-result__match" data-file="${filePath}" data-line="${m.lineNum}">
              <span style="color:var(--color-text-muted);font-size:10px;margin-right:6px;">${m.lineNum}</span>${highlighted}
            </div>`;
          }).join('');
          return `<div class="search-result">
            <div class="search-result__file" data-file="${filePath}">${icons.file} ${fileName} <span style="color:var(--color-text-muted)">(${fileMatches.length} match${fileMatches.length !== 1 ? 'es' : ''})</span></div>
            ${matchItems}
          </div>`;
        }).join('');

        results.querySelectorAll('[data-file]').forEach(el => {
          el.style.cursor = 'pointer';
          el.addEventListener('click', () => {
            eventBus.emit('file:open', { path: el.dataset.file });
          });
        });
      });

      input.focus();
    }, 100);

    return el;
  }

  _getAllFiles(dirPath) {
    const files = [];
    const items = this.fs.listDir(dirPath);
    items.forEach(item => {
      if (item.type === 'file') files.push(item.path);
      else if (item.type === 'directory') files.push(...this._getAllFiles(item.path));
    });
    return files;
  }

  _togglePanel() {
    this.showPanel = !this.showPanel;
    const panel = document.getElementById('bottom-panel');
    if (panel) panel.classList.toggle('collapsed', !this.showPanel);
    storage.set('show-panel', this.showPanel);
    if (this.showPanel) setTimeout(() => this.terminal.focus(), 100);
  }

  _toggleAIChat() {
    this.showAIChat = !this.showAIChat;
    const panel = document.getElementById('right-panel');
    const resize = document.getElementById('right-resize');
    if (panel) panel.classList.toggle('collapsed', !this.showAIChat);
    if (resize) resize.style.display = this.showAIChat ? '' : 'none';
    storage.set('show-ai-chat', this.showAIChat);
  }

  _togglePreview() {
    this.showPreview = !this.showPreview;
    const existing = document.getElementById('preview-container');
    if (this.showPreview) {
      if (!existing) {
        const container = document.createElement('div');
        container.id = 'preview-container';
        container.className = 'preview-container';
        container.appendChild(this.preview.render());
        const editorArea = document.querySelector('.editor-area');
        if (editorArea) {
          editorArea.style.flexDirection = 'row';
          const editorContent = document.getElementById('editor-content');
          if (editorContent) editorContent.style.flex = '1';
          editorArea.appendChild(container);
        }
      }
      this._showNotification('info', 'Preview opened');
    } else {
      if (existing) {
        existing.remove();
        const editorArea = document.querySelector('.editor-area');
        if (editorArea) editorArea.style.flexDirection = 'column';
      }
    }
  }

  _toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    if (this.theme === 'light') {
      document.documentElement.dataset.theme = 'light';
    } else {
      delete document.documentElement.dataset.theme;
    }
    storage.set('theme', this.theme);
    const btn = document.getElementById('theme-btn');
    if (btn) btn.innerHTML = this.theme === 'dark' ? icons.sun : icons.moon;
    // Reload editor theme
    this.editor.reloadTheme();
  }

  _newFile(dirPath = '/') {
    this._showModal({
      title: 'New File',
      icon: icons.plus,
      placeholder: 'filename.js',
      label: 'File name',
      confirmText: 'Create',
      onConfirm: (name) => {
        if (!name) return;
        if (this.fs.createFile(dirPath, name)) {
          const filePath = (dirPath === '/' ? '' : dirPath) + '/' + name;
          this.fileExplorer.refresh();
          eventBus.emit('file:open', { path: filePath });
          this._showNotification('success', `Created ${name}`);
        } else {
          this._showNotification('error', `File "${name}" already exists`);
        }
      }
    });
  }

  _newFolder(dirPath = '/') {
    this._showModal({
      title: 'New Folder',
      icon: icons.folder,
      placeholder: 'folder-name',
      label: 'Folder name',
      confirmText: 'Create',
      onConfirm: (name) => {
        if (!name) return;
        if (this.fs.createDirectory(dirPath, name)) {
          this.fileExplorer.refresh();
          this._showNotification('success', `Created folder ${name}`);
        } else {
          this._showNotification('error', `Folder "${name}" already exists`);
        }
      }
    });
  }

  _showModal({ title, icon, placeholder, label, confirmText, onConfirm }) {
    const existing = document.getElementById('app-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'app-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal__header">
          <span class="modal__title">${icon || ''} ${title}</span>
          <button class="modal__close" id="modal-close">${icons.close}</button>
        </div>
        <div class="modal__body">
          <label class="modal__label">${label}</label>
          <input class="modal__input" id="modal-input" placeholder="${placeholder}" autofocus />
        </div>
        <div class="modal__footer">
          <button class="btn btn--secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn--primary" id="modal-confirm">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = overlay.querySelector('#modal-input');
    const close = () => overlay.remove();

    overlay.querySelector('#modal-close').addEventListener('click', close);
    overlay.querySelector('#modal-cancel').addEventListener('click', close);
    overlay.querySelector('#modal-confirm').addEventListener('click', () => {
      const val = input.value.trim();
      if (val) { close(); onConfirm(val); }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { const val = input.value.trim(); if (val) { close(); onConfirm(val); } }
      if (e.key === 'Escape') close();
    });

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    setTimeout(() => input?.focus(), 50);
  }

  _openSettings() {
    this.sidebar.activePanel = 'settings';
    this.sidebar.isCollapsed = false;
    document.getElementById('sidebar')?.classList.remove('collapsed');
    this._setSidebarPanel('settings');
    // Update activity bar buttons
    document.querySelectorAll('.activity-bar__btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.panel === 'settings');
    });
  }

  _openSearch() {
    this.sidebar.activePanel = 'search';
    this.sidebar.isCollapsed = false;
    document.getElementById('sidebar')?.classList.remove('collapsed');
    this._setSidebarPanel('search');
    document.querySelectorAll('.activity-bar__btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.panel === 'search');
    });
  }

  _resetWorkspace() {
    this._showModal({
      title: 'Reset Workspace',
      icon: icons.refresh,
      placeholder: 'Type "reset" to confirm',
      label: 'This will clear all files and settings. Type "reset" to confirm.',
      confirmText: 'Reset',
      onConfirm: (val) => {
        if (val === 'reset') {
          this.fs.resetToDefault();
          storage.clear();
          location.reload();
        } else {
          this._showNotification('error', 'Type "reset" to confirm');
        }
      }
    });
  }

  _showNotification(type, text) {
    // Stack notifications
    const existing = document.querySelectorAll('.notification');
    const offset = existing.length * 58;

    const notif = document.createElement('div');
    notif.className = `notification notification--${type}`;
    notif.style.bottom = `calc(${40 + offset}px)`;
    const iconName = type === 'success' ? 'check' : type === 'error' ? 'alert' : 'info';
    notif.innerHTML = `
      <span class="notification__icon">${icons[iconName]}</span>
      <span class="notification__text">${text}</span>
      <button class="notification__close">${icons.close}</button>
    `;
    document.body.appendChild(notif);
    notif.querySelector('.notification__close').addEventListener('click', () => notif.remove());
    setTimeout(() => {
      notif.style.opacity = '0';
      notif.style.transform = 'translateY(8px)';
      setTimeout(() => notif.remove(), 300);
    }, 4000);
  }

  _initPanelResize() {
    const handle = document.getElementById('panel-resize');
    if (!handle) return;
    let startY, startH;
    const panel = document.getElementById('bottom-panel');

    handle.addEventListener('mousedown', (e) => {
      startY = e.clientY;
      startH = panel.offsetHeight;
      handle.classList.add('active');
      const onMove = (e) => {
        const delta = startY - e.clientY;
        panel.style.height = Math.max(80, Math.min(700, startH + delta)) + 'px';
      };
      const onUp = () => {
        handle.classList.remove('active');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  _initSidebarResize() {
    const handle = document.getElementById('sidebar-resize');
    if (!handle) return;
    let startX, startW;
    const sidebar = document.getElementById('sidebar');

    handle.addEventListener('mousedown', (e) => {
      if (!sidebar || sidebar.classList.contains('collapsed')) return;
      startX = e.clientX;
      startW = sidebar.offsetWidth;
      handle.classList.add('active');
      document.body.style.cursor = 'col-resize';
      const onMove = (e) => {
        const delta = e.clientX - startX;
        sidebar.style.width = Math.max(160, Math.min(500, startW + delta)) + 'px';
      };
      const onUp = () => {
        handle.classList.remove('active');
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  _initRightPanelResize() {
    const handle = document.getElementById('right-resize');
    if (!handle) return;
    let startX, startW;
    const panel = document.getElementById('right-panel');

    handle.addEventListener('mousedown', (e) => {
      if (!panel || panel.classList.contains('collapsed')) return;
      startX = e.clientX;
      startW = panel.offsetWidth;
      handle.classList.add('active');
      document.body.style.cursor = 'col-resize';
      const onMove = (e) => {
        const delta = startX - e.clientX;
        panel.style.width = Math.max(260, Math.min(700, startW + delta)) + 'px';
      };
      const onUp = () => {
        handle.classList.remove('active');
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }
}
