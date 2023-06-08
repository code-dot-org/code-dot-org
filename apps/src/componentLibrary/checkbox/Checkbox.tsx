import React, {useRef, useEffect} from 'react';

import Typography from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './checkbox.module.scss';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  name: string;
  value?: string;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
}

const Checkbox: React.FunctionComponent<CheckboxProps> = ({
  label,
  checked,
  onChange,
  name,
  value,
  disabled = false,
  indeterminate = false,
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef?.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [checkboxRef, indeterminate]);

  return (
    <label className={moduleStyles.label}>
      <input
        type="checkbox"
        ref={checkboxRef}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <i className="fa fa-solid" />
      {label && (
        <Typography semanticTag="span" visualAppearance="body-one">
          {label}
        </Typography>
      )}
    </label>
  );
};

export default Checkbox;
