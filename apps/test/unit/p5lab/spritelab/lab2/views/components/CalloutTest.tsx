import {act, render} from '@testing-library/react';
import React from 'react';

import Callout from '@cdo/apps/p5lab/spritelab/lab2/views/components/Callout';

const TARGET_RECT = {left: 100, top: 200, width: 60, height: 40};

/** A target in the document, boxed as jsdom's layout-free elements are not. */
const mountTarget = () => {
  const target = document.createElement('button');
  target.id = 'target';
  document.body.appendChild(target);
  jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({
    ...TARGET_RECT,
    right: TARGET_RECT.left + TARGET_RECT.width,
    bottom: TARGET_RECT.top + TARGET_RECT.height,
    x: TARGET_RECT.left,
    y: TARGET_RECT.top,
    toJSON: () => ({}),
  });
  return target;
};

const arrowBox = (container: HTMLElement) =>
  container.firstElementChild as HTMLElement | null;

describe('Callout', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    jest.useRealTimers();
  });

  it('renders nothing when the selector matches nothing', () => {
    const {container} = render(<Callout selector="#missing" />);
    expect(container.innerHTML).toBe('');
  });

  it('points up from below the element, centered on it', () => {
    mountTarget();
    const {container} = render(<Callout selector="#target" direction="up" />);
    const box = arrowBox(container)!;
    expect(box.className).toContain('up');
    expect(box.style.left).toBe('130px');
    expect(box.style.top).toBe('244px');
  });

  it('points down from above the element, honoring the offset', () => {
    mountTarget();
    const {container} = render(
      <Callout selector="#target" direction="down" offset={10} />
    );
    const box = arrowBox(container)!;
    expect(box.className).toContain('down');
    expect(box.style.left).toBe('130px');
    expect(box.style.top).toBe('190px');
  });

  it('points left from the right of the element, mid-height', () => {
    mountTarget();
    const {container} = render(<Callout selector="#target" direction="left" />);
    const box = arrowBox(container)!;
    expect(box.className).toContain('left');
    expect(box.style.left).toBe('164px');
    expect(box.style.top).toBe('220px');
  });

  it('follows the element as it appears, moves, and goes away', () => {
    jest.useFakeTimers();
    const {container} = render(<Callout selector="#target" />);
    expect(arrowBox(container)).toBeNull();

    const target = mountTarget();
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(arrowBox(container)!.style.left).toBe('130px');

    (target.getBoundingClientRect as jest.Mock).mockReturnValue({
      ...TARGET_RECT,
      left: 300,
      right: 360,
      bottom: TARGET_RECT.top + TARGET_RECT.height,
      x: 300,
      y: TARGET_RECT.top,
      toJSON: () => ({}),
    });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(arrowBox(container)!.style.left).toBe('330px');

    target.remove();
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(arrowBox(container)).toBeNull();
  });
});
