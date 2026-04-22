import {createContext, useContext} from 'react';

const SketchLabReadOnlyContext = createContext(false);

export const SketchLabReadOnlyProvider = SketchLabReadOnlyContext.Provider;

export function useSketchLabReadOnly(): boolean {
  return useContext(SketchLabReadOnlyContext);
}

interface NodeToolbarVisibilityContextValue {
  openNodeToolbarId: string | null;
  openNodeToolbar: (nodeId: string) => void;
  closeNodeToolbar: () => void;
}

const NodeToolbarVisibilityContext =
  createContext<NodeToolbarVisibilityContextValue>({
    openNodeToolbarId: null,
    openNodeToolbar: () => {},
    closeNodeToolbar: () => {},
  });

export const NodeToolbarVisibilityProvider =
  NodeToolbarVisibilityContext.Provider;

export function useNodeToolbarVisibility(): NodeToolbarVisibilityContextValue {
  return useContext(NodeToolbarVisibilityContext);
}
