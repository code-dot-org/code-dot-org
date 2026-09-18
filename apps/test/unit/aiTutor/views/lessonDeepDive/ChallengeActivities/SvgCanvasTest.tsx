import {act, fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import SvgCanvas, {
  buildPathString,
} from '@cdo/apps/aiTutor/views/lessonDeepDive/ChallengeActivities/SvgCanvas';

// ---------------------------------------------------------------------------
// Fabric mock
// ---------------------------------------------------------------------------

// Event handlers registered by the component via canvas.on().
// Prefixed 'mock' so Jest's hoist exception applies inside jest.mock().
const mockHandlers: Record<string, (e?: unknown) => void> = {};

// Single mock canvas instance shared across all tests.
// Prefixed 'mock' for the same reason.
const mockCanvas = {
  add: jest.fn(),
  remove: jest.fn(),
  getObjects: jest.fn().mockReturnValue([]),
  getActiveObject: jest.fn().mockReturnValue(null),
  setActiveObject: jest.fn(),
  discardActiveObject: jest.fn(),
  renderAll: jest.fn(),
  requestRenderAll: jest.fn(),
  dispose: jest.fn(),
  getWidth: jest.fn().mockReturnValue(800),
  getHeight: jest.fn().mockReturnValue(600),
  toDataURL: jest.fn().mockReturnValue('data:image/png;base64,abc'),
  toSVG: jest.fn().mockReturnValue('<svg></svg>'),
  bringObjectToFront: jest.fn(),
  bringObjectForward: jest.fn(),
  sendObjectBackwards: jest.fn(),
  sendObjectToBack: jest.fn(),
  setWidth: jest.fn(),
  setHeight: jest.fn(),
  on: jest
    .fn()
    .mockImplementation((event: string, handler: (e?: unknown) => void) => {
      mockHandlers[event] = handler;
    }),
  isDrawingMode: false,
  selection: true,
  skipTargetFind: false,
  backgroundColor: '#1e1e1e',
  defaultCursor: 'default',
  freeDrawingBrush: {color: '#000', width: 3},
  preserveObjectStacking: false,
};

jest.mock('fabric', () => {
  class FabricBase {
    data?: unknown;
    selectable = true;
    evented = true;
    left = 0;
    top = 0;
    fill = '#000';
    stroke = '#000';
    getBoundingRect() {
      return {left: this.left, top: this.top, width: 100, height: 100};
    }
    set(props: Record<string, unknown>) {
      Object.assign(this, props);
    }
    setCoords() {}
    getScaledWidth() {
      return 100;
    }
    getScaledHeight() {
      return 100;
    }
  }
  class Rect extends FabricBase {
    type = 'rect';
  }
  class Circle extends FabricBase {
    type = 'circle';
  }
  class Triangle extends FabricBase {
    type = 'triangle';
  }
  class IText extends FabricBase {
    type = 'i-text';
    constructor(_text: string, opts?: Record<string, unknown>) {
      super();
      if (opts) Object.assign(this, opts);
    }
    enterEditing() {}
  }
  class Line extends FabricBase {
    type = 'line';
  }
  class Path extends FabricBase {
    type = 'path';
    constructor(_pathStr: string, opts?: Record<string, unknown>) {
      super();
      if (opts) Object.assign(this, opts);
    }
  }
  class FabricImage extends FabricBase {
    type = 'image';
    scaleToWidth() {}
    scaleToHeight() {}
  }
  return {
    Canvas: jest.fn(() => mockCanvas),
    Rect,
    Circle,
    Triangle,
    IText,
    Line,
    Path,
    FabricImage,
    PencilBrush: jest.fn(() => ({color: '#000', width: 3})),
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultProps = {onHasObjectsChange: jest.fn()};

function renderCanvas(props?: Partial<typeof defaultProps>) {
  return render(<SvgCanvas {...defaultProps} {...props} />);
}

function getCanvasContainer() {
  return screen.getByRole('application');
}

function keyDown(element: HTMLElement, key: string, extra?: object) {
  fireEvent.keyDown(element, {key, ...extra});
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Clear call history but keep mockImplementation.
  jest.clearAllMocks();
  // Reset canvas mutable properties modified by the component.
  mockCanvas.skipTargetFind = false;
  mockCanvas.selection = true;
  mockCanvas.isDrawingMode = false;
  mockCanvas.defaultCursor = 'default';
  // Re-attach the on implementation after clearAllMocks.
  mockCanvas.on.mockImplementation(
    (event: string, handler: (e?: unknown) => void) => {
      mockHandlers[event] = handler;
    }
  );
  mockCanvas.getObjects.mockReturnValue([]);
  mockCanvas.getActiveObject.mockReturnValue(null);
  // Clear captured handlers from the previous test.
  Object.keys(mockHandlers).forEach(k => delete mockHandlers[k]);
});

// ---------------------------------------------------------------------------
// buildPathString — pure function
// ---------------------------------------------------------------------------

describe('buildPathString', () => {
  it('returns an empty string for fewer than 2 points', () => {
    expect(buildPathString([])).toBe('');
    expect(buildPathString([{x: 10, y: 20}])).toBe('');
  });

  it('produces M … L … for 2 points', () => {
    expect(
      buildPathString([
        {x: 0, y: 0},
        {x: 10, y: 20},
      ])
    ).toBe('M 0 0 L 10 20');
  });

  it('includes all intermediate L segments for 3+ points', () => {
    expect(
      buildPathString([
        {x: 5, y: 3},
        {x: 15, y: 7},
        {x: 30, y: 1},
      ])
    ).toBe('M 5 3 L 15 7 L 30 1');
  });
});

// ---------------------------------------------------------------------------
// Tool switching
// ---------------------------------------------------------------------------

describe('tool switching', () => {
  it('sets skipTargetFind and deselects when a shape tool is activated', () => {
    renderCanvas();
    fireEvent.click(screen.getByRole('button', {name: 'Rectangle'}));
    expect(mockCanvas.skipTargetFind).toBe(true);
    expect(mockCanvas.discardActiveObject).toHaveBeenCalled();
  });

  it('clears skipTargetFind when returning to the select tool', () => {
    renderCanvas();
    fireEvent.click(screen.getByRole('button', {name: 'Rectangle'}));
    fireEvent.click(screen.getByRole('button', {name: 'Select'}));
    expect(mockCanvas.skipTargetFind).toBe(false);
  });

  it('sets skipTargetFind for every non-select tool', () => {
    renderCanvas();
    const nonSelectTools = ['Circle', 'Triangle', 'Text', 'Line', 'Free draw'];
    for (const name of nonSelectTools) {
      fireEvent.click(screen.getByRole('button', {name: 'Select'}));
      expect(mockCanvas.skipTargetFind).toBe(false);
      fireEvent.click(screen.getByRole('button', {name}));
      expect(mockCanvas.skipTargetFind).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Keyboard free draw
// ---------------------------------------------------------------------------

describe('keyboard free draw', () => {
  it('announces "Drawing started" when Enter is pressed with free draw active', () => {
    renderCanvas();
    fireEvent.click(screen.getByRole('button', {name: 'Free draw'}));
    keyDown(getCanvasContainer(), 'Enter');
    expect(screen.getByRole('status')).toHaveTextContent('Drawing started');
  });

  it('commits the path and announces "Drawing added" on second Enter after moves', () => {
    renderCanvas();
    fireEvent.click(screen.getByRole('button', {name: 'Free draw'}));
    const container = getCanvasContainer();
    keyDown(container, 'Enter');
    keyDown(container, 'ArrowRight');
    keyDown(container, 'ArrowDown');
    keyDown(container, 'Enter');
    expect(screen.getByRole('status')).toHaveTextContent('Drawing added');
    expect(mockCanvas.add).toHaveBeenCalled();
  });

  it('warns when Enter is pressed a second time without moving', () => {
    renderCanvas();
    fireEvent.click(screen.getByRole('button', {name: 'Free draw'}));
    const container = getCanvasContainer();
    keyDown(container, 'Enter');
    keyDown(container, 'Enter'); // no moves — nothing to commit
    expect(screen.getByRole('status')).toHaveTextContent('Move the cursor');
  });

  it('announces "Drawing cancelled" when Escape is pressed while drawing', () => {
    renderCanvas();
    fireEvent.click(screen.getByRole('button', {name: 'Free draw'}));
    const container = getCanvasContainer();
    keyDown(container, 'Enter');
    keyDown(container, 'Escape');
    expect(screen.getByRole('status')).toHaveTextContent('Drawing cancelled');
  });

  it('returns to the select tool when Escape is pressed before starting a draw', () => {
    renderCanvas();
    fireEvent.click(screen.getByRole('button', {name: 'Free draw'}));
    keyDown(getCanvasContainer(), 'Escape');
    expect(screen.getByRole('button', {name: 'Select'})).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('cancels an in-progress draw when the tool is switched away', () => {
    renderCanvas();
    fireEvent.click(screen.getByRole('button', {name: 'Free draw'}));
    const container = getCanvasContainer();
    keyDown(container, 'Enter'); // start drawing
    keyDown(container, 'ArrowRight');

    // Add a preview object to the canvas so cancel has something to remove.
    const fakePreview = {
      type: 'path',
      data: {id: '__kd_preview__', starter: true},
    };
    mockCanvas.getObjects.mockReturnValue([fakePreview]);

    act(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Rectangle'}));
    });

    // The preview should have been removed from the canvas.
    expect(mockCanvas.remove).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// path:created event (freehand mouse drawing)
// ---------------------------------------------------------------------------

describe('path:created Fabric event', () => {
  it('tags the path with an id so syncObjects includes it', () => {
    renderCanvas();

    const fakePath: {
      type: string;
      fill: string;
      stroke: string;
      data?: unknown;
    } = {
      type: 'path',
      fill: 'transparent',
      stroke: '#1a1a1a',
    };
    mockCanvas.getObjects.mockReturnValue([fakePath]);

    act(() => {
      mockHandlers['path:created']?.({path: fakePath});
    });

    expect(fakePath.data).toEqual(
      expect.objectContaining({id: expect.any(String), description: ''})
    );
  });

  it('announces "Added drawing." after path:created', () => {
    renderCanvas();
    const fakePath = {type: 'path', fill: 'transparent', stroke: '#1a1a1a'};
    mockCanvas.getObjects.mockReturnValue([fakePath]);

    act(() => {
      mockHandlers['path:created']?.({path: fakePath});
    });

    expect(screen.getByRole('status')).toHaveTextContent('Added drawing.');
  });

  it('calls onHasObjectsChange(true) after a path is created', () => {
    const onHasObjectsChange = jest.fn();
    renderCanvas({onHasObjectsChange});

    const fakePath = {type: 'path', fill: 'transparent', stroke: '#1a1a1a'};
    mockCanvas.getObjects.mockReturnValue([fakePath]);

    act(() => {
      mockHandlers['path:created']?.({path: fakePath});
    });

    expect(onHasObjectsChange).toHaveBeenCalledWith(true);
  });
});

// ---------------------------------------------------------------------------
// Layer operations
// ---------------------------------------------------------------------------

describe('layer operations', () => {
  it('calls bringObjectToFront when "Bring to front" is clicked', () => {
    renderCanvas();

    // Simulate an object being selected so the layer buttons appear.
    const fakeRect = {
      type: 'rect',
      fill: '#e74c3c',
      data: {id: 'r1', description: ''},
    };
    mockCanvas.getObjects.mockReturnValue([fakeRect]);
    mockCanvas.getActiveObject.mockReturnValue(fakeRect);

    act(() => {
      mockHandlers['selection:created']?.();
    });

    fireEvent.click(screen.getByRole('button', {name: 'Bring to front'}));
    expect(mockCanvas.bringObjectToFront).toHaveBeenCalledWith(fakeRect);
  });

  it('calls sendObjectToBack when "Send to back" is clicked', () => {
    renderCanvas();

    const fakeRect = {
      type: 'rect',
      fill: '#3498db',
      data: {id: 'r2', description: ''},
    };
    mockCanvas.getObjects.mockReturnValue([fakeRect]);
    mockCanvas.getActiveObject.mockReturnValue(fakeRect);

    act(() => {
      mockHandlers['selection:created']?.();
    });

    fireEvent.click(screen.getByRole('button', {name: 'Send to back'}));
    expect(mockCanvas.sendObjectToBack).toHaveBeenCalledWith(fakeRect);
  });
});
