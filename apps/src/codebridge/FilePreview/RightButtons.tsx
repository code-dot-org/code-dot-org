import Button from '@code-dot-org/component-library/button';
import {setWidgetViewShowCode} from '@codebridge/redux/workspaceRedux';
import React from 'react';

import SettingsButton from '@cdo/apps/lab2/views/components/Settings/SettingsButton';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import {useCodebridgeContext} from '../codebridgeContext';
import {useCodebridgeSettings} from '../hooks/useCodebridgeSettings';

import moduleStyles from './styles/right-buttons.module.scss';

const RightButtons: React.FunctionComponent = () => {
  const {levelProperties} = useCodebridgeContext();
  const isWidgetView = levelProperties.widgetView;
  const widgetViewAllowShowCode = levelProperties.widgetViewAllowShowCode;
  const dispatch = useAppDispatch();
  const widgetViewShowCode = useAppSelector(
    state => state.codebridgeWorkspace.widgetViewShowCode
  );
  const settings = useCodebridgeSettings();

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
      {isWidgetView && !widgetViewShowCode && (
        <SettingsButton settings={settings} />
      )}
    </div>
  );
};

export default RightButtons;
