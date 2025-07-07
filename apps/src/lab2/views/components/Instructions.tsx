import {useTheme} from '@code-dot-org/component-library/common/contexts';
import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';

import {nextLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {
  isPredictAnswerLocked,
  isPredictResponseSubmitted,
  setPredictResponse,
} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import InstructionsPanel from './InstructionsPanel';

interface InstructionsProps {
  /** Whether the lab is currently running (different labs may define this differently). */
  isRunning: boolean;
  /** Whether the lab's code has been executed/run on this level. */
  hasRun: boolean;
  /** Whether the lab's code has been edited on this level. */
  hasEdited: boolean;
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
  hasRun,
  hasEdited,
  layout,
  handleInstructionsTextClick,
  className,
  manageNavigation = true,
  bottomComponent,
}) => {
  const levelProperties = useAppSelector(state => state.lab.levelProperties);
  const hasNextLevel = useSelector(state => nextLevelId(state) !== undefined);
  const message = useAppSelector(state => state.lab.validationState.message);
  const messageIndex = useAppSelector(state => state.lab.validationState.index);
  const passingValidation = useAppSelector(
    state =>
      !state.lab.validationState.hasConditions ||
      state.lab.validationState.satisfied
  );
  const predictSettings = useAppSelector(
    state => state.lab.levelProperties?.predictSettings
  );
  const predictResponse = useAppSelector(state => state.predictLevel.response);
  const predictResponseSubmitted = useAppSelector(isPredictResponseSubmitted);
  const predictAnswerLocked = useAppSelector(isPredictAnswerLocked);

  const offerBrowserTts =
    useAppSelector(state => state.lab.levelProperties?.offerBrowserTts) ||
    queryParams('show-tts') === 'true';

  const useSecondaryFinishButton =
    useAppSelector(
      state => state.lab.levelProperties?.useSecondaryFinishButton
    ) || queryParams('use-secondary-finish-button') === 'true';

  const dispatch = useAppDispatch();

  const setPredictResponseCallback = useCallback(
    (response: string) => {
      dispatch(setPredictResponse(response));
    },
    [dispatch]
  );

  const {theme} = useTheme();

  // Don't render anything if we don't have any instructions.
  if (
    levelProperties === undefined ||
    levelProperties.longInstructions === undefined
  ) {
    return null;
  }

  const canShowNextButton =
    manageNavigation &&
    passingValidation &&
    (!predictSettings?.isPredictLevel || predictResponseSubmitted);

  return (
    <InstructionsPanel
      text={levelProperties.longInstructions}
      message={message || undefined}
      messageIndex={messageIndex}
      theme={theme}
      predictSettings={predictSettings}
      predictResponse={predictResponse}
      setPredictResponse={setPredictResponseCallback}
      predictAnswerLocked={predictAnswerLocked}
      layout={layout}
      handleInstructionsTextClick={handleInstructionsTextClick}
      offerBrowserTts={offerBrowserTts}
      className={className}
      canShowNextButton={canShowNextButton}
      hasNextLevel={hasNextLevel}
      useSecondaryFinishButton={useSecondaryFinishButton}
      bottomComponent={bottomComponent}
      isRunning={isRunning}
      levelProperties={levelProperties}
      hasRun={hasRun}
      hasEdited={hasEdited}
    />
  );
};
export default Instructions;
