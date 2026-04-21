import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import ConsoleManager from '@codebridge/Console/ConsoleManager';
import {setWidgetViewShowCode} from '@codebridge/redux/workspaceRedux';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import React, {useEffect, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import {useCodebridgeContext} from '../codebridgeContext';

import moduleStyles from './right-buttons.module.scss';

interface RightButtonsProps {
  clearOutput?: () => void;
  consoleManager?: ConsoleManager | null;
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
  const {appName} = levelProperties;
  const isWidgetView = levelProperties.widgetView;
  const widgetViewAllowShowCode = levelProperties.widgetViewAllowShowCode;
  const isRunning = useAppSelector(state => state.lab2System.isRunning);
  const [hasConsoleOutput, setHasConsoleOutput] = useState(false);
  const isClearButtonDisabled = isRunning || !hasConsoleOutput;
  const dispatch = useAppDispatch();
  const widgetViewShowCode = useAppSelector(
    state => state.codebridgeWorkspace.widgetViewShowCode
  );

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
        <MuiButton
          variant="text"
          color="secondary"
          size="extraSmall"
          onClick={onViewCodeToggle}
          type="button"
          startIcon={<FontAwesomeV6Icon iconStyle="solid" iconName="code" />}
        >
          {widgetViewShowCode ? commonI18n.hideCode() : commonI18n.viewCode()}
        </MuiButton>
      )}
      {appName === 'pythonlab' && (
        <WithTooltip tooltipProps={tooltipProps}>
          <MuiIconButton
            variant="text"
            color="secondary"
            size="extraSmall"
            disabled={isClearButtonDisabled}
            onClick={clearOutput}
            aria-label={codebridgeI18n.clearConsole()}
            type="button"
          >
            <FontAwesomeV6Icon iconStyle="solid" iconName="eraser" />
          </MuiIconButton>
        </WithTooltip>
      )}
    </div>
  );
};

export default RightButtons;
