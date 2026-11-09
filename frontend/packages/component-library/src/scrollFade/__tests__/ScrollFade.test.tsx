import {act, render, screen} from '@testing-library/react';
import {createRef, Ref} from 'react';
import {vi} from 'vitest';

import {ScrollFade, ScrollFadeProps} from '../';

type ResizeCallback = () => void;
let resizeCallbacks: ResizeCallback[] = [];

beforeEach(() => {
  resizeCallbacks = [];
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeCallback) {
        resizeCallbacks.push(callback);
      }
      observe = vi.fn();
      disconnect = vi.fn();
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

interface Box {
  scrollHeight?: number;
  clientHeight?: number;
  scrollWidth?: number;
  clientWidth?: number;
  offsetWidth?: number;
  offsetHeight?: number;
  clientLeft?: number;
}

function define(el: HTMLElement, values: object) {
  Object.entries(values).forEach(([key, value]) =>
    Object.defineProperty(el, key, {value, configurable: true}),
  );
}

// Lays the scroller out as given, then fires the ResizeObserver.
function layout(scroller: HTMLElement, box: Box) {
  define(scroller, {
    scrollHeight: 200,
    clientHeight: 200,
    scrollWidth: 200,
    clientWidth: 200,
    offsetWidth: box.clientWidth ?? 200,
    offsetHeight: box.clientHeight ?? 200,
    clientLeft: 0,
    ...box,
  });
  act(() => resizeCallbacks.forEach(callback => callback()));
}

function scrollTo(
  scroller: HTMLElement,
  {top = 0, left = 0}: {top?: number; left?: number},
) {
  scroller.scrollTop = top;
  scroller.scrollLeft = left;
  act(() => {
    scroller.dispatchEvent(new Event('scroll'));
  });
}

function renderScrollFade(
  props: Partial<ScrollFadeProps> & {ref?: Ref<HTMLDivElement>} = {},
) {
  render(
    <ScrollFade data-testid="root" {...props}>
      <p>content</p>
    </ScrollFade>,
  );
  const root = screen.getByTestId('root');
  const scroller = screen.getByText('content').parentElement as HTMLElement;
  return {root, scroller};
}

function fades(root: HTMLElement) {
  return ['top', 'right', 'bottom', 'left'].filter(edge =>
    root.hasAttribute(`data-fade-${edge}`),
  );
}

const TALL = {scrollHeight: 500, clientHeight: 200};
const WIDE = {scrollWidth: 500, clientWidth: 200};

describe('Design System - ScrollFade', () => {
  it('renders its children in a scroller', () => {
    const {root, scroller} = renderScrollFade();
    expect(screen.getByText('content')).toBeInTheDocument();
    expect(root).toContainElement(scroller);
  });

  describe('vertical edges (default)', () => {
    it('fades only the bottom at the top of an overflowing list', () => {
      const {root, scroller} = renderScrollFade();
      layout(scroller, TALL);
      expect(fades(root)).toEqual(['bottom']);
    });

    it('fades both mid-list and only the top at the end', () => {
      const {root, scroller} = renderScrollFade();
      layout(scroller, TALL);
      scrollTo(scroller, {top: 100});
      expect(fades(root)).toEqual(['top', 'bottom']);
      scrollTo(scroller, {top: 300});
      expect(fades(root)).toEqual(['top']);
    });

    it('does not fade content that fits', () => {
      const {root, scroller} = renderScrollFade();
      layout(scroller, {});
      expect(fades(root)).toEqual([]);
    });

    it('updates when the content resizes', () => {
      const {root, scroller} = renderScrollFade();
      layout(scroller, {});
      expect(fades(root)).toEqual([]);
      layout(scroller, TALL);
      expect(fades(root)).toEqual(['bottom']);
    });

    it('ignores horizontal overflow', () => {
      const {root, scroller} = renderScrollFade();
      layout(scroller, WIDE);
      scrollTo(scroller, {left: 100});
      expect(fades(root)).toEqual([]);
    });
  });

  describe('edges', () => {
    it('fades left and right while scrolled mid-way', () => {
      const {root, scroller} = renderScrollFade({edges: ['left', 'right']});
      layout(scroller, WIDE);
      expect(fades(root)).toEqual(['right']);
      scrollTo(scroller, {left: 100});
      expect(fades(root)).toEqual(['right', 'left']);
      scrollTo(scroller, {left: 300});
      expect(fades(root)).toEqual(['left']);
    });

    it('fades only the edges asked for', () => {
      const {root, scroller} = renderScrollFade({edges: ['bottom']});
      layout(scroller, TALL);
      scrollTo(scroller, {top: 100});
      expect(fades(root)).toEqual(['bottom']);
    });

    it('fades all four edges at once', () => {
      const {root, scroller} = renderScrollFade({
        edges: ['top', 'right', 'bottom', 'left'],
      });
      layout(scroller, {...TALL, ...WIDE});
      scrollTo(scroller, {top: 100, left: 100});
      expect(fades(root)).toEqual(['top', 'right', 'bottom', 'left']);
    });

    it('scrolls on the axes its edges imply', () => {
      const {scroller: vertical} = renderScrollFade({edges: ['top']});
      expect(vertical.className).toMatch(/scrollY/);
      expect(vertical.className).not.toMatch(/scrollX/);
      document.body.innerHTML = '';
      const {scroller: horizontal} = renderScrollFade({edges: ['right']});
      expect(horizontal.className).toMatch(/scrollX/);
      expect(horizontal.className).not.toMatch(/scrollY/);
    });

    it('maps RTL scroll positions to physical edges', () => {
      const {root, scroller} = renderScrollFade({
        edges: ['left', 'right'],
        scrollerProps: {style: {direction: 'rtl'}},
      });
      layout(scroller, WIDE);
      // RTL starts at the right edge, so the hidden content is to the left.
      expect(fades(root)).toEqual(['left']);
      scrollTo(scroller, {left: -300});
      expect(fades(root)).toEqual(['right']);
    });
  });

  describe('fade size and insets', () => {
    it('defaults to a 24px fade', () => {
      const {root} = renderScrollFade();
      expect(root.style.getPropertyValue('--scroll-fade-size')).toBe('24px');
    });

    it('takes a size in px or as any CSS length', () => {
      const {root} = renderScrollFade({fadeSize: 40});
      expect(root.style.getPropertyValue('--scroll-fade-size')).toBe('40px');
      document.body.innerHTML = '';
      const {root: remRoot} = renderScrollFade({fadeSize: '1.5rem'});
      expect(remRoot.style.getPropertyValue('--scroll-fade-size')).toBe(
        '1.5rem',
      );
    });

    it('insets the fades by the scrollbars', () => {
      const {root, scroller} = renderScrollFade();
      layout(scroller, {
        ...TALL,
        clientWidth: 185,
        offsetWidth: 200,
        clientHeight: 185,
        offsetHeight: 200,
      });
      expect(root.style.getPropertyValue('--scroll-fade-inset-left')).toBe(
        '0px',
      );
      expect(root.style.getPropertyValue('--scroll-fade-inset-right')).toBe(
        '15px',
      );
      expect(root.style.getPropertyValue('--scroll-fade-inset-bottom')).toBe(
        '15px',
      );
    });

    it('insets the fades by a scrollbar on the left', () => {
      const {root, scroller} = renderScrollFade();
      layout(scroller, {
        ...TALL,
        clientWidth: 185,
        offsetWidth: 200,
        clientLeft: 15,
      });
      expect(root.style.getPropertyValue('--scroll-fade-inset-left')).toBe(
        '15px',
      );
      expect(root.style.getPropertyValue('--scroll-fade-inset-right')).toBe(
        '0px',
      );
    });
  });

  describe('keyboard access', () => {
    it('makes an overflowing scroller with no focusable content a tab stop', () => {
      const {scroller} = renderScrollFade();
      layout(scroller, TALL);
      expect(scroller).toHaveAttribute('tabindex', '0');
      expect(scroller).not.toHaveAttribute('role');
    });

    it('names the tab stop as a region when given a label', () => {
      const {scroller} = renderScrollFade({
        scrollerProps: {'aria-label': 'Results'},
      });
      layout(scroller, TALL);
      expect(screen.getByRole('region', {name: 'Results'})).toBe(scroller);
    });

    it('adds no tab stop when the content fits', () => {
      const {scroller} = renderScrollFade({
        scrollerProps: {'aria-label': 'Results'},
      });
      layout(scroller, {});
      expect(scroller).not.toHaveAttribute('tabindex');
      expect(scroller).not.toHaveAttribute('role');
    });

    it('drops the tab stop once the content stops overflowing', () => {
      const {scroller} = renderScrollFade();
      layout(scroller, TALL);
      layout(scroller, {});
      expect(scroller).not.toHaveAttribute('tabindex');
    });

    it('adds no tab stop when the content has focusable elements', () => {
      render(
        <ScrollFade>
          <div>
            <button>focusable</button>
          </div>
        </ScrollFade>,
      );
      const scroller = screen.getByRole('button').parentElement
        ?.parentElement as HTMLElement;
      layout(scroller, TALL);
      expect(scroller).not.toHaveAttribute('tabindex');
    });

    it('drops the tab stop when focusable content arrives deep inside', async () => {
      const {scroller} = renderScrollFade();
      layout(scroller, TALL);
      expect(scroller).toHaveAttribute('tabindex', '0');
      await act(async () => {
        const button = document.createElement('button');
        screen.getByText('content').appendChild(button);
        // MutationObserver callbacks run as a microtask.
        await Promise.resolve();
      });
      expect(scroller).not.toHaveAttribute('tabindex');
    });

    it('leaves a tabIndex from scrollerProps alone', () => {
      const {scroller} = renderScrollFade({scrollerProps: {tabIndex: -1}});
      layout(scroller, TALL);
      expect(scroller).toHaveAttribute('tabindex', '-1');
    });

    it('warns when the tab stop has no name', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const {scroller} = renderScrollFade();
      layout(scroller, TALL);
      expect(warn).toHaveBeenCalledTimes(1);
      warn.mockRestore();
    });

    it('does not warn when the tab stop is named', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const {scroller} = renderScrollFade({
        scrollerProps: {'aria-label': 'Results'},
      });
      layout(scroller, TALL);
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  describe('props', () => {
    it('forwards the ref to the scroller', () => {
      const ref = createRef<HTMLDivElement>();
      const {scroller} = renderScrollFade({ref});
      expect(ref.current).toBe(scroller);
    });

    it('applies class names to the root and the scroller', () => {
      const {root, scroller} = renderScrollFade({
        className: 'root-class',
        scrollerProps: {className: 'scroller-class'},
      });
      expect(root).toHaveClass('root-class');
      expect(scroller).toHaveClass('scroller-class');
    });

    it('forwards other HTML attributes to the root', () => {
      const {root} = renderScrollFade({id: 'list'});
      expect(root).toHaveAttribute('id', 'list');
    });

    it('forwards scrollerProps to the scroller', () => {
      const {scroller} = renderScrollFade({
        scrollerProps: {id: 'scroller', 'aria-describedby': 'hint'},
      });
      expect(scroller).toHaveAttribute('id', 'scroller');
      expect(scroller).toHaveAttribute('aria-describedby', 'hint');
    });
  });
});
