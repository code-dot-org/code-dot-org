import {createContext, useContext} from 'react';

import type {
  EffectGraphScope,
  EffectLiteral,
  EffectPosition,
  EffectSize,
} from '../model/types';
import type {EffectNodeRegistry} from '../nodes/registry';
import type {ShaderPreviewParameterValue} from '../preview/ShaderPreview';

/**
 * A compile failure with the location the compiler pinned it to.
 *
 * `EffectCompileError` carries this already; keeping it as a plain object
 * rather than the Error instance makes it safe to hold in state and compare.
 */
export interface CompileErrorInfo {
  message: string;
  nodeId?: string;
  portId?: string;
  /** Set when the error is inside a function's body; `nodeId` is scoped to it. */
  functionId?: string;
}

/**
 * Everything a node in the canvas needs from the editor around it.
 *
 * This is a context rather than React Flow node data because the callbacks and
 * the document identity change on every edit: putting them in node data would
 * mean rebuilding — and re-rendering — every node whenever any one of them
 * changed.
 */
export interface EffectEditorContextValue {
  /** The scope being edited: the document, or an open function's body. */
  document: EffectGraphScope;
  /** False inside a function, where the eye preview has no meaning yet. */
  canInspect: boolean;
  registry: EffectNodeRegistry;
  /** The test texture currently loaded into the input row. */
  texture: TexImageSource | null;
  /** Live parameter values by uniform name, for previews. */
  parameterValues: ReadonlyMap<string, ShaderPreviewParameterValue>;
  /**
   * Why the graph does not compile, or null when it does. Nodes read this to
   * mark themselves: the error belongs on the node the compiler blamed, not
   * only in the output row across the screen from it.
   */
  compileError: CompileErrorInfo | null;
  toggleInspect: (nodeId: string) => void;
  setLiteral: (nodeId: string, portId: string, value: EffectLiteral) => void;
  /**
   * Commit a resize. Position travels with it: dragging a top or left handle
   * moves the node's origin as well as changing its size.
   */
  resizeNode: (
    nodeId: string,
    bounds: {position: EffectPosition; size: EffectSize},
  ) => void;
  /** Write or clear a node's note. A blank note removes it. */
  setNote: (nodeId: string, note: string | undefined) => void;
  /** Set several literals in one undo step — the color picker's whole pick. */
  setLiterals: (
    nodeId: string,
    values: Readonly<Record<string, EffectLiteral>>,
  ) => void;
  /** Remove a wire by edge id. Used by the delete button drawn on each wire. */
  disconnect: (edgeId: string) => void;
}

const EffectEditorContext = createContext<EffectEditorContextValue | null>(
  null,
);

export const EffectEditorProvider = EffectEditorContext.Provider;

export function useEffectEditorContext(): EffectEditorContextValue {
  const value = useContext(EffectEditorContext);
  if (!value) {
    throw new Error(
      'Effect editor components must be rendered inside <EffectEditor>.',
    );
  }
  return value;
}
