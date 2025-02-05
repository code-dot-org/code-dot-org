import {Button, buttonColors} from '@code-dot-org/component-library/button';
import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import React, {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import VersionHistoryButton from '@cdo/apps/lab2/views/components/versionHistory/VersionHistoryButton';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {sendPythonCodeToMicroBit} from '@cdo/apps/maker/boards/microBit/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import {useCodebridgeContext} from '../codebridgeContext';

import moduleStyles from './workspace.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

const WorkspaceHeaderButtons: React.FunctionComponent = () => {
  const {startSources} = useCodebridgeContext();

  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const enableMicroBit = useAppSelector(
    state => state.lab.levelProperties?.enableMicroBit || false
  );
  const skipUrl = useAppSelector(state => state.lab.levelProperties?.skipUrl);
  const dialogControl = useDialogControl();
  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source
  ) as MultiFileSource | undefined;
  const files = source?.files || {};

  const feedbackTooltipProps: TooltipProps = {
    text: commonI18n.feedback(),
    direction: 'onLeft',
    tooltipId: 'feedback-tooltip',
    size: 'xs',
    className: darkModeStyles.tooltipLeft,
  };

  const openFeedbackForm = () => {
    window.open('https://forms.gle/Z4FsGMFzE4NrFp369', '_blank');
  };

  const onClickSkip = useCallback(() => {
    if (dialogControl) {
      dialogControl.showDialog({
        type: DialogType.Skip,
        handleConfirm: () => {
          if (skipUrl) {
            sendCodebridgeAnalyticsEvent(EVENTS.SKIP_TO_PROJECT, appName, {
              levelPath: window.location.pathname,
            });
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
      {enableMicroBit && (
        <Button
          iconRight={{iconStyle: 'solid', iconName: 'arrow-right-from-arc'}}
          onClick={onClickFlash}
          size={'xs'}
          type={'tertiary'}
          color={buttonColors.white}
          text={codebridgeI18n.sendToMicroBit()}
          className={darkModeStyles.tertiaryButton}
        />
      )}
      <VersionHistoryButton startSources={startSources} />
      {appName === 'pythonlab' && (
        <WithTooltip tooltipProps={feedbackTooltipProps}>
          <Button
            isIconOnly
            icon={{iconStyle: 'solid', iconName: 'commenting'}}
            color={'white'}
            onClick={openFeedbackForm}
            ariaLabel={commonI18n.feedback()}
            size={'xs'}
            type={'tertiary'}
            className={darkModeStyles.tertiaryButton}
          />
        </WithTooltip>
      )}
      {skipUrl && (
        <Button
          iconRight={{iconStyle: 'solid', iconName: 'arrow-right'}}
          onClick={onClickSkip}
          size={'xs'}
          type={'tertiary'}
          color={buttonColors.white}
          text={commonI18n.skipToProject()}
          className={darkModeStyles.tertiaryButton}
        >
          {commonI18n.skipToProject()}
        </Button>
      )}
    </div>
  );
};

export default WorkspaceHeaderButtons;
