// True when the element is a context where text editing/typing is the primary
// purpose — an input, textarea, or contentEditable (e.g. a TextNode editor).
// Used to let the browser handle native typing/paste there instead of the
// canvas's keyboard and clipboard handlers.
export function isTargetEditable(target: HTMLElement): boolean {
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA'
  );
}
