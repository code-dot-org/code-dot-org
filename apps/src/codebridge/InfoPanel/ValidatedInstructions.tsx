import classNames from 'classnames';
import React, {useCallback, useContext} from 'react';
import {useSelector} from 'react-redux';

import {
  navigateToNextLevel,
  sendSubmitReport,
} from '@cdo/apps/code-studio/progressRedux';
import {
  getCurrentLevel,
  nextLevelId,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {Button} from '@cdo/apps/componentLibrary/button';
import {FontAwesomeV6IconProps} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {
  isPredictAnswerLocked,
  setPredictResponse,
} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {setIsTesting} from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import PredictQuestion from '@cdo/apps/lab2/views/components/PredictQuestion';
import PredictSummary from '@cdo/apps/lab2/views/components/PredictSummary';
import {DialogType, useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import {ThemeContext} from '@cdo/apps/lab2/views/ThemeWrapper';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import {useCodebridgeContext} from '../codebridgeContext';
import {appendSystemMessage} from '../redux/consoleRedux';

import moduleStyles from '@codebridge/InfoPanel/styles/validated-instructions.module.scss';

const commonI18n = require('@cdo/locale');

interface InstructionsProps {
  /** Additional callback to fire before navigating to the next level. */
  beforeNextLevel?: () => void;
  /** If the instructions panel should be rendered vertically or horizontally. Defaults to vertical. */
  layout?: 'vertical' | 'horizontal';
  /**
   * A callback when the user clicks on clickable text.
   */
  handleInstructionsTextClick?: (id: string) => void;
  manageNavigation?: boolean;
  /** Optional classname for the container */
  className?: string;
}

/**
 * Lab2 instructions component. This can be used by any Lab2 lab, and will retrieve
 * all necessary data from the Lab2 redux store.
 *
 * Note that currently, this component solely renders instructions, and does not include any features
 * present on the legacy instructions panel, such as Help & Tips, Documentation, Code Review,
 * For Teachers Only, etc.
 */
const ValidatedInstructions: React.FunctionComponent<InstructionsProps> = ({
  beforeNextLevel,
  layout = 'vertical',
  handleInstructionsTextClick,
  className,
  manageNavigation = true,
}) => {
  const {onRun, onStop} = useCodebridgeContext();
  const dialogControl = useDialogControl();
  const instructionsText = useSelector(
    (state: {lab: LabState}) => state.lab.levelProperties?.longInstructions
  );
  const hasNextLevel = useSelector(state => nextLevelId(state) !== undefined);
  const {hasConditions, satisfied} = useSelector(
    (state: {lab: LabState}) => state.lab.validationState
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
  const isTesting = useAppSelector(state => state.lab2System.isTesting);
  const isLoadingEnvironment = useAppSelector(
    state => state.lab2System.loadingCodeEnvironment
  );

  const dispatch = useAppDispatch();

  const {theme} = useContext(ThemeContext) || 'dark';

  const vertical = layout === 'vertical';

  const onFinish = () => {
    // no op for now
  };

  const onNextPanel = useCallback(() => {
    if (beforeNextLevel) {
      beforeNextLevel();
    }
    dispatch(navigateToNextLevel());
  }, [dispatch, beforeNextLevel]);

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

  const handleSubmit = () => {
    dispatch(
      sendSubmitReport({appType: appType || '', submitted: !hasSubmitted})
    );
    // Go to the next level if we have one and we just submitted.
    // TODO: If onContinue starts to update progress, make sure we don't override the submitted status.
    if (hasNextLevel && !hasSubmitted) {
      onNextPanel();
    }
  };

  const handleTest = () => {
    if (onRun) {
      dispatch(setIsTesting(true));
      onRun(true, dispatch, source).finally(() =>
        dispatch(setIsTesting(false))
      );
    } else {
      dispatch(appendSystemMessage("We don't know how to run your code."));
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
      dispatch(setIsTesting(false));
    } else {
      dispatch(appendSystemMessage("We don't know how to stop your code."));
      dispatch(setIsTesting(false));
    }
  };

  const getNavigationButtonProps = () => {
    const hasMetValidation =
      (!hasConditions && hasRun) || (hasConditions && satisfied);

    // If there are no validation conditions, we can show the finish button so long as
    // this is the last level in the progression and the instructions panel is managing navigation.
    // If validation is present, also check that conditions are satisfied.
    const showFinishButton =
      !isSubmittable && manageNavigation && hasMetValidation && !hasNextLevel;
    // If there are no validation conditions, we can show the continue button so long as
    // there is another level, manageNavigation is true, and code has been run at least once.
    // If validation is present, also check that conditions are satisfied.
    const showContinueButton =
      !isSubmittable && manageNavigation && hasMetValidation && hasNextLevel;

    const showSubmitButton =
      isSubmittable && manageNavigation && (hasMetValidation || hasSubmitted);
    const showNavigation =
      showContinueButton || showFinishButton || showSubmitButton;
    if (isSubmittable) {
      return {
        showNavigation,
        navigationText: hasSubmitted
          ? commonI18n.unsubmit()
          : commonI18n.submit(),
        handleNavigation: onSubmit,
      };
    } else if (hasNextLevel) {
      return {
        showNavigation,
        navigationText: commonI18n.continue(),
        handleNavigation: onNextPanel,
        navigationIcon: {iconName: 'arrow-right', iconStyle: 'solid'},
      };
    } else {
      return {
        showNavigation,
        navigationText: commonI18n.finish(),
        handleNavigation: onFinish,
      };
    }
  };

  const renderTestButton = () => {
    if (!hasConditions) {
      return null;
    }
    return isTesting ? (
      <Button
        text={'Stop'}
        onClick={handleStop}
        color={'destructive'}
        iconLeft={{iconStyle: 'solid', iconName: 'square'}}
        className={moduleStyles.centerButton}
        size={'s'}
      />
    ) : (
      <Button
        text="Test"
        onClick={() => handleTest()}
        disabled={isLoadingEnvironment}
        iconLeft={{iconStyle: 'solid', iconName: 'flask'}}
        color={'black'}
        size={'s'}
      />
    );
  };

  const {showNavigation, navigationText, navigationIcon, handleNavigation} =
    getNavigationButtonProps();

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
        {instructionsText && (
          <div
            key={instructionsText}
            id="instructions-text"
            className={classNames(
              moduleStyles['bubble-' + theme],
              moduleStyles.text
            )}
          >
            {predictSettings?.isPredictLevel && <PredictSummary />}
            <EnhancedSafeMarkdown
              markdown={instructionsText}
              className={moduleStyles.markdownText}
              handleInstructionsTextClick={handleInstructionsTextClick}
            />
            <PredictQuestion
              predictSettings={predictSettings}
              predictResponse={predictResponse}
              setPredictResponse={response =>
                dispatch(setPredictResponse(response))
              }
              predictAnswerLocked={predictAnswerLocked}
            />
            {renderTestButton()}
          </div>
        )}
        {showNavigation && (
          <div
            id="instructions-navigation"
            className={moduleStyles['bubble-' + theme]}
          >
            <Button
              text={navigationText}
              onClick={handleNavigation}
              color={'white'}
              className={moduleStyles.buttonInstruction}
              iconLeft={navigationIcon as FontAwesomeV6IconProps | undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidatedInstructions;
