import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils/analyticsReporterHelper';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {sendPythonCodeToMicroBit} from '@cdo/apps/maker/boards/microBit/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import {useCodebridgeContext} from '../codebridgeContext';

import moduleStyles from './workspace.module.scss';

const WorkspaceHeaderButtons: React.FunctionComponent = () => {
  const {levelProperties, projectPickerSettings} = useCodebridgeContext();
  const {enableMicroBit, skipUrl} = levelProperties;

  const dialogControl = useDialogControl();
  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source
  ) as MultiFileSource | undefined;
  const files = source?.files || {};

  const onClickSkip = useCallback(() => {
    if (dialogControl) {
      dialogControl.showDialog({
        type: DialogType.Skip,
        handleConfirm: () => {
          if (skipUrl) {
            sendLab2AnalyticsEvent(EVENTS.SKIP_TO_PROJECT);
            window.location.href = skipUrl;
          }
        },
      });
    }
  }, [dialogControl, skipUrl]);

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
        <MuiButton
          variant="contained"
          color="secondary"
          size="extraSmall"
          onClick={projectPickerSettings.showProjectTypePicker}
          aria-label={codebridgeI18n.projectPickerAriaLabel()}
          type="button"
          endIcon={<FontAwesomeV6Icon iconName="rotate" />}
        >
          {projectPickerSettings.currentType}
        </MuiButton>
      )}
      {enableMicroBit && (
        <MuiButton
          variant="text"
          color="secondary"
          size="extraSmall"
          onClick={onClickFlash}
          type="button"
          endIcon={
            <FontAwesomeV6Icon
              iconStyle="solid"
              iconName="arrow-right-from-arc"
            />
          }
        >
          {codebridgeI18n.sendToMicroBit()}
        </MuiButton>
      )}
      {skipUrl && (
        <MuiButton
          variant="text"
          color="secondary"
          size="extraSmall"
          className={moduleStyles.buttonSkip}
          onClick={onClickSkip}
          type="button"
          endIcon={
            <FontAwesomeV6Icon iconStyle="solid" iconName="arrow-right" />
          }
        >
          {commonI18n.skipToProject()}
        </MuiButton>
      )}
    </div>
  );
};

export default WorkspaceHeaderButtons;
