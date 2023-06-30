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
      className={classnames(
        moduleStyles.toggle,
        moduleStyles[`toggle-${size}`],
        position === 'right' && moduleStyles['toggle-right']
      )}
    >
      <div>
        <input
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <span className={moduleStyles.switch}>
          <i className={classnames('fa', 'fa-solid')} />
          <span />
        </span>
      </div>

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
