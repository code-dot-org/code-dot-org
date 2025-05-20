import {Button} from '@code-dot-org/component-library/button';
import {
  WithTooltip,
  TooltipProps,
  WithTooltipHandle,
} from '@code-dot-org/component-library/tooltip';
import React, {useCallback, useRef, useState} from 'react';

import commonI18n from '@cdo/locale';

import SettingsDropdown from './SettingsDropdown';

const SettingsButton: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<WithTooltipHandle>(null);

  const closeSettings = useCallback(() => {
    setIsOpen(false);
    tooltipRef.current?.hideTooltip(); // Hide tooltip when dropdown closes.
  }, []);

  const settingsTooltipProps: TooltipProps = {
    text: commonI18n.settings(),
    direction: 'onLeft',
    tooltipId: 'settings-tooltip',
    size: 'xs',
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
        <SettingsDropdown
          closeDropdown={closeSettings}
          buttonRef={buttonContainerRef}
        />
      )}
    </div>
  );
};

export default React.memo(SettingsButton);
