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
}

const ToolbarVisibilityContext = createContext<ToolbarVisibilityContextValue>({
  openToolbarTarget: null,
  trapFocus: false,
  openToolbar: () => {},
  closeToolbar: () => {},
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
