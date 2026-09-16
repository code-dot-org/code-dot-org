import {Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import React, {
  useRef,
  useState,
  useEffect,
  MutableRefObject,
  memo,
} from 'react';

import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {LevelProperties} from '@cdo/apps/lab2/types';
import MainInstructionsContent from '@cdo/apps/lab2/views/components/Instructions/MainInstructionsContent';
import TextToSpeech from '@cdo/apps/lab2/views/components/TextToSpeech';

import NavigationArea from './NavigationArea';
import PredictQuestion from './PredictQuestion';
import PredictQuestionRunPrompt from './PredictQuestionRunPrompt';
import PredictSummary from './PredictSummary';

import moduleStyles from './instructions.module.scss';

export interface InstructionsProps {
  levelProperties: LevelProperties;
  /** Whether the lab is currently running (different labs may define this differently). */
  isRunning: boolean;
  /** Whether the lab's code has been executed/run on this level. */
  hasRun: boolean;
  /** Whether the lab's code has been edited on this level. */
  hasEdited: boolean;
  /**
   * A callback when the user clicks on clickable text.
   */
  handleInstructionsTextClick?: (id: string) => void;
  /** Optional component to render at the bottom of the main instructions. */
  bottomComponent?: React.ReactNode;
  /** If the instructions panel should always have a dark background, regardless of theme */
  fixedDarkBackground?: boolean;
  overrideTheme?: Theme;
  /** If the lab requires the user to click run in order to continue.
   * Only applies to non-validated levels. */
  requireRun?: boolean;
  /** If the navigation area should be hidden. */
  hideNavigation?: boolean;
  /** If the continue button should be hidden if disabled. */
  hideContinueIfDisabled?: boolean;
  /** Instructions content that updates dynamically throughout a level. Replaces `longInstructions` if provided. */
  dynamicInstructions?: string;
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
  handleInstructionsTextClick,
  bottomComponent,
  fixedDarkBackground,
  overrideTheme,
  dynamicInstructions,
  hideNavigation = false,
  hideContinueIfDisabled = false,
  ...feedbackProps
}) => {
  const {longInstructions, predictSettings, offerBrowserTts, appName} =
    levelProperties;
  const isPredictLevel = predictSettings?.isPredictLevel;
  const showTts = offerBrowserTts || queryParams('show-tts') === 'true';
  const {theme: defaultTheme} = useTheme();
  const ref: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  // Scrollable regions must be keyboard-reachable (WCAG 2.1 SC 2.1.1).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setIsScrollable(el.scrollHeight > el.clientHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const displayInstructions = dynamicInstructions || longInstructions;
  // Don't render anything if we don't have any instructions.
  if (displayInstructions === undefined) {
    return null;
  }

  return (
    <div
      id="instructions"
      className={classNames(
        moduleStyles.instructions,
        fixedDarkBackground
          ? moduleStyles.fixedDarkBackground
          : moduleStyles.standardBackground,
        'instructions'
      )}
      data-theme={overrideTheme || defaultTheme}
    >
      <div
        id="instructions-panel"
        aria-live="polite"
        className={classNames(moduleStyles.item)}
      >
        <div
          key={displayInstructions}
          id="instructions-text"
          className={classNames(moduleStyles.bubble, moduleStyles.textContent)}
        >
          {/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- scrollable region requires keyboard access per WCAG 2.1 SC 2.1.1 */}
          <div
            className={moduleStyles.scrollingContent}
            ref={scrollRef}
            tabIndex={isScrollable ? 0 : undefined}
            aria-label={isScrollable ? 'Instructions' : undefined}
          >
            <MainInstructionsContent
              instructionsText={displayInstructions}
              handleInstructionsTextClick={handleInstructionsTextClick}
              ref={ref}
            />
            <PredictQuestion
              levelProperties={levelProperties}
              className={moduleStyles.predictQuestion}
              showJavascriptWarning={appName === 'weblab2'}
              showSubmitButton={appName === 'weblab2'}
            />
          </div>
          {showTts && (
            <div className={moduleStyles.ttsContainer}>
              <TextToSpeech contentRef={ref} />
            </div>
          )}
          {bottomComponent && (
            <div className={moduleStyles.bottomComponent}>
              {bottomComponent}
            </div>
          )}
        </div>
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
            <PredictQuestionRunPrompt appName={appName} />
          </>
        )}
        {!hideNavigation && (
          <NavigationArea
            {...feedbackProps}
            overrideTheme={overrideTheme}
            levelProperties={levelProperties}
            handleInstructionsTextClick={handleInstructionsTextClick}
            hideContinueIfDisabled={hideContinueIfDisabled}
            styleAsBubble
          />
        )}
      </div>
    </div>
  );
};
export default memo(Instructions);
