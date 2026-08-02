import {Button, Paper} from '@mui/material';
import {useEffect, useState} from 'react';

import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import Toggle from '@code-dot-org/component-library/toggle';

import {defaultParameterValue, parameterValueType} from '../glsl/valueTypes';
import {translate} from '../localization';
import type {EffectParameter, EffectParameterType} from '../model/types';

import {LiteralInput} from './LiteralInput';
import styles from './ParameterEditor.module.css';
import {parameterTypeLabel} from './portTypes';

/** The types a parameter may take, in menu order — simplest first. */
const PARAMETER_TYPES: readonly EffectParameterType[] = [
  'float',
  'int',
  'bool',
  'vec2',
  'vec3',
  'vec4',
];

/** Fallback range for a whole-number knob, when none has been set. */
const DEFAULT_INT_RANGE = {min: 0, max: 10};

export interface ParameterEditorProps {
  parameter: EffectParameter;
  /** Offset within the input row, in CSS pixels. */
  left: number;
  /**
   * Apply a change. `coalesce` merges a typing run into one undo step, using
   * the same mechanism as sliders and literal fields.
   */
  onChange: (
    changes: Partial<Omit<EffectParameter, 'id'>>,
    coalesce?: string,
  ) => void;
  onRemove: () => void;
  onClose: () => void;
}

/**
 * The popover for editing one parameter.
 *
 * Everything here shapes the effect's public face: the name becomes the
 * `.addEffect()` argument, the default is what the effect does before anyone
 * touches the knob, and min/max become the bounds of the consumer's slider.
 */
export function ParameterEditor({
  parameter,
  left,
  onChange,
  onRemove,
  onClose,
}: ParameterEditorProps) {
  // The name field drafts locally and commits only non-empty values, so the
  // document never holds a nameless parameter even mid-edit — the name is the
  // `.addEffect()` argument, and an empty one would be an unusable block.
  const [nameDraft, setNameDraft] = useState(parameter.name);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleTypeChange = (type: EffectParameterType) => {
    // A new type means a new value shape; carrying the old literal across
    // would leave a vec2 parameter defaulting to a bare number. Ranges only
    // mean anything for a slider, so they reset with the type too — and an
    // on/off knob has no range at all.
    onChange({
      type,
      defaultValue: defaultParameterValue(type),
      ...(type === 'float'
        ? {min: 0, max: 1}
        : type === 'int'
          ? DEFAULT_INT_RANGE
          : {min: undefined, max: undefined}),
    });
  };

  /** Whole-number knobs are held to whole numbers everywhere they are typed. */
  const quantize = (value: number) =>
    parameter.type === 'int' ? Math.round(value) : value;

  return (
    <>
      <div className={styles.backdrop} onPointerDown={onClose} aria-hidden />
      <Paper
        className={styles.popover}
        style={{left}}
        role="dialog"
        aria-label={translate('Edit parameter {name}', {
          name: parameter.name,
        })}
      >
        <TextField
          name="parameter-name"
          size="s"
          label={translate('Name')}
          value={nameDraft}
          // The popover opens because the learner asked to edit; landing in
          // the name field is the point of the gesture.
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          onFocus={event => (event.target as HTMLInputElement).select()}
          onChange={event => {
            setNameDraft(event.target.value);
            const trimmed = event.target.value.trim();
            if (trimmed.length > 0) {
              onChange({name: trimmed}, `param:${parameter.id}:name`);
            }
          }}
          onBlur={() => setNameDraft(parameter.name)}
        />

        <SimpleDropdown
          name="parameter-type"
          size="s"
          labelText={translate('Type')}
          selectedValue={parameter.type}
          items={PARAMETER_TYPES.map(type => ({
            value: type,
            text: parameterTypeLabel(type),
          }))}
          onChange={event =>
            handleTypeChange(event.target.value as EffectParameterType)
          }
        />

        {parameter.type === 'bool' ? (
          // "Starts on" reads better than "default: 1" for a switch, and it
          // is the same 1-or-0 underneath.
          <Toggle
            name="parameter-default"
            size="s"
            className={styles.switchField}
            label={translate('Starts on')}
            checked={parameter.defaultValue === 1}
            onChange={event =>
              onChange({defaultValue: event.target.checked ? 1 : 0})
            }
          />
        ) : (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{translate('Default')}</span>
            <LiteralInput
              label={translate('Default value')}
              type={parameterValueType(parameter.type)}
              value={parameter.defaultValue}
              min={parameter.min}
              max={parameter.max}
              step={parameter.type === 'int' ? 1 : undefined}
              onChange={value =>
                onChange(
                  {
                    defaultValue:
                      typeof value === 'number' ? quantize(value) : value,
                  },
                  `param:${parameter.id}:default`,
                )
              }
            />
          </div>
        )}

        {(parameter.type === 'float' || parameter.type === 'int') && (
          <div className={styles.rangeRow}>
            <TextField
              name="parameter-min"
              size="s"
              label={translate('Min')}
              inputType="number"
              step={parameter.type === 'int' ? 1 : 0.1}
              value={parameter.min ?? (parameter.type === 'int' ? 0 : 0)}
              onChange={event =>
                onChange(
                  {min: quantize(Number(event.target.value) || 0)},
                  `param:${parameter.id}:range`,
                )
              }
            />
            <TextField
              name="parameter-max"
              size="s"
              label={translate('Max')}
              inputType="number"
              step={parameter.type === 'int' ? 1 : 0.1}
              value={
                parameter.max ??
                (parameter.type === 'int' ? DEFAULT_INT_RANGE.max : 1)
              }
              onChange={event =>
                onChange(
                  {max: quantize(Number(event.target.value) || 0)},
                  `param:${parameter.id}:range`,
                )
              }
            />
          </div>
        )}

        <TextField
          name="parameter-hint"
          size="s"
          label={translate('Hint')}
          placeholder={translate('What does this control?')}
          value={parameter.description ?? ''}
          onChange={event =>
            onChange(
              {description: event.target.value || undefined},
              `param:${parameter.id}:description`,
            )
          }
        />

        <footer className={styles.footer}>
          <Button variant="text" color="error" onClick={onRemove}>
            {translate('Remove parameter')}
          </Button>
          <Button variant="contained" color="primary" onClick={onClose}>
            {translate('Done')}
          </Button>
        </footer>
      </Paper>
    </>
  );
}
