import {renderHook, act} from '@testing-library/react-hooks';

import {useUndoHistory} from '@cdo/apps/sketchlab/reactFlow/hooks/useUndoHistory';
import {SketchLabNode} from '@cdo/apps/sketchlab/reactFlow/types';

const nodeA = {
  id: 'node-a',
  type: 'text',
  position: {x: 0, y: 0},
  data: {text: 'a'},
} as SketchLabNode;

describe('useUndoHistory', () => {
  it('undoes to the snapshot taken before a mutation', () => {
    const {result} = renderHook(() => useUndoHistory());

    act(() => {
      result.current.syncRefs([], []);
      result.current.pushSnapshot();
      result.current.syncRefs([nodeA], []);
    });
    expect(result.current.canUndo).toBe(true);

    let snapshot;
    act(() => {
      snapshot = result.current.undo();
    });
    expect(snapshot).toEqual({nodes: [], edges: []});
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('clearHistory empties both the undo and redo stacks', () => {
    const {result} = renderHook(() => useUndoHistory());

    // Build up one undo entry and one redo entry.
    act(() => {
      result.current.syncRefs([], []);
      result.current.pushSnapshot();
      result.current.syncRefs([nodeA], []);
      result.current.pushSnapshot();
      result.current.undo();
    });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    let undoResult;
    let redoResult;
    act(() => {
      undoResult = result.current.undo();
      redoResult = result.current.redo();
    });
    expect(undoResult).toBeNull();
    expect(redoResult).toBeNull();
  });
});
