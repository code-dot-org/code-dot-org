import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, iconButtonClasses} from '@mui/material';
import classNames from 'classnames';
import React, {type KeyboardEvent} from 'react';

interface PagerButtonProps {
  label: string;
  icon: string;
  disabled: boolean;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent) => void;
}

const PagerButton = ({
  label,
  icon,
  disabled,
  onClick,
  onKeyDown,
}: PagerButtonProps) => (
  <IconButton
    variant="outlined"
    color="secondary"
    size="small"
    aria-label={label}
    aria-disabled={disabled}
    className={classNames({[iconButtonClasses.disabled]: disabled})}
    onClick={onClick}
    onKeyDown={onKeyDown}
  >
    <FontAwesomeV6Icon iconName={icon} aria-hidden="true" />
  </IconButton>
);

export default PagerButton;
