import {Button, IconButton, TextField} from '@mui/material';
import {ThemeProvider} from '@mui/material/styles';
import {ReactFlowProvider, useReactFlow, type Connection} from '@xyflow/react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {compileEffect} from '../compiler/compileEffect';
import {EffectCompileError, type CompiledEffect} from '../compiler/types';
import {translate} from '../localization';
import {
  addNode,
  addParameter,
  applyToScope,
  connect,
  createEffectDocument,
  createFunction,
  disconnect,
  duplicateNodes,
  findFunction,
  incomingEdge,
  insertNodes,
  nextFunctionId,
  nextNodeId,
  nextParameterId,
  removeFunction,
  removeNode,
  removeParameter,
  setNodeLiteral,
  setNodeLiterals,
  setNodeNote,
  updateFunction,
  updateNode,
  updateParameter,
} from '../model/document';
import type {
  EffectDocument,
  EffectFunction,
  EffectGraphEdge,
  EffectGraphNode,
  EffectGraphScope,
  EffectLiteral,
  EffectParameter,
  EffectFunctionOutputType,
  EffectPosition,
  EffectSize,
  EffectValueType,
} from '../model/types';
import {defaultNodeRegistry} from '../nodes/definitions/index';
import {withDocumentFunctions} from '../nodes/functions';
import {outputGhost} from '../nodes/ghosts';
import type {EffectNodeRegistry} from '../nodes/registry';
import type {ShaderPreviewParameterValue} from '../preview/ShaderPreview';
import {
  defaultTestTextureId,
  findTestTexture,
  renderTestTexture,
} from '../preview/testTextures';

import {portTypeOf} from './connectionRules';
import styles from './EffectEditor.module.css';
import {
  EffectEditorProvider,
  type CompileErrorInfo,
} from './EffectEditorContext';
import {EffectGraphCanvas, type WireOrigin} from './EffectGraphCanvas';
import {NodePalette} from './NodePalette';
import {InputRow, OutputRow} from './PinnedRows';
import {portTypeLabel} from './portTypes';
import {preambleLineCount, splitShaderPreamble} from './shaderView';
import {effectEditorTheme} from './theme';
import {useEffectDocument} from './useEffectDocument';

export interface EffectEditorProps {
  /** Document to open. Defaults to a passthrough effect. */
  initialDocument?: EffectDocument;
  /** Node palette to offer. Defaults to the stock nodes. */
  registry?: EffectNodeRegistry;
  /** Called after every edit, for the host to persist the `.effect` file. */
  onChange?: (document: EffectDocument) => void;
  /**
   * Open the effect for reading only — the host mounted a workspace nobody may
   * edit. Every editing affordance is withdrawn and no edit can reach the
   * document (`useEffectDocument` refuses them at source), while everything
   * that only *reads* the graph stays live: panning, zooming, selection, the
   * per-node eye previews, the GLSL panel, the test-texture picker, and the
   * parameter try-out sliders. None of those touch the file.
   */
  readOnly?: boolean;
  className?: string;
}

/** Fallback landing point when the canvas has not been measured yet. */
const NEW_NODE_ORIGIN = {x: 40, y: 40};
/** Consecutive click-adds step diagonally so nodes never stack exactly. */
const NEW_NODE_STAGGER = 28;
/** Half the minimum node width, for centring a new node on a point. */
const NODE_HALF_WIDTH = 84;
/** How far a duplicate or paste lands from its original. */
const DUPLICATE_OFFSET = 28;

/**
 * The effect editor.
 *
 * Layout follows the spec's vertical arrangement: a fixed input row, the
 * pannable workspace, and a fixed output row. The two rows never scroll away,
 * so the effect's contract — what goes in, what must come out — stays visible
 * however far the learner has wandered across the graph.
 */
export function EffectEditor(props: EffectEditorProps) {
  // The provider wraps the whole editor, not just the canvas, so the editor
  // body itself can translate screen points to workspace coordinates — which
  // is how a palette click knows where the middle of the current view is.
  return (
    <ReactFlowProvider>
      <EffectEditorContent {...props} />
    </ReactFlowProvider>
  );
}

