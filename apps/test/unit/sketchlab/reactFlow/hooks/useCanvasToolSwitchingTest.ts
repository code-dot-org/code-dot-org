import {renderHook, act} from '@testing-library/react-hooks';
import React from 'react';

import {
  MIDDLE_MOUSE_BUTTON,
  useCanvasToolSwitching,
} from '@cdo/apps/sketchlab/reactFlow/hooks/useCanvasToolSwitching';

function makeKeyEvent(
  key: string,
  overrides: Partial<React.KeyboardEvent> = {}
) {
  return {
    key,
    target: document.createElement('div'),
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    ...overrides,
  } as unknown as React.KeyboardEvent;
}

function makeMouseEvent(button: number) {
  return {
    button,
    preventDefault: jest.fn(),
  } as unknown as React.MouseEvent;
}

describe('useCanvasToolSwitching', () => {
  const setCanvasTool = jest.fn();
  const container = document.createElement('div');
  const workspace = document.createElement('div');
  const defaultOptions = {
    setCanvasTool,
    readOnly: false,
    connecting: false,
    isGroupMode: false,
    canvasContainerRef: {current: container},
    workspaceRef: {current: workspace},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('selects the hand tool on "h" and the select tool on "s"', () => {
    const {result} = renderHook(() => useCanvasToolSwitching(defaultOptions));

    expect(result.current.handleToolKeyDown(makeKeyEvent('h'))).toBe(true);
    expect(setCanvasTool).toHaveBeenLastCalledWith('grab');

    expect(result.current.handleToolKeyDown(makeKeyEvent('s'))).toBe(true);
    expect(setCanvasTool).toHaveBeenLastCalledWith('cursor');
  });

  it('leaves other keys, modified keys, and typing alone', () => {
    const {result} = renderHook(() => useCanvasToolSwitching(defaultOptions));

    const ignored = [
      makeKeyEvent('g'),
      makeKeyEvent('s', {metaKey: true}),
      makeKeyEvent('h', {ctrlKey: true}),
      makeKeyEvent('h', {target: document.createElement('input')}),
    ];
    ignored.forEach(event => {
      expect(result.current.handleToolKeyDown(event)).toBe(false);
    });
    expect(setCanvasTool).not.toHaveBeenCalled();
  });

  it('ignores the shortcuts in read-only, connect, and group modes', () => {
    const modes = [
      {readOnly: true},
      {connecting: true},
      {isGroupMode: true},
    ] as const;

    modes.forEach(mode => {
      const {result} = renderHook(() =>
        useCanvasToolSwitching({...defaultOptions, ...mode})
      );
      expect(result.current.handleToolKeyDown(makeKeyEvent('h'))).toBe(false);
    });
    expect(setCanvasTool).not.toHaveBeenCalled();
  });

  it('reports the middle mouse button as held until it is released', () => {
    const {result} = renderHook(() => useCanvasToolSwitching(defaultOptions));

    act(() => {
      result.current.handleMouseDownCapture(
        makeMouseEvent(MIDDLE_MOUSE_BUTTON)
      );
    });
    expect(result.current.middleButtonHeld).toBe(true);

    // The release can land anywhere, so it is tracked on the window.
    act(() => {
      window.dispatchEvent(new MouseEvent('mouseup'));
    });
    expect(result.current.middleButtonHeld).toBe(false);
  });

  it('ignores mouse buttons other than the middle one', () => {
    const {result} = renderHook(() => useCanvasToolSwitching(defaultOptions));

    act(() => {
      result.current.handleMouseDownCapture(makeMouseEvent(0));
    });
    expect(result.current.middleButtonHeld).toBe(false);
  });
});
