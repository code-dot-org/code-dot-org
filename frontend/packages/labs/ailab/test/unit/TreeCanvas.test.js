import {ThemeProvider} from '@mui/material/styles';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {createElement} from 'react';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';

import TreeCanvas from '../../src/UIComponents/TreeCanvas';

const TOOLBAR_LEFT = 8;
const TOOLBAR_WIDTH = 40;

let viewportSize;
let resizeCallbacks;

vi.stubGlobal(
  'ResizeObserver',
  class {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {
      resizeCallbacks.add(this.callback);
    }
    disconnect() {
      resizeCallbacks.delete(this.callback);
    }
  },
);

function resizeViewport(width, height) {
  viewportSize = {width, height};
  act(() => resizeCallbacks.forEach(callback => callback([])));
}

function canvas(props = {}, children = 'tree') {
  return createElement(
    ThemeProvider,
    {theme: getMuiThemeForBrand(undefined)},
    createElement(
      TreeCanvas,
      {contentWidth: 752, contentHeight: 312, ...props},
      children,
    ),
  );
}

function renderCanvas(props, children) {
  return render(canvas(props, children));
}

function overlayRef(width, top = 0) {
  const overlay = document.createElement('div');
  overlay.getBoundingClientRect = () => ({
    left: viewportSize.width - width,
    right: viewportSize.width,
    top,
    bottom: top + 200,
  });
  return {current: overlay};
}

function mockBoxes(boxes) {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    function () {
      const {left, top, width = 0, height = 0} = boxes.get(this);
      return {
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height,
      };
    },
  );
}

let followNode;

// Fitted, the content's origin sits at (72, 102) at scale 0.5, in a frame from x = 72 to 448.
function renderNodesAt(xs, props = {}, viewportWidth = 472) {
  const children = xs.map(x =>
    createElement('button', {key: x, id: `node-${x}`}, `node at ${x}`),
  );
  const {rerender} = renderCanvas(props, children);
  followNode = id => rerender(canvas({...props, followId: id}, children));
  resizeViewport(viewportWidth, 360);
  const nodes = xs.map(x => screen.getByText(`node at ${x}`));
  const boxes = new Map(
    nodes.map((node, index) => [
      node,
      {left: 72 + xs[index] / 2, top: 202, width: 80, height: 20},
    ]),
  );
  const content = nodes[0].parentElement;
  boxes.set(content, {left: 72, top: 102});
  boxes.set(content.parentElement, {
    left: 0,
    top: 0,
    width: viewportWidth,
    height: 360,
  });
  mockBoxes(boxes);
  return nodes;
}

function button(name) {
  return screen.getByRole('button', {name});
}

function contentTransform() {
  return screen.getByText('tree').style.transform;
}

function contentScale() {
  return parseFloat(contentTransform().match(/scale\((.*)\)/)[1]);
}

