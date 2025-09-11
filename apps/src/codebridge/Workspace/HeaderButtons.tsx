import {Button, LinkButton} from '@code-dot-org/component-library/button';
import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import React, {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {isUsingResourcePanel} from '@cdo/apps/lab2/utils';
import SettingsButton from '@cdo/apps/lab2/views/components/Settings/SettingsButton';
import VersionHistoryButton from '@cdo/apps/lab2/views/components/versionHistory/VersionHistoryButton';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {sendPythonCodeToMicroBit} from '@cdo/apps/maker/boards/microBit/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {currentLocation} from '@cdo/apps/utils';
import commonI18n from '@cdo/locale';

import {useCodebridgeContext} from '../codebridgeContext';
import {useCodebridgeSettings} from '../hooks/useCodebridgeSettings';

import moduleStyles from './workspace.module.scss';

const WorkspaceHeaderButtons: React.FunctionComponent = () => {
  const {startSources, levelProperties, projectPickerSettings} =
    useCodebridgeContext();
  const {appName, enableMicroBit, skipUrl} = levelProperties;
  const isWidgetView = levelProperties.widgetView;
  const settings = useCodebridgeSettings();
  const dialogControl = useDialogControl();
  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source
  ) as MultiFileSource | undefined;
  const files = source?.files || {};
  // The resource panel includes settings.
  const showSettingsAndVersionHistory = !isUsingResourcePanel(
    appName,
    levelProperties.isProjectLevel || false
  );

  const documentationTooltipProps: TooltipProps = {
    text: commonI18n.documentation(),
    direction: 'onBottom',
    tooltipId: 'documentation-tooltip',
    size: 'xs',
    hideTail: true,
  };

  const documentationUrl = `${currentLocation().origin}/docs/ide/${appName}`;

  const onClickSkip = useCallback(() => {
    if (dialogControl) {
      dialogControl.showDialog({
        type: DialogType.Skip,
        handleConfirm: () => {
          if (skipUrl) {
            sendCodebridgeAnalyticsEvent(EVENTS.SKIP_TO_PROJECT, appName);
            window.location.href = skipUrl;
          }
        },
      });
    }
  }, [appName, dialogControl, skipUrl]);

  const onClickFlash = async () => {
    let pythonCode = '';
    for (const file of Object.values(files as object)) {
      if (file.name === MAIN_PYTHON_FILE) {
        pythonCode = file.contents;
      }
    }
    if (pythonCode.trim().length === 0) {
      console.log(
        'There is no python code from main.py to send to the micro:bit.'
      );
      return;
    }
    console.log('Flash file onto micro:bit');
    sendPythonCodeToMicroBit(pythonCode);
  };

  return (
    <div className={moduleStyles.rightHeaderButtons}>
      {projectPickerSettings && (
        <Button
          iconRight={{iconName: 'rotate'}}
          size={'xs'}
          text={projectPickerSettings.currentType}
          onClick={projectPickerSettings.showProjectTypePicker}
          type={'primary'}
          aria-label={codebridgeI18n.projectPickerAriaLabel()}
          color={'black'}
        />
      )}
      {showSettingsAndVersionHistory && <SettingsButton settings={settings} />}
      {enableMicroBit && (
        <Button
          iconRight={{iconStyle: 'solid', iconName: 'arrow-right-from-arc'}}
          onClick={onClickFlash}
          size={'xs'}
          type={'tertiary'}
          text={codebridgeI18n.sendToMicroBit()}
          color={'black'}
        />
      )}
      {!isWidgetView && showSettingsAndVersionHistory && (
        <VersionHistoryButton startSources={startSources} appName={appName} />
      )}
      {/* For now, only python lab supports documentation */}
      {appName === 'pythonlab' && (
        <WithTooltip tooltipProps={documentationTooltipProps}>
          <LinkButton
            isIconOnly
            icon={{iconStyle: 'solid', iconName: 'book'}}
            href={documentationUrl}
            size={'xs'}
            type={'tertiary'}
            target="_blank"
            color={'black'}
            aria-label={commonI18n.documentation()}
          />
        </WithTooltip>
      )}
      {skipUrl && (
        <Button
          iconRight={{iconStyle: 'solid', iconName: 'arrow-right'}}
          onClick={onClickSkip}
          size={'xs'}
          type={'tertiary'}
          text={commonI18n.skipToProject()}
          className={moduleStyles.buttonSkip}
          color={'black'}
        >
          <span>{commonI18n.skipToProject()}</span>
        </Button>
      )}
    </div>
  );
};

export default WorkspaceHeaderButtons;
