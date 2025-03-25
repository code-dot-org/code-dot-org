import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import React, {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

/*
  Please note - this is a fairly brittle component in that it's only allowing toggling between
  horizontal and vertical layouts.

  At some point in the future, we may need to expand the functionality to select between arbitrary
  layouts which are available.
*/

const SwapLayoutDropdown: React.FunctionComponent = () => {
  const {config, setConfig, levelProperties} = useCodebridgeContext();
  const appName = levelProperties.appName;
  // Disable toggling while the program is running, as it could cause data loss.
  const isRunningOrValidating = useAppSelector(
    state => state.lab2System.isRunning || state.lab2System.isValidating
  );

  const onLayoutChange = useCallback(() => {
    const newLayout =
      config.activeLayout === 'horizontal' ? 'vertical' : 'horizontal';
    sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_MOVE_CONSOLE, appName, {
      positionMovedTo: newLayout,
    });
    setConfig({
      ...config,
      activeLayout: newLayout,
    });
  }, [appName, config, setConfig]);

  if (!config.activeLayout) {
    return null;
  }

  const iconName =
    config.activeLayout === 'horizontal' ? 'up-down' : 'left-right';
  const layoutLabel =
    config.activeLayout === 'horizontal'
      ? codebridgeI18n.verticalLayout()
      : codebridgeI18n.defaultLayout();

  return (
    <PopUpButton
      iconName="ellipsis-v"
      alignment="right"
      disabled={isRunningOrValidating}
      ariaLabel={codebridgeI18n.consoleOptions()}
    >
      <div onClick={onLayoutChange} className={darkModeStyles.dropdownItem}>
        <FontAwesomeV6Icon iconName={iconName} iconStyle={'solid'} />
        <div>{layoutLabel}</div>
      </div>
    </PopUpButton>
  );
};

export default SwapLayoutDropdown;
