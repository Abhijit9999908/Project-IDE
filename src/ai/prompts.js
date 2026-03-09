// AI Prompt Templates — Extended for all agent skills
export const SYSTEM_PROMPT = `You are Vibe AI, an expert coding assistant integrated into Vibe Code IDE. You are equipped with 40+ agent skills spanning code generation, quality, debugging, testing, documentation, security, DevOps, frontend, data analysis, context engineering, git workflows, and integrations.

Rules:
- Always provide clean, well-commented code
- Follow best practices and modern patterns
- Explain your reasoning when asked
- Use markdown formatting with code blocks
- Be concise but thorough
- Use appropriate design patterns for the task
- Consider security, performance, and accessibility`;

export const prompts = {
  // Code Generation
  generate: (description, language, context) => ({
    system: SYSTEM_PROMPT,
    user: `Generate code for:\n\n**Description:** ${description}\n**Language:** ${language}\n${context ? `\n**Context:**\n\`\`\`\n${context}\n\`\`\`` : ''}\n\nProvide clean, production-ready code.`
  }),
  'component-builder': (description, language, context) => ({
    system: SYSTEM_PROMPT,
    user: `Build a reusable UI component:\n\n**Description:** ${description}\n**Language/Framework:** ${language}\n${context ? `\n**Existing code:**\n\`\`\`\n${context}\n\`\`\`` : ''}\n\nInclude props/interfaces, styling, accessibility, and usage examples.`
  }),
  'api-builder': (description, language, context) => ({
    system: SYSTEM_PROMPT,
    user: `Generate API endpoint:\n\n**Description:** ${description}\n**Language:** ${language}\n${context ? `\n**Context:**\n\`\`\`\n${context}\n\`\`\`` : ''}\n\nInclude route, controller, validation, error handling, and documentation.`
  }),
  'fullstack-builder': (description, language, context) => ({
    system: SYSTEM_PROMPT,
    user: `Scaffold a full-stack application:\n\n**Description:** ${description}\n**Stack:** ${language}\n\nInclude project structure, frontend, backend, database schema, and setup instructions.`
  }),
  'web-artifact': (description, language, context) => ({
    system: SYSTEM_PROMPT,
    user: `Build a complex web artifact:\n\n**Description:** ${description}\n**Tech:** ${language}\n${context ? `\n**Context:**\n\`\`\`\n${context}\n\`\`\`` : ''}\n\nCreate a complete, interactive web artifact with modern design.`
  }),
  'mcp-builder': (description, language, context) => ({
    system: SYSTEM_PROMPT,
    user: `Create an MCP (Model Context Protocol) server:\n\n**Description:** ${description}\n${context ? `\n**Context:**\n\`\`\`\n${context}\n\`\`\`` : ''}\n\nInclude server setup, tool definitions, and usage examples.`
  }),

  // Code Quality
  explain: (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nBreak down each part, patterns used, and potential improvements.`
  }),
  refactor: (code, language, instructions) => ({
    system: SYSTEM_PROMPT,
    user: `Refactor this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n${instructions ? `\n**Instructions:** ${instructions}` : '\nImprove readability, performance, and follow best practices.'}`
  }),
  optimize: (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Optimize this ${language} code for maximum performance:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nFocus on: time/space complexity, memory usage, caching, lazy loading, and algorithm improvements.`
  }),
  review: (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Professional code review of this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nReview: 1) Quality 2) Performance 3) Security 4) Best Practices 5) Suggestions`
  }),
  'type-check': (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Add TypeScript types to this code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nAdd interfaces, type annotations, generics where appropriate.`
  }),
  'lint-fix': (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Fix all linting issues in this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nApply ESLint/Prettier rules and style guide conventions.`
  }),
  'clean-code': (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Apply clean code principles:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nApply SOLID, DRY, KISS, and clean code patterns.`
  }),

  // Debugging
  debug: (code, language, error) => ({
    system: SYSTEM_PROMPT,
    user: `Debug this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n${error ? `\n**Error:** ${error}` : ''}\n\nIdentify bugs, explain causes, provide fixes.`
  }),
  'root-cause': (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Root cause analysis on this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nTrace the fundamental problem, explain the chain of causation, and provide the definitive fix.`
  }),
  'systematic-debug': (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Systematic debugging of this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nUse hypothesis-driven debugging: 1) Observe symptoms 2) Form hypotheses 3) Test each one 4) Fix confirmed issues.`
  }),
  'error-handler': (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Add comprehensive error handling to:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nAdd try/catch, validation, graceful degradation, user-friendly error messages, and logging.`
  }),
  'memory-leak': (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Detect memory leaks in this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nIdentify: event listener leaks, circular references, unclosed resources, and provide fixes.`
  }),

  // Testing
  test: (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Write comprehensive tests for:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nInclude unit tests, edge cases, mocking, and use appropriate testing framework.`
  }),
  tdd: (description, language) => ({
    system: SYSTEM_PROMPT,
    user: `Test-Driven Development — write tests first:\n\n**Feature:** ${description}\n**Language:** ${language}\n\n1. Write failing tests\n2. Write minimal implementation to pass\n3. Refactor while keeping tests green`
  }),
  'e2e-test': (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Write E2E tests with Playwright:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nTest user flows, navigation, forms, and interactions.`
  }),

  // Documentation
  document: (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Add comprehensive documentation:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nAdd inline comments, JSDoc/docstrings, and usage examples for every function and class.`
  }),
  'readme-gen': (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Generate a professional README.md for:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nInclude: description, features, installation, usage, API reference, contributing, and license.`
  }),
  'api-docs': (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Generate API documentation for:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nCreate OpenAPI/Swagger-style documentation with endpoints, parameters, responses, and examples.`
  }),

  // Security
  'security-audit': (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Security audit of this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nCheck for OWASP Top 10: injection, broken auth, XSS, insecure deserialization, and provide fixes.`
  }),
  'vuln-scan': (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Deep vulnerability scan:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nScan for: XSS, SQL Injection, SSRF, IDOR, CSRF, path traversal. Rate severity and provide fixes.`
  }),
  'defense-depth': (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Apply defense-in-depth to:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nAdd multiple security layers: input validation, output encoding, authentication, authorization, logging, rate limiting.`
  }),

  // DevOps
  docker: (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Create Docker configuration for this ${language} project:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nGenerate Dockerfile, docker-compose.yml, .dockerignore. Use multi-stage builds and best practices.`
  }),
  cicd: (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Create CI/CD pipeline for this ${language} project:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nGenerate GitHub Actions workflow with: lint, test, build, deploy stages.`
  }),
  terraform: (description, language) => ({
    system: SYSTEM_PROMPT,
    user: `Generate Terraform configuration:\n\n**Infrastructure:** ${description}\n\nCreate HCL code with modules, variables, outputs, and state management.`
  }),

  // Frontend
  'ui-ux-pro': (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Apply professional UI/UX patterns to:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nImprove: visual hierarchy, spacing, typography, color, animations, accessibility, and responsive design.`
  }),
  responsive: (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Make this responsive across all devices:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nAdd media queries, flexible layouts, mobile-first design, touch targets, and viewport meta.`
  }),
  accessibility: (code, language) => ({
    system: SYSTEM_PROMPT,
    user: `Accessibility audit (WCAG 2.2):\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nCheck: ARIA labels, keyboard nav, color contrast, screen reader support, focus management. Provide fixes.`
  }),

  // Context & AI
  'prompt-engineer': (description) => ({
    system: SYSTEM_PROMPT,
    user: `Craft an optimized prompt for:\n\n**Goal:** ${description}\n\nApply: clear instructions, few-shot examples, chain-of-thought, and structured output format.`
  }),
  'skill-creator': (description) => ({
    system: SYSTEM_PROMPT,
    user: `Create a new SKILL.md agent skill file:\n\n**Skill purpose:** ${description}\n\nFollow the standard structure:\n- YAML frontmatter (name, description)\n- When to Use\n- Instructions\n- Examples\n- Best Practices`
  }),
  'deep-research': (topic) => ({
    system: SYSTEM_PROMPT,
    user: `Conduct deep research on:\n\n**Topic:** ${topic}\n\nPerform multi-step analysis: 1) Define scope 2) Research key aspects 3) Analyze findings 4) Synthesize conclusions 5) Provide recommendations.`
  }),

  // General chat
  chat: (message, context) => ({
    system: SYSTEM_PROMPT,
    user: `${message}${context ? `\n\n**Current file context:**\n\`\`\`\n${context}\n\`\`\`` : ''}`
  })
};

// Generic prompt builder for skills without specific templates
export function buildSkillPrompt(skillId, code, language) {
  if (prompts[skillId]) {
    return prompts[skillId](code, language);
  }
  return {
    system: SYSTEM_PROMPT,
    user: `Execute the "${skillId}" skill on this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide comprehensive, actionable output.`
  };
}
