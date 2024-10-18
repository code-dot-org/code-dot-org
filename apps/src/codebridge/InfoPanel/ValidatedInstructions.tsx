import classNames from 'classnames';
import React, {useContext, useEffect, useMemo, useRef} from 'react';
import {useSelector} from 'react-redux';

import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {sendSubmitReport} from '@cdo/apps/code-studio/progressRedux';
import {
  getCurrentLevel,
  nextLevelId,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {Button} from '@cdo/apps/componentLibrary/button';
import {FontAwesomeV6IconProps} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {
  isPredictAnswerLocked,
  setPredictResponse,
} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {setIsValidating} from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import PredictQuestion from '@cdo/apps/lab2/views/components/PredictQuestion';
import PredictSummary from '@cdo/apps/lab2/views/components/PredictSummary';
import {DialogType, useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import {ThemeContext} from '@cdo/apps/lab2/views/ThemeWrapper';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';
import commonI18n from '@cdo/locale';

import {useCodebridgeContext} from '../codebridgeContext';
import {appendSystemMessage} from '../redux/consoleRedux';
import {sendCodebridgeAnalyticsEvent} from '../utils/analyticsReporterHelper';

import ValidationResults from './ValidationResults';
import ValidationStatusIcon from './ValidationStatusIcon';

import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';
import moduleStyles from '@codebridge/InfoPanel/styles/validated-instructions.module.scss';

interface InstructionsProps {
  /** Additional callback to fire before navigating to the next level. */
  beforeNextLevel?: () => void;
  /** If the instructions panel should be rendered vertically or horizontally. Defaults to vertical. */
  layout?: 'vertical' | 'horizontal';
  /**
   * A callback when the user clicks on clickable text.
   */
  handleInstructionsTextClick?: (id: string) => void;
  /** Optional classname for the container */
  className?: string;
}

interface NavigationButtonProps {
  showNavigation: boolean;
  navigationText: string;
  handleNavigation: () => void;
  navigationIcon?: FontAwesomeV6IconProps;
}

/**
 * Instructions panel with built-in validation feedback.
 * This instructions panel shows the validation results for a level, if they exist,
 * and provides navigation once validation has passed.
 */
const ValidatedInstructions: React.FunctionComponent<InstructionsProps> = ({
  beforeNextLevel,
  layout = 'vertical',
  handleInstructionsTextClick,
  className,
}) => {
  const {onRun, onStop} = useCodebridgeContext();
  const dialogControl = useDialogControl();

  const instructionsText = useAppSelector(
    state => state.lab.levelProperties?.longInstructions
  );
  const hasNextLevel = useSelector(state => nextLevelId(state) !== undefined);
  const {hasConditions, validationResults, satisfied} = useAppSelector(
    state => state.lab.validationState
  );
  const predictSettings = useAppSelector(
    state => state.lab.levelProperties?.predictSettings
  );
  const predictResponse = useAppSelector(state => state.predictLevel.response);
  const predictAnswerLocked = useAppSelector(isPredictAnswerLocked);
  const hasRun = useAppSelector(state => state.lab2System.hasRun);
  const hasSubmitted = useAppSelector(
    state => getCurrentLevel(state)?.status === LevelStatus.submitted
  );
  const isSubmittable = useAppSelector(
    state => state.lab.levelProperties?.submittable
  );
  const source = useAppSelector(
    state => state.lab2Project.projectSource?.source
  ) as MultiFileSource | undefined;

  const appType = useAppSelector(state => state.lab.levelProperties?.appName);
  const isValidating = useAppSelector(state => state.lab2System.isValidating);
  const isLoadingEnvironment = useAppSelector(
    state => state.lab2System.loadingCodeEnvironment
  );
  const isRunning = useAppSelector(state => state.lab2System.isRunning);
  const shouldValidateBeDisabled = isLoadingEnvironment || isRunning;

  const currentLevel = useAppSelector(state => getCurrentLevel(state));
  const hasEdited = useAppSelector(state => state.lab2Project.hasEdited);

  // The icon in the validated instructions panel should match the icon in the
  // header.
  const passedStatuses = [
    LevelStatus.perfect,
    LevelStatus.submitted,
    LevelStatus.passed,
    LevelStatus.free_play_complete,
    LevelStatus.completed_assessment,
  ];
  const showPassedIcon =
    currentLevel && passedStatuses.includes(currentLevel.status);

  const dispatch = useAppDispatch();

  const {theme} = useContext(ThemeContext);

  const vertical = layout === 'vertical';

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

  const handleSubmit = async () => {
    // We either submit or unsubmit the project, depending on the current state.
    const submit = !hasSubmitted;
    await dispatch(
      sendSubmitReport({appType: appType || '', submitted: submit})
    );
    // If we just submitted, continue or finish the lesson.
    if (submit) {
      dispatch(continueOrFinishLesson());
    }
  };

  const handleValidate = () => {
    if (onRun) {
      dispatch(setIsValidating(true));
      sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_VALIDATE_CLICK, appType);
      onRun(true, dispatch, source).finally(() =>
        dispatch(setIsValidating(false))
      );
    } else {
      dispatch(appendSystemMessage(codebridgeI18n.cannotTest()));
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
      dispatch(setIsValidating(false));
    } else {
      dispatch(appendSystemMessage(codebridgeI18n.cannotStop()));
      dispatch(setIsValidating(false));
    }
  };

  // There are 3 ways to "meet validation" for a level:
  // If the level is a predict level, the user must run the code.
  // Otherwise, if the level has conditions, they must be satisfied.
  // If the level has no conditions and is not a predict level,
  // the user must run their code at least once.
  const hasMetValidation = useMemo(() => {
    if (predictSettings?.isPredictLevel) {
      return hasRun;
    } else if (hasConditions) {
      return satisfied;
    } else {
      return hasRun && hasEdited;
    }
  }, [predictSettings, hasConditions, satisfied, hasRun, hasEdited]);

  /**
   * Returns the props for the navigation (continue/finish/submit/unsubmit)
   * button for the current level, including if we should show a navigation button.
   * @returns NavigationButtonProps for the current level and status.
   */
  const getNavigationButtonProps: () => NavigationButtonProps = () => {
    // The submit button will either say "submit" or "unsubmit" depending on if
    // the user has already submitted. We only show the "submit" option if the
    // user has met validation, otherwise we show the continue button.
    const showSubmitButton =
      isSubmittable && (hasMetValidation || hasSubmitted);

    // We show the finish variant if there is not a next level.
    const showFinishButton =
      !isSubmittable && hasMetValidation && !hasNextLevel;

    // We show the continue variant if there is a next level.
    const showContinueButton =
      !isSubmittable && hasMetValidation && hasNextLevel;

    const showNavigation =
      showContinueButton || showFinishButton || showSubmitButton || false;
    if (isSubmittable) {
      // Props for a submit button.
      return {
        showNavigation,
        navigationText: hasSubmitted
          ? commonI18n.unsubmit()
          : commonI18n.submit(),
        handleNavigation: onSubmit,
      };
    } else if (hasNextLevel) {
      // Props for a continue button.
      return {
        showNavigation,
        navigationText: commonI18n.continue(),
        handleNavigation: () => dispatch(continueOrFinishLesson()),
        navigationIcon: {iconName: 'arrow-right', iconStyle: 'solid'},
      };
    } else {
      // Props for a finish button.
      return {
        showNavigation,
        navigationText: commonI18n.finish(),
        handleNavigation: () => dispatch(continueOrFinishLesson()),
      };
    }
  };

  // TODO: If we go with the test button in the instructions panel long-term,
  // we should refactor this to a separate component.
  const renderValidationButton = () => {
    if (!hasConditions) {
      return null;
    }
    return isValidating ? (
      <Button
        text={codebridgeI18n.stopValidation()}
        onClick={handleStop}
        color={'destructive'}
        iconLeft={{iconStyle: 'solid', iconName: 'square'}}
        className={classNames(
          moduleStyles.buttonInstruction,
          moduleStyles.validationButton
        )}
        size={'s'}
      />
    ) : (
      <Button
        text={codebridgeI18n.validate()}
        onClick={() => handleValidate()}
        type={'secondary'}
        disabled={shouldValidateBeDisabled}
        iconLeft={{iconStyle: 'solid', iconName: 'clipboard-check'}}
        className={classNames(
          darkModeStyles.secondaryButton,
          moduleStyles.buttonInstruction,
          moduleStyles.validationButton
        )}
        color={'white'}
        size={'s'}
      />
    );
  };

  const {showNavigation, navigationText, navigationIcon, handleNavigation} =
    getNavigationButtonProps();

  const validationScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (validationResults) {
      // We must at least set a timeout with a wait of 0 to ensure the scroll happens at all,
      // because the DOM needs to update before we can scroll to the new element.
      setTimeout(
        () => validationScrollRef.current?.scrollIntoView({behavior: 'smooth'}),
        0
      );
    }
  }, [validationResults]);

  // Don't render anything if we don't have any instructions.
  if (instructionsText === undefined) {
    return null;
  }

  return (
    <div
      id="instructions"
      className={classNames(
        moduleStyles['instructions-' + theme],
        vertical && moduleStyles.vertical,
        'instructions',
        className
      )}
    >
      <div
        id="instructions-panel"
        className={classNames(
          moduleStyles.item,
          vertical && moduleStyles.itemVertical
        )}
      >
        <div className={moduleStyles.scrollingContent}>
          {instructionsText && (
            <div
              key={instructionsText}
              id="instructions-text"
              className={classNames(moduleStyles['bubble-' + theme])}
            >
              <div className={moduleStyles.mainInstructions}>
                <ValidationStatusIcon
                  status={showPassedIcon ? 'passed' : 'pending'}
                  className={moduleStyles.validationIcon}
                />
                <EnhancedSafeMarkdown
                  markdown={instructionsText}
                  className={moduleStyles.markdownText}
                  handleInstructionsTextClick={handleInstructionsTextClick}
                />
              </div>
              <PredictQuestion
                predictSettings={predictSettings}
                predictResponse={predictResponse}
                setPredictResponse={response =>
                  dispatch(setPredictResponse(response))
                }
                predictAnswerLocked={predictAnswerLocked}
                className={moduleStyles.predictQuestion}
              />
              {renderValidationButton()}
            </div>
          )}

          {validationResults && (
            <>
              <div ref={validationScrollRef} />
              <div className={classNames(moduleStyles['bubble-' + theme])}>
                <ValidationResults />
              </div>
            </>
          )}
          {predictSettings?.isPredictLevel && (
            <InstructorsOnly>
              <div className={moduleStyles['bubble-' + theme]}>
                <PredictSummary />
              </div>
            </InstructorsOnly>
          )}
        </div>
        {showNavigation && (
          <div
            id="instructions-navigation"
            className={classNames(
              moduleStyles['bubble-' + theme],
              moduleStyles.button
            )}
          >
            <Button
              text={navigationText}
              onClick={handleNavigation}
              color={'white'}
              className={moduleStyles.buttonInstruction}
              iconLeft={navigationIcon}
              size={'s'}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidatedInstructions;
