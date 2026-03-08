/**
 * Generic Modal UI component
 * Reusable shell for dialogs and prompt replacements
 */

export const MODAL_SIZES = {
  FULL_SCREEN: 'full-screen',
  MOST_OF_SCREEN: 'most-of-screen',
  MEDIUM: 'medium'
};

const VALID_SIZES = new Set(Object.values(MODAL_SIZES));

export class Modal {
  static alert(message, options = {}) {
    const modal = new Modal({
      title: options.title || 'Message',
      size: options.size || MODAL_SIZES.MEDIUM,
      closeOnBackdrop: options.closeOnBackdrop !== false,
      closeOnEscape: options.closeOnEscape !== false
    });

    const content = document.createElement('div');
    content.className = 'app-modal-message';
    content.textContent = message || '';

    const actions = document.createElement('div');
    actions.className = 'app-modal-actions';
    actions.innerHTML = '<button class="app-modal-btn app-modal-btn-primary">OK</button>';

    const okButton = actions.querySelector('button');

    return new Promise((resolve) => {
      modal.setBody(content);
      modal.setFooter(actions);

      okButton.addEventListener('click', () => {
        modal.close();
      });

      modal.onClose(() => {
        resolve(true);
      });

      modal.open();
      okButton.focus();
    });
  }

  constructor(options = {}) {
    this.title = options.title || '';
    this.size = VALID_SIZES.has(options.size) ? options.size : MODAL_SIZES.MOST_OF_SCREEN;
    this.closeOnBackdrop = options.closeOnBackdrop !== false;
    this.closeOnEscape = options.closeOnEscape !== false;
    this.onCloseCallbacks = [];
    this.isOpen = false;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleBackdropClick = this.handleBackdropClick.bind(this);

    this.createElements();
  }

  createElements() {
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'app-modal-overlay';

    this.modalElement = document.createElement('div');
    this.modalElement.className = `app-modal app-modal--${this.size}`;

    this.headerElement = document.createElement('div');
    this.headerElement.className = 'app-modal-header';
    this.headerElement.innerHTML = `
      <h2 class="app-modal-title"></h2>
      <button class="app-modal-close" aria-label="Close modal">×</button>
    `;

    this.bodyElement = document.createElement('div');
    this.bodyElement.className = 'app-modal-body';

    this.footerElement = document.createElement('div');
    this.footerElement.className = 'app-modal-footer';

    this.modalElement.appendChild(this.headerElement);
    this.modalElement.appendChild(this.bodyElement);
    this.modalElement.appendChild(this.footerElement);
    this.overlayElement.appendChild(this.modalElement);

    this.setTitle(this.title);

    const closeButton = this.headerElement.querySelector('.app-modal-close');
    closeButton.addEventListener('click', () => this.close());
    this.overlayElement.addEventListener('click', this.handleBackdropClick);
  }

  setTitle(title) {
    this.title = title || '';
    const titleElement = this.headerElement.querySelector('.app-modal-title');
    titleElement.textContent = this.title;
  }

  setBody(content) {
    this.bodyElement.innerHTML = '';
    if (typeof content === 'string') {
      this.bodyElement.innerHTML = content;
      return;
    }

    if (content instanceof HTMLElement) {
      this.bodyElement.appendChild(content);
    }
  }

  setFooter(content) {
    this.footerElement.innerHTML = '';
    if (!content) {
      this.footerElement.style.display = 'none';
      return;
    }

    this.footerElement.style.display = 'flex';

    if (typeof content === 'string') {
      this.footerElement.innerHTML = content;
      return;
    }

    if (content instanceof HTMLElement) {
      this.footerElement.appendChild(content);
    }
  }

  onClose(callback) {
    if (typeof callback === 'function') {
      this.onCloseCallbacks.push(callback);
    }
  }

  open() {
    if (this.isOpen) {
      return;
    }

    document.body.appendChild(this.overlayElement);
    if (this.closeOnEscape) {
      document.addEventListener('keydown', this.handleKeyDown);
    }
    this.isOpen = true;
  }

  close(result = null) {
    if (!this.isOpen) {
      return;
    }

    if (this.overlayElement.parentNode) {
      this.overlayElement.parentNode.removeChild(this.overlayElement);
    }
    document.removeEventListener('keydown', this.handleKeyDown);
    this.isOpen = false;

    this.onCloseCallbacks.forEach((callback) => callback(result));
  }

  handleKeyDown(event) {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  handleBackdropClick(event) {
    if (!this.closeOnBackdrop) {
      return;
    }

    if (event.target === this.overlayElement) {
      this.close();
    }
  }
}
