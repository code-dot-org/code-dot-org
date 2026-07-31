import {Handle, Position, type NodeProps} from '@xyflow/react';
import {Fragment, useCallback, useEffect, useMemo, useRef} from 'react';

import {compileEffect} from '../compiler/compileEffect';
import {EffectCompileError} from '../compiler/types';
import {defaultLiteral} from '../glsl/valueTypes';
import {translate} from '../localization';
import {incomingEdge} from '../model/document';
import type {
  EffectDocument,
  EffectGraphNode,
  EffectLiteral,
  EffectValueType,
} from '../model/types';
import type {EffectNodeDefinition, EffectPortDefinition} from '../nodes/types';
import {PreviewCanvas} from '../preview/PreviewCanvas';

import {hexToRgb, hslToRgb, rgbToHex, rgbToHsl} from './colorUtils';
import {useEffectEditorContext} from './EffectEditorContext';
import styles from './EffectFlowNode.module.css';
import type {EffectFlowNodeData} from './flowMapping';
import {
  nodeDisplayDescription,
  nodeDisplayLabel,
  portDisplayLabel,
} from './labels';
import {LiteralInput} from './LiteralInput';
import {NodeNote} from './NodeNote';
import {portColor, portOffset, portTypeLabel} from './portTypes';

const INSPECT_PREVIEW_SIZE = 96;

/** Dot diameter, in pixels. Big enough to be an easy drop target. */
const HANDLE_SIZE = 10;

/**
 * A node in the pannable workspace.
 *
 * Input handles sit along the top edge and output handles along the bottom, so
 * data reads downward — the same direction as the input row above the canvas
 * and the output row below it.
 */
export function EffectFlowNode({id, data, selected}: NodeProps) {
  const {definition, node, inspected} = data as unknown as EffectFlowNodeData;
  const {
    document,
    canInspect,
    texture,
    parameterValues,
    compileError,
    toggleInspect,
    setLiteral,
    setLiterals,
    setNote,
    readOnly,
  } = useEffectEditorContext();

  const firstOutput = definition.outputs[0];

  // The compiler blames exactly one location per failure; if it is this node,
  // wear the error here — a message in the output row does not say *where*.
  const nodeError = compileError?.nodeId === id ? compileError : null;

  // A port with nothing wired into it is how a learner types a constant, so it
  // gets a number field. Textures have no literal form and are wire-only.
  const editableInputs = definition.inputs.filter(
    input =>
      input.type !== 'sampler2D' &&
      incomingEdge(document, {node: id, port: input.id}) === undefined,
  );

  // Compiling for inspection is the whole point of the eye: the shader returns
  // this node's value instead of the graph's, so the thumbnail shows exactly
  // what is flowing through this point.
  const inspection = useMemo(() => {
    if (!inspected || !firstOutput || !canInspect) {
      return null;
    }
    try {
      return {
        // `canInspect` is only true when the open scope IS the document, so
        // the cast is sound; inside a function this branch never runs.
        source: compileEffect(document as EffectDocument, {
          inspect: {node: id, port: firstOutput.id},
        }).fragmentSource,
        error: null,
      };
    } catch (error) {
      return {
        source: null,
        error:
          error instanceof EffectCompileError
            ? error.message
            : (error as Error).message,
      };
    }
  }, [inspected, firstOutput, canInspect, document, id]);

  return (
    <div
      className={`${styles.node} ${selected ? styles.selected : ''} ${
        nodeError ? styles.errored : ''
      }`}
      data-testid={`effect-node-${id}`}
    >
      {/* Only while selected: see NodeNote for why that gating is the point. */}
      {selected && (
        <NodeNote
          note={node.note}
          nodeLabel={nodeDisplayLabel(definition)}
          onChange={value => setNote(id, value)}
          readOnly={readOnly}
        />
      )}

      <PortStrip
        definition={definition}
        ports={definition.inputs}
        direction="target"
        erroredPortId={nodeError?.portId}
      />

      <header className={styles.header}>
        <span className={styles.title}>{nodeDisplayLabel(definition)}</span>
        {firstOutput && canInspect && (
          <button
            type="button"
            className={`${styles.eye} ${inspected ? styles.eyeActive : ''}`}
            aria-pressed={inspected}
            aria-label={translate('Show what {name} produces', {
              name: nodeDisplayLabel(definition),
            })}
            title={nodeDisplayDescription(definition)}
            onClick={() => toggleInspect(id)}
          >
            {inspected ? '◉' : '◎'}
          </button>
        )}
      </header>

      {/* The output row announces the message; this copy is the visual one,
          placed where the fix is. */}
      {nodeError && <p className={styles.nodeError}>{nodeError.message}</p>}

      {definition.colorPicker && (
        <ColorSwatchRow
          model={definition.colorPicker}
          definition={definition}
          node={node}
          onPick={values => setLiterals(id, values)}
          readOnly={readOnly}
        />
      )}

      {/* Only unwired ports get a body row — a wired port's label is already
          on its handle above, and repeating it doubles the node's height for
          nothing. */}
      {editableInputs.length > 0 && (
        <ul className={styles.ports}>
          {editableInputs.map(input => (
            <PortRow
              key={input.id}
              displayLabel={portDisplayLabel(definition, input)}
              port={input}
              onChange={value => setLiteral(id, input.id, value)}
              literal={node.params?.[input.id]}
              readOnly={readOnly}
            />
          ))}
        </ul>
      )}

      {inspected && (
        <div className={styles.inspector}>
          {inspection?.source ? (
            <PreviewCanvas
              fragmentSource={inspection.source}
              texture={texture}
              parameters={parameterValues}
              size={INSPECT_PREVIEW_SIZE}
              label={translate('Preview of {name}', {
                name: nodeDisplayLabel(definition),
              })}
            />
          ) : (
            <p className={styles.inspectorError}>{inspection?.error}</p>
          )}
        </div>
      )}

      <PortStrip
        definition={definition}
        ports={definition.outputs}
        direction="source"
        erroredPortId={nodeError?.portId}
      />
    </div>
  );
}

