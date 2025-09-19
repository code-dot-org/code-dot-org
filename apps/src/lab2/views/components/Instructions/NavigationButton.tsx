import {Button} from '@code-dot-org/component-library/button';
import {ComponentSizeXSToL} from '@code-dot-org/component-library/common/types';
import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useMemo} from 'react';

import {
  getCurrentLevel,
  nextLevelId,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {queryParams} from '@cdo/apps/code-studio/utils';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {isPredictResponseSubmitted} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import SubmitButton from './SubmitButton';
interface NavigationButtonProps {
  levelProperties: LevelProperties;
  hasRun: boolean;
  hasEdited: boolean;
  className?: string;
  size?: ComponentSizeXSToL;
}

// Currently, NavigationButton is only in Instructions.tsx by Music Lab.
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

export default NavigationButton;
