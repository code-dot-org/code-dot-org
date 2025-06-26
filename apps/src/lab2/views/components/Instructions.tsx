import {useTheme} from '@code-dot-org/component-library/common/contexts';
import React from 'react';
import {useSelector} from 'react-redux';

import {nextLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {queryParams} from '@cdo/apps/code-studio/utils';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {
  isPredictAnswerLocked,
  setPredictResponse,
} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import InstructionsPanel from './InstructionsPanel';

interface InstructionsProps {
  /** Whether the lab is currently running (different labs may define this differently). */
  isRunning: boolean;
  /** If the instructions panel should be rendered vertically or horizontally. Defaults to vertical. */
  layout?: 'vertical' | 'horizontal';
  /**
   * A callback when the user clicks on clickable text.
   */
  handleInstructionsTextClick?: (id: string) => void;
  /** Whether the instructions panel should show lesson navigation buttons (Continue & Finish) */
  manageNavigation?: boolean;
  /** Optional classname for the container */
  className?: string;
  /** Optional component to render at the bottom of the main instructions. */
  bottomComponent?: React.ReactNode;
}

/**
 * Lab2 instructions component. This can be used by any Lab2 lab, and will retrieve
 * all necessary data from the Lab2 redux store.
 *
 * Note that currently, this component solely renders instructions, and does not include any features
 * present on the legacy instructions panel, such as Help & Tips, Documentation, Code Review,
 * For Teachers Only, etc.
 */
const Instructions: React.FunctionComponent<InstructionsProps> = ({
  isRunning,
  layout,
  handleInstructionsTextClick,
  className,
  manageNavigation = true,
  bottomComponent,
}) => {
  const instructionsText = useAppSelector(
    state => state.lab.levelProperties?.longInstructions
  );
  const hasNextLevel = useSelector(state => nextLevelId(state) !== undefined);
  const {hasConditions, message, satisfied, index} = useAppSelector(
    state => state.lab.validationState
  );
  const predictSettings = useAppSelector(
    state => state.lab.levelProperties?.predictSettings
  );
  const predictResponse = useAppSelector(state => state.predictLevel.response);
  const predictAnswerLocked = useAppSelector(isPredictAnswerLocked);

  const offerBrowserTts =
    useAppSelector(state => state.lab.levelProperties?.offerBrowserTts) ||
    queryParams('show-tts') === 'true';

  const useSecondaryFinishButton =
    useAppSelector(
      state => state.lab.levelProperties?.useSecondaryFinishButton
    ) || queryParams('use-secondary-finish-button') === 'true';

  const dispatch = useAppDispatch();

  const {theme} = useTheme();

  // Don't render anything if we don't have any instructions.
  if (instructionsText === undefined) {
    return null;
  }

  const canShowNextButton =
    manageNavigation &&
    (!hasConditions || satisfied) &&
    (!predictSettings?.isPredictLevel || predictAnswerLocked);

  return (
    <InstructionsPanel
      text={instructionsText}
      message={message || undefined}
      messageIndex={index}
      theme={theme}
      predictSettings={predictSettings}
      predictResponse={predictResponse}
      setPredictResponse={response => dispatch(setPredictResponse(response))}
      predictAnswerLocked={predictAnswerLocked}
      layout={layout}
      handleInstructionsTextClick={handleInstructionsTextClick}
      offerBrowserTts={offerBrowserTts}
      className={className}
      canShowNextButton={canShowNextButton}
      hasNextLevel={hasNextLevel}
      useSecondaryFinishButton={useSecondaryFinishButton}
      onContinueOrFinish={() => dispatch(continueOrFinishLesson())}
      bottomComponent={bottomComponent}
      isRunning={isRunning}
    />
  );
};
export default Instructions;
