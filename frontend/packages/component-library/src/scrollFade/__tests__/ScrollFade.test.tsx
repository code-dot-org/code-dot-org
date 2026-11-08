import {act, render, screen} from '@testing-library/react';
import {vi} from 'vitest';

import {ScrollFade} from '../';

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

function sizeScroller(
  scroller: HTMLElement,
  {
    scrollHeight,
    clientHeight,
    scrollTop,
  }: {scrollHeight: number; clientHeight: number; scrollTop: number},
) {
  Object.defineProperty(scroller, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  });
  Object.defineProperty(scroller, 'clientHeight', {
    value: clientHeight,
    configurable: true,
  });
  scroller.scrollTop = scrollTop;
  act(() => {
    scroller.dispatchEvent(new Event('scroll'));
  });
}

function renderScrollFade(props = {}) {
  const {container} = render(
    <ScrollFade data-testid="root" {...props}>
      <p>content</p>
    </ScrollFade>,
  );
  const root = screen.getByTestId('root');
  const scroller = screen.getByText('content').parentElement as HTMLElement;
  return {container, root, scroller};
}

describe('Design System - ScrollFade', () => {
  it('renders its children in a scroller', () => {
    const {root, scroller} = renderScrollFade();
    expect(screen.getByText('content')).toBeInTheDocument();
    expect(root).toContainElement(scroller);
  });

  it('fades only the bottom edge at the top of an overflowing list', () => {
    const {root, scroller} = renderScrollFade();
    sizeScroller(scroller, {
      scrollHeight: 500,
      clientHeight: 200,
      scrollTop: 0,
    });
    expect(root).not.toHaveAttribute('data-fade-top');
    expect(root).toHaveAttribute('data-fade-bottom');
  });

  it('fades both edges mid-list and only the top at the end', () => {
    const {root, scroller} = renderScrollFade();
    sizeScroller(scroller, {
      scrollHeight: 500,
      clientHeight: 200,
      scrollTop: 100,
    });
    expect(root).toHaveAttribute('data-fade-top');
    expect(root).toHaveAttribute('data-fade-bottom');

    sizeScroller(scroller, {
      scrollHeight: 500,
      clientHeight: 200,
      scrollTop: 300,
    });
    expect(root).toHaveAttribute('data-fade-top');
    expect(root).not.toHaveAttribute('data-fade-bottom');
  });

  it('does not fade content that fits', () => {
    const {root, scroller} = renderScrollFade();
    sizeScroller(scroller, {
      scrollHeight: 200,
      clientHeight: 200,
      scrollTop: 0,
    });
    expect(root).not.toHaveAttribute('data-fade-top');
    expect(root).not.toHaveAttribute('data-fade-bottom');
  });

  it('updates when the content resizes', () => {
    const {root, scroller} = renderScrollFade();
    sizeScroller(scroller, {
      scrollHeight: 200,
      clientHeight: 200,
      scrollTop: 0,
    });
    expect(root).not.toHaveAttribute('data-fade-bottom');

    Object.defineProperty(scroller, 'scrollHeight', {
      value: 500,
      configurable: true,
    });
    act(() => resizeCallbacks.forEach(callback => callback()));
    expect(root).toHaveAttribute('data-fade-bottom');
  });

  it('sets the fade height and color as custom properties', () => {
    const {root} = renderScrollFade({
      fadeHeight: 40,
      fadeColor: 'var(--background-neutral-secondary)',
    });
    expect(root.style.getPropertyValue('--scroll-fade-height')).toBe('40px');
    expect(root.style.getPropertyValue('--scroll-fade-color')).toBe(
      'var(--background-neutral-secondary)',
    );
  });

  it('defaults to a 24px fade into the primary background', () => {
    const {root} = renderScrollFade();
    expect(root.style.getPropertyValue('--scroll-fade-height')).toBe('24px');
    expect(root.style.getPropertyValue('--scroll-fade-color')).toBe(
      'var(--background-neutral-primary)',
    );
  });

  it('keeps the fades out of the accessibility tree', () => {
    const {root} = renderScrollFade();
    const fades = root.querySelectorAll('[aria-hidden="true"]');
    expect(fades).toHaveLength(2);
  });

  it('adds no tab stops', () => {
    const {root, scroller} = renderScrollFade();
    expect(root).not.toHaveAttribute('tabindex');
    expect(scroller).not.toHaveAttribute('tabindex');
  });

  it('applies class names to the root and the scroller', () => {
    const {root, scroller} = renderScrollFade({
      className: 'root-class',
      scrollerClassName: 'scroller-class',
    });
    expect(root).toHaveClass('root-class');
    expect(scroller).toHaveClass('scroller-class');
  });

  it('forwards other HTML attributes to the root', () => {
    const {root} = renderScrollFade({id: 'list'});
    expect(root).toHaveAttribute('id', 'list');
  });
});
