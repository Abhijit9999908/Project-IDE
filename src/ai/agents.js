// AI Agent Skills — Comprehensive skill catalog from awesome-agent-skills repos
import { eventBus } from '../utils/EventBus.js';

export const skillCategories = [
  {
    id: 'code-generation', name: 'Code Generation', icon: '✨', color: '#8b5cf6',
    skills: [
      { id: 'generate', name: 'Generate Code', icon: '✨', description: 'Generate code from natural language description', shortcut: 'Ctrl+Shift+I' },
      { id: 'component-builder', name: 'Component Builder', icon: '🧩', description: 'Build reusable UI components with best practices' },
      { id: 'api-builder', name: 'API Builder', icon: '🔌', description: 'Generate REST/GraphQL API endpoints' },
      { id: 'fullstack-builder', name: 'Full-Stack Builder', icon: '🏗️', description: 'Scaffold entire full-stack applications' },
      { id: 'web-artifact', name: 'Web Artifact Builder', icon: '🌐', description: 'Build complex web artifacts with modern frameworks' },
      { id: 'mcp-builder', name: 'MCP Builder', icon: '🔧', description: 'Create MCP servers to integrate external APIs' },
    ]
  },
  {
    id: 'code-quality', name: 'Code Quality', icon: '💎', color: '#06b6d4',
    skills: [
      { id: 'explain', name: 'Explain Code', icon: '💡', description: 'Deep explanation of any code with patterns and improvements', shortcut: 'Ctrl+K' },
      { id: 'refactor', name: 'Refactor', icon: '♻️', description: 'Improve readability, maintainability and structure' },
      { id: 'optimize', name: 'Optimize', icon: '⚡', description: 'Optimize for performance and efficiency' },
      { id: 'review', name: 'Code Review', icon: '📋', description: 'Professional code review with actionable feedback' },
      { id: 'type-check', name: 'Type Check', icon: '🔤', description: 'Add TypeScript types and fix type errors' },
      { id: 'lint-fix', name: 'Lint & Fix', icon: '🧹', description: 'Fix linting issues and enforce style guides' },
      { id: 'clean-code', name: 'Clean Code', icon: '✅', description: 'Apply clean code principles and patterns' },
    ]
  },
  {
    id: 'debugging', name: 'Debugging', icon: '🐛', color: '#ef4444',
    skills: [
      { id: 'debug', name: 'Debug', icon: '🐛', description: 'Find and fix bugs with detailed analysis' },
      { id: 'root-cause', name: 'Root Cause Analysis', icon: '🔍', description: 'Trace fundamental problems in complex codebases' },
      { id: 'systematic-debug', name: 'Systematic Debug', icon: '🔬', description: 'Methodical problem-solving with hypothesis testing' },
      { id: 'error-handler', name: 'Error Handler', icon: '🛡️', description: 'Add comprehensive error handling and recovery' },
      { id: 'memory-leak', name: 'Memory Leak Detector', icon: '💧', description: 'Identify and fix memory leaks and resource issues' },
    ]
  },
  {
    id: 'testing', name: 'Testing', icon: '🧪', color: '#22c55e',
    skills: [
      { id: 'test', name: 'Write Tests', icon: '🧪', description: 'Generate comprehensive unit and integration tests' },
      { id: 'tdd', name: 'Test-Driven Dev', icon: '🔄', description: 'Write tests first, then implement code' },
      { id: 'test-fixer', name: 'Test Fixer', icon: '🔧', description: 'Fix failing tests and improve coverage' },
      { id: 'e2e-test', name: 'E2E Tests', icon: '🎯', description: 'Generate end-to-end tests with Playwright/Cypress' },
      { id: 'vibe-testing', name: 'Vibe Testing', icon: '🎵', description: 'Quick validation testing for vibe-coded projects' },
      { id: 'test-anti-patterns', name: 'Anti-Pattern Detector', icon: '⚠️', description: 'Identify ineffective testing practices' },
    ]
  },
  {
    id: 'documentation', name: 'Documentation', icon: '📚', color: '#f59e0b',
    skills: [
      { id: 'document', name: 'Add Docs', icon: '📝', description: 'Generate inline documentation and comments' },
      { id: 'readme-gen', name: 'README Generator', icon: '📄', description: 'Generate professional README.md files' },
      { id: 'api-docs', name: 'API Docs', icon: '📡', description: 'Generate OpenAPI/Swagger documentation' },
      { id: 'changelog', name: 'Changelog', icon: '📋', description: 'Generate changelog from code changes' },
      { id: 'jsdoc', name: 'JSDoc / Docstrings', icon: '💬', description: 'Add JSDoc, docstrings, and type annotations' },
      { id: 'internal-comms', name: 'Status Report', icon: '📊', description: 'Write status reports, newsletters, and FAQs' },
    ]
  },
  {
    id: 'security', name: 'Security', icon: '🔒', color: '#dc2626',
    skills: [
      { id: 'security-audit', name: 'Security Audit', icon: '🔒', description: 'Scan for OWASP Top 10 vulnerabilities' },
      { id: 'vuln-scan', name: 'Vulnerability Scan', icon: '🕵️', description: 'Deep scan for XSS, SQLi, SSRF, IDOR' },
      { id: 'safe-encrypt', name: 'Safe Encryption', icon: '🔐', description: 'Implement secure encryption and hashing' },
      { id: 'defense-depth', name: 'Defense in Depth', icon: '🏰', description: 'Multi-layered security architecture design' },
      { id: 'auth-setup', name: 'Auth Setup', icon: '🔑', description: 'Set up authentication with best practices' },
      { id: 'threat-hunting', name: 'Threat Hunting', icon: '🎯', description: 'Hunt threats with SIGMA rules and YARA patterns' },
    ]
  },
  {
    id: 'devops', name: 'DevOps & Cloud', icon: '☁️', color: '#0ea5e9',
    skills: [
      { id: 'docker', name: 'Docker', icon: '🐳', description: 'Generate Dockerfile and docker-compose configs' },
      { id: 'cicd', name: 'CI/CD Pipeline', icon: '🔄', description: 'Create GitHub Actions, GitLab CI, or Jenkins pipelines' },
      { id: 'aws-skills', name: 'AWS Skills', icon: '☁️', description: 'AWS development with infrastructure patterns' },
      { id: 'terraform', name: 'Terraform', icon: '🏗️', description: 'Generate and validate Terraform HCL code' },
      { id: 'cloudflare', name: 'Cloudflare Deploy', icon: '🌐', description: 'Deploy to Workers, Pages, and Cloudflare stack' },
      { id: 'netlify', name: 'Netlify Deploy', icon: '🚀', description: 'Deploy and configure Netlify projects' },
    ]
  },
  {
    id: 'frontend', name: 'Frontend & UI', icon: '🎨', color: '#ec4899',
    skills: [
      { id: 'ui-ux-pro', name: 'UI/UX Pro', icon: '🎨', description: 'Professional UI/UX design patterns and best practices' },
      { id: 'responsive', name: 'Responsive Design', icon: '📱', description: 'Make layouts responsive across all devices' },
      { id: 'accessibility', name: 'Accessibility Audit', icon: '♿', description: 'WCAG 2.2 compliance and a11y best practices' },
      { id: 'css-optimizer', name: 'CSS Optimizer', icon: '🎯', description: 'Optimize and clean up CSS with modern features' },
      { id: 'animation', name: 'Animation Builder', icon: '✨', description: 'Create smooth CSS/JS animations and transitions' },
      { id: 'frontend-design', name: 'Frontend Design', icon: '🖌️', description: 'Frontend design and UI development best practices' },
      { id: 'theme-factory', name: 'Theme Factory', icon: '🎭', description: 'Generate professional themes and design systems' },
    ]
  },
  {
    id: 'data', name: 'Data & Analysis', icon: '📊', color: '#14b8a6',
    skills: [
      { id: 'csv-summarizer', name: 'CSV Summarizer', icon: '📊', description: 'Analyze and summarize CSV data sets' },
      { id: 'data-transform', name: 'Data Transformer', icon: '🔄', description: 'Transform data between formats (JSON, CSV, XML, YAML)' },
      { id: 'sql-query', name: 'SQL Query', icon: '🗃️', description: 'Generate and optimize SQL queries' },
      { id: 'schema-design', name: 'Schema Design', icon: '📐', description: 'Design database schemas and migrations' },
      { id: 'data-viz', name: 'Data Visualization', icon: '📈', description: 'Create D3.js and Chart.js visualizations' },
    ]
  },
  {
    id: 'context-ai', name: 'Context & AI', icon: '🧠', color: '#7c3aed',
    skills: [
      { id: 'context-engineer', name: 'Context Engineer', icon: '🧠', description: 'Optimize context window usage for AI agents' },
      { id: 'prompt-engineer', name: 'Prompt Engineer', icon: '💬', description: 'Craft effective prompts with best practices' },
      { id: 'memory-systems', name: 'Memory Systems', icon: '🗄️', description: 'Design short/long-term memory architectures' },
      { id: 'multi-agent', name: 'Multi-Agent', icon: '🤖', description: 'Orchestrate multi-agent collaboration patterns' },
      { id: 'skill-creator', name: 'Skill Creator', icon: '🛠️', description: 'Create new SKILL.md files for AI agents' },
      { id: 'deep-research', name: 'Deep Research', icon: '🔬', description: 'Autonomous multi-step research and analysis' },
    ]
  },
  {
    id: 'git', name: 'Git & Collaboration', icon: '🌿', color: '#f97316',
    skills: [
      { id: 'git-workflow', name: 'Git Workflow', icon: '🌿', description: 'Git branching strategies and workflow patterns' },
      { id: 'pr-review', name: 'PR Review', icon: '👀', description: 'Review pull requests with detailed feedback' },
      { id: 'branch-manager', name: 'Branch Manager', icon: '🌳', description: 'Manage and finish development branches' },
      { id: 'commit-message', name: 'Commit Messages', icon: '✏️', description: 'Generate conventional commit messages' },
      { id: 'merge-resolver', name: 'Merge Resolver', icon: '🔀', description: 'Resolve merge conflicts intelligently' },
    ]
  },
  {
    id: 'integration', name: 'Integration', icon: '🔗', color: '#6366f1',
    skills: [
      { id: 'api-integration', name: 'API Integration', icon: '🔗', description: 'Integrate with REST/GraphQL external APIs' },
      { id: 'webhook-builder', name: 'Webhook Builder', icon: '🪝', description: 'Create webhook handlers and event systems' },
      { id: 'stripe-integration', name: 'Stripe Integration', icon: '💳', description: 'Stripe payment integration best practices' },
      { id: 'supabase', name: 'Supabase Setup', icon: '⚡', description: 'Set up Supabase backend with PostgreSQL' },
      { id: 'google-workspace', name: 'Google Workspace', icon: '📧', description: 'Integrate with Gmail, Sheets, Drive, Calendar' },
    ]
  },
];

// Flatten all skills for quick access
export const agentSkills = skillCategories.flatMap(cat =>
  cat.skills.map(skill => ({ ...skill, category: cat.id, categoryName: cat.name, categoryColor: cat.color }))
);

export function getSkillById(id) {
  return agentSkills.find(s => s.id === id) || null;
}

export function getSkillsByCategory(categoryId) {
  const cat = skillCategories.find(c => c.id === categoryId);
  return cat ? cat.skills : [];
}

export function searchSkills(query) {
  const q = query.toLowerCase();
  return agentSkills.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.categoryName.toLowerCase().includes(q)
  );
}

export function executeAgent(skillId, context) {
  eventBus.emit('agent:execute', { skillId, context });
}

export function getAgentSkills() {
  return agentSkills;
}
