import {Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import React from 'react';

import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {isUsingResourcePanel} from '@cdo/apps/lab2/utils';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
import ValidationResults from '@cdo/apps/lab2/views/components/Instructions/ValidationResults';
import TextToSpeech from '@cdo/apps/lab2/views/components/TextToSpeech';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import NavigationArea from './NavigationArea';
import PredictQuestion from './PredictQuestion';
import PredictQuestionRunPrompt from './PredictQuestionRunPrompt';
import PredictSummary from './PredictSummary';
import ValidationButton from './ValidationButton';

import moduleStyles from './instructions.module.scss';

export interface InstructionsProps {
  levelProperties: LevelProperties;
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
  /** Optional classname for the container */
  className?: string;
  /** Optional component to render at the bottom of the main instructions. */
  bottomComponent?: React.ReactNode;
  /** Props for in-panel validation button and results table. */
  validationSettings?: ValidationSettings;
  /** If the instructions panel should always have a dark background, regardless of theme */
  fixedDarkBackground?: boolean;
  /** Component to use for AI Tutor responses, if any. */
  AiTutor2ResponseView?: React.ReactNode;
  overrideTheme?: Theme;
  /** If the lab requires the user to click run in order to continue.
   * Only applies to non-validated levels. */
  requireRun?: boolean;
  /** If the navigation area should be hidden. */
  hideNavigation?: boolean;
  /** If the continue button should be hidden if disabled. */
  hideContinueIfDisabled?: boolean;
}

export interface ValidationSettings {
  onValidate: () => void;
  onStopValidation: () => void;
  isValidating: boolean;
  isValidateDisabled: boolean;
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
  levelProperties,
  layout = 'vertical',
  handleInstructionsTextClick,
  className,
  bottomComponent,
  validationSettings,
  fixedDarkBackground,
  AiTutor2ResponseView,
  overrideTheme,
  hideNavigation = false,
  hideContinueIfDisabled = false,
  ...feedbackProps
}) => {
  const validationResults = useAppSelector(
    state => state.lab.validationState?.validationResults
  );

  // TODO: When Python Lab uses the resource panel permanently, we can remove all validation
  // from this component.`
  const includeValidation =
    validationSettings !== undefined &&
    !isUsingResourcePanel(
      levelProperties.appName,
      levelProperties.isProjectLevel || false
    );
  const {longInstructions, predictSettings, offerBrowserTts} = levelProperties;
  const isPredictLevel = predictSettings?.isPredictLevel;
  const showTts = offerBrowserTts || queryParams('show-tts') === 'true';
  const defaultTheme = useTheme();
  const theme = overrideTheme || defaultTheme;

  // Don't render anything if we don't have any instructions.
  if (longInstructions === undefined) {
    return null;
  }

  const vertical = layout === 'vertical';
  return (
    <div
      id="instructions"
      className={classNames(
        moduleStyles.instructions,
        fixedDarkBackground
          ? moduleStyles.fixedDarkBackground
          : moduleStyles.standardBackground,
        moduleStyles['instructions-' + layout],
        vertical && moduleStyles.vertical,
        'instructions',
        className
      )}
      data-theme={theme}
    >
      <div
        id="instructions-panel"
        className={classNames(
          moduleStyles.item,
          vertical && moduleStyles.itemVertical
        )}
      >
        <div
          key={longInstructions}
          id="instructions-text"
          className={classNames(moduleStyles.bubble, moduleStyles.textContent)}
        >
          <div className={moduleStyles.scrollingContent}>
            <MainInstructionsContent
              instructionsText={longInstructions}
              handleInstructionsTextClick={handleInstructionsTextClick}
            />
            <PredictQuestion className={moduleStyles.predictQuestion} />
          </div>
          {showTts && (
            <div className={moduleStyles.ttsContainer}>
              <TextToSpeech text={longInstructions} />
            </div>
          )}
          {includeValidation && (
            <ValidationButton
              onValidate={validationSettings.onValidate}
              onStopValidation={validationSettings.onStopValidation}
              isValidating={validationSettings.isValidating}
              isValidateDisabled={validationSettings.isValidateDisabled}
            />
          )}
          {bottomComponent && (
            <div className={moduleStyles.bottomComponent}>
              {bottomComponent}
            </div>
          )}
        </div>
        {includeValidation && validationResults && (
          <div className={moduleStyles.bubble}>
            <div className={moduleStyles.textContent}>
              <div className={moduleStyles.scrollingContent}>
                <ValidationResults />
              </div>
            </div>
          </div>
        )}
        {AiTutor2ResponseView && AiTutor2ResponseView}
        {isPredictLevel && (
          <>
            <InstructorsOnly>
              <div
                className={classNames(
                  moduleStyles.bubble,
                  moduleStyles.predictSummaryBubble
                )}
              >
                <PredictSummary />
              </div>
            </InstructorsOnly>
            <PredictQuestionRunPrompt />
          </>
        )}
        {!hideNavigation && (
          <NavigationArea
            {...feedbackProps}
            levelProperties={levelProperties}
            handleInstructionsTextClick={handleInstructionsTextClick}
            hideContinueIfDisabled={hideContinueIfDisabled}
          />
        )}
      </div>
    </div>
  );
};
export default Instructions;
