// Skills Explorer — Browsable, searchable skill catalog
import { eventBus } from '../utils/EventBus.js';
import { icons } from './Icons.js';
import { skillCategories, searchSkills } from '../ai/agents.js';

export class SkillsExplorer {
  constructor() {
    this.query = '';
    this.activeCategory = null;
    this.el = null;
  }

  render() {
    const el = document.createElement('div');
    el.className = 'skills-explorer';
    el.id = 'skills-explorer';
    this.el = el;
    this._update();
    return el;
  }

  _update() {
    if (!this.el) return;

    const filteredCategories = this.query
      ? [{ id: 'search', name: 'Search Results', icon: '🔍', color: '#6366f1', skills: searchSkills(this.query) }]
      : (this.activeCategory
        ? skillCategories.filter(c => c.id === this.activeCategory)
        : skillCategories);

    this.el.innerHTML = `
      <div class="skills-explorer__search">
        <div class="skills-explorer__search-wrapper">
          ${icons.search}
          <input class="skills-explorer__search-input" placeholder="Search ${skillCategories.reduce((a, c) => a + c.skills.length, 0)}+ skills..." value="${this.query}" id="skills-search" />
          ${this.query ? `<button class="skills-explorer__clear" id="skills-clear">${icons.close}</button>` : ''}
        </div>
      </div>
      ${!this.query ? `
      <div class="skills-explorer__categories" id="skills-categories">
        <button class="skills-category-chip ${!this.activeCategory ? 'active' : ''}" data-cat="all">All</button>
        ${skillCategories.map(cat => `
          <button class="skills-category-chip ${this.activeCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}" style="--chip-color:${cat.color}">
            ${cat.icon} ${cat.name}
          </button>
        `).join('')}
      </div>` : ''}
      <div class="skills-explorer__grid" id="skills-grid">
        ${filteredCategories.map(cat => `
          ${filteredCategories.length > 1 ? `<div class="skills-explorer__category-header"><span style="color:${cat.color}">${cat.icon}</span> ${cat.name} <span class="skills-explorer__count">${cat.skills.length}</span></div>` : ''}
          ${cat.skills.map(skill => `
            <button class="skill-card" data-skill="${skill.id}" title="${skill.description}">
              <span class="skill-card__icon">${skill.icon}</span>
              <div class="skill-card__info">
                <span class="skill-card__name">${skill.name}</span>
                <span class="skill-card__desc">${skill.description}</span>
              </div>
              ${skill.shortcut ? `<span class="skill-card__shortcut">${skill.shortcut}</span>` : ''}
            </button>
          `).join('')}
        `).join('')}
      </div>
    `;

    this._attachEvents();
  }

  _attachEvents() {
    // Search input
    const searchInput = this.el.querySelector('#skills-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.query = e.target.value;
        this.activeCategory = null;
        this._update();
        this.el.querySelector('#skills-search')?.focus();
      });
    }

    // Clear search
    this.el.querySelector('#skills-clear')?.addEventListener('click', () => {
      this.query = '';
      this._update();
    });

    // Category chips
    this.el.querySelectorAll('.skills-category-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const cat = chip.dataset.cat;
        this.activeCategory = cat === 'all' ? null : cat;
        this._update();
      });
    });

    // Skill cards
    this.el.querySelectorAll('.skill-card').forEach(card => {
      card.addEventListener('click', () => {
        const skillId = card.dataset.skill;
        eventBus.emit('agent:execute', { skillId });
      });
    });
  }
}
