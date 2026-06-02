// Element inspector for the weblab2 HTML preview.
//
// Given the inner preview's `document`, installInspector() makes every element
// in the page reachable by hover and by Tab, drawing a highlight box + a label
// showing the element's tag, id, and class. The currently focused or hovered
// element is described to screen readers: focus uses `aria-describedby`, hover uses a
// best-effort polite live region.
//
// Everything is reversible: teardown() removes our nodes/listeners, restores the
// tabindex we added and any aria-describedby we set, and is idempotent.

import {
  HIGHLIGHT_STYLE,
  LABEL_STYLE,
  SR_ONLY_STYLE,
} from './htmlPreviewInspectorStyles';
import {
  asElement,
  computeLabelPosition,
  formatDescription,
  formatLabel,
  getElementInfo,
  INSPECTOR_ATTR,
  isOurNode,
  isTabindexEligible,
} from './htmlPreviewInspectorUtils';

export interface InspectorController {
  teardown(): void;
}

// id of the hidden node that aria-describedby points at on focus.
const DESCRIPTION_ID = 'weblab2-inspector-description';

// Zero-width space appended to alternate live-region updates so a screen reader
// re-announces text identical to the previous announcement.
const ZERO_WIDTH_SPACE = '\u200B';

// Owns the overlay nodes, listeners, and mutable state for one inner document.
class InspectorOverlay implements InspectorController {
  private readonly currentDocument: Document;
  private readonly currentWindow: (Window & typeof globalThis) | null;
  private readonly highlight: HTMLDivElement;
  private readonly label: HTMLDivElement;
  private readonly description: HTMLDivElement;
  private readonly liveRegion: HTMLDivElement;

  // Elements we added tabindex to, for exact restoration on teardown.
  private readonly taggedElements = new Set<Element>();
  // The element currently described via focus, and its prior describedby, if any,
  // for restoration on blur/teardown.
  private describedElement: Element | null = null;
  private priorDescribedBy: string | null = null;

  private focusedElement: Element | null = null;
  private hoveredElement: Element | null = null;
  // The element the overlay is currently drawn over (for scroll repositioning).
  private activeElement: Element | null = null;
  private liveToggle = false;
  private animationFrameId = 0;
  private disposed = false;
  private observer: MutationObserver | null = null;

  constructor(currentDocument: Document) {
    this.currentDocument = currentDocument;
    this.currentWindow = currentDocument.defaultView;

    this.highlight = this.makeNode('highlight', HIGHLIGHT_STYLE);
    this.highlight.setAttribute('aria-hidden', 'true');
    this.label = this.makeNode('label', LABEL_STYLE);
    this.label.setAttribute('aria-hidden', 'true');
    // Referenced by aria-describedby on focus; read by screen readers, hidden visually.
    this.description = this.makeNode('description', SR_ONLY_STYLE);
    this.description.id = DESCRIPTION_ID;
    // Best-effort announcements for the mouse-hover path.
    this.liveRegion = this.makeNode('live', SR_ONLY_STYLE);
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');

    currentDocument.body.appendChild(this.highlight);
    currentDocument.body.appendChild(this.label);
    currentDocument.body.appendChild(this.description);
    currentDocument.body.appendChild(this.liveRegion);

    // Make every existing element reachable by Tab.
    this.tagSubtree(currentDocument.body);

    // Catch elements the page adds after we install.
    const {currentWindow} = this;
    if (currentWindow && typeof currentWindow.MutationObserver === 'function') {
      this.observer = new currentWindow.MutationObserver(mutations => {
        for (const mutation of mutations) {
          mutation.addedNodes.forEach(node => {
            const element = asElement(node);
            if (element) {
              this.tagSubtree(element);
            }
          });
          // Drop references to detached subtrees.
          mutation.removedNodes.forEach(node => {
            const element = asElement(node);
            if (element) {
              this.untagSubtree(element);
            }
          });
        }
      });
      this.observer.observe(currentDocument.body, {
        childList: true,
        subtree: true,
      });
    }

    currentDocument.addEventListener('mouseover', this.onMouseOver, true);
    currentDocument.addEventListener('mouseout', this.onMouseOut, true);
    currentDocument.addEventListener('focusin', this.onFocusIn, true);
    currentDocument.addEventListener('focusout', this.onFocusOut, true);
    currentWindow?.addEventListener('scroll', this.scheduleReposition, true);
    currentWindow?.addEventListener('resize', this.scheduleReposition);
  }

