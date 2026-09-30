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

function renderCanvas(props = {}) {
  render(
    createElement(
      ThemeProvider,
      {theme: getMuiThemeForBrand(undefined)},
      createElement(
        TreeCanvas,
        {contentWidth: 752, contentHeight: 312, ...props},
        'tree',
      ),
    ),
  );
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
});
