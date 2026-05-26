import {createContext, useContext} from 'react';

import type {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

const SketchLabReadOnlyContext = createContext(false);

export const SketchLabReadOnlyProvider = SketchLabReadOnlyContext.Provider;

export function useSketchLabReadOnly(): boolean {
  return useContext(SketchLabReadOnlyContext);
}

export interface ToolbarTarget {
  type: 'node' | 'edge';
  id: string;
}

interface ToolbarVisibilityContextValue {
  openToolbarTarget: ToolbarTarget | null;
  trapFocus: boolean;
  openToolbar: (target: ToolbarTarget, options?: {trapFocus?: boolean}) => void;
  closeToolbar: () => void;
  // Tracks whether any dropdown popover (e.g. color picker, size list) is
  // currently open. ToolbarShell uses this to pause its focus-trap-react
  // while a MUI Popover is open — otherwise the two traps fight each
  // other (focus-trap-react pulls focus back into the toolbar Paper while
  // MUI's TrapFocus pulls focus back into the popover Paper, recursing).
  isAnyPopoverOpen: boolean;
  setPopoverOpen: (open: boolean) => void;
}

const ToolbarVisibilityContext = createContext<ToolbarVisibilityContextValue>({
  openToolbarTarget: null,
  trapFocus: false,
  openToolbar: () => {},
  closeToolbar: () => {},
  isAnyPopoverOpen: false,
  setPopoverOpen: () => {},
});

export const ToolbarVisibilityProvider = ToolbarVisibilityContext.Provider;

export function useToolbarVisibility(): ToolbarVisibilityContextValue {
  return useContext(ToolbarVisibilityContext);
}

export interface ClipboardContents {
  nodes: SketchlabReactFlowNode[];
  edges: SketchlabReactFlowEdge[];
}

interface ClipboardContextValue {
  duplicateNode: (nodeId: string) => void;
  duplicateLine: (edgeId: string) => void;
}

const ClipboardContext = createContext<ClipboardContextValue>({
  duplicateNode: () => {},
  duplicateLine: () => {},
});

export const ClipboardProvider = ClipboardContext.Provider;

export function useClipboard(): ClipboardContextValue {
  return useContext(ClipboardContext);
}

const PushSnapshotContext = createContext<() => void>(() => {});

export const PushSnapshotProvider = PushSnapshotContext.Provider;

export function usePushSnapshot(): () => void {
  return useContext(PushSnapshotContext);
}
