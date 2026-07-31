import {Button, IconButton} from '@mui/material';
import {useCallback, useRef, useState} from 'react';

import {translate} from '../localization';
import {
  INPUT_EFFECT_TIME_NODE_ID,
  parameterIdFromNodeId,
} from '../model/constants';
import type {
  EffectGraphScope,
  EffectLiteral,
  EffectParameter,
} from '../model/types';
import {
  inputRowGhosts,
  outputGhost,
  parameterGhost,
  type EffectGhost,
} from '../nodes/ghosts';
import {PreviewCanvas} from '../preview/PreviewCanvas';
import {restartEffectTime} from '../preview/previewClock';
import type {ShaderPreviewParameterValue} from '../preview/ShaderPreview';
import type {TestTexture} from '../preview/testTextures';

import {ghostDisplayLabel} from './labels';
import {ParameterTryOut} from './ParameterControls';
import {ParameterEditor} from './ParameterEditor';
import styles from './PinnedRows.module.css';
import {portTypeLabel} from './portTypes';
import {TexturePickerDialog} from './TexturePickerDialog';

const PREVIEW_SIZE = 96;

/** Popover width plus a margin, for keeping it inside the row. */
const EDITOR_WIDTH = 248;

export type RegisterAnchor = (
  nodeId: string,
  element: HTMLElement | null,
) => void;

export interface InputRowProps {
  document: EffectGraphScope;
  texture: TexImageSource | null;
  selectedTexture: TestTexture;
  onSelectTexture: (textureId: string) => void;
  /** Create a parameter and return its id, so its editor can open on it. */
  onAddParameter: () => string;
  onUpdateParameter: (
    parameterId: string,
    changes: Partial<Omit<EffectParameter, 'id'>>,
    coalesce?: string,
  ) => void;
  onRemoveParameter: (parameterId: string) => void;
  registerAnchor: RegisterAnchor;
  /** Try-out values for parameters, driving the previews only. */
  parameterValues: ReadonlyMap<string, EffectLiteral>;
  onParameterValueChange: (parameterId: string, value: EffectLiteral) => void;
  /**
   * False inside a function workspace: no test texture, no stock knobs, no
   * try-out sliders — the row holds only the function's declared inputs.
   */
  showStockInputs?: boolean;
  /** "Parameter" in the main workspace, "Input" inside a function. */
  addButtonLabel?: string;
  /**
   * Read-only: no adding, renaming, retyping, or removing a parameter. The
   * try-out sliders stay live — they drive the previews and are never written
   * to the document, so trying values out is reading, not editing.
   */
  readOnly?: boolean;
}

/**
 * The fixed row above the workspace.
 *
 * It shows the texture being tested against and one knob per value the effect
 * is given, parameters included. The knobs are not draggable React Flow
 * handles — they are the *labels* for handles pinned underneath them in the
 * canvas, which is what keeps them visible no matter where the workspace has
 * been panned.
 */
