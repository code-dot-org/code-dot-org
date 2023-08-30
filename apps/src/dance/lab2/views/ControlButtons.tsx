import React from 'react';
import moduleStyles from './control-buttons.module.scss';
import classNames from 'classnames';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

// TODO move to Lab2 shared components

interface ButtonProps {
  onClick: () => void;
  text: string;
  disabled?: boolean;
}
export const RunButton: React.FunctionComponent<ButtonProps> = ({
  onClick,
  text,
  disabled,
}) => {
  return (
    <button
      id="run-button"
      className={classNames(
        moduleStyles.controlButton,
        moduleStyles.controlButtonRun,
        disabled && moduleStyles.disabled
      )}
      onClick={onClick}
      type="button"
    >
      <FontAwesome icon={'play'} title={undefined} className={undefined} />
      <div className={moduleStyles.text}>{text}</div>
    </button>
  );
};

export const ResetButton: React.FunctionComponent<ButtonProps> = ({
  onClick,
  text,
  disabled,
}) => {
  return (
    <button
      id="reset-button"
      className={classNames(
        moduleStyles.controlButton,
        moduleStyles.controlButtonReset,
        disabled && moduleStyles.disabled
      )}
      onClick={onClick}
      type="button"
    >
      <FontAwesome icon={'refresh'} title={undefined} className={undefined} />
      <div className={moduleStyles.text}>{text}</div>
    </button>
  );
};