function EffectEditorContent({
  initialDocument,
  registry = defaultNodeRegistry,
  onChange,
  readOnly = false,
  className,
}: EffectEditorProps) {
  const [initial] = useState(() => initialDocument ?? createEffectDocument());
  const {document, update, undo, redo, canUndo, canRedo} = useEffectDocument(
    initial,
    {readOnly},
  );

  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  /**
   * Which workspace is open: the main effect (null) or one function's body.
   * View state, not document state — so it is not undoable, but an undo that
   * deletes the open function drops the editor back to the main effect.
   */
  const [editingFunctionId, setEditingFunctionId] = useState<string | null>(
    null,
  );
  const editingFunction = editingFunctionId
    ? findFunction(document, editingFunctionId)
    : undefined;
  const scope: EffectGraphScope = editingFunction ?? document;

  useEffect(() => {
    if (editingFunctionId && !editingFunction) {
      setEditingFunctionId(null);
    }
  }, [editingFunctionId, editingFunction]);

  const enterFunction = useCallback((functionId: string) => {
    setEditingFunctionId(functionId);
    setSelectedNodeIds([]);
  }, []);

  const exitFunction = useCallback(() => {
    setEditingFunctionId(null);
    setSelectedNodeIds([]);
  }, []);
  /**
   * The internal clipboard: a snapshot of node data and wires, not ids. A
   * snapshot survives the originals being deleted or edited — pasting gives
   * back what was copied, not whatever the ids point at now.
   */
  const clipboardRef = useRef<{
    nodes: EffectGraphNode[];
    edges: EffectGraphEdge[];
  } | null>(null);
  /** Consecutive pastes stagger so copies never stack exactly. */
  const pasteCountRef = useRef(0);

  const duplicateSelection = useCallback(() => {
    if (selectedNodeIds.length > 0) {
      update(current =>
        applyToScope(current, editingFunctionId, inner =>
          duplicateNodes(
            inner,
            selectedNodeIds,
            {x: DUPLICATE_OFFSET, y: DUPLICATE_OFFSET},
            {stockInputsAvailable: editingFunctionId === null},
          ),
        ),
      );
    }
  }, [selectedNodeIds, editingFunctionId, update]);

  const copySelection = useCallback(() => {
    if (selectedNodeIds.length === 0) {
      return;
    }
    const wanted = new Set(selectedNodeIds);
    clipboardRef.current = {
      nodes: scope.nodes.filter(node => wanted.has(node.id)),
      // Wires among and into the copied set; `insertNodes` sorts out at paste
      // time which of them still have a live source.
      edges: scope.edges.filter(candidate => wanted.has(candidate.target.node)),
    };
    pasteCountRef.current = 0;
  }, [selectedNodeIds, scope]);

  const pasteClipboard = useCallback(() => {
    const clipboard = clipboardRef.current;
    if (!clipboard) {
      return;
    }
    pasteCountRef.current += 1;
    const offset = DUPLICATE_OFFSET * pasteCountRef.current;
    update(current =>
      applyToScope(current, editingFunctionId, inner =>
        insertNodes(
          inner,
          clipboard.nodes,
          clipboard.edges,
          {x: offset, y: offset},
          {stockInputsAvailable: editingFunctionId === null},
        ),
      ),
    );
  }, [editingFunctionId, update]);

  /**
   * Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, and Ctrl+Y.
   *
   * The listener is on the window so undo works wherever focus happens to be —
   * a learner who just clicked the canvas or a palette button should not have
   * to know about focus. Two guards keep that from overreaching: editable
   * elements are skipped so a number field's own text undo keeps working, and
   * anything that already handled the event is respected.
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.defaultPrevented) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if ((key === 'z' && event.shiftKey) || key === 'y') {
        event.preventDefault();
        redo();
      } else if (key === 'd') {
        // Always claimed: the browser default (bookmark) is never wanted here.
        event.preventDefault();
        duplicateSelection();
      } else if (key === 'c') {
        // Copying selected page text must keep working — only claim Ctrl+C
        // when the copy is unambiguously about nodes.
        if (!window.getSelection()?.toString()) {
          copySelection();
        }
      } else if (key === 'v') {
        pasteClipboard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, duplicateSelection, copySelection, pasteClipboard]);

  const [textureId, setTextureId] = useState(
    initial.testTexture ?? defaultTestTextureId,
  );
  /** Whether the generated-GLSL panel is open beside the canvas. */
  const [codeVisible, setCodeVisible] = useState(false);
  const [parameterOverrides, setParameterOverrides] = useState<
    ReadonlyMap<string, EffectLiteral>
  >(() => new Map());
  const [anchors, setAnchors] = useState<
    ReadonlyMap<string, HTMLElement | null>
  >(() => new Map());

  const nodeCountRef = useRef(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const {screenToFlowPosition} = useReactFlow();

  const selectedTexture = findTestTexture(textureId);
  const texture = useMemo(
    () => renderTestTexture(selectedTexture),
    [selectedTexture],
  );

  const compilation = useMemo<
    | {compiled: CompiledEffect; error: null}
    | {compiled: null; error: CompileErrorInfo}
  >(() => {
    try {
      return {compiled: compileEffect(document, {registry}), error: null};
    } catch (error) {
      // Keep the location, not just the message: nodeId/portId are what let
      // the canvas mark the offending node instead of leaving the learner to
      // hunt for it from a sentence in the output row.
      return {
        compiled: null,
        error:
          error instanceof EffectCompileError
            ? {
                message: error.message,
                nodeId: error.nodeId,
                portId: error.portId,
                functionId: error.functionId,
              }
            : {message: (error as Error).message},
      };
    }
  }, [document, registry]);

  /**
   * The wire the compile error is about, if it is about one at all.
   *
   * Errors located at an input port are usually wire problems — "this wire
   * carries a vec2 but…" — so the wire feeding that port turns red too. An
   * error at an unwired port has no edge here and marks only the node.
   */
  // Node ids are scoped per workspace, so location only means something when
  // the workspace the compiler blamed is the one on screen.
  const scopedError = useMemo(() => {
    const error = compilation.error;
    if (!error || (error.functionId ?? null) !== editingFunctionId) {
      return null;
    }
    return error;
  }, [compilation.error, editingFunctionId]);

  const errorEdgeId = useMemo(() => {
    if (!scopedError?.nodeId || !scopedError.portId) {
      return null;
    }
    return (
      incomingEdge(scope, {node: scopedError.nodeId, port: scopedError.portId})
        ?.id ?? null
    );
  }, [scopedError, scope]);

  const parameterValues = useMemo(() => {
    const values = new Map<string, ShaderPreviewParameterValue>();
    for (const parameter of compilation.compiled?.parameters ?? []) {
      values.set(parameter.name, {
        type: parameter.type,
        value:
          parameterOverrides.get(parameter.parameterId) ??
          parameter.defaultValue,
      });
    }
    return values;
  }, [compilation.compiled, parameterOverrides]);

  /**
   * The concrete type each wire carries, for coloring.
   *
   * Resolved types come from the compiler, which is the only place a generic
   * port's real type is known — a `multiply` passing a color is a vec4 wire,
   * not a gray one. When the graph does not compile (or a node never reaches
   * the output and so is never emitted), the declared port type is the
   * fallback, and `generic` stays uncolored rather than guessing.
   */
  // Function definitions come and go with the document, and a function's own
  // palette must not offer the function itself.
  const scopeRegistry = useMemo(
    () => withDocumentFunctions(registry, document, editingFunctionId),
    [registry, document, editingFunctionId],
  );

  /**
   * Concrete types the last compile settled on, for the scope now open.
   *
   * Generic ports declare no type of their own, so this is the only way the
   * editor can know that a particular Multiply is carrying a vec2 right now —
   * which is what lets a wire out of it offer to narrow instead of failing to
   * compile later.
   */
  const resolvedTypes = useMemo(
    () =>
      editingFunctionId
        ? compilation.compiled?.functionResolvedTypes[editingFunctionId]
        : compilation.compiled?.resolvedPortTypes,
    [editingFunctionId, compilation.compiled],
  );

  /**
   * The concrete type an output port carries right now, resolved on demand.
   *
   * `resolvedTypes` only covers nodes the last compile actually walked, and
   * the walk is demand-driven from the Output — so a node the learner is
   * still building toward it has no entry. Compiling once with `inspect`
   * pointed at the port forces exactly that walk, using the compiler's own
   * type rules rather than a second copy of them in the editor.
   *
   * Called on drop, never during a drag: one compile per connection made.
   */
  const resolveSourceType = useCallback(
    (nodeId: string, portId: string): EffectValueType | undefined => {
      const known = resolvedTypes?.[nodeId]?.[portId];
      if (known) {
        return known;
      }
      // `inspect` walks the main graph; a function body has no equivalent, so
      // inside one the resolved map is all there is.
      if (editingFunctionId) {
        return undefined;
      }
      try {
        return compileEffect(document, {
          registry,
          inspect: {node: nodeId, port: portId},
        }).resolvedPortTypes[nodeId]?.[portId];
      } catch {
        // A half-built subgraph has no settled type yet. Nothing to say here;
        // the drop falls back to the declared type.
        return undefined;
      }
    },
    [resolvedTypes, editingFunctionId, document, registry],
  );

  const wireTypes = useMemo(() => {
    const types = new Map<string, EffectValueType>();
    const resolved = resolvedTypes;

    for (const edge of scope.edges) {
      const type =
        resolved?.[edge.source.node]?.[edge.source.port] ??
        portTypeOf(
          scope,
          scopeRegistry,
          edge.source.node,
          edge.source.port,
          'source',
        );
      if (type !== undefined && type !== 'generic') {
        types.set(edge.id, type);
      }
    }
    return types;
  }, [scope, scopeRegistry, resolvedTypes]);

  /**
   * The last document the host was told about — the one it opened, until an
   * edit happens.
   *
   * Notifying on mount would report a change that nobody made: a host that
   * persists `onChange` (the World lab writes the `.effect` file) would rewrite
   * the file the moment it was opened, marking a project dirty and churning the
   * stored text through a re-serialize for a document identical to the one on
   * disk. `useEffectDocument`'s reducer returns the same object when a change
   * is a no-op, so identity is the right comparison here.
   */
  const notifiedRef = useRef(initial);
  useEffect(() => {
    if (document === notifiedRef.current) {
      return;
    }
    notifiedRef.current = document;
    onChange?.(document);
  }, [document, onChange]);

  const registerAnchor = useCallback(
    (nodeId: string, element: HTMLElement | null) => {
      setAnchors(current => {
        if (current.get(nodeId) === element) {
          return current;
        }
        const next = new Map(current);
        if (element) {
          next.set(nodeId, element);
        } else {
          next.delete(nodeId);
        }
        return next;
      });
    },
    [],
  );

  /**
   * Add a node. With a position (a drag-drop), it lands exactly there; from a
   * palette click, it lands in the middle of the current view — wherever the
   * learner has panned to — with a small stagger so repeats don't stack.
   */
  const handleAddNode = useCallback(
    (type: string, position?: {x: number; y: number}) => {
      let target = position;
      if (!target) {
        nodeCountRef.current += 1;
        const offset = (nodeCountRef.current % 5) * NEW_NODE_STAGGER;
        const bounds = canvasRef.current?.getBoundingClientRect();
        if (bounds && bounds.width > 0) {
          const centre = screenToFlowPosition({
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2,
          });
          target = {
            x: centre.x - NODE_HALF_WIDTH + offset,
            y: centre.y - 40 + offset,
          };
        } else {
          target = {
            x: NEW_NODE_ORIGIN.x + offset,
            y: NEW_NODE_ORIGIN.y + offset,
          };
        }
      }

      update(current =>
        applyToScope(current, editingFunctionId, inner =>
          addNode(inner, {
            id: nextNodeId(inner, type),
            type,
            position: target,
          }),
        ),
      );
    },
    [update, editingFunctionId, screenToFlowPosition],
  );

  /**
   * Place a node and wire it up in one document transition, so a learner who
   * built forward from a wire can undo the whole gesture with one Ctrl+Z.
   */
  const handleAddConnectedNode = useCallback(
    (
      type: string,
      position: {x: number; y: number},
      origin: WireOrigin,
      viaPort: string,
    ) => {
      update(current =>
        applyToScope(current, editingFunctionId, inner => {
          const id = nextNodeId(inner, type);
          const withNode = addNode(inner, {id, type, position});
          return origin.direction === 'source'
            ? connect(
                withNode,
                {node: origin.node, port: origin.port},
                {node: id, port: viaPort},
              )
            : connect(
                withNode,
                {node: id, port: viaPort},
                {node: origin.node, port: origin.port},
              );
        }),
      );
    },
    [update, editingFunctionId],
  );

  const handleMoveNode = useCallback(
    (nodeId: string, position: {x: number; y: number}) => {
      // Called once, on drag stop — so a drag is already one undo step and
      // needs no coalescing.
      update(current =>
        applyToScope(current, editingFunctionId, inner =>
          updateNode(inner, nodeId, {position}),
        ),
      );
    },
    [update, editingFunctionId],
  );

  const handleResizeNode = useCallback(
    (nodeId: string, bounds: {position: EffectPosition; size: EffectSize}) => {
      // Called once, on resize stop — one undo step per resize, like a drag.
      update(current =>
        applyToScope(current, editingFunctionId, inner =>
          updateNode(inner, nodeId, bounds),
        ),
      );
    },
    [update, editingFunctionId],
  );

  const handleRemoveNode = useCallback(
    (nodeId: string) =>
      update(current =>
        applyToScope(current, editingFunctionId, inner =>
          removeNode(inner, nodeId),
        ),
      ),
    [update, editingFunctionId],
  );

  const handleConnect = useCallback(
    (connection: Connection, swizzle?: string) => {
      if (!connection.sourceHandle || !connection.targetHandle) {
        return;
      }
      update(current =>
        applyToScope(current, editingFunctionId, inner =>
          connect(
            inner,
            {
              node: connection.source,
              port: connection.sourceHandle as string,
              // Narrowing lives on the wire, not on either node: the same
              // output can feed a color one way and a single channel another.
              ...(swizzle ? {swizzle} : {}),
            },
            {node: connection.target, port: connection.targetHandle as string},
          ),
        ),
      );
    },
    [update, editingFunctionId],
  );

  const handleDisconnect = useCallback(
    (edgeId: string) =>
      update(current =>
        applyToScope(current, editingFunctionId, inner =>
          disconnect(inner, edgeId),
        ),
      ),
    [update, editingFunctionId],
  );

  const handleToggleInspect = useCallback(
    (nodeId: string) =>
      update(current =>
        applyToScope(current, editingFunctionId, inner =>
          updateNode(inner, nodeId, {
            inspected: !inner.nodes.find(node => node.id === nodeId)?.inspected,
          }),
        ),
      ),
    [update, editingFunctionId],
  );

  const handleSetLiteral = useCallback(
    (nodeId: string, portId: string, value: EffectLiteral) =>
      update(
        current =>
          applyToScope(current, editingFunctionId, inner =>
            setNodeLiteral(inner, nodeId, portId, value),
          ),
        {coalesce: `literal:${nodeId}:${portId}`},
      ),
    [update, editingFunctionId],
  );

  const handleSetNote = useCallback(
    (nodeId: string, note: string | undefined) =>
      update(
        current =>
          applyToScope(current, editingFunctionId, inner =>
            setNodeNote(inner, nodeId, note),
          ),
        // The editor commits once, when editing finishes, so this arrives as
        // a whole note rather than a stream of keystrokes. Coalescing is a
        // backstop for anything else that writes notes — an assistant filling
        // several in, say.
        {coalesce: `note:${nodeId}`},
      ),
    [update, editingFunctionId],
  );

  const handleSetLiterals = useCallback(
    (nodeId: string, values: Readonly<Record<string, EffectLiteral>>) =>
      update(
        current =>
          applyToScope(current, editingFunctionId, inner =>
            setNodeLiterals(inner, nodeId, values),
          ),
        // One key per node: a drag inside the picker streams changes, and
        // they should land as a single undo step.
        {coalesce: `literals:${nodeId}`},
      ),
    [update, editingFunctionId],
  );

  /**
   * Create a parameter and hand back its id so the row can open its editor —
   * "add, then rename" is one gesture, not two discoveries.
   */
  const handleAddParameter = useCallback((): string => {
    const id = nextParameterId(scope);
    update(current =>
      applyToScope(current, editingFunctionId, inner =>
        addParameter(inner, {
          id,
          name: id,
          type: 'float',
          defaultValue: 1,
          min: 0,
          max: 1,
        }),
      ),
    );
    return id;
  }, [scope, editingFunctionId, update]);

  const handleUpdateParameter = useCallback(
    (
      parameterId: string,
      changes: Partial<Omit<EffectParameter, 'id'>>,
      coalesce?: string,
    ) => {
      // A type change invalidates the try-out override's shape — a number is
      // not a vec3 — so the preview falls back to the new default.
      if (changes.type !== undefined) {
        setParameterOverrides(current => {
          if (!current.has(parameterId)) {
            return current;
          }
          const next = new Map(current);
          next.delete(parameterId);
          return next;
        });
      }
      update(
        current =>
          applyToScope(current, editingFunctionId, inner =>
            updateParameter(inner, parameterId, changes),
          ),
        coalesce !== undefined ? {coalesce} : undefined,
      );
    },
    [update, editingFunctionId],
  );

  const handleRemoveParameter = useCallback(
    (parameterId: string) => {
      setParameterOverrides(current => {
        if (!current.has(parameterId)) {
          return current;
        }
        const next = new Map(current);
        next.delete(parameterId);
        return next;
      });
      update(current =>
        applyToScope(current, editingFunctionId, inner =>
          removeParameter(inner, parameterId),
        ),
      );
    },
    [update, editingFunctionId],
  );

  const handleParameterValueChange = useCallback(
    (parameterId: string, value: EffectLiteral) => {
      setParameterOverrides(current => {
        const next = new Map(current);
        next.set(parameterId, value);
        return next;
      });
    },
    [],
  );

  const handleCreateFunction = useCallback(() => {
    const id = nextFunctionId(document);
    const name = translate('Function {number}', {number: id.slice(2)});
    update(current => createFunction(current, id, name));
    enterFunction(id);
  }, [document, update, enterFunction]);

  const handleRenameFunction = useCallback(
    (functionId: string, name: string) =>
      update(current => updateFunction(current, functionId, {name}), {
        coalesce: `function:${functionId}:name`,
      }),
    [update],
  );

  const handleRenameEffect = useCallback(
    (name: string) =>
      update(current => ({...current, name}), {coalesce: 'effect:name'}),
    [update],
  );

  const handleDescribeEffect = useCallback(
    (description: string) =>
      update(
        current => {
          if (!description.trim()) {
            // Delete the key rather than setting it undefined: an absent
            // field and a field holding `undefined` serialize the same but
            // are not equal, and that difference shows up as a document that
            // no longer round-trips through `.effect`.
            const {description: cleared, ...rest} = current;
            void cleared;
            return rest as EffectDocument;
          }
          return {...current, description};
        },
        {coalesce: 'effect:description'},
      ),
    [update],
  );

  const handleFunctionOutputType = useCallback(
    (functionId: string, outputType: EffectFunctionOutputType) =>
      update(current => updateFunction(current, functionId, {outputType})),
    [update],
  );

  const handleDeleteFunction = useCallback(
    (functionId: string) => {
      update(current => removeFunction(current, functionId));
      exitFunction();
    },
    [update, exitFunction],
  );

  const handleSelectTexture = useCallback(
    (nextTextureId: string) => {
      setTextureId(nextTextureId);
      update(current => ({...current, testTexture: nextTextureId}));
    },
    [update],
  );

  const contextValue = useMemo(
    () => ({
      document: scope,
      canInspect: editingFunctionId === null,
      registry: scopeRegistry,
      texture,
      parameterValues,
      compileError: scopedError,
      toggleInspect: handleToggleInspect,
      setLiteral: handleSetLiteral,
      setLiterals: handleSetLiterals,
      setNote: handleSetNote,
      resizeNode: handleResizeNode,
      disconnect: handleDisconnect,
      readOnly,
    }),
    [
      scope,
      editingFunctionId,
      scopeRegistry,
      texture,
      parameterValues,
      scopedError,
      handleToggleInspect,
      handleSetLiteral,
      handleSetLiterals,
      handleSetNote,
      handleResizeNode,
      handleDisconnect,
      readOnly,
    ],
  );

  return (
    <EffectEditorProvider value={contextValue}>
      {/* Nested theme: composes under the host's brand theme on mainline. */}
      <ThemeProvider theme={effectEditorTheme}>
        <div
          className={
            className ? `${styles.editor} ${className}` : styles.editor
          }
          // Every learner-facing string in here already went through
          // localization.translate; the mainline LocalizeJS DOM engine must not
          // re-translate the rendered output (it would double-translate and
          // fight React's reconciliation).
          data-notranslate="true"
        >
          {/* The palette exists to place nodes. Read-only, it would be a
              column of controls that do nothing, so it is not rendered — the
              canvas takes the width instead. Functions are still reachable by
              their nodes in the graph. */}
          {!readOnly && (
            <NodePalette
              registry={scopeRegistry}
              onAddNode={handleAddNode}
              onEditFunction={enterFunction}
              onCreateFunction={handleCreateFunction}
            />
          )}

          <div className={styles.stack}>
            {editingFunction ? (
              <FunctionBar
                key={editingFunction.id}
                fn={editingFunction}
                onBack={exitFunction}
                onRename={name =>
                  handleRenameFunction(editingFunction.id, name)
                }
                onOutputTypeChange={type =>
                  handleFunctionOutputType(editingFunction.id, type)
                }
                onDelete={() => handleDeleteFunction(editingFunction.id)}
                readOnly={readOnly}
              />
            ) : (
              <EffectBar
                document={document}
                onRename={handleRenameEffect}
                onDescribe={handleDescribeEffect}
                readOnly={readOnly}
              />
            )}

            <InputRow
              document={scope}
              texture={texture}
              selectedTexture={selectedTexture}
              onSelectTexture={handleSelectTexture}
              onAddParameter={handleAddParameter}
              onUpdateParameter={handleUpdateParameter}
              onRemoveParameter={handleRemoveParameter}
              registerAnchor={registerAnchor}
              parameterValues={parameterOverrides}
              onParameterValueChange={handleParameterValueChange}
              showStockInputs={editingFunctionId === null}
              addButtonLabel={translate(
                editingFunctionId ? '+ Input' : '+ Parameter',
              )}
              readOnly={readOnly}
            />

            <div className={styles.canvasHolder}>
              <EffectGraphCanvas
                document={scope}
                registry={scopeRegistry}
                anchors={anchors}
                containerRef={canvasRef}
                wireTypes={wireTypes}
                onMoveNode={handleMoveNode}
                onRemoveNode={handleRemoveNode}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onAddNode={handleAddNode}
                onAddConnectedNode={handleAddConnectedNode}
                resolvedTypes={resolvedTypes}
                resolveSourceType={resolveSourceType}
                errorEdgeId={errorEdgeId}
                onSelectedNodesChange={setSelectedNodeIds}
                readOnly={readOnly}
              />

              <div className={styles.history}>
                <IconButton
                  className={styles.historyButton}
                  disabled={!canUndo}
                  aria-label={translate('Undo')}
                  title={translate('Undo (Ctrl+Z)')}
                  onClick={undo}
                >
                  ↶
                </IconButton>
                <IconButton
                  className={styles.historyButton}
                  disabled={!canRedo}
                  aria-label={translate('Redo')}
                  title={translate('Redo (Ctrl+Shift+Z)')}
                  onClick={redo}
                >
                  ↷
                </IconButton>
                <Button
                  className={styles.codeToggle}
                  aria-pressed={codeVisible}
                  aria-label={translate('Show the GLSL code')}
                  title={translate(
                    'The GLSL shader this graph compiles to, live',
                  )}
                  variant={codeVisible ? 'contained' : 'outlined'}
                  onClick={() => setCodeVisible(visible => !visible)}
                >
                  Show Code
                </Button>
              </div>
            </div>

            <OutputRow
              fragmentSource={compilation.compiled?.fragmentSource ?? null}
              compileError={compilation.error?.message ?? null}
              texture={texture}
              parameters={parameterValues}
              registerAnchor={registerAnchor}
              showPreview={editingFunctionId === null}
              ghost={
                editingFunction
                  ? {...outputGhost, type: editingFunction.outputType}
                  : undefined
              }
            />
          </div>

          {codeVisible && (
            <ShaderCodePanel
              source={compilation.compiled?.fragmentSource ?? null}
              error={compilation.error?.message ?? null}
            />
          )}
        </div>
      </ThemeProvider>
    </EffectEditorProvider>
  );
}

/**
 * The live GLSL, with the setup lines folded away.
 *
 * A learner opens this to see what their graph became; `#version`, the Phaser
 * pragma, and the precision guard are true of every effect and say nothing
 * about this one. They stay in the compiled shader — the guard has to reach
 * the device that runs it — and are one click away here.
 */
function ShaderCodePanel({
  source,
  error,
}: {
  source: string | null;
  error: string | null;
}) {
  const [showSetup, setShowSetup] = useState(false);

  const sections = useMemo(
    () => (source ? splitShaderPreamble(source) : null),
    [source],
  );
  const hiddenLines = sections ? preambleLineCount(sections.preamble) : 0;

  return (
    <aside className={styles.codePanel} aria-label={translate('GLSL code')}>
      {sections && hiddenLines > 0 && (
        <button
          type="button"
          className={styles.setupToggle}
          aria-expanded={showSetup}
          title={translate(
            'Version, the Phaser pragma, and the precision guard — the same in every effect',
          )}
          onClick={() => setShowSetup(visible => !visible)}
        >
          {showSetup
            ? translate('Hide the {count} setup lines', {count: hiddenLines})
            : translate('Show the {count} setup lines', {count: hiddenLines})}
        </button>
      )}
      {/* Code is code: never translated, and shown exactly as the compiler
          will hand it to Phaser. */}
      <pre className={styles.code}>
        {sections ? (showSetup ? source : sections.body) : `// ${error ?? ''}`}
      </pre>
    </aside>
  );
}

interface EffectBarProps {
  document: EffectDocument;
  onRename: (name: string) => void;
  onDescribe: (description: string) => void;
  readOnly: boolean;
}

/**
 * The strip above the main workspace: what this effect is called and what it
 * is for.
 *
 * The counterpart to `FunctionBar`, which says the same things about a
 * function — so the two occupy the same slot and never appear together. The
 * description is deliberately one line: it is what a host shows beside the
 * effect in a gallery, not the place to explain the graph. That job belongs to
 * the notes and Comment nodes in the workspace itself.
 */
function EffectBar({document, onRename, onDescribe, readOnly}: EffectBarProps) {
  // Same non-empty-name discipline as functions and parameters: a nameless
  // effect is an unlabelled entry in whatever list a host shows.
  const [nameDraft, setNameDraft] = useState(document.name);

  return (
    <div className={styles.functionBar}>
      <TextField
        className={styles.effectName}
        disabled={readOnly}
        slotProps={{htmlInput: {'aria-label': translate('Effect name')}}}
        value={nameDraft}
        onChange={event => {
          setNameDraft(event.target.value);
          const trimmed = event.target.value.trim();
          if (trimmed.length > 0) {
            onRename(trimmed);
          }
        }}
        onBlur={() => setNameDraft(document.name)}
      />
      <TextField
        className={styles.effectDescription}
        disabled={readOnly}
        placeholder={translate('What does this effect do?')}
        slotProps={{htmlInput: {'aria-label': translate('Effect description')}}}
        value={document.description ?? ''}
        onChange={event => onDescribe(event.target.value)}
      />
    </div>
  );
}

interface FunctionBarProps {
  fn: EffectFunction;
  onBack: () => void;
  onRename: (name: string) => void;
  onOutputTypeChange: (type: EffectFunctionOutputType) => void;
  onDelete: () => void;
  readOnly: boolean;
}

/** The strip above a function's workspace: identity, return type, exit. */
function FunctionBar({
  fn,
  onBack,
  onRename,
  onOutputTypeChange,
  onDelete,
  readOnly,
}: FunctionBarProps) {
  // Same non-empty-name discipline as parameters: the name is the node label,
  // and a blank one would be an unfindable palette entry.
  const [nameDraft, setNameDraft] = useState(fn.name);

  return (
    <div className={styles.functionBar}>
      <Button onClick={onBack} title={translate('Back to the main effect')}>
        {translate('◂ Effect')}
      </Button>
      <span className={styles.functionCrumb} aria-hidden="true">
        ▸
      </span>
      <TextField
        className={styles.functionName}
        disabled={readOnly}
        slotProps={{htmlInput: {'aria-label': translate('Function name')}}}
        value={nameDraft}
        onChange={event => {
          setNameDraft(event.target.value);
          const trimmed = event.target.value.trim();
          if (trimmed.length > 0) {
            onRename(trimmed);
          }
        }}
        onBlur={() => setNameDraft(fn.name)}
      />
      <label className={styles.functionReturns}>
        {translate('returns')}
        <TextField
          select
          disabled={readOnly}
          slotProps={{
            select: {
              native: true,
              // Names the control for assistive tech; the visible "returns"
              // text is decorative context beside it.
              inputProps: {'aria-label': translate('returns')},
            },
          }}
          value={fn.outputType}
          onChange={event =>
            onOutputTypeChange(event.target.value as EffectFunctionOutputType)
          }
        >
          {(['float', 'vec2', 'vec3', 'vec4'] as const).map(type => (
            <option key={type} value={type}>
              {portTypeLabel(type)}
            </option>
          ))}
        </TextField>
      </label>
      {!readOnly && (
        <Button
          color="error"
          className={styles.functionDelete}
          onClick={onDelete}
          title={translate('Delete this function and every node that uses it')}
        >
          {translate('Delete function')}
        </Button>
      )}
    </div>
  );
}
