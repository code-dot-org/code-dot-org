import {ComponentSizeXSToL} from '@code-dot-org/component-library/common/types';
import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useMemo} from 'react';

import {
  getCurrentLevel,
  nextLevelId,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {isPredictResponseSubmitted} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import ContinueButton from './ContinueButton';
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

  return (
    <ContinueButton
      isDisabled={!canShow}
      type={type}
      color={color}
      iconRight={iconRight}
      text={text}
      className={className}
      size={size}
    />
  );
};

export default NavigationButton;
