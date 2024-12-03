import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import {DAPLink, WebUSB} from 'dapjs';
import React, {useCallback} from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import {TooltipProps, WithTooltip} from '@cdo/apps/componentLibrary/tooltip';
import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import VersionHistoryButton from '@cdo/apps/lab2/views/components/versionHistory/VersionHistoryButton';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {
  MICROBIT_VENDOR_ID,
  MICROBIT_PRODUCT_ID,
} from '@cdo/apps/maker/boards/microBit/MicroBitConstants';
import {
  detectMicroBitVersion,
  getModifiedMicroPythonHexFile,
} from '@cdo/apps/maker/boards/microBit/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {PythonlabLevelProperties} from '@cdo/apps/pythonlab/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import {useCodebridgeContext} from '../codebridgeContext';

import moduleStyles from './workspace.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

const WorkspaceHeaderButtons: React.FunctionComponent = () => {
  const {startSource} = useCodebridgeContext();

  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const enableMicroBit = useAppSelector(
    state =>
      (state.lab.levelProperties as PythonlabLevelProperties | undefined)
        ?.enableMicroBit || false
  );
  const skipUrl = useAppSelector(state => state.lab.levelProperties?.skipUrl);
  const dialogControl = useDialogControl();
  const source = useAppSelector(
    state => state.lab2Project.projectSource?.source
  ) as MultiFileSource | undefined;
  const files = source?.files || {};
  let pythonCode = '';
  for (const file of Object.values(files as object)) {
    if (file.name === MAIN_PYTHON_FILE) {
      pythonCode = file.contents;
    }
  }

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
    console.log('Flash file onto micro:bit');
    if (pythonCode.trim().length === 0) {
      console.log(
        'There is no python code from main.py to send to the micro:bit'
      );
      return;
    }
    const device = await navigator.usb.requestDevice({
      filters: [{vendorId: MICROBIT_VENDOR_ID, productId: MICROBIT_PRODUCT_ID}],
    });
    const microBitVersion = detectMicroBitVersion(device);
    if (!microBitVersion) {
      throw new Error('micro:bit version not detected correctly.');
    }

    const transport = new WebUSB(device);
    const target = new DAPLink(transport);
    // For now, log progress in dev console.
    target.on(DAPLink.EVENT_PROGRESS, progress => {
      if (Math.floor(progress * 100) % 10 === 0) {
        console.log('progress percent', Math.floor(progress * 100));
      }
      if (progress === 1) {
        console.log('FLASH COMPLETE');
      }
    });
    const hexStrWithFiles = await getModifiedMicroPythonHexFile(
      pythonCode,
      microBitVersion
    );
    // Intel Hex is currently in ASCII, do a 1-to-1 conversion from chars to bytes
    const hexAsBytes = new TextEncoder().encode(hexStrWithFiles);
    try {
      // Push binary to board
      await target.connect();
      await target.flash(hexAsBytes);
      await target.disconnect();
    } catch (error) {
      console.log(error);
      return Promise.reject('Failed to send MicroPython program to micro:bit.');
    }
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
          text={'Send to micro:bit'}
          className={darkModeStyles.tertiaryButton}
        />
      )}
      <VersionHistoryButton startSource={startSource} />
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
