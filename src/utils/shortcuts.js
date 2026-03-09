// Keyboard Shortcut Manager
import { eventBus } from './EventBus.js';

const shortcuts = [
  { key: 'p', ctrl: true, shift: true, action: 'command-palette', label: 'Command Palette' },
  { key: 's', ctrl: true, shift: false, action: 'save-file', label: 'Save File' },
  { key: 'n', ctrl: true, shift: false, action: 'new-file', label: 'New File' },
  { key: 'w', ctrl: true, shift: false, action: 'close-tab', label: 'Close Tab' },
  { key: 'b', ctrl: true, shift: false, action: 'toggle-sidebar', label: 'Toggle Sidebar' },
  { key: '`', ctrl: true, shift: false, action: 'toggle-terminal', label: 'Toggle Terminal' },
  { key: 'j', ctrl: true, shift: false, action: 'toggle-panel', label: 'Toggle Panel' },
  { key: 'f', ctrl: true, shift: false, action: 'search-file', label: 'Search in File' },
  { key: 'f', ctrl: true, shift: true, action: 'search-project', label: 'Search in Project' },
  { key: 'l', ctrl: true, shift: false, action: 'toggle-ai-chat', label: 'Toggle AI Chat' },
  { key: 'Tab', ctrl: false, shift: false, alt: true, action: 'next-tab', label: 'Next Tab' },
  { key: ',', ctrl: true, shift: false, action: 'open-settings', label: 'Open Settings' },
  { key: 'i', ctrl: true, shift: true, action: 'ai-generate', label: 'AI Generate Code' },
  { key: 'k', ctrl: true, shift: false, action: 'ai-explain', label: 'AI Explain Code' },
  { key: '.', ctrl: true, shift: false, action: 'toggle-preview', label: 'Toggle Preview' },
];

export function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    for (const s of shortcuts) {
      const ctrlMatch = s.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
      const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = s.alt ? e.altKey : !e.altKey;
      if (e.key.toLowerCase() === s.key.toLowerCase() && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault();
        e.stopPropagation();
        eventBus.emit('shortcut', { action: s.action });
        return;
      }
    }
  });
}

export function getShortcuts() {
  return shortcuts;
}

export function getShortcutLabel(action) {
  const s = shortcuts.find(s => s.action === action);
  if (!s) return '';
  const parts = [];
  if (s.ctrl) parts.push('Ctrl');
  if (s.shift) parts.push('Shift');
  if (s.alt) parts.push('Alt');
  parts.push(s.key.length === 1 ? s.key.toUpperCase() : s.key);
  return parts.join('+');
}
