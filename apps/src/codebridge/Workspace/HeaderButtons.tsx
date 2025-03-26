import {Button, buttonColors} from '@code-dot-org/component-library/button';
import {
  TooltipProps,
  WithTooltip,
} from '@code-dot-org/component-library/tooltip';
import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import classNames from 'classnames';
import React, {useCallback} from 'react';

import {DEFAULT_FONT_SIZE_KEY, FontSize} from '@cdo/apps/codebridge/constants';
import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {setEditorFontSize} from '@cdo/apps/codebridge/redux/workspaceRedux';
import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import VersionHistoryButton from '@cdo/apps/lab2/views/components/versionHistory/VersionHistoryButton';
import {
  useDialogControl,
  DialogType,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {GenericDropdownProps} from '@cdo/apps/lab2/views/dialogs/GenericDropdown';
import {sendPythonCodeToMicroBit} from '@cdo/apps/maker/boards/microBit/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {trySetSessionStorage} from '@cdo/apps/utils';
import commonI18n from '@cdo/locale';

import {useCodebridgeContext} from '../codebridgeContext';

import moduleStyles from './workspace.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

// fontSizeOptions contains a list of value/text from the FontSize enum,
// e.g., [{value: 'Tiny', text: 'Tiny'}, {value: 'Small', text: 'Small'}, ...]
const fontSizeOptions: GenericDropdownProps['items'] = Object.keys(FontSize)
  .filter(key => isNaN(Number(key))) // Filters out the reverse enum keys.
  .map(key => ({
    value: key,
    text: key,
  }));

const WorkspaceHeaderButtons: React.FunctionComponent = () => {
  const {startSources, levelProperties} = useCodebridgeContext();
  const {appName, enableMicroBit, skipUrl} = levelProperties;
  const editorFontSizeKey = useAppSelector(
    state => state.codebridgeWorkspace.editorFontSizeKey
  );
  console.log('editorFontSizeKey', editorFontSizeKey);
  const selectedFontSizeKey = editorFontSizeKey || DEFAULT_FONT_SIZE_KEY;

  const dialogControl = useDialogControl();
  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source
  ) as MultiFileSource | undefined;
  const files = source?.files || {};
  const dispatch = useAppDispatch();

  const feedbackTooltipProps: TooltipProps = {
    text: commonI18n.feedback(),
    direction: 'onLeft',
    tooltipId: 'feedback-tooltip',
    size: 'xs',
    className: darkModeStyles.tooltipLeft,
  };

  const settingsTooltipProps: TooltipProps = {
    text: commonI18n.settings(),
    direction: 'onLeft',
    tooltipId: 'settings-tooltip',
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

  const onClickSettings = async () => {
    const results = await dialogControl?.showDialog({
      type: DialogType.GenericDropdown,
      title: 'Settings',
      message: 'Customize your text editor font size',
      selectedValue: selectedFontSizeKey,
      items: fontSizeOptions,
      dropdownLabel: '',
    });
    const selectedKey = extractUserInput(results) as keyof typeof FontSize;
    if (selectedKey && FontSize[selectedKey]) {
      const sessionStorageKey = `${levelProperties.appName}CodeEditorFontSizeKey`;
      trySetSessionStorage(sessionStorageKey, selectedKey);
      dispatch(setEditorFontSize(selectedKey));
    }
  };

  return (
    <div className={moduleStyles.rightHeaderButtons}>
      <WithTooltip tooltipProps={settingsTooltipProps}>
        <Button
          isIconOnly
          icon={{iconStyle: 'solid', iconName: 'gear'}}
          onClick={onClickSettings}
          size={'xs'}
          type={'tertiary'}
          color={buttonColors.white}
          className={darkModeStyles.tertiaryButton}
        />
      </WithTooltip>
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
      <VersionHistoryButton startSources={startSources} appName={appName} />
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
          className={classNames(
            darkModeStyles.tertiaryButton,
            moduleStyles.buttonSkip
          )}
        >
          <span>{commonI18n.skipToProject()}</span>
        </Button>
      )}
    </div>
  );
};

export default WorkspaceHeaderButtons;
