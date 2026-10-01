import {IconButton, Tooltip} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

interface ZoomButtonProps {
  label: string;
  iconName: string;
  onClick: () => void;
  disabled?: boolean;
  disabledHint?: string;
}

const ZoomButton = ({
  label,
  iconName,
  onClick,
  disabled,
  disabledHint,
}: ZoomButtonProps) => (
  <Tooltip
    title={disabled && disabledHint ? disabledHint : label}
    placement="right"
  >
    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a disabled button takes no pointer events or focus, so the span carries its tooltip */}
    <span tabIndex={disabled ? 0 : undefined}>
      <IconButton
        aria-label={label}
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
