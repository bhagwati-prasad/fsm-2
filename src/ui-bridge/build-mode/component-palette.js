/**
 * Component Palette
 * Manages component library and drag-to-canvas functionality
 */

import { Logger } from '../../utils/logger';

export class ComponentPalette {
  /**
   * Create a new component palette
   * @param {HTMLElement} container - Container element
   * @param {ComponentLibrary} library - Component library
   * @param {EventBus} eventBus - Event bus
   */
  constructor(container, library, eventBus) {
    if(!library) {
        this.logger.warn('No library provided to ComponentPalette');
        throw new Error('ComponentPalette requires a valid library instance');
    }

    this.logger = new Logger('ComponentPalette');
    this.container = container;
    this.library = library;
    this.eventBus = eventBus;
    this.categories = new Map();
    this.searchTerm = '';
    this.init();
  }

  /**
   * Initialize palette
   * @private
   */
  init() {
    this.createPaletteUI();
    this.loadComponents();
    this.setupEventListeners();
  }

  /**
   * Create palette UI
   * @private
   */
  createPaletteUI() {
    const palette = document.createElement('div');
    palette.className = 'component-palette';
    palette.innerHTML = `
      <div class="palette-header">
        <h3>Components</h3>
        <input type="text" class="palette-search" placeholder="Search components...">
      </div>
      <div class="palette-categories"></div>
    `;
    this.container.appendChild(palette);
    this.paletteElement = palette;
    this.searchInput = palette.querySelector('.palette-search');
    this.categoriesContainer = palette.querySelector('.palette-categories');
  }

  /**
   * Load components from library
   * @private
   */
  loadComponents() {
    const components = this.library.getComponents();
    const grouped = this.groupByCategory(components);

    grouped.forEach((components, category) => {
      this.createCategory(category, components);
    });
  }

  /**
   * Group components by category
   * @private
   * @param {Array} components - Components to group
   * @returns {Map} - Grouped components
   */
  groupByCategory(components) {
    const grouped = new Map();

    components.forEach((component) => {
      const category = component.category || 'Other';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category).push(component);
    });

    return grouped;
  }

  /**
   * Create category section
   * @private
   * @param {string} category - Category name
   * @param {Array} components - Components in category
   */
  createCategory(category, components) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'palette-category';
    categoryDiv.innerHTML = `
      <div class="category-header">
        <span class="category-name">${category}</span>
        <span class="category-count">${components.length}</span>
      </div>
      <div class="category-items"></div>
    `;

    const itemsContainer = categoryDiv.querySelector('.category-items');
    components.forEach((component) => {
      const item = this.createComponentItem(component);
      itemsContainer.appendChild(item);
    });

    this.categoriesContainer.appendChild(categoryDiv);
    this.categories.set(category, categoryDiv);
  }

  /**
   * Create component item
   * @private
   * @param {Object} component - Component definition
   * @returns {HTMLElement} - Component item element
   */
  createComponentItem(component) {
    const item = document.createElement('div');
    item.className = 'palette-item';
    item.draggable = true;
    item.setAttribute('data-component-type', component.type);
    item.setAttribute('data-component-name', component.name);
    item.innerHTML = `
      <div class="item-icon">${this.getComponentIcon(component.type)}</div>
      <div class="item-info">
        <div class="item-name">${component.name}</div>
        <div class="item-description">${component.description || ''}</div>
      </div>
    `;

    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('application/json', JSON.stringify({
        type: 'component',
        componentType: component.type,
        componentName: component.name
      }));

      this.eventBus.emit({
        urn: 'ui://palette',
        type: 'ui:component-drag-start',
        timestamp: new Date().toISOString(),
        payload: {
          componentType: component.type,
          componentName: component.name
        }
      });
    });

    return item;
  }

  /**
   * Get component icon
   * @private
   * @param {string} type - Component type
   * @returns {string} - Icon HTML
   */
  getComponentIcon(type) {
    const icons = {
      database: '🗄️',
      compute: '⚙️',
      network: '🌐',
      messaging: '💬',
      storage: '💾',
      api: '🔌',
      default: '📦'
    };
    return icons[type] || icons.default;
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    this.searchInput.addEventListener('input', (e) => {
      this.filterComponents(e.target.value);
    });
  }

  /**
   * Filter components by search term
   * @private
   * @param {string} term - Search term
   */
  filterComponents(term) {
    this.searchTerm = term.toLowerCase();

    this.categories.forEach((categoryDiv) => {
      const items = categoryDiv.querySelectorAll('.palette-item');
      let visibleCount = 0;

      items.forEach((item) => {
        const name = item.getAttribute('data-component-name').toLowerCase();
        const matches = name.includes(this.searchTerm);
        item.style.display = matches ? 'flex' : 'none';
        if (matches) visibleCount++;
      });

      categoryDiv.style.display = visibleCount > 0 ? 'block' : 'none';
    });
  }
}