interface PortStripProps {
  definition: EffectNodeDefinition;
  ports: readonly EffectPortDefinition[];
  direction: 'source' | 'target';
  /** Port the current compile error names, drawn with a red ring. */
  erroredPortId?: string;
}

/**
 * The handles along one edge of a node, each under its own name.
 *
 * The `left` offsets have to be inline. React Flow positions handles with
 * `.react-flow__handle-bottom`, a two-class selector that outranks any single
 * class a CSS module can hand out — so a stylesheet cannot move them, and
 * every handle on an edge stacks at its midpoint. That is what made Split
 * unusable: four outputs, one visible dot, and no way to tell which of X, Y,
 * Z, or W a wire had picked up.
 *
 * Labels are positioned at the same percentages so each name sits directly
 * over its dot.
 */
function PortStrip({
  definition,
  ports,
  direction,
  erroredPortId,
}: PortStripProps) {
  if (ports.length === 0) {
    return null;
  }

  return (
    <div
      className={`${styles.portStrip} ${
        direction === 'source' ? styles.portStripOut : styles.portStripIn
      }`}
    >
      {ports.map((port, index) => {
        const offset = portOffset(index, ports.length);
        const errored = port.id === erroredPortId;
        return (
          <Fragment key={port.id}>
            <Handle
              id={port.id}
              type={direction}
              position={direction === 'source' ? Position.Bottom : Position.Top}
              className={styles.handle}
              // Size and color are inline for the same reason as `left`:
              // React Flow's own rules are as specific as anything a CSS
              // module can produce, and load after it. The error ring is
              // inline for the same reason.
              style={{
                left: offset,
                width: HANDLE_SIZE,
                height: HANDLE_SIZE,
                backgroundColor: portColor(port.type),
                borderColor: errored
                  ? 'var(--effect-editor-error)'
                  : 'rgb(0 0 0 / 45%)',
                boxShadow: errored
                  ? '0 0 0 3px rgb(229 72 77 / 45%)'
                  : undefined,
              }}
              title={`${portDisplayLabel(definition, port)} — ${portTypeLabel(port.type)}`}
            >
              {/* Finger-sized hit area for starting a drag. The visual stays
                  a small dot; drop detection is unaffected because it works
                  from the handle's own bounds plus the connection radius. */}
              <span className={styles.handleHitPad} aria-hidden="true" />
            </Handle>
            <span
              className={`${styles.portStripLabel} ${
                errored ? styles.portStripLabelError : ''
              }`}
              style={{left: offset}}
            >
              {portDisplayLabel(definition, port)}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}

interface PortRowProps {
  displayLabel: string;
  port: EffectPortDefinition;
  literal: EffectLiteral | undefined;
  onChange: (value: EffectLiteral) => void;
  readOnly: boolean;
}

/**
 * How often a picker drag may write to the document, in ms.
 *
 * Color channels are literals baked into the GLSL, so every commit recompiles
 * the shader and relinks a WebGL program per open preview. A native picker
 * streams a change event per mouse move — committing each one makes the drag
 * crawl. Ten commits a second still feels live while keeping the work off the
 * pointer's back.
 */
const PICK_COMMIT_INTERVAL_MS = 100;

/**
 * Throttle with a leading and a trailing edge: the first value commits
 * immediately, intermediate values collapse to at most one per interval, and
 * the last value always lands.
 */
function useThrottled<T>(
  callback: (value: T) => void,
  interval: number,
): (value: T) => void {
  const latest = useRef(callback);
  latest.current = callback;
  const throttle = useRef<{timer: number | null; pending: {value: T} | null}>({
    timer: null,
    pending: null,
  });

  useEffect(() => {
    const state = throttle.current;
    return () => {
      if (state.timer !== null) {
        window.clearTimeout(state.timer);
      }
    };
  }, []);

  return useCallback(
    (value: T) => {
      const state = throttle.current;
      if (state.timer !== null) {
        state.pending = {value};
        return;
      }
      latest.current(value);
      const flush = () => {
        state.timer = null;
        if (state.pending) {
          const {value: pending} = state.pending;
          state.pending = null;
          latest.current(pending);
          state.timer = window.setTimeout(flush, interval);
        }
      };
      state.timer = window.setTimeout(flush, interval);
    },
    [interval],
  );
}

interface ColorSwatchRowProps {
  model: 'rgba' | 'hsla';
  definition: EffectNodeDefinition;
  node: EffectGraphNode;
  onPick: (values: Record<string, number>) => void;
  readOnly: boolean;
}

/**
 * The node's color swatch — a native `<input type="color">`, which is both
 * the preview and the picker (and portals nothing). Picking writes every
 * channel in one document step; the channel inputs below stay editable and
 * wireable on their own.
 */
function ColorSwatchRow({
  model,
  definition,
  node,
  onPick,
  readOnly,
}: ColorSwatchRowProps) {
  const commitPick = useThrottled((hex: string) => {
    const picked = hexToRgb(hex);
    onPick(model === 'rgba' ? picked : rgbToHsl(picked.r, picked.g, picked.b));
  }, PICK_COMMIT_INTERVAL_MS);

  const channel = (portId: string): number => {
    const literal = node.params?.[portId];
    if (typeof literal === 'number') {
      return literal;
    }
    const declared = definition.inputs.find(input => input.id === portId);
    return typeof declared?.defaultValue === 'number'
      ? declared.defaultValue
      : 0;
  };

  const rgb =
    model === 'rgba'
      ? {r: channel('r'), g: channel('g'), b: channel('b')}
      : hslToRgb(channel('h'), channel('s'), channel('l'));

  return (
    <div className={styles.swatchRow}>
      <input
        type="color"
        // `nodrag` is React Flow's own opt-out: without it, pressing on the
        // swatch starts a node drag.
        className={`${styles.swatch} nodrag`}
        value={rgbToHex(rgb.r, rgb.g, rgb.b)}
        disabled={readOnly}
        aria-label={readOnly ? translate('Color') : translate('Pick a color')}
        title={
          readOnly
            ? undefined
            : translate('Pick this color with a color picker')
        }
        onChange={event => commitPick(event.target.value)}
      />
    </div>
  );
}

/** The number field shown for an input port with nothing wired into it. */
function PortRow({
  displayLabel,
  port,
  literal,
  onChange,
  readOnly,
}: PortRowProps) {
  // A generic port has no concrete type until the graph is compiled; `float`
  // is the same fallback the compiler uses for an unwired generic.
  const type: EffectValueType = port.type === 'generic' ? 'float' : port.type;

  return (
    <li className={styles.port}>
      <span className={styles.portLabel}>{displayLabel}</span>
      <LiteralInput
        label={displayLabel}
        type={type}
        value={literal ?? port.defaultValue ?? defaultLiteral(type)}
        onChange={onChange}
        readOnly={readOnly}
      />
    </li>
  );
}
