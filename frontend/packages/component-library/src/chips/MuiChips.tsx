import {Chip as MuiChip, FormGroup as MuiFormGroup} from '@mui/material';
import classNames from 'classnames';
import uniq from 'lodash/uniq';
import {useEffect, useId, useRef} from 'react';

import {ComponentSizeXSToL} from '@/common/types';

import moduleStyles from './muiChips.module.scss';

export interface MuiChipsProps {
  /** Group heading; also the fieldset's accessible name */
  label?: string;
  /** Group name: each checkbox posts as `<name>[]`, and the root gets `data-testid="chips-<name>"` */
  name: string;
  /** At least one option must be checked before the host form submits */
  required?: boolean;
  /** Validation message shown when `required` blocks submission */
  requiredMessageText?: string;
  /** Disables every checkbox */
  disabled?: boolean;
  /** Chip text weight */
  textThickness?: 'thick' | 'thin';
  /** Chips to render, in order */
  options: {value: string; label: string}[];
  /** Values of the checked chips */
  values: string[];
  /** Called with the next `values`: a checked value is appended, an unchecked one removed */
  setValues: (values: string[]) => void;
  /** Chip border color */
  color?: 'black' | 'gray';
  /** Chip and heading size */
  size?: ComponentSizeXSToL;
  /** Custom class name, applied to the root div */
  className?: string;
}

interface MuiChipOptionProps {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  textThickness: 'thick' | 'thin';
  required: boolean;
  requiredMessageText?: string;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const MuiChipOption: React.FunctionComponent<MuiChipOptionProps> = ({
  label,
  name,
  value,
  checked,
  textThickness,
  required,
  requiredMessageText,
  disabled,
  onCheckedChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // A message set by an earlier invalid event keeps the input invalid after `required` goes false.
  useEffect(() => {
    inputRef.current?.setCustomValidity('');
  });

  return (
    <div>
      {/* No onClick, clickable, onDelete or disabled: each turns the root into ButtonBase or applies MUI's disabled look. */}
      <MuiChip
        component="label"
        variant="outlined"
        className={classNames(
          moduleStyles.chip,
          moduleStyles[`chip-${textThickness}`],
        )}
        slotProps={{label: {className: moduleStyles.chipLabel}}}
        label={
          <>
            <input
              ref={inputRef}
              type="checkbox"
              name={name}
              value={value}
              checked={checked}
              required={required}
              disabled={disabled}
              onChange={e => {
                onCheckedChange(e.target.checked);
                e.target.setCustomValidity('');
              }}
              // Native bubble, not FormHelperText; see "Deferred changes" in CHIPS_MIGRATION_TO_MUI.md.
              onInvalid={e => {
                (e.target as HTMLInputElement).setCustomValidity(
                  requiredMessageText || 'Please choose at least one option',
                );
              }}
            />
            {label}
          </>
        }
      />
    </div>
  );
};

/**
 * ###  Status: ```Ready for dev```
 *
 * Design System: Chips on MUI `Chip` and `FormGroup`. A group of checkboxes,
 * each drawn as a chip, that posts as `<name>[]` in its host form.
 */
const MuiChips: React.FunctionComponent<MuiChipsProps> = ({
  label,
  name,
  required,
  requiredMessageText,
  disabled,
  options,
  values,
  setValues,
  textThickness = 'thin',
  color = 'black',
  size = 'm',
  className,
}) => {
  const labelId = useId();

  useEffect(() => {
    if (required && !requiredMessageText) {
      console.warn(
        'For usages of the Chips component where the "required" prop is set to true, a localized error message to display when no option is selected is needed.',
      );
    }
  }, [required, requiredMessageText]);

  return (
    <div
      className={classNames(
        moduleStyles.chips,
        moduleStyles[`chips-${color}`],
        moduleStyles[`chips-${size}`],
        className,
      )}
      data-testid={`chips-${name}`}
    >
      {/* Plain fieldset and <label>, not FormControl and FormLabel; see "Deferred changes" in CHIPS_MIGRATION_TO_MUI.md. */}
      <fieldset aria-labelledby={label ? labelId : undefined}>
        {label && (
          <label id={labelId} className={moduleStyles.groupLabel}>
            {label}
          </label>
        )}

        <MuiFormGroup row className={moduleStyles.chipsContainer}>
          {options.map(option => (
            <MuiChipOption
              key={option.value}
              label={option.label}
              name={`${name}[]`}
              value={option.value}
              textThickness={textThickness}
              checked={values.includes(option.value)}
              // Every option is required until one is checked, so the browser blocks an empty submit.
              required={required ? values.length === 0 : false}
              requiredMessageText={requiredMessageText}
              disabled={disabled}
              onCheckedChange={checked =>
                setValues(
                  checked
                    ? uniq([...values, option.value])
                    : values.filter(v => v !== option.value),
                )
              }
            />
          ))}
        </MuiFormGroup>
      </fieldset>
    </div>
  );
};

export default MuiChips;
