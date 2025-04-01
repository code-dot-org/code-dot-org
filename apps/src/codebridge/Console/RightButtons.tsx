import Button from '@code-dot-org/component-library/button';
import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import SwapLayoutDropdown from '@codebridge/components/SwapLayoutDropdown';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

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
  const isShareView = useAppSelector(state => state.lab.isShareView);

  return (
    <>
      <div className={moduleStyles.buttonContainer}>
        <WithTooltip tooltipProps={tooltipProps}>
          <Button
            isIconOnly
            icon={{iconStyle: 'solid', iconName: 'eraser'}}
            ariaLabel={codebridgeI18n.clearConsole()}
            onClick={clearOutput}
            size={'xs'}
            type={'tertiary'}
            className={darkModeStyles.tertiaryButton}
          />
        </WithTooltip>
        {!isShareView && <SwapLayoutDropdown />}
      </div>
    </>
  );
};

export default RightButtons;
