import {Button} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import {
  BodyOneText,
  BodyThreeText,
  BodyTwoText,
  Heading1,
  Heading3,
  Heading6,
  StrongText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React from 'react';
import Confetti from 'react-dom-confetti';

import HttpClient from '@cdo/apps/util/HttpClient';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';
import ai101Thumnail from '@cdo/static/ai-101-pl-course-thumbnail.png';
import aiBotHappy from '@cdo/static/ai-bot-happy.png';
import aiBotScanning from '@cdo/static/ai-bot-scanning.png';

import {EVENTS, PLATFORMS} from '../../metrics/AnalyticsConstants';
import analyticsReporter from '../../metrics/AnalyticsReporter';
import AiDiffChat from '../AiDiffChat';
import {
  EXAMPLE_PROMPT,
  EXPLAIN_CONCEPT_PROMPT,
  EXTRA_PRACTICE_PROMPT,
  FINISH_EARLY_PROMPT,
  ADJUST_TIMING_PROMPT,
  DEBUG_MISTAKES_PROMPT,
  REAL_WORLD_PROMPT,
  EXIT_TICKET_PROMPT,
  MINI_LESSON_PROMPT,
  LESSON_HOOK_PROMPT,
  SUGGEST_CURRICULUM_PROMPT,
  GET_STARTED_PROMPT,
  PROFESSIONAL_LEARNING_PROMPT,
  CREATE_SECTION_PROMPT,
  ADDITIONAL_HELP_PROMPT,
  APCSP_EXAM_PREPARATION_RESOURCES,
  APCSP_EXAM_SAMPLE_QUESTIONS,
  APCSP_EXAM_TIME_STRATEGIES,
  APCSP_CREATE_PT_AI,
  APCSP_CREATE_PT_PREPARATION,
} from '../AiDiffPredefinedPrompts';
import {ChatPrompt, Context} from '../types';

import style from './ai-diff-welcome.module.scss';

const HAS_SEEN_WELCOME_URL =
  '/api/v1/users/has_completed_ai_differentiation_welcome';

type WelcomeState = 'get_started' | 'select_option' | 'practice' | 'end_page';

const WelcomeStates: {[key in WelcomeState]: WelcomeState} = {
  get_started: 'get_started',
  select_option: 'select_option',
  practice: 'practice',
  end_page: 'end_page',
};

interface AiDiffWelcomeProps {
  setShowWelcomeExperience: (show: boolean) => void;
  context: Context;
  scriptName?: string;
  firstState?: WelcomeState;
  curriculumCourses?: string[];
}

const SUGGESTED_PROMPTS_FOR_SELECTION: {
  [selection: string]: {initialMessage: string; suggestedPrompts: ChatPrompt[]};
} = {
  plan: {
    initialMessage: `Let's iterate together! What would you like to change? Below are some of the tasks I can help you with.`,
    suggestedPrompts: [
      EXPLAIN_CONCEPT_PROMPT,
      EXAMPLE_PROMPT,
      ADJUST_TIMING_PROMPT,
      DEBUG_MISTAKES_PROMPT,
      REAL_WORLD_PROMPT,
    ],
  },
  create: {
    initialMessage: `Let's work together to create resources for your classroom! What would you like help creating? Below are some of the tasks I can help you with.`,
    suggestedPrompts: [
      FINISH_EARLY_PROMPT,
      EXTRA_PRACTICE_PROMPT,
      EXIT_TICKET_PROMPT,
      MINI_LESSON_PROMPT,
      LESSON_HOOK_PROMPT,
    ],
  },
  support: {
    initialMessage: `Let's get started teaching on Code.org together! What would you like to do on the Code.org platform? Below are some of the tasks I can help you with.`,
    suggestedPrompts: [
      SUGGEST_CURRICULUM_PROMPT,
      GET_STARTED_PROMPT,
      PROFESSIONAL_LEARNING_PROMPT,
      CREATE_SECTION_PROMPT,
      ADDITIONAL_HELP_PROMPT,
    ],
  },
  apcsp: {
    initialMessage: `Let's get started with AP prep! What would you like help with preparing for the AP exam? Below are some of the tasks I can help you with.`,
    suggestedPrompts: [
      APCSP_EXAM_PREPARATION_RESOURCES,
      APCSP_EXAM_SAMPLE_QUESTIONS,
      APCSP_EXAM_TIME_STRATEGIES,
      APCSP_CREATE_PT_AI,
      APCSP_CREATE_PT_PREPARATION,
    ],
  },
};

const optionButton = (
  isSelected = false,
  onClick: () => void,
  iconName: string,
  title: string,
  description: string | null
) => {
  return (
    <button
      className={classNames(
        style.optionRow,
        isSelected && style.selectedOption
      )}
      onClick={onClick}
      type="button"
      aria-label={title}
    >
      <FontAwesomeV6Icon
        iconName={iconName}
        iconFamily="duotone"
        className={style.optionIcon}
      />
      <div className={style.optionText}>
        <BodyTwoText className={style.optionTitle}>
          <StrongText>{title}</StrongText>
        </BodyTwoText>

        {description && (
          <BodyThreeText className={style.optionDescription}>
            {description}
          </BodyThreeText>
        )}
      </div>
    </button>
  );
};

const getStartedPage = (onClick: () => void) => {
  return (
    <div className={style.getStartedPage}>
      <div className={style.getStartedContent}>
        <div className={style.getStartedTop}>
          <img
            src={aiBotScanning}
            className={style.botScanning}
            alt={'AI Teaching Assistant'}
          />
          <Heading1>AI Teaching Assistant</Heading1>
          <BodyOneText>Empowering teachers. Enhancing learning.</BodyOneText>
        </div>
        <Button onClick={onClick} text="Get Started" />
      </div>
    </div>
  );
};

const progressBarHeader = (percentage: number, onBack: () => void) => {
  return (
    <div className={style.progressBarHeader}>
      <button
        className={style.headerBackButton}
        type="button"
        onClick={onBack}
        aria-label="Back"
      >
        <FontAwesomeV6Icon
          iconName="arrow-left"
          className={style.headerBackIcon}
        />
      </button>
      <div className={style.progressBar}>
        <div
          className={style.progressBarFill}
          style={{width: `${percentage}%`}}
        />
      </div>
    </div>
  );
};

const AiDiffWelcome: React.FC<AiDiffWelcomeProps> = ({
  setShowWelcomeExperience,
  context,
  scriptName,
  // This should only be used for testing purposes
  firstState = 'get_started',
  curriculumCourses,
}) => {
  const [currentWelcomeState, setCurrentWelcomeState] =
    React.useState<WelcomeState>(firstState);

  const [chatContinueButtonDisabled, setChatContinueButtonDisabled] =
    React.useState(true);

  const [selectedOption, setSelectedOption] = React.useState<
    'plan' | 'create' | 'support' | 'apcsp' | null
  >(null);

  const [confettiActive, setConfettiActive] = React.useState<boolean>(false);

  const reportingContext = React.useMemo(() => {
    return {
      aiDiffChatContext: context,
      scriptName,
      selectedOption,
      url: window.location.href,
    };
  }, [context, scriptName, selectedOption]);

  const updateShowWelcomeExperience = React.useCallback(
    (statsigKey: string) => {
      analyticsReporter.sendEvent(
        statsigKey,
        reportingContext,
        PLATFORMS.STATSIG
      );
      HttpClient.post(HAS_SEEN_WELCOME_URL, undefined, true).then(() => {
        setShowWelcomeExperience(false);
      });
    },
    [reportingContext, setShowWelcomeExperience]
  );

  const moveForwardTo = React.useCallback(
    (nextState: WelcomeState) => {
      const statsigKey = (() => {
        switch (nextState) {
          case WelcomeStates.select_option:
            return EVENTS.AI_DIFF_GET_STARTED;
          case WelcomeStates.practice:
            return EVENTS.AI_DIFF_CHOOSE_FLOW;
          case WelcomeStates.end_page:
            return EVENTS.AI_DIFF_FINISH_FIRST;
        }
        return null;
      })();
      if (statsigKey) {
        analyticsReporter.sendEvent(
          statsigKey,
          reportingContext,
          PLATFORMS.STATSIG
        );
      }

      setCurrentWelcomeState(nextState);
    },
    [reportingContext]
  );

  const continueAndSkipButtons = React.useCallback(
    (nextState: WelcomeState, continueDisabled: boolean) => {
      return (
        <div className={style.bottomButtons}>
          <Button
            id="uitest_aiDiffWelcomeContinue"
            onClick={() => moveForwardTo(nextState)}
            text="Continue"
            disabled={continueDisabled}
          />
          <Link
            className={style.skipLink}
            onClick={() =>
              updateShowWelcomeExperience(EVENTS.AI_DIFF_SKIP_WELCOME)
            }
            text="Skip the tutorial"
            size="xs"
            type="secondary"
          />
        </div>
      );
    },
    [updateShowWelcomeExperience, moveForwardTo]
  );

  const selectAnOptionPage = React.useCallback(() => {
    return (
      <div className={style.selectOption}>
        <div className={style.selectOptionPage}>
          {progressBarHeader(30, () => setCurrentWelcomeState('get_started'))}
          <div className={style.selectOptionContent}>
            <Heading3>Pick a skill to practice</Heading3>
            <Heading6 className={style.selectOptionSubtitle}>
              Using AI in multiple ways increases productivity.
            </Heading6>
            {context.type === AiDiffContext.GENERAL &&
              optionButton(
                selectedOption === 'support',
                () => setSelectedOption('support'),
                'rocket-launch',
                'Get Started',
                'Get help using the Code.org platform, learn about professional learning opportunities, suggest a curriculum, create a section'
              )}
            {optionButton(
              selectedOption === 'plan',
              () => setSelectedOption('plan'),
              'folder-tree',
              'Ideate',
              'Locate resources, brainstorm teaching strategies, ask questions about the curriculum, recommend a course'
            )}
            {optionButton(
              selectedOption === 'create',
              () => setSelectedOption('create'),
              'file-pen',
              'Create',
              'Differentiate assessment materials, generate lesson-aligned activities and practice problems'
            )}
            {curriculumCourses &&
              curriculumCourses.includes('csp') &&
              optionButton(
                selectedOption === 'apcsp',
                () => setSelectedOption('apcsp'),
                'laptop-code',
                'AP Prep',
                'Get help preparing for the AP CSP exam, learn about the Create PT, get sample questions and exam resources'
              )}
          </div>
          {continueAndSkipButtons(WelcomeStates.practice, !selectedOption)}
        </div>
      </div>
    );
  }, [continueAndSkipButtons, selectedOption, context, curriculumCourses]);

  React.useEffect(() => {
    if (currentWelcomeState === WelcomeStates.end_page) {
      setConfettiActive(true);
    }
    if (currentWelcomeState === WelcomeStates.practice) {
      setConfettiActive(false);
      setChatContinueButtonDisabled(true);
    }
  }, [currentWelcomeState]);

  const endPage = React.useCallback(() => {
    return (
      <div className={style.endPage}>
        <div className={style.endPageTop}>
          <div className={style.confetti}>
            <Confetti active={confettiActive} />
          </div>
          <img
            src={aiBotHappy}
            className={style.botHappy}
            alt={'Congratulations!'}
          />
          <Heading3>You’re on your way to becoming an AI all-star!</Heading3>
          <Heading6 className={style.endPageSubTitle}>
            Continue your learning journey
          </Heading6>
          {optionButton(
            false,
            () => setCurrentWelcomeState(WelcomeStates.select_option),
            'dumbbell',
            'Practice another skill',
            null
          )}

          <a
            className={classNames(style.optionRow, style.optionRowWithPic)}
            href="https://code.org/ai/pl/101"
            onClick={() =>
              analyticsReporter.sendEvent(
                EVENTS.AI_DIFF_101,
                reportingContext,
                PLATFORMS.STATSIG
              )
            }
          >
            <div className={style.optionWithPicTop}>
              <FontAwesomeV6Icon
                iconName="head-side-brain"
                iconFamily="duotone"
                className={style.optionIcon}
              />
              <BodyTwoText className={style.optionTitle}>
                <StrongText>
                  Take Code.org’s self-paced AI 101 professional learning course
                </StrongText>
              </BodyTwoText>
            </div>
            <img
              src={ai101Thumnail}
              className={style.ai101Thumbnail}
              alt={''}
            />
          </a>
        </div>
        <Button
          onClick={() =>
            updateShowWelcomeExperience(EVENTS.AI_DIFF_CELEBRATION)
          }
          text="Finish"
        />
      </div>
    );
  }, [updateShowWelcomeExperience, confettiActive, reportingContext]);

  const practicePage = React.useCallback(() => {
    if (!selectedOption) {
      // Default to something so we don't just show a blank page
      setSelectedOption('plan');
      return null;
    }
    const {initialMessage, suggestedPrompts} =
      SUGGESTED_PROMPTS_FOR_SELECTION[selectedOption];

    return (
      <div className={style.practicePage}>
        {progressBarHeader(60, () => setCurrentWelcomeState('select_option'))}
        <div className={style.practiceContent}>
          <AiDiffChat
            context={context}
            scriptName={scriptName}
            chatResponseCallback={() => setChatContinueButtonDisabled(false)}
            initialChatMessage={initialMessage}
            suggestedPrompts={suggestedPrompts}
            disableEndButtons={true}
          />
        </div>
        {continueAndSkipButtons(
          WelcomeStates.end_page,
          chatContinueButtonDisabled
        )}
      </div>
    );
  }, [
    selectedOption,
    context,
    scriptName,
    continueAndSkipButtons,
    chatContinueButtonDisabled,
  ]);

  const currentWelcomePage = React.useMemo(() => {
    switch (currentWelcomeState) {
      case WelcomeStates.get_started:
        return getStartedPage(() => {
          moveForwardTo(WelcomeStates.select_option);
        });
      case WelcomeStates.select_option:
        return selectAnOptionPage();
      case WelcomeStates.practice:
        return practicePage();
      case WelcomeStates.end_page:
        return endPage();
      default:
        return null;
    }
  }, [
    currentWelcomeState,
    selectAnOptionPage,
    practicePage,
    endPage,
    moveForwardTo,
  ]);

  return currentWelcomePage;
};

export default AiDiffWelcome;
