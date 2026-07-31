import {Slider, Switch} from '@mui/material';

import {componentCount, parameterValueType} from '../glsl/valueTypes';
import {translate} from '../localization';
import type {EffectLiteral, EffectParameter} from '../model/types';

import styles from './ParameterControls.module.css';

/** Track length of the vertical try-out slider, in px. */
const SLIDER_HEIGHT = 64;

/**
 * The slider's current value, written the way the slider moves.
 *
 * Decimals come from the step rather than the number, so the readout keeps a
 * steady width while it is being dragged — a figure that grows and shrinks by
 * a character as you move is hard to read and shoves the column around. That
 * is also why trailing zeros stay: `0.020` and `0.100` line up, `0.02` and
 * `0.1` do not.
 */
function readValue(parameter: EffectParameter, value: number): string {
  if (parameter.type === 'int') {
    return String(Math.round(value));
  }
  const step = ((parameter.max ?? 1) - (parameter.min ?? 0)) / 100;
  const decimals = step >= 0.1 ? 1 : step >= 0.01 ? 2 : 3;
  return value.toFixed(decimals);
}

export interface ParameterTryOutProps {
  parameter: EffectParameter;
  /** Current value; undefined means the parameter's default. */
  value: EffectLiteral | undefined;
  onChange: (value: EffectLiteral) => void;
}

/**
 * A try-out control for one parameter, shown directly above its knob in the
 * input row — the input row is tall (it holds the texture preview), so the
 * vertical orientation uses room that is otherwise empty, and the control
 * sits visibly attached to the connection point it feeds.
 *
 * These are editor-only: they drive the previews so a learner can see what
 * their knob actually does, and they are deliberately *not* written to the
 * document. The value a game gets is the parameter's default, or whatever the
 * `.useEffect()` block passes.
 */
/**
 * The slider's value, printed above it.
 *
 * `aria-hidden` on purpose: the slider already announces its own value, so
 * this would only repeat it. It is here to be *read* while dragging.
 */
function ValueReadout({
  parameter,
  value,
}: {
  parameter: EffectParameter;
  value: number;
}) {
  return (
    <span className={styles.value} aria-hidden="true">
      {readValue(parameter, value)}
    </span>
  );
}

export function ParameterTryOut({
  parameter,
  value,
  onChange,
}: ParameterTryOutProps) {
  const current = value ?? parameter.defaultValue;

  if (parameter.type === 'bool') {
    // A switch, not a two-step slider: "on or off" is the idea, and the knob
    // sends 1 or 0 into the graph so it can be multiplied straight in.
    return (
      <Switch
        className={styles.switch}
        size="small"
        checked={current === 1}
        inputProps={{
          'aria-label': translate('{name} on', {
            name: parameter.name,
          }),
        }}
        onChange={event => onChange(event.target.checked ? 1 : 0)}
      />
    );
  }

  if (parameter.type === 'int') {
    // Whole numbers only, and marked so the steps are visible rather than
    // something you discover by feel.
    const min = Math.round(parameter.min ?? 0);
    const max = Math.round(parameter.max ?? 10);
    const shown = typeof current === 'number' ? Math.round(current) : min;
    return (
      <div className={styles.control}>
        <ValueReadout parameter={parameter} value={shown} />
        <Slider
          className={styles.slider}
          orientation="vertical"
          style={{height: SLIDER_HEIGHT}}
          min={min}
          max={max}
          step={1}
          marks={max - min <= 10}
          value={shown}
          aria-label={translate('{name} value', {name: parameter.name})}
          onChange={(_event, next) => onChange(Math.round(next as number))}
        />
      </div>
    );
  }

  if (parameter.type === 'float') {
    return (
      <div className={styles.control}>
        <ValueReadout
          parameter={parameter}
          value={typeof current === 'number' ? current : 0}
        />
        <Slider
          className={styles.slider}
          orientation="vertical"
          // MUI sizes a vertical slider from its container; the knob strip has
          // no height to give, so the track length is set here.
          style={{height: SLIDER_HEIGHT}}
          min={parameter.min ?? 0}
          max={parameter.max ?? 1}
          // 100 steps across the range reads as continuous while staying
          // predictable for ranges like 0–0.1.
          step={((parameter.max ?? 1) - (parameter.min ?? 0)) / 100 || 0.01}
          value={typeof current === 'number' ? current : 0}
          aria-label={translate('{name} value', {name: parameter.name})}
          onChange={(_event, next) => onChange(next as number)}
        />
      </div>
    );
  }

  return (
    <span className={styles.components}>
      {Array.from(
        {length: componentCount(parameterValueType(parameter.type))},
        (_unused, index) => (
          <input
            key={index}
            type="number"
            className={styles.field}
            step={0.1}
            value={
              typeof current === 'number' ? current : (current[index] ?? 0)
            }
            aria-label={translate('{name} component {n}', {
              name: parameter.name,
              n: index + 1,
            })}
            onChange={event => {
              const next = Array.from(
                {length: componentCount(parameterValueType(parameter.type))},
                (_ignored, position) =>
                  typeof current === 'number'
                    ? current
                    : (current[position] ?? 0),
              );
              next[index] = Number(event.target.value);
              onChange(next);
            }}
          />
        ),
      )}
    </span>
  );
}
