import {act, fireEvent, render} from '@testing-library/react';
import {createRef} from 'react';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';

import type {LocationPicker} from '../../blockly/pool';
import Playspace from '../Playspace';

let picker: LocationPicker | null = null;
vi.mock('../../blockly/pool', () => ({
  setLocationPicker: (next: LocationPicker | null) => {
    picker = next;
  },
}));
vi.mock('../../imageTrim', () => ({getImageThumbnail: () => null}));
vi.mock('../../redux/store', () => ({
  useAppSelector: (select: (state: unknown) => unknown) =>
    select({
      animationList: {
        orderedKeys: ['k1'],
        propsByKey: {k1: {name: 'Hero', sourceUrl: 'hero.png'}},
      },
    }),
}));

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  // jsdom's pointer events carry no coordinates without this.
  (window as unknown as {PointerEvent: unknown}).PointerEvent = MouseEvent;
});

beforeEach(() => {
  picker = null;
});

// The 400x400 canvas, drawn at half size with its corner at (10, 20).
function renderPlayspace() {
  const canvasRef = createRef<HTMLDivElement>();
  const onOuterClick = vi.fn();
  const utils = render(
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div onClick={onOuterClick}>
      <Playspace
        mode="preview"
        canvasContainerRef={canvasRef}
        getDefaultSpriteSize={() => 50}
      />
    </div>,
  );
  const canvas = canvasRef.current as HTMLDivElement;
  canvas.getBoundingClientRect = () =>
    ({left: 10, top: 20, width: 200, height: 200}) as DOMRect;
  Object.defineProperty(canvas, 'offsetWidth', {value: 400});
  Object.defineProperty(canvas, 'offsetHeight', {value: 400});
  return {...utils, canvas, onOuterClick};
}

function startPick(costume: string | null = 'Hero') {
  const onUpdate = vi.fn();
  const onDone = vi.fn();
  act(() => picker?.(undefined, onUpdate, onDone, costume));
  return {onUpdate, onDone};
}

describe('location picking', () => {
  it('registers a picker while mounted, and abandons a pick on unmount', () => {
    const {unmount} = renderPlayspace();
    expect(picker).not.toBeNull();
    const {onDone} = startPick();
    unmount();
    expect(picker).toBeNull();
    expect(onDone).toHaveBeenCalledWith(null);
  });

  it('reports the pointer in canvas coordinates and shows the costume there', () => {
    const {canvas, container} = renderPlayspace();
    const {onUpdate} = startPick();
    fireEvent.pointerMove(canvas, {clientX: 110, clientY: 70});
    expect(onUpdate).toHaveBeenLastCalledWith({x: 200, y: 100});
    const ghost = container.querySelector('img') as HTMLImageElement;
    expect(ghost.getAttribute('src')).toBe('hero.png');
    expect(ghost.style.left).toBe('175px');
    expect(ghost.style.top).toBe('75px');
  });

  it('shows no ghost for a block without a costume', () => {
    const {canvas, container} = renderPlayspace();
    startPick(null);
    fireEvent.pointerMove(canvas, {clientX: 110, clientY: 70});
    expect(container.querySelector('img')).toBeNull();
  });

  it('ends on a click, which goes no further', () => {
    const {canvas, container, onOuterClick} = renderPlayspace();
    const {onUpdate, onDone} = startPick();
    fireEvent.pointerMove(canvas, {clientX: 110, clientY: 70});
    fireEvent.pointerUp(canvas, {clientX: 60, clientY: 120});
    fireEvent.click(canvas);
    expect(onDone).toHaveBeenCalledWith({x: 100, y: 200});
    expect(onOuterClick).not.toHaveBeenCalled();
    expect(container.querySelector('img')).toBeNull();

    onUpdate.mockClear();
    fireEvent.pointerMove(canvas, {clientX: 30, clientY: 30});
    fireEvent.click(canvas);
    expect(onUpdate).not.toHaveBeenCalled();
    expect(onOuterClick).toHaveBeenCalledTimes(1);
  });

  it('abandons a pick when another begins', () => {
    renderPlayspace();
    const first = startPick();
    const second = startPick();
    expect(first.onDone).toHaveBeenCalledWith(null);
    expect(second.onDone).not.toHaveBeenCalled();
  });
});
