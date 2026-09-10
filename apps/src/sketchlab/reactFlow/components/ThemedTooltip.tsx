import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {Tooltip, TooltipProps} from '@mui/material';
import React from 'react';

// Drop-in for MUI's Tooltip. The bubble portals to <body>, outside every
// element that carries data-theme, so it has to be set on the bubble itself.
const ThemedTooltip: React.FunctionComponent<TooltipProps> = ({
  slotProps,
  ...rest
}) => {
  const {theme} = useTheme(true);
  if (!theme) {
    return <Tooltip {...rest} slotProps={slotProps} />;
  }

  return (
    <Tooltip
      {...rest}
      slotProps={{...slotProps, tooltip: {'data-theme': theme}}}
    />
  );
};

export default ThemedTooltip;
