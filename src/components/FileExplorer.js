// File Explorer Component — with context menu, inline rename, drag support
import { eventBus } from '../utils/EventBus.js';
import { icons } from './Icons.js';

export class FileExplorer {
  constructor(fileSystem) {
    this.fs = fileSystem;
    this.expandedDirs = new Set(['/']);
    this.selectedPath = null;
    this.renamingPath = null;
    this.el = null;
    this._contextMenu = null;
  }

  render() {
    const el = document.createElement('div');
    el.className = 'file-tree';
    el.id = 'file-explorer';
    el.innerHTML = this._renderDir('/');
    this.el = el;
    this._attachEvents();
    return el;
  }

  _renderDir(dirPath, depth = 0) {
    const items = this.fs.listDir(dirPath);
    return items.map(item => {
      const indent = depth * 12;
      if (item.type === 'directory') {
        const isOpen = this.expandedDirs.has(item.path);
        const children = isOpen ? `<div class="file-tree__children">${this._renderDir(item.path, depth + 1)}</div>` : '';
        return `<div class="file-tree__item ${this.selectedPath === item.path ? 'active' : ''}" data-path="${item.path}" data-type="directory" style="padding-left:${8 + indent}px">
          <span class="file-tree__chevron ${isOpen ? 'open' : ''}">${icons.chevronRight}</span>
          <span class="file-tree__icon ${isOpen ? 'file-icon--folder-open' : 'file-icon--folder'}">${isOpen ? icons.folderOpen : icons.folder}</span>
          ${this.renamingPath === item.path
            ? `<input class="file-tree__rename-input" data-rename="${item.path}" value="${item.name}" />`
            : `<span class="file-tree__name">${item.name}</span>`}
        </div>${children}`;
      } else {
        const ext = item.name.split('.').pop();
        const iconClass = this._getFileIconClass(ext);
        return `<div class="file-tree__item ${this.selectedPath === item.path ? 'active' : ''}" data-path="${item.path}" data-type="file" style="padding-left:${24 + indent}px">
          <span class="file-tree__icon ${iconClass}">${icons.file}</span>
          ${this.renamingPath === item.path
            ? `<input class="file-tree__rename-input" data-rename="${item.path}" value="${item.name}" />`
            : `<span class="file-tree__name">${item.name}</span>`}
        </div>`;
      }
    }).join('');
  }

  _getFileIconClass(ext) {
    const map = { js: 'file-icon--js', jsx: 'file-icon--js', ts: 'file-icon--ts', tsx: 'file-icon--ts', html: 'file-icon--html', css: 'file-icon--css', json: 'file-icon--json', md: 'file-icon--md', py: 'file-icon--py' };
    return map[ext] || '';
  }

