import React, {createContext, useContext} from 'react';

const SketchLabReadOnlyContext = createContext(false);

export const SketchLabReadOnlyProvider = SketchLabReadOnlyContext.Provider;

export function useSketchLabReadOnly(): boolean {
  return useContext(SketchLabReadOnlyContext);
}

interface ToolbarVisibilityContextValue {
  openToolbarNodeId: string | null;
  openToolbar: (nodeId: string, options?: {focusToolbar?: boolean}) => void;
  closeToolbar: () => void;
  // Set to true by openToolbar({focusToolbar: true}) and consumed
  // (cleared) by NodeToolbarShell on the rising edge of isVisible.
  // A ref rather than state so flipping it doesn't re-render every
  // toolbar shell in the canvas.
  focusToolbarOnOpen: React.MutableRefObject<boolean>;
}

const ToolbarVisibilityContext = createContext<ToolbarVisibilityContextValue>({
  openToolbarNodeId: null,
  openToolbar: () => {},
  closeToolbar: () => {},
  focusToolbarOnOpen: {current: false},
});

export const ToolbarVisibilityProvider = ToolbarVisibilityContext.Provider;

export function useToolbarVisibility(): ToolbarVisibilityContextValue {
  return useContext(ToolbarVisibilityContext);
}
