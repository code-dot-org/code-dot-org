import {componentCount} from '../glsl/valueTypes';
import type {EffectLiteral, EffectValueType} from '../model/types';

import styles from './EffectFlowNode.module.css';

export interface LiteralInputProps {
  /** Port label, used to name each component field for screen readers. */
  label: string;
  type: EffectValueType;
  value: EffectLiteral;
  onChange: (value: EffectLiteral) => void;
  min?: number;
  max?: number;
  /** Spinner increment. Whole-number parameters pass 1. */
  step?: number;
  /** Show the value but refuse edits (a read-only workspace). */
  readOnly?: boolean;
}

const COMPONENT_LABELS = ['X', 'Y', 'Z', 'W'];

/**
 * The number widget shown on an input port with nothing wired into it.
 *
 * An unwired port is how a learner types a constant — there is no separate
 * "constant node" to place — so this doubles as the literal editor for the
 * whole graph.
 */
export function LiteralInput({
  label,
  type,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  readOnly = false,
}: LiteralInputProps) {
  const count = componentCount(type);
  const components =
    typeof value === 'number'
      ? [value]
      : Array.from({length: count}, (_unused, index) => value[index] ?? 0);

  const handleChange = (index: number, next: number) => {
    if (type === 'float') {
      onChange(next);
      return;
    }
    const updated = Array.from(
      {length: count},
      (_unused, position) => components[position] ?? 0,
    );
    updated[index] = next;
    onChange(updated);
  };

  return (
    <span className={styles.literal}>
      {Array.from({length: count}, (_unused, index) => (
        <input
          key={index}
          type="number"
          className={styles.literalField}
          step={step}
          min={min}
          max={max}
          value={components[index] ?? 0}
          disabled={readOnly}
          aria-label={
            count === 1 ? label : `${label} ${COMPONENT_LABELS[index]}`
          }
          onChange={event => {
            const parsed = Number.parseFloat(event.target.value);
            handleChange(index, Number.isNaN(parsed) ? 0 : parsed);
          }}
          // React Flow pans the canvas on drag; without this a drag inside the
          // field selects text on the canvas instead of in the input.
          onPointerDown={event => event.stopPropagation()}
        />
      ))}
    </span>
  );
}
