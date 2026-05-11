import {useCallback, useRef, useState} from 'react';

import type {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';

import type {SketchLabNode} from '../types';

interface HistorySnapshot {
  nodes: SketchLabNode[];
  edges: SketchlabReactFlowEdge[];
}

const MAX_HISTORY_SIZE = 50;

/**
 * Snapshot-based undo/redo for the sketch lab canvas.
 *
 * Call syncRefs(nodes, edges) after every render so pushSnapshot always
 * reads current state. Call pushSnapshot() immediately before any mutation
 * that should be undoable. undo() and redo() each return the snapshot to
 * restore; the caller applies it with setNodes/setEdges.
 *
 * New mutations clear the redo stack, matching standard undo/redo behavior.
 * restoringRef blocks pushSnapshot while a restore is in flight so the React
 * state update from undo/redo doesn't push a spurious history entry.
 */
export function useUndoHistory() {
  const historyRef = useRef<HistorySnapshot[]>([]);
  const futureRef = useRef<HistorySnapshot[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const nodesRef = useRef<SketchLabNode[]>([]);
  const edgesRef = useRef<SketchlabReactFlowEdge[]>([]);
  const restoringRef = useRef(false);

  const syncRefs = useCallback(
    (nodes: SketchLabNode[], edges: SketchlabReactFlowEdge[]) => {
      nodesRef.current = nodes;
      edgesRef.current = edges;
    },
    []
  );

  const pushSnapshot = useCallback(() => {
    if (restoringRef.current) return;
    historyRef.current = [
      ...historyRef.current.slice(-(MAX_HISTORY_SIZE - 1)),
      {nodes: nodesRef.current, edges: edgesRef.current},
    ];
    // Any new mutation invalidates the redo stack.
    futureRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const undo = useCallback((): HistorySnapshot | null => {
    const history = historyRef.current;
    if (history.length === 0) return null;
    const snapshot = history[history.length - 1];
    // Stash current state so redo can bring it back.
    futureRef.current = [
      ...futureRef.current.slice(-(MAX_HISTORY_SIZE - 1)),
      {nodes: nodesRef.current, edges: edgesRef.current},
    ];
    historyRef.current = history.slice(0, -1);
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(true);
    restoringRef.current = true;
    requestAnimationFrame(() => {
      restoringRef.current = false;
    });
    return snapshot;
  }, []);

  const redo = useCallback((): HistorySnapshot | null => {
    const future = futureRef.current;
    if (future.length === 0) return null;
    const snapshot = future[future.length - 1];
    // Stash current state so undo can bring it back.
    historyRef.current = [
      ...historyRef.current.slice(-(MAX_HISTORY_SIZE - 1)),
      {nodes: nodesRef.current, edges: edgesRef.current},
    ];
    futureRef.current = future.slice(0, -1);
    setCanRedo(futureRef.current.length > 0);
    setCanUndo(true);
    restoringRef.current = true;
    requestAnimationFrame(() => {
      restoringRef.current = false;
    });
    return snapshot;
  }, []);

  return {syncRefs, pushSnapshot, undo, redo, canUndo, canRedo};
}
