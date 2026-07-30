import {IconButton} from '@mui/material';
import {useRef, useState, type ChangeEvent} from 'react';

import type {ReactFieldEditorProps} from '@code-dot-org/blockly';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './vectorEditor.module.css';

/** A 2D value — the in-memory form of a `vector` field. */
export interface VectorValue {
  x: number;
  y: number;
}

export const DEFAULT_VECTOR: VectorValue = {x: 0, y: 0};

// The grid is a square of `SIZE` px with the origin at its centre and `DIV`
// divisions each way; it spans [-range, range] per axis, where `range` zooms.
// `+y` is down, matching the engine (gravity's direction is `(0, 1)` = down)
// and SVG.
const SIZE = 200;
const CENTER = SIZE / 2;
const DIV = 10;
const DEFAULT_RANGE = 10;
const MIN_RANGE = 1;
const MAX_RANGE = 10000;

const clamp = (n: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, n));

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** A zoom range that comfortably frames `value` (default when it fits). */
const fitRange = (value: VectorValue): number => {
  const magnitude = Math.max(Math.abs(value.x), Math.abs(value.y));
  if (magnitude <= DEFAULT_RANGE) {
    return DEFAULT_RANGE;
  }
  return clamp(
    Math.ceil(magnitude / DEFAULT_RANGE) * DEFAULT_RANGE,
    MIN_RANGE,
    MAX_RANGE,
  );
};

/**
 * The `vector` field's popup editor: a two-axis grid centred at (0, 0). Clicking
 * or dragging points an arrow from the origin to the chosen grid point and sets
 * the field's x/y. Zoom buttons reach larger values; the x/y text fields set
 * exact ones.
 */
export function VectorEditor({
  value,
  onChange,
}: ReactFieldEditorProps<VectorValue>) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const [range, setRange] = useState(() => fitRange(value));

  const scale = CENTER / range; // px per unit
  const unit = range / DIV; // grid-snap increment

  const setFromEvent = (clientX: number, clientY: number): void => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const snap = (px: number): number =>
      round2(Math.round((px - CENTER) / scale / unit) * unit);
    onChange({x: snap(clientX - rect.left), y: snap(clientY - rect.top)});
  };

  const setAxis = (axis: 'x' | 'y', raw: string): void => {
    const n = Number(raw);
    if (Number.isFinite(n)) {
      onChange({...value, [axis]: n});
    }
  };

  // Colors come from the CSS module via `var()` (theme-reactive) — SVG resolves
  // custom properties through the `stroke`/`fill` CSS properties (classes), not
  // through the presentation attributes.
  const lines = [];
  for (let i = -DIV; i <= DIV; i++) {
    const p = CENTER + (i * CENTER) / DIV;
    const axis = i === 0;
    lines.push(
      <line
        key={`v${i}`}
        className={axis ? styles.axis : styles.line}
        x1={p}
        y1={0}
        x2={p}
        y2={SIZE}
      />,
      <line
        key={`h${i}`}
        className={axis ? styles.axis : styles.line}
        x1={0}
        y1={p}
        x2={SIZE}
        y2={p}
      />,
    );
  }

  const tip = {x: CENTER + value.x * scale, y: CENTER + value.y * scale};

  return (
    <div className={styles.editor}>
      <div className={styles.stage}>
        <svg
          ref={svgRef}
          className={styles.grid}
          width={SIZE}
          height={SIZE}
          onMouseDown={e => {
            setDragging(true);
            setFromEvent(e.clientX, e.clientY);
          }}
          onMouseMove={e => {
            if (dragging) {
              setFromEvent(e.clientX, e.clientY);
            }
          }}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
        >
          <defs>
            <marker
              id="world-vector-arrowhead"
              markerWidth={8}
              markerHeight={8}
              refX={6}
              refY={3}
              orient="auto"
            >
              <path className={styles.arrow} d="M0,0 L6,3 L0,6 Z" />
            </marker>
          </defs>
          <rect
            className={styles.bg}
            x={0}
            y={0}
            width={SIZE}
            height={SIZE}
            rx={4}
          />
          {lines}
          {(value.x !== 0 || value.y !== 0) && (
            <line
              className={styles.arrow}
              x1={CENTER}
              y1={CENTER}
              x2={tip.x}
              y2={tip.y}
              strokeWidth={3}
              markerEnd="url(#world-vector-arrowhead)"
            />
          )}
          <circle className={styles.arrow} cx={CENTER} cy={CENTER} r={3} />
        </svg>
        <div className={styles.zoom}>
          <IconButton
            aria-label="Zoom in"
            size="extraSmall"
            color="tertiary"
            variant="text"
            onClick={() => setRange(r => clamp(r / 2, MIN_RANGE, MAX_RANGE))}
          >
            <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
          </IconButton>
          <IconButton
            aria-label="Reset zoom"
            size="extraSmall"
            color="tertiary"
            variant="text"
            onClick={() => setRange(fitRange(value))}
          >
            <FontAwesomeV6Icon iconName="expand" iconStyle="solid" />
          </IconButton>
          <IconButton
            aria-label="Zoom out"
            size="extraSmall"
            color="tertiary"
            variant="text"
            onClick={() => setRange(r => clamp(r * 2, MIN_RANGE, MAX_RANGE))}
          >
            <FontAwesomeV6Icon iconName="minus" iconStyle="solid" />
          </IconButton>
        </div>
      </div>
      <div className={styles.inputs}>
        <label className={styles.field}>
          x
          <input
            type="number"
            value={value.x}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setAxis('x', e.target.value)
            }
          />
        </label>
        <label className={styles.field}>
          y
          <input
            type="number"
            value={value.y}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setAxis('y', e.target.value)
            }
          />
        </label>
      </div>
    </div>
  );
}

export default VectorEditor;
