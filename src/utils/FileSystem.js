// FileSystem — Virtual in-browser file system
import { storage } from './storage.js';
import { eventBus } from './EventBus.js';

const DEFAULT_FILES = {
  '/': { type: 'directory', children: ['src', 'public', 'index.html', 'package.json', 'README.md'] },
  '/src': { type: 'directory', children: ['main.js', 'styles.css', 'App.js', 'components'] },
  '/src/components': { type: 'directory', children: ['Header.js', 'Footer.js'] },
  '/public': { type: 'directory', children: ['favicon.svg'] },
  '/index.html': {
    type: 'file', language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Vibe App</title>
  <link rel="stylesheet" href="/src/styles.css" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"><\/script>
</body>
</html>`
  },
  '/package.json': {
    type: 'file', language: 'json',
    content: `{
  "name": "my-vibe-app",
  "version": "1.0.0",
  "description": "Built with Vibe Code IDE",
  "main": "src/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}`
  },
  '/README.md': {
    type: 'file', language: 'markdown',
    content: `# My Vibe App\n\nBuilt with ❤️ using Vibe Code IDE.\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`
  },
  '/src/main.js': {
    type: 'file', language: 'javascript',
    content: `import { App } from './App.js';\nimport './styles.css';\n\nconst app = new App();\napp.mount('#app');\n\nconsole.log('🚀 Vibe App is running!');\n`
  },
  '/src/styles.css': {
    type: 'file', language: 'css',
    content: `/* Vibe App Styles */\n:root {\n  --primary: #6366f1;\n  --bg: #0a0e1a;\n  --text: #e2e8f0;\n}\n\n* { margin: 0; padding: 0; box-sizing: border-box; }\n\nbody {\n  font-family: 'Inter', sans-serif;\n  background: var(--bg);\n  color: var(--text);\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n#app {\n  text-align: center;\n  padding: 2rem;\n}\n\nh1 {\n  font-size: 3rem;\n  background: linear-gradient(135deg, #6366f1, #a855f7);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n`
  },
  '/src/App.js': {
    type: 'file', language: 'javascript',
    content: `export class App {\n  constructor() {\n    this.name = 'Vibe App';\n  }\n\n  mount(selector) {\n    const el = document.querySelector(selector);\n    el.innerHTML = \`\n      <h1>\${this.name}</h1>\n      <p>Welcome to your new project!</p>\n    \`;\n  }\n}\n`
  },
  '/src/components/Header.js': {
    type: 'file', language: 'javascript',
    content: `export function Header(title) {\n  return \`<header><h1>\${title}</h1></header>\`;\n}\n`
  },
  '/src/components/Footer.js': {
    type: 'file', language: 'javascript',
    content: `export function Footer() {\n  return \`<footer><p>&copy; 2026 Vibe App</p></footer>\`;\n}\n`
  },
  '/public/favicon.svg': {
    type: 'file', language: 'xml',
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#6366f1"/><text x="16" y="22" font-size="18" font-weight="bold" fill="white" text-anchor="middle">V</text></svg>`
  }
};

export class FileSystem {
  constructor() {
    this.files = storage.get('filesystem', null) || JSON.parse(JSON.stringify(DEFAULT_FILES));
    this.save();
  }

  save() {
    storage.set('filesystem', this.files);
  }

  getNode(path) {
    return this.files[path] || null;
  }

  isDirectory(path) {
    const node = this.getNode(path);
    return node && node.type === 'directory';
  }

  listDir(path) {
    const node = this.getNode(path);
    if (!node || node.type !== 'directory') return [];
    return (node.children || []).map(name => {
      const childPath = path === '/' ? `/${name}` : `${path}/${name}`;
      const childNode = this.getNode(childPath);
      return { name, path: childPath, type: childNode ? childNode.type : 'file' };
    }).sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'directory' ? -1 : 1;
    });
  }

  readFile(path) {
    const node = this.getNode(path);
    return node && node.type === 'file' ? node.content : null;
  }

  writeFile(path, content) {
    const node = this.getNode(path);
    if (node && node.type === 'file') {
      node.content = content;
      this.save();
      eventBus.emit('file:changed', { path, content });
    }
  }

  createFile(parentPath, name, content = '') {
    const parent = this.getNode(parentPath);
    if (!parent || parent.type !== 'directory') return false;
    const filePath = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;
    if (this.files[filePath]) return false;
    const ext = name.split('.').pop();
    const langMap = { js: 'javascript', ts: 'typescript', html: 'html', css: 'css', json: 'json', md: 'markdown', py: 'python', jsx: 'javascript', tsx: 'typescript' };
    this.files[filePath] = { type: 'file', language: langMap[ext] || 'text', content };
    parent.children.push(name);
    this.save();
    eventBus.emit('file:created', { path: filePath });
    return true;
  }

  createDirectory(parentPath, name) {
    const parent = this.getNode(parentPath);
    if (!parent || parent.type !== 'directory') return false;
    const dirPath = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;
    if (this.files[dirPath]) return false;
    this.files[dirPath] = { type: 'directory', children: [] };
    parent.children.push(name);
    this.save();
    eventBus.emit('file:created', { path: dirPath });
    return true;
  }

  deleteNode(path) {
    if (path === '/') return false;
    const parts = path.split('/');
    const name = parts.pop();
    const parentPath = parts.join('/') || '/';
    const parent = this.getNode(parentPath);
    if (!parent) return false;
    parent.children = parent.children.filter(c => c !== name);
    const node = this.getNode(path);
    if (node && node.type === 'directory') {
      (node.children || []).forEach(child => {
        this.deleteNode(path === '/' ? `/${child}` : `${path}/${child}`);
      });
    }
    delete this.files[path];
    this.save();
    eventBus.emit('file:deleted', { path });
    return true;
  }

  rename(path, newName) {
    if (path === '/') return false;
    const parts = path.split('/');
    const oldName = parts.pop();
    const parentPath = parts.join('/') || '/';
    const parent = this.getNode(parentPath);
    if (!parent) return false;
    const newPath = parentPath === '/' ? `/${newName}` : `${parentPath}/${newName}`;
    this.files[newPath] = this.files[path];
    delete this.files[path];
    parent.children = parent.children.map(c => c === oldName ? newName : c);
    this.save();
    eventBus.emit('file:renamed', { oldPath: path, newPath });
    return true;
  }

  getLanguage(path) {
    const node = this.getNode(path);
    return node ? node.language || 'text' : 'text';
  }

  resetToDefault() {
    this.files = JSON.parse(JSON.stringify(DEFAULT_FILES));
    this.save();
    eventBus.emit('filesystem:reset');
  }
}
