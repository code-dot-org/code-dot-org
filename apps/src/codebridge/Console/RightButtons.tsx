import SwapLayoutDropdown from '@codebridge/components/SwapLayoutDropdown';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Button from '@cdo/apps/componentLibrary/button';
import {TooltipProps, WithTooltip} from '@cdo/apps/componentLibrary/tooltip';

import moduleStyles from './right-buttons.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

interface RightButtonsProps {
  clearOutput: () => void;
}

const tooltipProps: TooltipProps = {
  text: codebridgeI18n.clearConsole(),
  size: 'xs',
  direction: 'onLeft',
  tooltipId: 'clear-console-tooltip',
  className: darkModeStyles.tooltipLeft,
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
            ariaLabel={codebridgeI18n.clearConsole()}
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
