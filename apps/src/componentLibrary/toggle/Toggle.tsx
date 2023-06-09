import React from 'react';
import classnames from 'classnames';
import Typography from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './toggle.module.scss';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  name: string;
  value?: string;
  label?: string;
  disabled?: boolean;
  position?: 'left' | 'right';
  size?: 'xs' | 's' | 'm' | 'l';
}

const Toggle: React.FunctionComponent<ToggleProps> = ({
  checked,
  onChange,
  name,
  value,
  label,
  disabled = false,
  position = 'left',
  size = 'm',
}) => {
  return (
    <label
      className={classnames(moduleStyles.label, moduleStyles[`label-${size}`])}
    >
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <i className="fa fa-solid" />
      {label && (
        //   TODO: [DES-296] Once new Typography is ready, implement different label sizes
        <Typography semanticTag="span" visualAppearance="body-one">
          {label}
        </Typography>
      )}
    </label>
  );
};

export default Toggle;
