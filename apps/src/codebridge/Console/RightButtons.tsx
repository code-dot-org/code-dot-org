import Button from '@code-dot-org/component-library/button';
import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import {setWidgetViewShowCode} from '@codebridge/redux/workspaceRedux';
import React, {useEffect, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import SettingsButton from '@cdo/apps/lab2/views/components/Settings/SettingsButton';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import {useCodebridgeContext} from '../codebridgeContext';
import {useCodebridgeSettings} from '../hooks/useCodebridgeSettings';

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
  const isWidgetView = levelProperties.widgetView;
  const widgetViewAllowShowCode = levelProperties.widgetViewAllowShowCode;
  const isRunning = useAppSelector(state => state.lab2System.isRunning);
  const [hasConsoleOutput, setHasConsoleOutput] = useState(false);
  const isClearButtonDisabled = isRunning || !hasConsoleOutput;
  const dispatch = useAppDispatch();
  const widgetViewShowCode = useAppSelector(
    state => state.codebridgeWorkspace.widgetViewShowCode
  );
  const settings = useCodebridgeSettings();

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

  const onViewCodeToggle = () => {
    dispatch(setWidgetViewShowCode(!widgetViewShowCode));
  };

  return (
    <div className={moduleStyles.buttonContainer}>
      {isWidgetView && widgetViewAllowShowCode && (
        <Button
          text={
            widgetViewShowCode ? commonI18n.hideCode() : commonI18n.viewCode()
          }
          type="tertiary"
          color="black"
          size="xs"
          iconLeft={{iconStyle: 'solid', iconName: 'code'}}
          onClick={onViewCodeToggle}
        />
      )}
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
      {isWidgetView && !widgetViewShowCode && (
        <SettingsButton settings={settings} />
      )}
    </div>
  );
};

export default RightButtons;
