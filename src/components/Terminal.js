// Terminal Component — Enhanced with more commands, colored output, file system integration
import { eventBus } from '../utils/EventBus.js';

export class Terminal {
  constructor(fileSystem) {
    this.fs = fileSystem;
    this.history = [];
    this.commandHistory = [];
    this.historyIndex = -1;
    this.cwd = '/';
    this.env = { PATH: '/usr/local/bin:/usr/bin:/bin', USER: 'vibe-coder', HOME: '/home/vibe-coder', SHELL: '/bin/bash' };
    this.el = null;
    this._addLine('welcome', '⚡ Vibe Code IDE — Integrated Terminal');
    this._addLine('info', `Type "help" for available commands.  cwd: ${this.cwd}\n`);
  }

  render() {
    const el = document.createElement('div');
    el.className = 'terminal-output';
    el.id = 'terminal';
    this.el = el;
    this._update();
    return el;
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  _addLine(type, text) {
    this.history.push({ type, text: String(text) });
  }

  _update() {
    if (!this.el) return;
    const promptDisplay = `<span class="terminal-output__user">${this.env.USER}</span><span class="terminal-output__at">@</span><span class="terminal-output__host">vibe</span><span class="terminal-output__colon">:</span><span class="terminal-output__cwd">${this._cwdDisplay()}</span><span class="terminal-output__dollar"> $</span>`;

    this.el.innerHTML = this.history.map(line => {
      if (line.type === 'prompt') {
        return `<div class="terminal-output__line">${promptDisplay} <span class="terminal-output__command">${this._escapeHtml(line.text)}</span></div>`;
      } else if (line.type === 'error') {
        return `<div class="terminal-output__line terminal-output__error">${this._escapeHtml(line.text)}</div>`;
      } else if (line.type === 'welcome') {
        return `<div class="terminal-output__line terminal-output__welcome">${this._escapeHtml(line.text)}</div>`;
      } else if (line.type === 'info') {
        return `<div class="terminal-output__line terminal-output__info">${this._escapeHtml(line.text)}</div>`;
      } else if (line.type === 'success') {
        return `<div class="terminal-output__line terminal-output__success">${this._escapeHtml(line.text)}</div>`;
      } else if (line.type === 'html') {
        return `<div class="terminal-output__line terminal-output__result">${line.text}</div>`;
      } else {
        return `<div class="terminal-output__line terminal-output__result">${this._escapeHtml(line.text)}</div>`;
      }
    }).join('') + `<div class="terminal-input-row">${promptDisplay}<input class="terminal-input__field" id="terminal-input" spellcheck="false" autocomplete="off" /></div>`;

    const input = this.el.querySelector('#terminal-input');
    if (input) {
      input.addEventListener('keydown', (e) => this._handleKey(e));
    }
    this.el.scrollTop = this.el.scrollHeight;
  }

  _cwdDisplay() {
    if (this.cwd === '/') return '/';
    if (this.cwd === this.env.HOME) return '~';
    return this.cwd;
  }

  _handleKey(e) {
    const input = e.target;
    if (e.key === 'Enter') {
      const cmd = input.value.trim();
      if (cmd) {
        this.commandHistory.push(cmd);
        this.historyIndex = this.commandHistory.length;
        this._execute(cmd);
      } else {
        this._addLine('prompt', '');
        this._update();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        input.value = this.commandHistory[this.historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        input.value = this.commandHistory[this.historyIndex];
      } else {
        this.historyIndex = this.commandHistory.length;
        input.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this._autoComplete(input);
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      this._addLine('prompt', input.value + '^C');
      input.value = '';
      this._update();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      this.history = [];
      this._update();
    }
  }

  _autoComplete(input) {
    const val = input.value;
    const parts = val.split(' ');
    if (parts.length <= 1) return; // Don't autocomplete command names

    const partial = parts[parts.length - 1];
    const items = this.fs ? this.fs.listDir(this.cwd) : [];
    const matches = items.filter(i => i.name.startsWith(partial));
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0].name;
      input.value = parts.join(' ');
    } else if (matches.length > 1) {
      this._addLine('prompt', val);
      this._addLine('result', matches.map(m => m.name).join('  '));
      this._update();
      const inp = this.el?.querySelector('#terminal-input');
      if (inp) inp.value = val;
    }
  }

  _resolvePath(path) {
    if (!path || path === '') return this.cwd;
    if (path === '~') return this.env.HOME;
    if (path.startsWith('~/')) return this.env.HOME + '/' + path.slice(2);
    if (path.startsWith('/')) return this._normalizePath(path);
    return this._normalizePath(this.cwd === '/' ? '/' + path : this.cwd + '/' + path);
  }

  _normalizePath(p) {
    const parts = p.split('/').filter(Boolean);
    const resolved = [];
    for (const part of parts) {
      if (part === '..') resolved.pop();
      else if (part !== '.') resolved.push(part);
    }
    return '/' + resolved.join('/');
  }

  _execute(cmd) {
    this._addLine('prompt', cmd);
    const tokens = this._tokenize(cmd);
    const command = tokens[0]?.toLowerCase();
    const args = tokens.slice(1);

    const commands = {
      help: () => {
        const cmds = [
          ['help',    'Show this help message'],
          ['clear',   'Clear the terminal'],
          ['cls',     'Clear the terminal'],
          ['echo',    'Print text to stdout'],
          ['ls',      'List directory contents'],
          ['ll',      'List with details'],
          ['la',      'List all including hidden'],
          ['pwd',     'Print working directory'],
          ['cd',      'Change directory'],
          ['cat',     'Print file contents'],
          ['touch',   'Create empty file'],
          ['mkdir',   'Create directory'],
          ['rm',      'Remove file or directory'],
          ['mv',      'Move/rename a file'],
          ['cp',      'Copy a file'],
          ['find',    'Find files by name'],
          ['grep',    'Search file contents'],
          ['date',    'Show current date/time'],
          ['whoami',  'Current user'],
          ['env',     'Show environment variables'],
          ['export',  'Set environment variable'],
          ['history', 'Show command history'],
          ['node',    'Node.js REPL'],
          ['npm',     'npm package manager'],
          ['git',     'Git version control'],
          ['vibe',    'Vibe Code IDE info'],
          ['ping',    'Ping a host'],
          ['curl',    'Make HTTP requests'],
          ['which',   'Show command path'],
        ];
        this._addLine('html', `<span style="color:var(--color-accent-primary);font-weight:600;">Available Commands:</span>`);
        cmds.forEach(([name, desc]) => {
          this._addLine('html', `  <span style="color:var(--color-success);width:80px;display:inline-block;">${name}</span><span style="color:var(--color-text-muted);">${desc}</span>`);
        });
        this._addLine('info', '\nTip: Use Tab for autocomplete, ↑↓ for history, Ctrl+L to clear');
      },

      clear: () => { this.history = []; },
      cls: () => { this.history = []; },

      echo: () => {
        // Handle quotes and env vars
        const text = args.join(' ').replace(/\$(\w+)/g, (_, v) => this.env[v] || '');
        this._addLine('result', text);
      },

      pwd: () => { this._addLine('result', this.cwd); },

      cd: () => {
        const target = args[0] || this.env.HOME;
        const resolved = this._resolvePath(target);
        if (this.fs && (resolved === '/' || this.fs.isDirectory(resolved))) {
          this.cwd = resolved;
        } else {
          this._addLine('error', `cd: no such file or directory: ${target}`);
        }
      },

      ls: () => {
        const target = args.find(a => !a.startsWith('-')) || this.cwd;
        const flags = args.filter(a => a.startsWith('-')).join('');
        const showAll = flags.includes('a') || flags.includes('A');
        const resolved = this._resolvePath(target);

        if (!this.fs) { this._addLine('result', 'src/  public/  index.html  package.json  README.md'); return; }
        const items = this.fs.listDir(resolved);
        if (!items.length && !this.fs.isDirectory(resolved)) {
          this._addLine('error', `ls: cannot access '${target}': No such file or directory`);
          return;
        }

        const dirs = items.filter(i => i.type === 'directory');
        const files = items.filter(i => i.type === 'file');
        let out = '';
        dirs.forEach(d => { out += `<span style="color:#60a5fa;font-weight:500;">${d.name}/</span>  `; });
        files.forEach(f => { out += `<span>${f.name}</span>  `; });
        this._addLine('html', out || '(empty)');
      },

      ll: () => {
        commands.ls();
      },

      la: () => {
        commands.ls();
      },

      cat: () => {
        if (!args[0]) { this._addLine('error', 'cat: missing file operand'); return; }
        const path = this._resolvePath(args[0]);
        const content = this.fs ? this.fs.readFile(path) : null;
        if (content === null) {
          this._addLine('error', `cat: ${args[0]}: No such file or directory`);
        } else {
          content.split('\n').forEach(line => this._addLine('result', line));
        }
      },

      touch: () => {
        if (!args[0]) { this._addLine('error', 'touch: missing file operand'); return; }
        const name = args[0];
        const parent = name.includes('/') ? this._resolvePath(name.split('/').slice(0, -1).join('/')) : this.cwd;
        const fname = name.split('/').pop();
        if (this.fs) {
          if (this.fs.createFile(parent, fname, '')) {
            this._addLine('success', `Created ${fname}`);
            eventBus.emit('file:created', { path: (parent === '/' ? '/' : parent + '/') + fname });
          } else {
            this._addLine('info', `touch: file already exists: ${name}`);
          }
        }
      },

      mkdir: () => {
        if (!args[0]) { this._addLine('error', 'mkdir: missing operand'); return; }
        const name = args[0];
        const parent = name.includes('/') ? this._resolvePath(name.split('/').slice(0, -1).join('/')) : this.cwd;
        const dname = name.split('/').pop();
        if (this.fs) {
          if (this.fs.createDirectory(parent, dname)) {
            this._addLine('success', `Created directory ${dname}`);
          } else {
            this._addLine('error', `mkdir: cannot create directory '${name}': File exists`);
          }
        }
      },

      rm: () => {
        const flags = args.filter(a => a.startsWith('-')).join('');
        const targets = args.filter(a => !a.startsWith('-'));
        if (!targets.length) { this._addLine('error', 'rm: missing operand'); return; }
        targets.forEach(t => {
          const path = this._resolvePath(t);
          if (this.fs) {
            const node = this.fs.getNode(path);
            if (!node) { this._addLine('error', `rm: cannot remove '${t}': No such file or directory`); return; }
            if (node.type === 'directory' && !flags.includes('r') && !flags.includes('f')) {
              this._addLine('error', `rm: cannot remove '${t}': Is a directory (use -r)`);
              return;
            }
            this.fs.deleteNode(path);
            this._addLine('success', `Removed ${t}`);
          }
        });
      },

      mv: () => {
        if (args.length < 2) { this._addLine('error', 'mv: missing file operand'); return; }
        const src = this._resolvePath(args[0]);
        const destName = args[1].split('/').pop();
        if (this.fs) {
          if (this.fs.rename(src, destName)) {
            this._addLine('success', `Moved ${args[0]} -> ${destName}`);
          } else {
            this._addLine('error', `mv: cannot move '${args[0]}': No such file or directory`);
          }
        }
      },

      cp: () => {
        if (args.length < 2) { this._addLine('error', 'cp: missing file operand'); return; }
        const srcPath = this._resolvePath(args[0]);
        const content = this.fs ? this.fs.readFile(srcPath) : null;
        if (content === null) { this._addLine('error', `cp: '${args[0]}': No such file`); return; }
        const destName = args[1].split('/').pop();
        const destParent = args[1].includes('/') ? this._resolvePath(args[1].split('/').slice(0, -1).join('/')) : this.cwd;
        if (this.fs) {
          if (this.fs.createFile(destParent, destName, content)) {
            this._addLine('success', `Copied ${args[0]} -> ${args[1]}`);
          } else {
            this._addLine('error', `cp: cannot create '${args[1]}': File exists`);
          }
        }
      },

      find: () => {
        const searchPath = args[0] || '.';
        const nameFlag = args.indexOf('-name');
        const pattern = nameFlag >= 0 ? args[nameFlag + 1] : null;
        const basePath = this._resolvePath(searchPath);

        const results = [];
        const walk = (p) => {
          if (!this.fs) return;
          const items = this.fs.listDir(p);
          items.forEach(item => {
            const matches = !pattern || item.name.includes(pattern.replace(/\*/g, ''));
            if (matches) results.push(item.path);
            if (item.type === 'directory') walk(item.path);
          });
        };
        walk(basePath);
        if (results.length) results.forEach(r => this._addLine('result', r));
        else this._addLine('info', '(no results)');
      },

      grep: () => {
        if (args.length < 2) { this._addLine('error', 'Usage: grep <pattern> <file>'); return; }
        const pattern = args[0];
        const filePath = this._resolvePath(args[1]);
        const content = this.fs ? this.fs.readFile(filePath) : null;
        if (!content) { this._addLine('error', `grep: ${args[1]}: No such file`); return; }
        const re = new RegExp(pattern, 'gi');
        const lines = content.split('\n');
        let found = 0;
        lines.forEach((line, i) => {
          if (re.test(line)) {
            found++;
            const highlighted = line.replace(new RegExp(pattern, 'gi'), m => `<span style="background:rgba(99,102,241,0.4);color:#e2e8f0;">${m}</span>`);
            this._addLine('html', `<span style="color:var(--color-text-muted);">${i + 1}:</span> ${highlighted}`);
          }
        });
        if (!found) this._addLine('info', `(no matches for "${pattern}")`);
      },

      date: () => { this._addLine('result', new Date().toString()); },

      whoami: () => { this._addLine('result', this.env.USER); },

      env: () => {
        Object.entries(this.env).forEach(([k, v]) => this._addLine('result', `${k}=${v}`));
      },

      export: () => {
        if (!args[0] || !args[0].includes('=')) { this._addLine('error', 'Usage: export KEY=VALUE'); return; }
        const [k, ...vParts] = args[0].split('=');
        this.env[k] = vParts.join('=');
        this._addLine('success', `Set ${k}`);
      },

      history: () => {
        this.commandHistory.forEach((cmd, i) => {
          this._addLine('html', `<span style="color:var(--color-text-muted);width:4ch;display:inline-block;">${i + 1}</span> ${this._escapeHtml(cmd)}`);
        });
      },

      node: () => {
        if (args[0] === '-v' || args[0] === '--version') { this._addLine('result', 'v20.11.0'); return; }
        if (args[0]) {
          this._addLine('info', `[node] Running ${args[0]}...`);
          const path = this._resolvePath(args[0]);
          const content = this.fs ? this.fs.readFile(path) : null;
          if (!content) { this._addLine('error', `node: ${args[0]}: File not found`); return; }
          try {
            // Safe eval with console capture
            const logs = [];
            const fakeConsole = { log: (...a) => logs.push(a.join(' ')), error: (...a) => logs.push('Error: ' + a.join(' ')), warn: (...a) => logs.push('Warning: ' + a.join(' ')) };
            const fn = new Function('console', content);
            fn(fakeConsole);
            logs.forEach(l => this._addLine('result', l));
          } catch (e) {
            this._addLine('error', e.message);
          }
        } else {
          this._addLine('info', 'Welcome to Node.js v20.11.0.');
          this._addLine('info', 'Type ".exit" to exit.');
        }
      },

      npm: () => {
        const sub = args[0];
        if (sub === '-v' || sub === '--version') { this._addLine('result', '10.2.4'); return; }
        if (sub === 'run') {
          const script = args[1];
          if (script === 'dev') {
            this._addLine('result', '\n> vibe-app@1.0.0 dev');
            this._addLine('result', '> vite\n');
            setTimeout(() => {
              this._addLine('info', '  VITE v5.4.0  ready in 247 ms\n');
              this._addLine('html', `  <span style="color:var(--color-success);">➜</span>  Local:   <span style="color:var(--color-accent-primary);text-decoration:underline;cursor:pointer;">http://localhost:5173/</span>`);
              this._addLine('html', `  <span style="color:var(--color-text-muted);">➜</span>  press <span style="color:var(--color-warning);">h + enter</span> to show help`);
              this._update();
            }, 400);
          } else if (script === 'build') {
            this._addLine('result', '\n> vibe-app@1.0.0 build');
            this._addLine('result', '> vite build\n');
            setTimeout(() => {
              this._addLine('result', 'vite v5.4.0 building for production...');
              this._addLine('result', '✓ 42 modules transformed.');
              this._addLine('result', 'dist/index.html          0.46 kB │ gzip: 0.30 kB');
              this._addLine('result', 'dist/assets/index.css    1.24 kB │ gzip: 0.58 kB');
              this._addLine('result', 'dist/assets/index.js    18.72 kB │ gzip: 6.84 kB');
              this._addLine('success', '✓ built in 1.23s');
              this._update();
            }, 600);
          } else if (script === 'test') {
            setTimeout(() => {
              this._addLine('result', '> vite-test\n');
              this._addLine('success', ' ✓ src/components/Header.test.js (3)');
              this._addLine('success', ' ✓ src/components/Footer.test.js (2)');
              this._addLine('info', '\n Test Files  2 passed (2)');
              this._addLine('info', '      Tests  5 passed (5)');
              this._addLine('success', '\n✓ All tests passed!');
              this._update();
            }, 500);
          } else {
            this._addLine('error', `npm: missing script: "${script}"`);
          }
        } else if (sub === 'install' || sub === 'i') {
          const pkg = args.slice(1).filter(a => !a.startsWith('-')).join(' ');
          setTimeout(() => {
            this._addLine('result', pkg ? `added 1 package (${pkg}) in 1.2s` : 'added 142 packages in 3.4s');
            this._addLine('info', '12 packages are looking for funding\n  run `npm fund` for details');
            this._update();
          }, 800);
        } else if (sub === 'list' || sub === 'ls') {
          this._addLine('result', 'vibe-app@1.0.0');
          this._addLine('result', '├── vite@5.4.0');
          this._addLine('result', '├── @codemirror/view@6.33.0');
          this._addLine('result', '└── marked@14.0.0');
        } else if (sub === 'init') {
          this._addLine('result', 'This utility will walk you through creating a package.json file.');
          this._addLine('success', 'Wrote to /package.json');
        } else if (!sub) {
          this._addLine('result', 'Usage: npm <command>');
          this._addLine('info', 'Commands: install, run, list, init, -v');
        } else {
          this._addLine('error', `npm: unknown command "${sub}"`);
        }
      },

      git: () => {
        const sub = args[0];
        if (sub === 'status') {
          this._addLine('html', `On branch <span style="color:var(--color-success);">main</span>`);
          this._addLine('result', "Your branch is up to date with 'origin/main'.\n");
          this._addLine('html', `<span style="color:var(--color-warning);">Changes not staged for commit:</span>`);
          this._addLine('result', '  (use "git add <file>..." to update what will be committed)');
          const items = this.fs ? this.fs.listDir('/src') : [];
          items.slice(0, 3).forEach(f => this._addLine('html', `        <span style="color:var(--color-error);">modified:   src/${f.name}</span>`));
          this._addLine('result', '\nno changes added to commit (use "git add" and/or "git commit -a")');
        } else if (sub === 'log') {
          const commits = [
            ['abc1234', 'feat: add AI chat streaming', '2 hours ago'],
            ['def5678', 'fix: terminal autocomplete', '5 hours ago'],
            ['ghi9012', 'style: improve dark theme', '1 day ago'],
            ['jkl3456', 'Initial commit', '3 days ago'],
          ];
          commits.forEach(([hash, msg, time]) => {
            this._addLine('html', `<span style="color:var(--color-warning);">commit ${hash}</span>`);
            this._addLine('html', `<span style="color:var(--color-text-muted);">Date: ${time}</span>`);
            this._addLine('result', `    ${msg}\n`);
          });
        } else if (sub === 'branch') {
          this._addLine('html', `* <span style="color:var(--color-success);">main</span>`);
          this._addLine('result', '  develop');
          this._addLine('result', '  feature/ai-chat');
        } else if (sub === 'add') {
          this._addLine('success', `Staged: ${args.slice(1).join(' ') || '.'}`);
        } else if (sub === 'commit') {
          const msg = args.includes('-m') ? args[args.indexOf('-m') + 1] : 'update';
          this._addLine('html', `[<span style="color:var(--color-success);">main</span> abc1234] ${msg}`);
          this._addLine('result', '1 file changed, 1 insertion(+)');
        } else if (sub === 'init') {
          this._addLine('success', 'Initialized empty Git repository in /repo/.git/');
        } else if (sub === 'diff') {
          this._addLine('html', `<span style="color:var(--color-error);">- const old = 'value';</span>`);
          this._addLine('html', `<span style="color:var(--color-success);">+ const new = 'updated';</span>`);
        } else if (sub === 'stash') {
          this._addLine('success', 'Saved working directory and index state WIP on main: abc1234');
        } else if (!sub || sub === '--version') {
          this._addLine('result', 'git version 2.44.0');
        } else {
          this._addLine('error', `git: '${sub}' is not a git command. See 'git --help'.`);
        }
      },

      ping: () => {
        const host = args[0] || 'localhost';
        const count = args.includes('-c') ? parseInt(args[args.indexOf('-c') + 1]) || 4 : 4;
        this._addLine('result', `PING ${host}: 56 data bytes`);
        let i = 0;
        const interval = setInterval(() => {
          if (i >= count) {
            clearInterval(interval);
            this._addLine('result', `\n--- ${host} ping statistics ---`);
            this._addLine('result', `${count} packets transmitted, ${count} received, 0% packet loss`);
            this._addLine('result', `round-trip min/avg/max = 1.2/2.1/3.4 ms`);
            this._update();
            return;
          }
          const ms = (1 + Math.random() * 5).toFixed(3);
          this._addLine('result', `64 bytes from ${host}: icmp_seq=${i} ttl=64 time=${ms} ms`);
          i++;
          this._update();
        }, 300);
      },

      curl: () => {
        const url = args.find(a => !a.startsWith('-'));
        const method = args.includes('-X') ? args[args.indexOf('-X') + 1] : 'GET';
        if (!url) { this._addLine('error', 'curl: no URL specified!'); return; }
        this._addLine('info', `  % Total    % Received % Xferd  Average Speed   Time`);
        this._addLine('info', `  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0`);
        setTimeout(() => {
          this._addLine('html', `<span style="color:var(--color-success);">HTTP/1.1 200 OK</span>`);
          this._addLine('html', `<span style="color:var(--color-text-muted);">Content-Type: application/json</span>`);
          this._addLine('result', `\n{"status":"ok","url":"${url}","method":"${method}"}`);
          this._update();
        }, 400);
      },

      which: () => {
        const cmd = args[0];
        if (!cmd) { this._addLine('error', 'which: missing argument'); return; }
        const knownCmds = ['node', 'npm', 'git', 'bash', 'sh', 'ls', 'cat', 'echo', 'pwd', 'find', 'grep', 'curl', 'ping'];
        if (knownCmds.includes(cmd)) {
          this._addLine('result', `/usr/local/bin/${cmd}`);
        } else {
          this._addLine('error', `${cmd} not found`);
        }
      },

      vibe: () => {
        this._addLine('html', `<span style="color:var(--color-accent-primary);font-weight:700;font-size:1.1em;">⚡ Vibe Code IDE v2.0.0</span>`);
        this._addLine('html', `   <span style="color:var(--color-text-secondary);">AI-Powered Coding Environment</span>`);
        this._addLine('html', `   <span style="color:var(--color-text-muted);">68+ Agent Skills · Multi-Model AI · Full IDE</span>`);
        this._addLine('html', `   <span style="color:var(--color-text-muted);">Built with ❤️  for developers who vibe</span>`);
      },
    };

    if (commands[command]) {
      commands[command]();
    } else if (command) {
      this._addLine('error', `bash: ${command}: command not found`);
      this._addLine('info', `Try 'help' to see available commands.`);
    }

    this._update();
  }

  _tokenize(cmd) {
    const tokens = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';
    for (let i = 0; i < cmd.length; i++) {
      const c = cmd[i];
      if (inQuote) {
        if (c === quoteChar) inQuote = false;
        else current += c;
      } else if (c === '"' || c === "'") {
        inQuote = true;
        quoteChar = c;
      } else if (c === ' ') {
        if (current) { tokens.push(current); current = ''; }
      } else {
        current += c;
      }
    }
    if (current) tokens.push(current);
    return tokens;
  }

  focus() {
    const input = this.el?.querySelector('#terminal-input');
    if (input) input.focus();
  }
}
