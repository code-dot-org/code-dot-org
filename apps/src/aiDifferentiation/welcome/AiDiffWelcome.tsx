import classNames from 'classnames';
import React from 'react';

import ai101Thumnail from '@cdo/static/ai-101-pl-course-thumbnail.png';
import aiBotConfetti from '@cdo/static/ai-bot-confetti.png';

import {Button} from '../../componentLibrary/button';
import FontAwesomeV6Icon from '../../componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {
  BodyThreeText,
  BodyTwoText,
  Heading3,
  Heading6,
  StrongText,
} from '../../componentLibrary/typography';
import AiDiffChat, {
  EXAMPLE_PROMPT,
  EXPLAIN_CONCEPT_PROMPT,
  EXTRA_PRACTICE_PROMPT,
  FINISH_EARLY_PROMPT,
} from '../AiDiffChat';
import {ChatPrompt} from '../types';

import style from './ai-diff-welcome.module.scss';

type WelcomeState = 'select_option' | 'practice' | 'end_page';

const WelcomeStates: {[key in WelcomeState]: WelcomeState} = {
  select_option: 'select_option',
  practice: 'practice',
  end_page: 'end_page',
};

interface AiDiffWelcomeProps {
  setShowWelcomeExperience: (show: boolean) => void;
  lessonId: number;
  lessonName: string;
  unitDisplayName: string;
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

const AiDiffWelcome: React.FC<AiDiffWelcomeProps> = ({
  setShowWelcomeExperience,
  lessonId,
  lessonName,
  unitDisplayName,
}) => {
  const [currentWelcomeState, setCurrentWelcomeState] =
    React.useState<WelcomeState>('select_option');

  const [selectedOption, setSelectedOption] = React.useState<
    'plan' | 'create' | null
  >(null);

  const continueAndSkipButtons = React.useCallback(
    (nextState: WelcomeState) => {
      return (
        <div className={style.bottomButtons}>
          <Button
            onClick={() => setShowWelcomeExperience(false)}
            text="Skip"
            className={style.skipButton}
            color="gray"
            type="secondary"
          />
          <Button
            onClick={() => setCurrentWelcomeState(nextState)}
            text="Continue"
            className={style.continueButton}
            disabled={!selectedOption}
          />
        </div>
      );
    },
    [selectedOption, setShowWelcomeExperience]
  );

  const selectAnOptionPage = React.useCallback(
    (nextState: WelcomeState) => {
      return (
        <div className={style.selectOption}>
          <div className={style.selectOptionPage}>
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
          {continueAndSkipButtons(nextState)}
        </div>
      );
    },
    [continueAndSkipButtons, selectedOption]
  );

  const endPage = React.useCallback(() => {
    return (
      <div className={style.endPage}>
        <div className={style.endPageTop}>
          <img
            src={aiBotConfetti}
            className={style.botConfetti}
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
              alt={'AI 101 professional learning course'}
            />
          </a>
        </div>
        <Button onClick={() => setShowWelcomeExperience(false)} text="Finish" />
      </div>
    );
  }, [setShowWelcomeExperience]);

  const practicePage = React.useCallback(() => {
    if (!selectedOption) {
      return null;
    }
    const {initialMessage, suggestedPrompts} =
      SUGGESTED_PROMPTS_FOR_SELECTION[selectedOption];

    return (
      <div className={style.practicePage}>
        <AiDiffChat
          lessonId={lessonId}
          lessonName={lessonName}
          unitDisplayName={unitDisplayName}
          initialChatMessage={initialMessage}
          suggestedPrompts={suggestedPrompts}
          disableEndButtons={true}
        />
        {continueAndSkipButtons(WelcomeStates.end_page)}
      </div>
    );
  }, [
    selectedOption,
    lessonId,
    lessonName,
    unitDisplayName,
    continueAndSkipButtons,
  ]);

  const currentWelcomePage = React.useMemo(() => {
    switch (currentWelcomeState) {
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
