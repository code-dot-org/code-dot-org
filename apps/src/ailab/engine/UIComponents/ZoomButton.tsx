import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Tooltip} from '@mui/material';
import React from 'react';

interface ZoomButtonProps {
  label: string;
  iconName: string;
  onClick: () => void;
  disabled?: boolean;
  disabledHint?: string;
  tabbable?: boolean;
  tourAnchor?: string;
}

const ZoomButton = ({
  label,
  iconName,
  onClick,
  disabled,
  disabledHint,
  tabbable = true,
  tourAnchor,
}: ZoomButtonProps) => (
  <Tooltip
    title={disabled && disabledHint ? disabledHint : label}
    placement="right"
  >
    <span
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a disabled button takes no pointer events or focus, so the span carries its tooltip
      tabIndex={disabled && tabbable ? 0 : undefined}
      data-tour-anchor={tourAnchor}
      data-tour-label={label}
    >
      <IconButton
        aria-label={label}
        tabIndex={tabbable ? 0 : -1}
        onClick={onClick}
        disabled={disabled}
        size="extraSmall"
        color="tertiary"
        variant="text"
      >
        <FontAwesomeV6Icon iconName={iconName} aria-hidden="true" />
      </IconButton>
    </span>
  </Tooltip>
);

export default ZoomButton;
