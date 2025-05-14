import Button from '@code-dot-org/component-library/button';
import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import SwapLayoutDropdown from '@codebridge/components/SwapLayoutDropdown';
import SettingsButton from '@codebridge/Settings/SettingsButton';
import React, {useEffect, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useCodebridgeContext} from '../codebridgeContext';

import ConsoleManager from './ConsoleManager';

import moduleStyles from './right-buttons.module.scss';

interface RightButtonsProps {
  clearOutput: () => void;
  consoleManager: ConsoleManager | null;
}

const tooltipProps: TooltipProps = {
  text: codebridgeI18n.clearConsole(),
  size: 'xs',
  direction: 'onLeft',
  tooltipId: 'clear-console-tooltip',
};

const RightButtons: React.FunctionComponent<RightButtonsProps> = ({
  clearOutput,
  consoleManager,
}) => {
  const {levelProperties} = useCodebridgeContext();
  const isShareView = useAppSelector(state => state.lab.isShareView);
  const isWidgetView = levelProperties.widgetView;
  const isRunning = useAppSelector(state => state.lab2System.isRunning);
  const [hasConsoleOutput, setHasConsoleOutput] = useState(false);
  const isClearButtonDisabled = isRunning || !hasConsoleOutput;

  useEffect(() => {
    if (!consoleManager) {
      return;
    }

    setHasConsoleOutput(consoleManager.getTerminalLines().length > 0);

    const handleUpdate = (terminalLines: string[]) => {
      setHasConsoleOutput(terminalLines.length > 0);
    };

    consoleManager.addTerminalLinesListener(handleUpdate);

    return () => {
      consoleManager.removeTerminalLinesListener(handleUpdate);
    };
  }, [consoleManager]);

  return (
    <div className={moduleStyles.buttonContainer}>
      <WithTooltip tooltipProps={tooltipProps}>
        <Button
          isIconOnly
          icon={{iconStyle: 'solid', iconName: 'eraser'}}
          ariaLabel={codebridgeI18n.clearConsole()}
          onClick={clearOutput}
          size={'xs'}
          type={'tertiary'}
          disabled={isClearButtonDisabled}
          color={'black'}
        />
      </WithTooltip>
      {!isShareView && !isWidgetView && <SwapLayoutDropdown />}
      {isWidgetView && <SettingsButton />}
    </div>
  );
};

export default RightButtons;
