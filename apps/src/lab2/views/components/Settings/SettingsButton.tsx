import {Button} from '@code-dot-org/component-library/button';
import {
  WithTooltip,
  TooltipProps,
  WithTooltipHandle,
} from '@code-dot-org/component-library/tooltip';
import React, {useCallback, useRef, useState} from 'react';

import commonI18n from '@cdo/locale';

import SettingsDropdowns, {Setting} from './SettingsDropdowns';

interface SettingsButtonProps {
  settings: Setting[];
}
const SettingsButton: React.FC<SettingsButtonProps> = ({settings}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<WithTooltipHandle>(null);

  const closeSettings = useCallback(() => {
    setIsOpen(false);
    tooltipRef.current?.hideTooltip(); // Hide tooltip when dropdown closes.
  }, []);

  const settingsTooltipProps: TooltipProps = {
    text: commonI18n.settings(),
    direction: 'onBottom',
    tooltipId: 'settings-tooltip',
    size: 'xs',
    hideTail: true,
  };

  return (
    <div ref={buttonContainerRef}>
      <WithTooltip tooltipProps={settingsTooltipProps} ref={tooltipRef}>
        <Button
          isIconOnly
          icon={{iconStyle: 'solid', iconName: 'gear'}}
          size="xs"
          onClick={() => setIsOpen(true)}
          type="tertiary"
          ariaLabel={commonI18n.settings()}
          color={'black'}
        />
      </WithTooltip>
      {isOpen && (
        <SettingsDropdowns
          closeDropdown={closeSettings}
          buttonRef={buttonContainerRef}
          settings={settings}
        />
      )}
    </div>
  );
};

export default React.memo(SettingsButton);
