// True when the element is a context where text editing/typing is the primary
// purpose — an input, textarea, or contentEditable (e.g. a rich-text editor).
// Used to let the browser handle native typing/paste there instead of app-level
// keyboard, clipboard, or shortcut handlers. Accepts a raw EventTarget so it can
// be called directly with `event.target`.
export function isTargetEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA'
  );
}