export function InputRow({
  document,
  texture,
  selectedTexture,
  onSelectTexture,
  onAddParameter,
  onUpdateParameter,
  onRemoveParameter,
  registerAnchor,
  parameterValues,
  onParameterValueChange,
  showStockInputs = true,
  addButtonLabel = '+ Parameter',
  readOnly = false,
}: InputRowProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState<{id: string; left: number} | null>(
    null,
  );
  const [choosingTexture, setChoosingTexture] = useState(false);

  /** Popover offset within the row, from wherever the learner clicked. */
  const editorLeftFor = useCallback((element: HTMLElement) => {
    const bounds = sectionRef.current?.getBoundingClientRect();
    const anchor = element.getBoundingClientRect();
    const left = anchor.left - (bounds?.left ?? 0);
    return Math.max(
      8,
      Math.min(left, (bounds?.width ?? EDITOR_WIDTH) - EDITOR_WIDTH),
    );
  }, []);

  const handleAdd = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      // Open the editor on the new parameter immediately: "add, then rename"
      // is the whole flow, and the default name is a placeholder.
      const id = onAddParameter();
      setEditing({id, left: editorLeftFor(event.currentTarget)});
    },
    [onAddParameter, editorLeftFor],
  );

  // The edited parameter is looked up fresh each render, so an undo that
  // removes it also closes the popover instead of leaving it editing a ghost.
  const editingParameter = editing
    ? document.parameters.find(parameter => parameter.id === editing.id)
    : undefined;

  return (
    <section
      ref={sectionRef}
      className={styles.row}
      aria-label={translate('Effect input')}
    >
      {showStockInputs && (
        <div className={styles.textureColumn}>
          <div className={styles.texturePreviewRow}>
            <TexturePreview
              texture={texture}
              label={translate(selectedTexture.label)}
            />
            <IconButton
              className={styles.textureButton}
              aria-label={translate('Change test texture')}
              title={translate('Choose the texture the previews run on')}
              onClick={() => setChoosingTexture(true)}
            >
              ⇄
            </IconButton>
          </div>
          <TexturePickerDialog
            open={choosingTexture}
            selectedId={selectedTexture.id}
            onSelect={onSelectTexture}
            onClose={() => setChoosingTexture(false)}
          />
        </div>
      )}

      <ul className={styles.knobs}>
        {(showStockInputs
          ? inputRowGhosts(document)
          : document.parameters.map(parameterGhost)
        ).map(ghost => {
          const parameterId = parameterIdFromNodeId(ghost.id);
          const parameter =
            parameterId !== null && showStockInputs
              ? document.parameters.find(entry => entry.id === parameterId)
              : undefined;
          return (
            <Knob
              key={ghost.id}
              ghost={ghost}
              registerAnchor={registerAnchor}
              control={
                parameter ? (
                  <ParameterTryOut
                    parameter={parameter}
                    value={parameterValues.get(parameter.id)}
                    onChange={value =>
                      onParameterValueChange(parameter.id, value)
                    }
                  />
                ) : ghost.id === INPUT_EFFECT_TIME_NODE_ID ? (
                  // The editor analogue of a game re-applying the effect:
                  // `uEffectTime` in every preview jumps back to zero.
                  <IconButton
                    className={styles.restartButton}
                    aria-label={translate('Restart effect time')}
                    title={translate(
                      'Play the effect from its beginning, as if it was just applied',
                    )}
                    onClick={restartEffectTime}
                  >
                    ↻
                  </IconButton>
                ) : undefined
              }
              onEdit={
                parameterId !== null && !readOnly
                  ? event =>
                      setEditing({
                        id: parameterId,
                        left: editorLeftFor(event.currentTarget),
                      })
                  : undefined
              }
            />
          );
        })}
        {!readOnly && (
          <li className={styles.knobItem}>
            <Button className={styles.addParameter} onClick={handleAdd}>
              {addButtonLabel}
            </Button>
          </li>
        )}
      </ul>

      {editing && editingParameter && (
        <ParameterEditor
          key={editing.id}
          parameter={editingParameter}
          left={editing.left}
          onChange={(changes, coalesce) =>
            onUpdateParameter(editing.id, changes, coalesce)
          }
          onRemove={() => {
            onRemoveParameter(editing.id);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

export interface OutputRowProps {
  fragmentSource: string | null;
  compileError: string | null;
  texture: TexImageSource | null;
  parameters: ReadonlyMap<string, ShaderPreviewParameterValue>;
  registerAnchor: RegisterAnchor;
  /** False inside a function, where there is no shader preview to run. */
  showPreview?: boolean;
  /** Overrides the output knob — a function's output carries its own type. */
  ghost?: EffectGhost;
}

/** The fixed row below the workspace: the effect's result, live. */
export function OutputRow({
  fragmentSource,
  compileError,
  texture,
  parameters,
  registerAnchor,
  showPreview = true,
  ghost = outputGhost,
}: OutputRowProps) {
  return (
    // The result box sits under the test texture box above it, so a learner
    // reads the before and after in the same column.
    <section className={styles.row} aria-label={translate('Effect output')}>
      <div className={styles.textureColumn}>
        {compileError ? (
          <p className={styles.error} role="status">
            {compileError}
          </p>
        ) : showPreview ? (
          <PreviewCanvas
            fragmentSource={fragmentSource}
            texture={texture}
            parameters={parameters}
            size={PREVIEW_SIZE}
            label={translate('Effect result')}
          />
        ) : null}
      </div>

      <ul className={`${styles.knobs} ${styles.knobsTop}`}>
        <Knob ghost={ghost} registerAnchor={registerAnchor} />
      </ul>
    </section>
  );
}

interface KnobProps {
  ghost: EffectGhost;
  registerAnchor: RegisterAnchor;
  /** A control shown above the label, e.g. a parameter's try-out slider. */
  control?: React.ReactNode;
  /** Present only on parameter knobs — the stock inputs are not editable. */
  onEdit?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * One named anchor in a pinned row.
 *
 * Deliberately just the name: the single dot for each value is the ghost pin
 * at the canvas seam, pinned under this label by `usePinnedGhosts`. An extra
 * dot up here made every input read as two disconnected points.
 */
function Knob({ghost, registerAnchor, control, onEdit}: KnobProps) {
  // The ref callback has to keep its identity across renders. An inline arrow
  // would be a new function every time, so React would detach it with `null`
  // and reattach it on each render — and since detaching updates the anchor
  // map, that is an infinite render loop rather than a cosmetic waste.
  const setAnchor = useCallback(
    (element: HTMLElement | null) => {
      registerAnchor(ghost.id, element);
    },
    [ghost.id, registerAnchor],
  );

  return (
    <li className={styles.knobItem}>
      {control}
      {onEdit ? (
        <button
          ref={setAnchor}
          data-knob={ghost.id}
          type="button"
          className={styles.knobLabelButton}
          aria-label={translate('Edit parameter {name}', {name: ghost.label})}
          title={translate('Rename, retype, or remove this parameter')}
          onClick={onEdit}
        >
          {ghost.label}
          <span className={styles.editGlyph} aria-hidden="true">
            ✎
          </span>
        </button>
      ) : (
        <span
          ref={setAnchor}
          data-knob={ghost.id}
          className={styles.knobLabel}
          title={`${ghostDisplayLabel(ghost)} — ${portTypeLabel(ghost.type)}`}
        >
          {ghostDisplayLabel(ghost)}
        </span>
      )}
    </li>
  );
}

function TexturePreview({
  texture,
  label,
}: {
  texture: TexImageSource | null;
  label: string;
}) {
  return (
    <div
      className={styles.textureBox}
      style={{width: PREVIEW_SIZE, height: PREVIEW_SIZE}}
    >
      {texture instanceof HTMLCanvasElement && (
        <CanvasMirror source={texture} label={label} />
      )}
    </div>
  );
}

/**
 * Show the test texture itself.
 *
 * The texture is generated onto an offscreen canvas for WebGL upload; drawing
 * it as a data URL rather than mounting that canvas twice keeps a single
 * source of truth for what the shader is actually reading.
 */
function CanvasMirror({
  source,
  label,
}: {
  source: HTMLCanvasElement;
  label: string;
}) {
  return (
    <img
      className={styles.textureImage}
      src={source.toDataURL()}
      alt={translate('{name} test texture', {name: label})}
    />
  );
}
