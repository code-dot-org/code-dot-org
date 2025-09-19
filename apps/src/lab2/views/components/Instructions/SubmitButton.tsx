import {Button} from '@code-dot-org/component-library/button';
import {
  useDialogControl,
  DialogType,
} from '@code-dot-org/component-library/dialog';
import React from 'react';

import WithConditionalTooltip from '@cdo/apps/codebridge/components/WithConditionalTooltip';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {getCurrentLevel} from '@cdo/apps/lab2/progress/getCurrentLevel';
import {LevelStatus} from '@cdo/apps/lab2/progress/LevelStatus';
import {logUserLevelInteraction} from '@cdo/apps/lab2/progress/logUserLevelInteraction';
import {sendSubmitReport} from '@cdo/apps/lab2/progress/sendSubmitReport';
import {UserLevelInteractions} from '@cdo/apps/lab2/progress/UserLevelInteractions';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';

import moduleStyles from '@cdo/apps/lab2/views/components/Instructions/Instructions.module.scss';

interface SubmitButtonProps {
  levelId: number;
  appName: string;
  hasRun: boolean;
  hasEdited: boolean;
  disableEditRunForSubmission?: boolean;
  className?: string;
  tooltipMessage?: string;
}

/**
 * Displays the "Submit" or "Unsubmit" button that submits or unsubmits the project on a submittable level.
 * This button is always displayed, but is disabled if the user has not met the conditions for submission.
 */
export const SubmitButton: React.FC<SubmitButtonProps> = ({
  levelId,
  appName,
  hasRun,
  hasEdited,
  disableEditRunForSubmission = false,
  className,
  tooltipMessage,
}) => {
  const hasSubmitted = useAppSelector(
    state => getCurrentLevel(state)?.status === LevelStatus.submitted
  );
  const scriptId = useAppSelector(
    state => state.progress.scriptId || undefined
  );

  const enabled =
    disableEditRunForSubmission || hasSubmitted || (hasRun && hasEdited);
  const buttonText = hasSubmitted ? commonI18n.unsubmit() : commonI18n.submit();

  const dialogControl = useDialogControl();
  const dispatch = useAppDispatch();

  const handleSubmit = async () => {
    // We either submit or unsubmit the project, depending on the current state.
    const submit = !hasSubmitted;
    await dispatch(
      sendSubmitReport({appType: appName || '', submitted: submit})
    );
    // If we just submitted, continue or finish the lesson.
    if (submit) {
      logUserLevelInteraction({
        levelId: levelId,
        scriptId: scriptId,
        interaction: UserLevelInteractions.click_submit,
      });
      dispatch(continueOrFinishLesson());
    }
  };

  const onSubmit = () => {
    const dialogTitle = hasSubmitted
      ? commonI18n.unsubmitYourProject()
      : commonI18n.submitYourProject();
    const dialogMessage = hasSubmitted
      ? commonI18n.unsubmitYourProjectConfirm()
      : commonI18n.submitYourProjectConfirm();
    dialogControl?.showDialog({
      type: DialogType.GenericConfirmation,
      handleConfirm: handleSubmit,
      title: dialogTitle,
      message: dialogMessage,
    });
  };

  return (
    <div className={moduleStyles.buttonInstructionTooltipOverlay}>
      <WithConditionalTooltip
        showTooltip={!enabled && !!tooltipMessage}
        tooltipProps={{
          text: tooltipMessage || '',
          direction: 'onTop',
          tooltipId: 'submit-button-tooltip',
          size: 'xs',
        }}
      >
        <Button
          id="instructions-submit-button"
          text={buttonText}
          onClick={onSubmit}
          className={className}
          disabled={!enabled}
        />
      </WithConditionalTooltip>
    </div>
  );
};

export default SubmitButton;
