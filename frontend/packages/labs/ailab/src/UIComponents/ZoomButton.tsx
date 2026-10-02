import {IconButton, Tooltip} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

interface ZoomButtonProps {
  label: string;
  iconName: string;
  onClick: () => void;
  disabled?: boolean;
  disabledHint?: string;
  tabbable?: boolean;
}

const ZoomButton = ({
  label,
  iconName,
  onClick,
  disabled,
  disabledHint,
  tabbable = true,
}: ZoomButtonProps) => {
  const tabIndex = tabbable ? 0 : -1;
  return (
    <Tooltip
      title={disabled && disabledHint ? disabledHint : label}
      placement="right"
    >
      {/* A disabled button takes no pointer events or focus, so the span carries its tooltip. */}
      <span tabIndex={disabled ? tabIndex : undefined}>
        <IconButton
          aria-label={label}
          tabIndex={tabIndex}
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
};

export default ZoomButton;
