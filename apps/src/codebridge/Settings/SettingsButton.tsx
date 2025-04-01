import {Button} from '@code-dot-org/component-library/button';
import {
  WithTooltip,
  TooltipProps,
} from '@code-dot-org/component-library/tooltip';
import React, {useCallback, useRef, useState} from 'react';

import commonI18n from '@cdo/locale';

import SettingsDropdown from './SettingsDropdown';

import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

const SettingsButton: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const closeSettings = useCallback(() => {
    setIsOpen(false);
  }, []);

  const settingsTooltipProps: TooltipProps = {
    text: commonI18n.settings(),
    direction: 'onLeft',
    tooltipId: 'settings-tooltip',
    size: 'xs',
    className: darkModeStyles.tooltipLeft,
  };

  return (
    <div ref={buttonContainerRef}>
      <WithTooltip tooltipProps={settingsTooltipProps}>
        <Button
          isIconOnly
          icon={{iconStyle: 'solid', iconName: 'gear'}}
          color="white"
          size="xs"
          onClick={() => setIsOpen(true)}
          type="tertiary"
          className={darkModeStyles.tertiaryButton}
          ariaLabel="Settings"
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