  _attachEvents() {
    this.el.addEventListener('click', (e) => {
      if (e.target.classList.contains('file-tree__rename-input')) return;
      const item = e.target.closest('.file-tree__item');
      if (!item) return;
      const path = item.dataset.path;
      const type = item.dataset.type;

      if (type === 'directory') {
        if (this.expandedDirs.has(path)) {
          this.expandedDirs.delete(path);
        } else {
          this.expandedDirs.add(path);
        }
        this.selectedPath = path;
        this.refresh();
      } else {
        this.selectedPath = path;
        eventBus.emit('file:open', { path });
        this.refresh();
      }
    });

    this.el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const item = e.target.closest('.file-tree__item');
      const path = item ? item.dataset.path : null;
      const type = item ? item.dataset.type : null;
      this._showContextMenu(e.clientX, e.clientY, path, type);
    });

    this.el.addEventListener('keydown', (e) => {
      if (!e.target.classList.contains('file-tree__rename-input')) return;
      if (e.key === 'Enter') {
        this._commitRename(e.target);
      } else if (e.key === 'Escape') {
        this.renamingPath = null;
        this.refresh();
      }
    });

    this.el.addEventListener('blur', (e) => {
      if (e.target.classList.contains('file-tree__rename-input')) {
        this._commitRename(e.target);
      }
    }, true);

    eventBus.on('file:created', () => this.refresh());
    eventBus.on('file:deleted', () => this.refresh());
    eventBus.on('file:renamed', () => this.refresh());
    eventBus.on('filesystem:reset', () => {
      this.expandedDirs = new Set(['/']);
      this.selectedPath = null;
      this.refresh();
    });
  }

  _commitRename(input) {
    const oldPath = input.dataset.rename;
    const newName = input.value.trim();
    if (!newName || !oldPath) {
      this.renamingPath = null;
      this.refresh();
      return;
    }
    const parts = oldPath.split('/');
    const oldName = parts[parts.length - 1];
    if (newName !== oldName) {
      this.fs.rename(oldPath, newName);
      eventBus.emit('notification', { type: 'success', text: `Renamed to ${newName}` });
    }
    this.renamingPath = null;
    this.refresh();
  }

  _showContextMenu(x, y, path, type) {
    this._closeContextMenu();

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.id = 'file-context-menu';

    let items = [];
    if (path && type === 'file') {
      items = [
        { label: 'Open', icon: 'file', action: () => eventBus.emit('file:open', { path }) },
        { separator: true },
        { label: 'Rename', icon: 'edit', action: () => this._startRename(path) },
        { label: 'Delete', icon: 'trash', action: () => this._deleteFile(path), danger: true },
        { separator: true },
        { label: 'New File Here', icon: 'plus', action: () => eventBus.emit('request:new-file', { dirPath: this._getParentPath(path) }) },
        { label: 'New Folder Here', icon: 'folder', action: () => eventBus.emit('request:new-folder', { dirPath: this._getParentPath(path) }) },
      ];
    } else if (path && type === 'directory') {
      items = [
        { label: 'New File', icon: 'plus', action: () => { this.expandedDirs.add(path); eventBus.emit('request:new-file', { dirPath: path }); } },
        { label: 'New Folder', icon: 'folder', action: () => { this.expandedDirs.add(path); eventBus.emit('request:new-folder', { dirPath: path }); } },
        { separator: true },
        { label: 'Rename', icon: 'edit', action: () => this._startRename(path) },
        { label: 'Delete Folder', icon: 'trash', action: () => this._deleteFile(path), danger: true },
      ];
    } else {
      items = [
        { label: 'New File', icon: 'plus', action: () => eventBus.emit('request:new-file', { dirPath: '/' }) },
        { label: 'New Folder', icon: 'folder', action: () => eventBus.emit('request:new-folder', { dirPath: '/' }) },
      ];
    }

    menu.innerHTML = items.map(item => {
      if (item.separator) return `<div class="context-menu__separator"></div>`;
      return `<div class="context-menu__item ${item.danger ? 'context-menu__item--danger' : ''}">
        <span class="context-menu__icon">${icons[item.icon] || ''}</span>
        <span>${item.label}</span>
      </div>`;
    }).join('');

    document.body.appendChild(menu);
    this._contextMenu = menu;

    // Correct position after render
    requestAnimationFrame(() => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const w = menu.offsetWidth, h = menu.offsetHeight;
      menu.style.left = Math.min(x, vw - w - 8) + 'px';
      menu.style.top = Math.min(y, vh - h - 8) + 'px';
    });

    const actionItems = items.filter(i => !i.separator);
    menu.querySelectorAll('.context-menu__item').forEach((el, i) => {
      el.addEventListener('click', () => {
        this._closeContextMenu();
        actionItems[i].action();
      });
    });

    const close = (e) => {
      if (!menu.contains(e.target)) {
        this._closeContextMenu();
        document.removeEventListener('mousedown', close);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', close), 0);
  }

  _closeContextMenu() {
    if (this._contextMenu) {
      this._contextMenu.remove();
      this._contextMenu = null;
    }
  }

  _startRename(path) {
    this.renamingPath = path;
    const parts = path.split('/');
    parts.pop();
    const parent = parts.join('/') || '/';
    this.expandedDirs.add(parent);
    this.refresh();
    setTimeout(() => {
      const input = this.el?.querySelector(`.file-tree__rename-input[data-rename="${path}"]`);
      if (input) { input.focus(); input.select(); }
    }, 50);
  }

  _deleteFile(path) {
    const name = path.split('/').pop();
    this.fs.deleteNode(path);
    if (this.selectedPath === path) this.selectedPath = null;
    this.refresh();
    eventBus.emit('notification', { type: 'info', text: `Deleted ${name}` });
  }

  _getParentPath(path) {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/') || '/';
  }

  refresh() {
    if (this.el) {
      this.el.innerHTML = this._renderDir('/');
    }
  }
}
