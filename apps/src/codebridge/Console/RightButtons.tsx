import SwapLayoutDropdown from '@codebridge/components/SwapLayoutDropdown';
import React from 'react';

import Button from '@cdo/apps/componentLibrary/button';
import {WithTooltip} from '@cdo/apps/componentLibrary/tooltip';

import moduleStyles from './right-buttons.module.scss';
import darkModeStyles from '@codebridge/styles/dark-mode.module.scss';

interface RightButtonsProps {
  clearOutput: () => void;
}

const tooltipProps = {
  text: 'Clear Console',
  size: 'xs',
  direction: 'onLeft',
  tooltipId: 'clear-console-tooltip',
};

const RightButtons: React.FunctionComponent<RightButtonsProps> = ({
  clearOutput,
}) => {
  return (
    <>
      <div className={moduleStyles.buttonContainer}>
        <WithTooltip tooltipProps={tooltipProps}>
          <Button
            isIconOnly
            color={'white'}
            icon={{iconStyle: 'solid', iconName: 'eraser'}}
            ariaLabel="clear console"
            onClick={clearOutput}
            size={'xs'}
            type={'tertiary'}
            className={darkModeStyles.iconOnlyTertiaryButton}
          />
        </WithTooltip>
        <SwapLayoutDropdown />
      </div>
    </>
  );
};

export default RightButtons;
