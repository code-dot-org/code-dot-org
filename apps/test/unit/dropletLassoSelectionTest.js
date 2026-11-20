import '../../lib/ace/src-noconflict/ace';
import droplet from '../../lib/droplet/droplet-full';

// Sentry APPS-4MT and APPS-WH: a lasso selection was left pointing at tokens
// that a reparse had replaced, and dragging it threw from Editor.hitTest.
describe('droplet lasso selection', () => {
  const TAB_KEY = 9;
  let editor, errors, onError;

  const mouse = (type, x, y) => {
    const event = new MouseEvent(type, {clientX: x, clientY: y, bubbles: true});
    // droplet ignores mouse buttons other than event.which === 1.
    Object.defineProperty(event, 'which', {value: 1});
    (type === 'mousedown' ? editor.dropletElement : window).dispatchEvent(
      event
    );
  };

  const keydown = (which, shiftKey) => {
    const event = new KeyboardEvent('keydown', {bubbles: true, shiftKey});
    Object.defineProperty(event, 'which', {value: which});
    editor.dropletElement.dispatchEvent(event);
  };

  const topLevelBlockBounds = () => {
    const bounds = [];
    for (let head = editor.session.tree.start; head; head = head.next) {
      if (head.type === 'blockStart' && head.parent === editor.session.tree) {
        bounds.push(
          editor.session.view.getViewNodeFor(head.container).bounds[0]
        );
      }
    }
    return bounds;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    const container = document.createElement('div');
    document.body.appendChild(container);
    editor = new droplet.Editor(container, {mode: 'javascript', palette: []});
    editor.setValue('foo(1);\nbar(2);\nbaz(3);\n');
    // jsdom has no layout, so give the block canvas a size for pointer events.
    const rect = () => ({left: 0, top: 0, right: 800, bottom: 600});
    editor.mainCanvas.getBoundingClientRect = rect;
    editor.mainScroller.getBoundingClientRect = rect;
    editor.redrawMain();

    // jsdom reports exceptions thrown by event listeners here, not to dispatchEvent.
    errors = [];
    onError = event => errors.push(event.error);
    window.addEventListener('error', onError);
  });

  afterEach(() => {
    window.removeEventListener('error', onError);
    jest.clearAllTimers();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  it('drops a lasso drag when a reparse replaces the selected blocks', () => {
    const [foo, bar] = topLevelBlockBounds();

    // Lasso foo() and bar() by dragging a rectangle from empty space.
    mouse('mousedown', 700, foo.y + 2);
    mouse('mousemove', 690, foo.y + 4);
    mouse('mousemove', bar.x + 2, bar.y + 2);
    mouse('mouseup', bar.x + 2, bar.y + 2);
    expect(editor.lassoSelection.stringify()).toBe('foo(1);\nbar(2);');

    // Shift+Tab puts the text cursor in bar()'s argument.
    keydown(TAB_KEY, true);
    expect(editor.cursorAtSocket()).toBe(true);

    // Drag the selection; Tab leaves the argument mid-drag, which reparses bar().
    mouse('mousedown', foo.x + 3, foo.y + 3);
    mouse('mousemove', foo.x + 20, foo.y + 20);
    keydown(TAB_KEY, false);
    mouse('mousemove', 700, 400);
    expect(errors).toEqual([]);

    // Near the bottom edge the drag-scroll timer calls handleDragContinue too.
    mouse('mousemove', 700, 595);
    expect(() => jest.advanceTimersByTime(50)).not.toThrow();

    mouse('mouseup', 700, 595);
    expect(errors).toEqual([]);
    expect(editor.draggingBlock).toBeNull();
    expect(editor.getValue()).toBe('foo(1);\nbar(2);\nbaz(3);\n');
  });
});
