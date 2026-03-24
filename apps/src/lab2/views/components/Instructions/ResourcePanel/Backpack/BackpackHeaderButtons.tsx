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
      type="tertiary"
      color="gray"
      buttonSize="xs"
      tooltipSize="xs"
      tooltipDirection="onBottom"
      hideTooltipTail={true}
      icon={{iconName: 'refresh', iconStyle: 'solid'}}
    />
  );
};

export default BackpackHeaderButtons;
