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
import ai101Thumnail from '@cdo/static/ai-101-pl-course-thumbnail.png';
import aiBotHappy from '@cdo/static/ai-bot-happy.png';
import aiBotScanning from '@cdo/static/ai-bot-scanning.png';

import AiDiffChat, {
  EXAMPLE_PROMPT,
  EXPLAIN_CONCEPT_PROMPT,
  EXTRA_PRACTICE_PROMPT,
  FINISH_EARLY_PROMPT,
} from '../AiDiffChat';
import {ChatPrompt} from '../types';

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
  context: string;
  scriptId?: number;
  scriptName?: string;
  unitDisplayName?: string;
  firstState?: WelcomeState;
}

const SUGGESTED_PROMPTS_FOR_SELECTION: {
  [selection: string]: {initialMessage: string; suggestedPrompts: ChatPrompt[]};
} = {
  plan: {
    initialMessage:
      'Lets iterate together! What would you like to change? Below are some of the tasks I can help you with.',
    suggestedPrompts: [EXPLAIN_CONCEPT_PROMPT, EXAMPLE_PROMPT],
  },
  create: {
    initialMessage:
      'Lets work together to create resources for your classroom! What would you like help creating? Below are some of the tasks I can help you with.',
    suggestedPrompts: [FINISH_EARLY_PROMPT, EXTRA_PRACTICE_PROMPT],
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
  scriptId,
  scriptName,
  unitDisplayName,
  // This should only be used for testing purposes
  firstState = 'get_started',
}) => {
  const [currentWelcomeState, setCurrentWelcomeState] =
    React.useState<WelcomeState>(firstState);

  const [chatContinueButtonDisabled, setChatContinueButtonDisabled] =
    React.useState(true);

  const [selectedOption, setSelectedOption] = React.useState<
    'plan' | 'create' | null
  >(null);

  const [confettiActive, setConfettiActive] = React.useState<boolean>(false);

  const updateShowWelcomeExperience = React.useCallback(() => {
    HttpClient.post(HAS_SEEN_WELCOME_URL, undefined, true).then(() => {
      setShowWelcomeExperience(false);
    });
  }, [setShowWelcomeExperience]);

  const continueAndSkipButtons = React.useCallback(
    (nextState: WelcomeState, continueDisabled: boolean) => {
      return (
        <div className={style.bottomButtons}>
          <Button
            onClick={() => setCurrentWelcomeState(nextState)}
            text="Continue"
            disabled={continueDisabled}
          />
          <Link
            className={style.skipLink}
            onClick={() => updateShowWelcomeExperience()}
            text="Skip the tutorial"
            size="xs"
            type="secondary"
          />
        </div>
      );
    },
    [updateShowWelcomeExperience]
  );

  const selectAnOptionPage = React.useCallback(
    (nextState: WelcomeState) => {
      return (
        <div className={style.selectOption}>
          <div className={style.selectOptionPage}>
            {progressBarHeader(30, () => setCurrentWelcomeState('get_started'))}
            <div className={style.selectOptionContent}>
              <Heading3>Pick a skill to practice</Heading3>
              <Heading6 className={style.selectOptionSubtitle}>
                Using AI in multiple ways increases productivity.
              </Heading6>
              {optionButton(
                selectedOption === 'plan',
                () => setSelectedOption('plan'),
                'folder-tree',
                'Plan',
                'Locate resources, brainstorm teaching strategies, ask questions about the curriculum, recommend a course'
              )}
              {optionButton(
                selectedOption === 'create',
                () => setSelectedOption('create'),
                'file-pen',
                'Create',
                'Differentiate assessment materials, generate lesson-aligned activities and practice problems'
              )}
            </div>
            {continueAndSkipButtons(nextState, !selectedOption)}
          </div>
        </div>
      );
    },
    [continueAndSkipButtons, selectedOption]
  );

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
        <Button onClick={() => updateShowWelcomeExperience()} text="Finish" />
      </div>
    );
  }, [updateShowWelcomeExperience, confettiActive]);

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
            scriptId={scriptId}
            scriptName={scriptName}
            chatResponseCallback={() => setChatContinueButtonDisabled(false)}
            unitDisplayName={unitDisplayName}
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
    scriptId,
    scriptName,
    unitDisplayName,
    continueAndSkipButtons,
    chatContinueButtonDisabled,
  ]);

  const currentWelcomePage = React.useMemo(() => {
    switch (currentWelcomeState) {
      case WelcomeStates.get_started:
        return getStartedPage(() =>
          setCurrentWelcomeState(WelcomeStates.select_option)
        );
      case WelcomeStates.select_option:
        return selectAnOptionPage(WelcomeStates.practice);
      case WelcomeStates.practice:
        return practicePage();
      case WelcomeStates.end_page:
        return endPage();
      default:
        return null;
    }
  }, [currentWelcomeState, selectAnOptionPage, practicePage, endPage]);

  return currentWelcomePage;
};

export default AiDiffWelcome;
