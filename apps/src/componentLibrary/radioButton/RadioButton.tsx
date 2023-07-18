import React, {memo} from 'react';
import classnames from 'classnames';

import Typography from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './radioButton.module.scss';

export interface RadioButtonProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  value: string;
  label?: string;
  disabled?: boolean;
  size?: 'xs' | 's' | 'm' | 'l';
}

const RadioButton: React.FunctionComponent<RadioButtonProps> = ({
  label,
  checked,
  onChange,
  name,
  value,
  disabled = false,
  size = 'm',
}) => {
  return (
    <label
      className={classnames(
        moduleStyles.radioButton,
        moduleStyles[`radioButton-${size}`]
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <i className={moduleStyles.radioIcon} />
      {label && (
        <Typography
          semanticTag="span"
          className={moduleStyles.radioButtonLabel}
          visualAppearance="body-two"
        >
          {label}
        </Typography>
      )}
    </label>
  );
};

export default memo(RadioButton);
