import {createContext, useContext} from 'react';

const SketchLabReadOnlyContext = createContext(false);

export const SketchLabReadOnlyProvider = SketchLabReadOnlyContext.Provider;

export function useSketchLabReadOnly(): boolean {
  return useContext(SketchLabReadOnlyContext);
}

interface ToolbarVisibilityContextValue {
  openToolbarNodeId: string | null;
  openToolbar: (nodeId: string) => void;
  closeToolbar: () => void;
}

const ToolbarVisibilityContext = createContext<ToolbarVisibilityContextValue>({
  openToolbarNodeId: null,
  openToolbar: () => {},
  closeToolbar: () => {},
});

export const ToolbarVisibilityProvider = ToolbarVisibilityContext.Provider;

export function useToolbarVisibility(): ToolbarVisibilityContextValue {
  return useContext(ToolbarVisibilityContext);
}
