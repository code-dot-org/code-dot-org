import {Button} from '@code-dot-org/component-library/button';
import {ComponentSizeXSToL} from '@code-dot-org/component-library/common/types';
import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useMemo} from 'react';

import {sendSubmitReport} from '@cdo/apps/code-studio/progressRedux';
import {
  getCurrentLevel,
  nextLevelId,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {queryParams} from '@cdo/apps/code-studio/utils';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {isPredictResponseSubmitted} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {DialogType, useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import {commonI18n} from '@cdo/apps/types/locale';
import {logUserLevelInteraction} from '@cdo/apps/userLevelInteractionsLogger/userLevelInteractionsApi';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {
  LevelStatus,
  UserLevelInteractions,
} from '@cdo/generated-scripts/sharedConstants';

interface NavigationButtonProps {
  levelProperties: LevelProperties;
  hasRun: boolean;
  hasEdited: boolean;
  className?: string;
  size?: ComponentSizeXSToL;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  levelProperties,
  hasRun,
  hasEdited,
  className,
  size,
}) => {
  const {predictSettings, submittable} = levelProperties;
  const hasSubmittedPredictResponse = useAppSelector(
    isPredictResponseSubmitted
  );
  const hasConditions = useAppSelector(
    state => state.lab.validationState.hasConditions
  );
  const validationSatisfied = useAppSelector(
    state => state.lab.validationState.satisfied
  );
  const hasSubmitted = useAppSelector(
    state => getCurrentLevel(state)?.status === LevelStatus.submitted
  );
  const canShow = useMemo(() => {
    if (predictSettings?.isPredictLevel) {
      return hasSubmittedPredictResponse;
    } else if (submittable && hasSubmitted) {
      return true;
    } else if (hasConditions) {
      return validationSatisfied;
    } else {
      return true;
    }
  }, [
    hasConditions,
    predictSettings?.isPredictLevel,
    hasSubmittedPredictResponse,
    validationSatisfied,
    submittable,
    hasSubmitted,
  ]);

  if (!canShow) {
    return null;
  }

  if (levelProperties.submittable) {
    return (
      <SubmitButton
        levelId={levelProperties.id}
        appName={levelProperties.appName}
        disableEditRunForSubmission={
          levelProperties.disableEditRunForSubmission
        }
        hasRun={hasRun}
        hasEdited={hasEdited}
        className={className}
      />
    );
  }

  return <ContinueButton className={className} size={size} />;
};

interface ContinueButtonProps {
  className?: string;
  size?: ComponentSizeXSToL;
}

/**
 * Displays the "Continue" or "Finish" button that advances to the next level or finishes the progression.
 */
const ContinueButton: React.FC<ContinueButtonProps> = ({className, size}) => {
  const dispatch = useAppDispatch();
  const hasNextLevel = useAppSelector(
    state => nextLevelId(state) !== undefined
  );
  const useSecondaryFinishButton =
    useAppSelector(
      state => state.lab.levelProperties?.useSecondaryFinishButton
    ) || queryParams('use-secondary-finish-button') === 'true';

  const text = hasNextLevel ? commonI18n.continue() : commonI18n.finish();

  const [type, color] =
    useSecondaryFinishButton && !hasNextLevel
      ? (['secondary', 'black'] as const)
      : (['primary', 'purple'] as const);

  const iconRight: FontAwesomeV6IconProps | undefined = hasNextLevel
    ? {iconName: 'arrow-right', iconStyle: 'solid'}
    : undefined;

  return (
    <Button
      id="instructions-continue-button"
      {...{className, size, text, type, color}}
      onClick={() => dispatch(continueOrFinishLesson())}
      iconRight={iconRight}
    />
  );
};

interface SubmitButtonProps {
  levelId: number;
  appName: string;
  hasRun: boolean;
  hasEdited: boolean;
  disableEditRunForSubmission?: boolean;
  className?: string;
}

/**
 * Displays the "Submit" or "Unsubmit" button that submits or unsubmits the project on a submittable level.
 */
export const SubmitButton: React.FC<SubmitButtonProps> = ({
  levelId,
  appName,
  hasRun,
  hasEdited,
  disableEditRunForSubmission = false,
  className,
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
    <Button
      id="instructions-submit-button"
      text={buttonText}
      onClick={onSubmit}
      className={className}
      disabled={!enabled}
    />
  );
};

export default NavigationButton;
