import React from 'react';

import Typography from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './checkbox.module.scss';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  name: string;
  value?: string;
  label?: string;
}

const Checkbox: React.FunctionComponent<CheckboxProps> = ({
  label,
  checked,
  onChange,
  name,
  value,
}) => {
  return (
    <label className={moduleStyles.label}>
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
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
