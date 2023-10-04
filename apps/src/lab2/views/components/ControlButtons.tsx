// Various control buttons for Lab2 labs.

// Note: this is intended as an eventual replacement for GameButtons.
// These buttons do not reference any specific IDs or make any assumptions
// about placement or view state to allow for more flexibility in their use.

import React from 'react';
import moduleStyles from './control-buttons.module.scss';
import classNames from 'classnames';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

interface ButtonProps {
  onClick: () => void;
  text: string;
  disabled?: boolean;
}

export const RunButton: React.FunctionComponent<ButtonProps> = props => {
  return (
    <ControlButton
      {...props}
      id="run-button"
      style={moduleStyles.controlButtonRun}
      icon={'play'}
    />
  );
};

export const ResetButton: React.FunctionComponent<ButtonProps> = props => {
  return (
    <ControlButton
      {...props}
      id="reset-button"
      style={moduleStyles.controlButtonReset}
      icon={'refresh'}
    />
  );
};

interface BaseButtonProps {
  id: string;
  style: string;
  icon: string;
}

const ControlButton: React.FunctionComponent<ButtonProps & BaseButtonProps> = ({
  onClick,
  text,
  disabled,
  id,
  style,
  icon,
}) => {
  return (
    <button
      id={id}
      className={classNames(style, disabled && moduleStyles.disabled)}
      onClick={onClick}
      type="button"
    >
      <FontAwesome icon={icon} title={undefined} className={undefined} />
      <div className={moduleStyles.text}>{text}</div>
    </button>
  );
};
