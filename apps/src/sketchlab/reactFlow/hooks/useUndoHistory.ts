import {useCallback, useRef, useState} from 'react';

import type {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';

import type {SketchLabNode} from '../types';

interface HistorySnapshot {
  nodes: SketchLabNode[];
  edges: SketchlabReactFlowEdge[];
}

const MAX_HISTORY_SIZE = 50;

/**
 * Snapshot-based undo for the sketch lab canvas.
 *
 * Call syncRefs(nodes, edges) after every render so pushSnapshot always
 * reads current state. Call pushSnapshot() immediately before any mutation
 * that should be undoable. Call undo() to pop the most recent snapshot and
 * get back the previous state to restore.
 *
 * restoringRef blocks pushSnapshot while a restore is in flight so that the
 * React state update driven by undo() doesn't overwrite the history stack.
 */
export function useUndoHistory() {
  const historyRef = useRef<HistorySnapshot[]>([]);
  const [canUndo, setCanUndo] = useState(false);
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
    setCanUndo(true);
  }, []);

  const undo = useCallback((): HistorySnapshot | null => {
    const history = historyRef.current;
    if (history.length === 0) return null;
    const snapshot = history[history.length - 1];
    historyRef.current = history.slice(0, -1);
    setCanUndo(historyRef.current.length > 0);
    restoringRef.current = true;
    // Allow snapshot recording again after React flushes the restore update.
    requestAnimationFrame(() => {
      restoringRef.current = false;
    });
    return snapshot;
  }, []);

  return {syncRefs, pushSnapshot, undo, canUndo};
}