describe('TreeCanvas', () => {
  beforeEach(() => {
    viewportSize = {width: 0, height: 0};
    resizeCallbacks = new Set();
    vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(
      () => viewportSize.width,
    );
    vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(
      () => viewportSize.height,
    );
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({
        left: 0,
        right: viewportSize.width,
        top: 0,
        bottom: viewportSize.height,
      }),
    );
    vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(
      function () {
        return this.getAttribute('role') === 'group' ? TOOLBAR_LEFT : 0;
      },
    );
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(
      function () {
        return this.getAttribute('role') === 'group' ? TOOLBAR_WIDTH : 0;
      },
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it('fits the content beside the toolbar once the viewport has room', () => {
    renderCanvas();
    resizeViewport(0, 0);

    expect(contentTransform()).toBe('');

    resizeViewport(472, 360);

    expect(contentTransform()).toBe('translate(72px, 102px) scale(0.5)');
  });

  it('refits when the viewport resizes', () => {
    renderCanvas();
    resizeViewport(472, 360);
    resizeViewport(848, 360);

    expect(contentTransform()).toBe('translate(72px, 24px) scale(1)');
  });

  it('fits the content clear of an overlay on the right edge', () => {
    renderCanvas({overlayRef: overlayRef(376)});
    resizeViewport(848, 360);

    expect(contentTransform()).toBe('translate(72px, 102px) scale(0.5)');
  });

  it('ignores an overlay stacked below the canvas', () => {
    renderCanvas({overlayRef: overlayRef(376, 360)});
    resizeViewport(848, 360);

    expect(contentTransform()).toBe('translate(72px, 24px) scale(1)');
  });

  it('fits under the overlay when keeping it clear leaves no room', () => {
    renderCanvas({overlayRef: overlayRef(376)});
    resizeViewport(472, 360);

    expect(contentTransform()).toBe('translate(72px, 102px) scale(0.5)');
  });

  it('zooms to fit clear of the overlay', async () => {
    renderCanvas({overlayRef: overlayRef(376)});
    resizeViewport(848, 360);
    fireEvent.click(button('Zoom in'));
    await vi.waitFor(() => expect(contentScale()).toBe(0.5 * 1.25));

    fireEvent.click(button('Zoom to fit'));

    await vi.waitFor(() =>
      expect(contentTransform()).toBe('translate(72px, 102px) scale(0.5)'),
    );
  });

  it("keeps the student's zoom when the viewport resizes", async () => {
    renderCanvas();
    resizeViewport(472, 360);
    fireEvent.click(button('Zoom in'));
    await vi.waitFor(() => expect(contentScale()).toBe(0.5 * 1.25));

    resizeViewport(848, 360);

    expect(contentScale()).toBe(0.5 * 1.25);
  });

  it('refits on resize again after Zoom to fit', async () => {
    renderCanvas();
    resizeViewport(472, 360);
    fireEvent.click(button('Zoom in'));
    await vi.waitFor(() => expect(contentScale()).toBe(0.5 * 1.25));
    fireEvent.click(button('Zoom to fit'));
    await vi.waitFor(() => expect(contentScale()).toBe(0.5));

    resizeViewport(848, 360);

    expect(contentTransform()).toBe('translate(72px, 24px) scale(1)');
  });

  it('zooms in a whole step per click, however fast the clicks come', async () => {
    renderCanvas();
    resizeViewport(472, 360);

    fireEvent.click(button('Zoom in'));
    fireEvent.click(button('Zoom in'));

    await vi.waitFor(() => expect(contentScale()).toBe(0.5 * 1.25 * 1.25));
  });

  it('zooms to the path beside the toolbar', async () => {
    renderCanvas({pathBounds: {x: 0, y: 208, width: 160, height: 104}});
    resizeViewport(472, 360);

    fireEvent.click(button('Zoom to your path'));

    await vi.waitFor(() =>
      expect(contentTransform()).toBe('translate(180px, -80px) scale(1)'),
    );
  });

  it('lets keyboard users reach why zooming to the path is unavailable', () => {
    renderCanvas();

    expect(button('Zoom to your path').disabled).toBe(true);
    expect(button('Zoom to your path').parentElement.tabIndex).toBe(0);
    expect(button('Zoom to your path').parentElement.title).toBe(
      'Make a prediction to see your path',
    );
    expect(button('Zoom in').parentElement.hasAttribute('tabindex')).toBe(
      false,
    );
  });

  it('takes its zoom buttons out of the tab order when asked', () => {
    renderCanvas({toolbarTabbable: false});

    expect(button('Zoom in').tabIndex).toBe(-1);
    expect(button('Zoom to your path').parentElement.tabIndex).toBe(-1);
  });

  it('zooms to a readable scale and pans a node that takes keyboard focus into view', async () => {
    const [node] = renderNodesAt([800]);

    act(() => node.focus());

    await vi.waitFor(() =>
      expect(node.parentElement.style.transform).toBe(
        'translate(-512px, 2px) scale(1)',
      ),
    );
  });

  it('pans a node that takes keyboard focus clear of an overlay', async () => {
    const [node] = renderNodesAt([800], {overlayRef: overlayRef(376)}, 848);

    act(() => node.focus());

    await vi.waitFor(() =>
      expect(node.parentElement.style.transform).toBe(
        'translate(-512px, 2px) scale(1)',
      ),
    );
  });

  it('keeps the view on a node it panned to when the viewport resizes', async () => {
    const [node] = renderNodesAt([800]);
    act(() => node.focus());
    await vi.waitFor(() =>
      expect(node.parentElement.style.transform).toBe(
        'translate(-512px, 2px) scale(1)',
      ),
    );

    resizeViewport(848, 360);

    expect(node.parentElement.style.transform).toBe(
      'translate(-512px, 2px) scale(1)',
    );
  });

  it('tells only the focused node the scale, so its ring can keep a width on screen', async () => {
    const [node] = renderNodesAt([800]);

    act(() => node.focus());

    expect(node.style.getPropertyValue('--tree-canvas-scale')).toBe('0.5');
    await vi.waitFor(() =>
      expect(node.style.getPropertyValue('--tree-canvas-scale')).toBe('1'),
    );
    expect(
      node.parentElement.style.getPropertyValue('--tree-canvas-scale'),
    ).toBe('');
  });

  it('leaves the view alone when focus shows no ring, as after a click', async () => {
    const [node] = renderNodesAt([800]);
    const matches = Element.prototype.matches;
    vi.spyOn(Element.prototype, 'matches').mockImplementation(
      function (selector) {
        return selector === ':focus-visible'
          ? false
          : matches.call(this, selector);
      },
    );

    act(() => node.focus());
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(node.parentElement.style.transform).toBe(
      'translate(72px, 102px) scale(0.5)',
    );
  });

  it('pans from where the view is heading when focus moves again', async () => {
    const [far, near] = renderNodesAt([800, 100]);

    act(() => far.focus());
    act(() => near.focus());

    await vi.waitFor(() =>
      expect(near.parentElement.style.transform).toBe(
        'translate(-28px, 2px) scale(1)',
      ),
    );
  });

  it('zooms to a readable scale and pans the node it follows into view', async () => {
    const [node] = renderNodesAt([800]);

    followNode('node-800');

    await vi.waitFor(() =>
      expect(node.parentElement.style.transform).toBe(
        'translate(-512px, 2px) scale(1)',
      ),
    );
  });

  it('follows from where the view is heading when the node it follows changes', async () => {
    const [, near] = renderNodesAt([800, 100]);

    followNode('node-800');
    followNode('node-100');

    await vi.waitFor(() =>
      expect(near.parentElement.style.transform).toBe(
        'translate(-28px, 2px) scale(1)',
      ),
    );
  });

  it('pans a node that takes keyboard focus clear of the hints', async () => {
    renderCanvas(
      {hints: createElement('span', {}, 'hint')},
      createElement('button', {}, 'node'),
    );
    resizeViewport(472, 360);
    const node = screen.getByText('node');
    const hints = screen.getByText('hint').parentElement;
    mockBoxes(
      new Map([
        [node, {left: 122, top: 12, width: 80, height: 20}],
        [node.parentElement, {left: 72, top: 102}],
      ]),
    );
    vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(
      function () {
        return this === hints ? 8 : 0;
      },
    );
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(
      function () {
        return this === hints ? 28 : 0;
      },
    );

    act(() => node.focus());

    await vi.waitFor(() =>
      expect(node.parentElement.style.transform).toBe(
        'translate(22px, 240px) scale(1)',
      ),
    );
  });

  it('pans a label hanging off a node into view with it', async () => {
    renderCanvas(
      {},
      createElement('button', {}, createElement('span', {}, 'label')),
    );
    resizeViewport(472, 360);
    const label = screen.getByText('label');
    const node = label.parentElement;
    mockBoxes(
      new Map([
        [node, {left: 122, top: 40, width: 80, height: 20}],
        [label, {left: 142, top: 12, width: 40, height: 9}],
        [node.parentElement, {left: 72, top: 102}],
      ]),
    );

    act(() => node.focus());

    await vi.waitFor(() =>
      expect(node.parentElement.style.transform).toBe(
        'translate(22px, 204px) scale(1)',
      ),
    );
  });
});
