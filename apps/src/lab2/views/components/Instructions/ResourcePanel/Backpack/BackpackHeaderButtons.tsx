import React from 'react';

import IconButtonWithTooltip from '@cdo/apps/lab2/views/components/IconButtonWithTooltip';

interface BackpackHeaderButtonsProps {
  incrementBackpackRefreshKey: () => void;
}

const BackpackHeaderButtons: React.FC<BackpackHeaderButtonsProps> = ({
  incrementBackpackRefreshKey,
}) => {
  return (
    <IconButtonWithTooltip
      id="refresh-backpack"
      label="Refresh Backpack"
      onClick={incrementBackpackRefreshKey}
      variant="text"
      color="tertiary"
      size="extraSmall"
      tooltipSize="xs"
      tooltipDirection="onBottom"
      hideTooltipTail={true}
      icon={{iconName: 'refresh', iconStyle: 'solid'}}
    />
  );
};

export default BackpackHeaderButtons;
