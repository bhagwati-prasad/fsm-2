/**
 * FSM Tool - Layout Application
 * Handles UI interactions and layout management
 */

class LayoutApp {
  constructor() {
    this.currentMode = 'build';
    this.selectedComponent = null;
    this.components = new Map();
    this.connections = new Map();
    this.zoom = 100;
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    this.setupEventListeners();
    this.setupDragDrop();
    this.setupModeSelector();
    this.setupToolbar();
    this.setupSidebars();
    console.log('FSM Tool Layout initialized');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Header buttons
    document.querySelectorAll('.icon-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleHeaderAction(e));
    });

    // Canvas
    const canvas = document.getElementById('canvas');
    if (canvas) {
      canvas.addEventListener('dragover', (e) => this.handleCanvasDragOver(e));
      canvas.addEventListener('drop', (e) => this.handleCanvasDrop(e));
      canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    // Sidebar collapse buttons
    document.querySelectorAll('.sidebar-collapse-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleSidebarCollapse(e));
    });
  }

  /**
   * Setup drag and drop for components
   */
  setupDragDrop() {
    document.querySelectorAll('.component-item').forEach(item => {
      item.addEventListener('dragstart', (e) => this.handleComponentDragStart(e));
      item.addEventListener('dragend', (e) => this.handleComponentDragEnd(e));
    });
  }

  /**
   * Setup mode selector
   */
  setupModeSelector() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleModeChange(e));
    });
  }

  /**
   * Setup toolbar
   */
  setupToolbar() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleToolAction(e));
    });
  }

  /**
   * Setup sidebars
   */
  setupSidebars() {
    // Category headers
    document.querySelectorAll('.category-header').forEach(header => {
      header.addEventListener('click', (e) => this.handleCategoryToggle(e));
    });

    // Property inputs
    document.querySelectorAll('.property-input, .property-select, .property-textarea').forEach(input => {
      input.addEventListener('change', (e) => this.handlePropertyChange(e));
    });

    // Search
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e));
    }
  }

  /**
   * Handle header action buttons
   */
  handleHeaderAction(event) {
    const btn = event.currentTarget;
    const title = btn.getAttribute('title');

    switch (title) {
      case 'Save':
        this.saveProject();
        break;
      case 'Undo':
        this.undo();
        break;
      case 'Redo':
        this.redo();
        break;
      case 'Settings':
        this.openSettings();
        break;
      case 'Help':
        this.openHelp();
        break;
    }
  }

  /**
   * Handle mode change
   */
  handleModeChange(event) {
    const btn = event.currentTarget;
    const mode = btn.getAttribute('data-mode');

    // Update active button
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    this.currentMode = mode;
    console.log(`Switched to ${mode} mode`);

    // Emit event
    this.emit('mode-changed', { mode });
  }

  /**
   * Handle component drag start
   */
  handleComponentDragStart(event) {
    const item = event.currentTarget;
    const type = item.getAttribute('data-type');
    const name = item.querySelector('span').textContent;

    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/json', JSON.stringify({
      type,
      name,
      timestamp: Date.now()
    }));

    item.style.opacity = '0.5';
  }

  /**
   * Handle component drag end
   */
  handleComponentDragEnd(event) {
    event.currentTarget.style.opacity = '1';
  }

  /**
   * Handle canvas drag over
   */
  handleCanvasDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }

  /**
   * Handle canvas drop
   */
  handleCanvasDrop(event) {
    event.preventDefault();

    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      this.addComponent(data.type, data.name, x, y);
    } catch (error) {
      console.error('Error dropping component:', error);
    }
  }

  /**
   * Handle canvas click
   */
  handleCanvasClick(event) {
    if (event.target === event.currentTarget) {
      this.deselectComponent();
    }
  }

  /**
   * Handle tool action
   */
  handleToolAction(event) {
    const btn = event.currentTarget;
    const title = btn.getAttribute('title');

    switch (title) {
      case 'Select':
        this.setTool('select');
        break;
      case 'Connect':
        this.setTool('connect');
        break;
      case 'Zoom In':
        this.zoomIn();
        break;
      case 'Zoom Out':
        this.zoomOut();
        break;
      case 'Fit to View':
        this.fitToView();
        break;
      case 'Delete':
        this.deleteSelected();
        break;
    }
  }

  /**
   * Handle category toggle
   */
  handleCategoryToggle(event) {
    const header = event.currentTarget;
    const items = header.nextElementSibling;

    if (items) {
      const isExpanded = items.style.display !== 'none';
      items.style.display = isExpanded ? 'none' : 'flex';
      header.setAttribute('aria-expanded', !isExpanded);
    }
  }

  /**
   * Handle sidebar collapse
   */
  handleSidebarCollapse(event) {
    const btn = event.currentTarget;
    const sidebar = btn.closest('.sidebar');

    if (sidebar) {
      sidebar.classList.toggle('collapsed');
    }
  }

  /**
   * Handle property change
   */
  handlePropertyChange(event) {
    const input = event.currentTarget;
    const label = input.previousElementSibling?.textContent || 'Unknown';
    const value = input.value;

    if (this.selectedComponent) {
      this.updateComponentProperty(this.selectedComponent, label, value);
    }
  }

  /**
   * Handle search
   */
  handleSearch(event) {
    const query = event.currentTarget.value.toLowerCase();
    const items = document.querySelectorAll('.component-item');

    items.forEach(item => {
      const name = item.querySelector('span').textContent.toLowerCase();
      item.style.display = name.includes(query) ? 'flex' : 'none';
    });
  }

  /**
   * Add component to canvas
   */
  addComponent(type, name, x, y) {
    const id = `${type}-${Date.now()}`;
    const component = {
      id,
      type,
      name,
      x,
      y,
      width: 120,
      height: 80
    };

    this.components.set(id, component);
    this.renderComponent(component);
    this.updateStatus();

    console.log(`Added component: ${name} (${id})`);
    this.emit('component-added', { component });
  }

  /**
   * Render component on canvas
   */
  renderComponent(component) {
    const canvas = document.querySelector('.canvas-content');
    if (!canvas) return;

    const el = document.createElement('div');
    el.className = 'component-node';
    el.id = component.id;
    el.style.position = 'absolute';
    el.style.left = component.x + 'px';
    el.style.top = component.y + 'px';
    el.style.width = component.width + 'px';
    el.style.height = component.height + 'px';
    el.style.border = '2px solid #2563eb';
    el.style.borderRadius = '8px';
    el.style.backgroundColor = '#f0f9ff';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = 'pointer';
    el.style.userSelect = 'none';
    el.textContent = component.name;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectComponent(component.id);
    });

    canvas.appendChild(el);
  }

  /**
   * Select component
   */
  selectComponent(id) {
    this.deselectComponent();
    this.selectedComponent = id;

    const el = document.getElementById(id);
    if (el) {
      el.style.borderColor = '#1e40af';
      el.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
    }

    const component = this.components.get(id);
    if (component) {
      this.updatePropertiesPanel(component);
    }

    this.emit('component-selected', { id });
  }

  /**
   * Deselect component
   */
  deselectComponent() {
    if (this.selectedComponent) {
      const el = document.getElementById(this.selectedComponent);
      if (el) {
        el.style.borderColor = '#2563eb';
        el.style.boxShadow = 'none';
      }
    }
    this.selectedComponent = null;
    this.emit('component-deselected', {});
  }

  /**
   * Update properties panel
   */
  updatePropertiesPanel(component) {
    const nameInput = document.querySelector('.property-input');
    if (nameInput) nameInput.value = component.name;
  }

  /**
   * Update component property
   */
  updateComponentProperty(id, property, value) {
    const component = this.components.get(id);
    if (component) {
      component[property.toLowerCase()] = value;
      this.emit('component-updated', { id, property, value });
    }
  }

  /**
   * Delete selected component
   */
  deleteSelected() {
    if (this.selectedComponent) {
      const el = document.getElementById(this.selectedComponent);
      if (el) el.remove();

      this.components.delete(this.selectedComponent);
      this.selectedComponent = null;
      this.updateStatus();
      this.emit('component-deleted', {});
    }
  }

  /**
   * Set tool
   */
  setTool(tool) {
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.querySelector(`[data-tool="${tool}"]`);
    if (btn) btn.classList.add('active');

    this.emit('tool-changed', { tool });
  }

  /**
   * Zoom in
   */
  zoomIn() {
    this.zoom = Math.min(this.zoom + 10, 200);
    this.updateZoom();
  }

  /**
   * Zoom out
   */
  zoomOut() {
    this.zoom = Math.max(this.zoom - 10, 50);
    this.updateZoom();
  }

  /**
   * Fit to view
   */
  fitToView() {
    this.zoom = 100;
    this.updateZoom();
  }

  /**
   * Update zoom
   */
  updateZoom() {
    const canvas = document.querySelector('.canvas-content');
    if (canvas) {
      canvas.style.transform = `scale(${this.zoom / 100})`;
      canvas.style.transformOrigin = '0 0';
    }

    const indicator = document.querySelector('.zoom-indicator');
    if (indicator) indicator.textContent = `${this.zoom}%`;

    this.emit('zoom-changed', { zoom: this.zoom });
  }

  /**
   * Save project
   */
  saveProject() {
    const project = {
      mode: this.currentMode,
      components: Array.from(this.components.values()),
      connections: Array.from(this.connections.values()),
      timestamp: new Date().toISOString()
    };

    console.log('Saving project:', project);
    this.emit('project-saved', { project });
  }

  /**
   * Undo
   */
  undo() {
    console.log('Undo action');
    this.emit('undo', {});
  }

  /**
   * Redo
   */
  redo() {
    console.log('Redo action');
    this.emit('redo', {});
  }

  /**
   * Open settings
   */
  openSettings() {
    console.log('Opening settings');
    this.emit('settings-opened', {});
  }

  /**
   * Open help
   */
  openHelp() {
    console.log('Opening help');
    this.emit('help-opened', {});
  }

  /**
   * Update status bar
   */
  updateStatus() {
    const infoText = document.querySelector('.info-text');
    if (infoText) {
      const componentCount = this.components.size;
      const connectionCount = this.connections.size;
      infoText.textContent = `Components: ${componentCount} | Connections: ${connectionCount}`;
    }
  }

  /**
   * Emit custom event
   */
  emit(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  /**
   * Listen to custom event
   */
  on(eventName, callback) {
    document.addEventListener(eventName, (e) => callback(e.detail));
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new LayoutApp();
  });
} else {
  window.app = new LayoutApp();
}