  teardown(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    const {currentDocument, currentWindow} = this;
    currentDocument.removeEventListener('mouseover', this.onMouseOver, true);
    currentDocument.removeEventListener('mouseout', this.onMouseOut, true);
    currentDocument.removeEventListener('focusin', this.onFocusIn, true);
    currentDocument.removeEventListener('focusout', this.onFocusOut, true);
    currentWindow?.removeEventListener('scroll', this.scheduleReposition, true);
    currentWindow?.removeEventListener('resize', this.scheduleReposition);
    if (this.animationFrameId && currentWindow) {
      currentWindow.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
    this.observer?.disconnect();
    this.clearFocusDescription();
    this.taggedElements.forEach(element => element.removeAttribute('tabindex'));
    this.taggedElements.clear();
    this.highlight.remove();
    this.label.remove();
    this.description.remove();
    this.liveRegion.remove();
  }

  private makeNode(
    nodeKind: string,
    style: Partial<CSSStyleDeclaration>
  ): HTMLDivElement {
    const element = this.currentDocument.createElement('div');
    element.setAttribute(INSPECTOR_ATTR, nodeKind);
    Object.assign(element.style, style);
    return element;
  }

  private tagSubtree(root: Element): void {
    const candidates: Element[] = [
      root,
      ...Array.from(root.querySelectorAll('*')),
    ];
    for (const element of candidates) {
      if (isTabindexEligible(element)) {
        element.setAttribute('tabindex', '0');
        this.taggedElements.add(element);
      }
    }
  }

  private untagSubtree(root: Element): void {
    this.untag(root);
    for (const element of root.querySelectorAll('*')) {
      this.untag(element);
    }
  }

  // Drop our reference to an element and remove the tabindex we added.
  private untag(element: Element): void {
    if (this.taggedElements.delete(element)) {
      element.removeAttribute('tabindex');
    }
  }

  private paintOverlay(element: Element): void {
    const scrollX = this.currentWindow ? this.currentWindow.scrollX : 0;
    const scrollY = this.currentWindow ? this.currentWindow.scrollY : 0;
    const box = element.getBoundingClientRect();

    this.highlight.style.top = `${box.top + scrollY}px`;
    this.highlight.style.left = `${box.left + scrollX}px`;
    this.highlight.style.width = `${box.width}px`;
    this.highlight.style.height = `${box.height}px`;
    this.highlight.style.display = 'block';

    // Show the label, measure it, then place it just outside the box.
    this.label.textContent = formatLabel(getElementInfo(element));
    this.label.style.display = 'block';
    const labelRect = this.label.getBoundingClientRect();
    const position = computeLabelPosition(
      box,
      {width: labelRect.width, height: labelRect.height},
      {
        width: this.currentWindow ? this.currentWindow.innerWidth : 0,
        height: this.currentWindow ? this.currentWindow.innerHeight : 0,
      }
    );
    this.label.style.top = `${position.top + scrollY}px`;
    this.label.style.left = `${position.left + scrollX}px`;

    this.activeElement = element;
  }

  private hideOverlay(): void {
    this.highlight.style.display = 'none';
    this.label.style.display = 'none';
    this.activeElement = null;
  }

  private announceHover(element: Element): void {
    // Toggle a trailing zero-width space so identical consecutive text still
    // triggers a live-region announcement.
    this.liveToggle = !this.liveToggle;
    this.liveRegion.textContent =
      formatDescription(getElementInfo(element)) +
      (this.liveToggle ? ZERO_WIDTH_SPACE : '');
  }

  private describeForFocus(element: Element): void {
    this.clearFocusDescription();
    this.description.textContent = formatDescription(getElementInfo(element));
    this.priorDescribedBy = element.getAttribute('aria-describedby');
    element.setAttribute(
      'aria-describedby',
      this.priorDescribedBy
        ? `${this.priorDescribedBy} ${DESCRIPTION_ID}`
        : DESCRIPTION_ID
    );
    this.describedElement = element;
  }

  private clearFocusDescription(): void {
    if (!this.describedElement) {
      return;
    }
    if (this.priorDescribedBy === null) {
      this.describedElement.removeAttribute('aria-describedby');
    } else {
      this.describedElement.setAttribute(
        'aria-describedby',
        this.priorDescribedBy
      );
    }
    this.describedElement = null;
    this.priorDescribedBy = null;
  }

  private scheduleReposition = (): void => {
    if (this.animationFrameId || !this.currentWindow) {
      return;
    }
    this.animationFrameId = this.currentWindow.requestAnimationFrame(() => {
      this.animationFrameId = 0;
      if (this.activeElement && this.activeElement.isConnected) {
        this.paintOverlay(this.activeElement);
      }
    });
  };

  private onMouseOver = (event: Event): void => {
    const element = asElement(event.target);
    if (!element || isOurNode(element)) {
      return;
    }
    this.hoveredElement = element;
    if (!this.focusedElement) {
      this.paintOverlay(element);
      this.announceHover(element);
    }
  };

  private onMouseOut = (event: Event): void => {
    // Moving between elements is handled by the next mouseover; only act when
    // leaving to nothing (off the document) or onto our overlay.
    const relatedElement = asElement((event as MouseEvent).relatedTarget);
    if (relatedElement && !isOurNode(relatedElement)) {
      return;
    }
    // Clear hover state even while focused, so a later blur does not fall back
    // to an element the pointer has already left.
    this.hoveredElement = null;
    if (!this.focusedElement) {
      this.hideOverlay();
    }
  };

  private onFocusIn = (event: Event): void => {
    const element = asElement(event.target);
    if (!element || isOurNode(element)) {
      return;
    }
    this.focusedElement = element;
    this.paintOverlay(element);
    this.describeForFocus(element);
  };

  private onFocusOut = (event: Event): void => {
    const element = asElement(event.target);
    if (element && element === this.focusedElement) {
      this.clearFocusDescription();
      this.focusedElement = null;
      if (this.hoveredElement) {
        this.paintOverlay(this.hoveredElement);
        this.announceHover(this.hoveredElement);
      } else {
        this.hideOverlay();
      }
    }
  };
}

export function installInspector(
  currentDocument: Document
): InspectorController {
  if (!currentDocument || !currentDocument.body) {
    return {teardown() {}};
  }
  return new InspectorOverlay(currentDocument);
}
