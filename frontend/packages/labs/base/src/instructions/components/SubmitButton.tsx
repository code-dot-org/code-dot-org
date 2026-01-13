import type {FunctionComponent} from 'react';

import {Button} from '@code-dot-org/component-library/button';
import {LevelStatus} from '@code-dot-org/progress';
import {progressActions} from '@code-dot-org/progress/redux';

// TODO: add user level interaction back in
//import {logUserLevelInteraction} from '@cdo/apps/userLevelInteractionsLogger/userLevelInteractionsApi';

import {useDialogControl} from '../../contexts';
import {DialogType} from '../../dialogs';
import continueOrFinishLesson from '../../progress/continueOrFinishLesson';
import {useAppSelector, useAppDispatch} from '../../redux/store';

import WithConditionalTooltip from './WithConditionalTooltip';

import moduleStyles from './instructions.module.scss';

const {sendSubmitReport, getCurrentLevel} = progressActions;

interface SubmitButtonProps {
  levelId: number;
  appName: string;
  className?: string;
  enabled: boolean;
  tooltipMessage?: string;
}

/**
 * Displays the "Submit" or "Unsubmit" button that submits or unsubmits the project on a submittable level.
 * This button is always displayed, but is disabled if the user has not met the conditions for submission.
 */
const SubmitButton: FunctionComponent<SubmitButtonProps> = ({
  //levelId,
  appName,
  className,
  enabled,
  tooltipMessage,
}) => {
  const hasSubmitted = useAppSelector(
    state => getCurrentLevel(state)?.status === LevelStatus.submitted,
  );
  //const scriptId = useAppSelector(
  //  state => state.progress.scriptId || undefined
  //);
  const buttonText = hasSubmitted ? 'Unsubmit' : 'Submit';

  const dialogControl = useDialogControl();
  const dispatch = useAppDispatch();

  const handleSubmit = async () => {
    // We either submit or unsubmit the project, depending on the current state.
    const submit = !hasSubmitted;
    await dispatch(
      sendSubmitReport({appType: appName || '', submitted: submit}),
    );
    // If we just submitted, continue or finish the lesson.
    if (submit) {
      // TODO: add user level interaction back in
      /*logUserLevelInteraction({
        levelId: levelId,
        scriptId: scriptId,
        interaction: UserLevelInteractions.click_submit,
      });*/
      dispatch(continueOrFinishLesson());
    }
  };

  const onSubmit = () => {
    const dialogTitle = hasSubmitted
      ? 'Unsubmit your project'
      : 'Submit your project';
    const dialogMessage = hasSubmitted
      ? 'Unsubmitting your project will reset the submitted date. Are you sure you want to unsubmit?'
      : 'You cannot edit your project after submitting. Are you sure you want to submit?';
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
          text: tooltipMessage,
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
