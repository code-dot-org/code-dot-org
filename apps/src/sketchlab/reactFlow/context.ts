import {createContext, useContext} from 'react';

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
