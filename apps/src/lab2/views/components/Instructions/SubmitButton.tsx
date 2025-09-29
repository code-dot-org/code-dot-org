import {Button} from '@code-dot-org/component-library/button';
import React, {useMemo} from 'react';

import {sendSubmitReport} from '@cdo/apps/code-studio/progressRedux';
import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import WithConditionalTooltip from '@cdo/apps/codebridge/components/WithConditionalTooltip';
import lab2I18n from '@cdo/apps/lab2/locale';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {commonI18n} from '@cdo/apps/types/locale';
import {logUserLevelInteraction} from '@cdo/apps/userLevelInteractionsLogger/userLevelInteractionsApi';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {
  LevelStatus,
  UserLevelInteractions,
} from '@cdo/generated-scripts/sharedConstants';

import moduleStyles from '@cdo/apps/lab2/views/components/Instructions/instructions.module.scss';

interface SubmitButtonProps {
  levelId: number;
  appName: string;
  hasRun: boolean;
  hasEdited: boolean;
  disableEditRunForSubmission?: boolean;
  className?: string;
  requireRun?: boolean;
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
  requireRun = false,
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

  const tooltipMessage = useMemo(() => {
    if (!enabled) {
      if (requireRun || !hasRun) {
        return lab2I18n.toSubmitEditRun();
      } else {
        return lab2I18n.toSubmitEdit();
      }
    }
    return undefined;
  }, [enabled, hasRun, requireRun]);

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
