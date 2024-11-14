import React, {useCallback} from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import {TooltipProps, WithTooltip} from '@cdo/apps/componentLibrary/tooltip';
import VersionHistoryButton from '@cdo/apps/lab2/views/components/versionHistory/VersionHistoryButton';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import {useCodebridgeContext} from '../codebridgeContext';

import moduleStyles from './workspace.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

interface WorkspaceHeaderButtonProps {
  skipUrl: string | undefined;
}

const WorkspaceHeaderButtons: React.FunctionComponent<
  WorkspaceHeaderButtonProps
> = ({skipUrl}) => {
  const {startSource} = useCodebridgeContext();

  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const dialogControl = useDialogControl();

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
            window.location.href = skipUrl;
          }
        },
      });
    }
  }, [dialogControl, skipUrl]);

  return (
    <div className={moduleStyles.rightHeaderButtons}>
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
            className={darkModeStyles.iconOnlyTertiaryButton}
          />
        </WithTooltip>
      )}
      {appName === 'pythonlab' && skipUrl && (
        <Button
          iconRight={{iconStyle: 'solid', iconName: 'arrow-right'}}
          onClick={onClickSkip}
          size={'xs'}
          type={'tertiary'}
          color={buttonColors.white}
          text={commonI18n.skipToProject()}
          // className={darkModeStyles.iconOnlyTertiaryButton}
        >
          {commonI18n.skipToProject()}
        </Button>
      )}
    </div>
  );
};

export default WorkspaceHeaderButtons;
