import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import React, {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './swap-layout-dropdown.module.scss';

/*
  Please note - this is a fairly brittle component in that it's only allowing toggling between
  horizontal and vertical layouts. That's...kinda fine? For now? Probably?

  At some point in the future, we may need to expand the functionality to select between arbitrary
  layouts which are available - we'll probably want to iterate through the keys of the labeledGridLayouts
  and have each of them provide an icon (to add to the button) and a nextState (to show which layout to toggle to)
  or alternatively, maybe this whole component should become a pop up list to let the user select it? Maybe this one
  stays around as the easy way to flip between just horizontal and vertical?

  Anyway, again, it's fine as is, but will require refactoring if we expand use cases.
*/

const SwapLayoutDropdown: React.FunctionComponent = () => {
  const {config, setConfig} = useCodebridgeContext();
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);

  const onLayoutChange = useCallback(() => {
    const newLayout =
      config.activeGridLayout === 'horizontal' ? 'vertical' : 'horizontal';
    sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_MOVE_CONSOLE, appName, {
      positionMovedTo: newLayout,
    });
    setConfig({
      ...config,
      activeGridLayout: newLayout,
    });
  }, [appName, config, setConfig]);

  if (!config.activeGridLayout || !config.labeledGridLayouts) {
    return null;
  }

  const iconName =
    config.activeGridLayout === 'horizontal' ? 'up-down' : 'left-right';
  const layoutLabel =
    config.activeGridLayout === 'horizontal'
      ? codebridgeI18n.verticalLayout()
      : codebridgeI18n.defaultLayout();

  return (
    <PopUpButton iconName="ellipsis-v" alignment="right">
      <div onClick={onLayoutChange} className={moduleStyles.layoutItem}>
        <FontAwesomeV6Icon iconName={iconName} iconStyle={'solid'} />
        <div>{layoutLabel}</div>
      </div>
    </PopUpButton>
  );
};

export default SwapLayoutDropdown;
