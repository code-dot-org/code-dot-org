import classNames from 'classnames';
import React, {useEffect, useRef, memo, HTMLAttributes} from 'react';

import moduleStyles from './chip.module.scss';

const commonI18n = require('@cdo/locale');

interface ChipProps extends HTMLAttributes<HTMLInputElement> {
  /** Chip label */
  label: string;
  /** Chip name*/
  name: string;
  /** Chip value */
  value: string;
  /** Chip checked state */
  checked: boolean;
  /** Chip text type (thickness) */
  textThickness: 'thick' | 'thin';
  /** Chip required state */
  required: boolean;
  /** Chip disabled state */
  disabled?: boolean;
  /** Chip onChange handler*/
  onCheckedChange: (checked: boolean) => void;
}

const Chip: React.FunctionComponent<ChipProps> = ({
  label,
  name,
  value,
  checked,
  required,
  textThickness,
  disabled,
  onCheckedChange,
  ...HTMLAttributes
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset validity on every render so it gets checked again.
    // Otherwise, removing the `required` attribute doesn't work as expected.
    const input = inputRef.current;
    if (input) {
      input.setCustomValidity('');
    }
  }, [inputRef, onCheckedChange]);

  return (
    <div>
      <label
        className={classNames(
          moduleStyles.chip,
          moduleStyles[`chip-${textThickness}`]
        )}
      >
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
            // Reset validity so it gets checked again.
            e.target.setCustomValidity('');
          }}
          onInvalid={e => {
            (e.target as HTMLInputElement).setCustomValidity(
              commonI18n.chooseAtLeastOne()
            );
          }}
          {...HTMLAttributes}
        />
        {label}
      </label>
    </div>
  );
};

export default memo(Chip);
