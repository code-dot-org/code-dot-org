import classNames from 'classnames';
import React from 'react';

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

type WelcomeState = 'select_option' | 'practice' | 'end_page' | 'finished';

const WelcomeStates: {[key in WelcomeState]: WelcomeState} = {
  select_option: 'select_option',
  practice: 'practice',
  end_page: 'end_page',
  finished: 'finished',
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

const AiDiffWelcome: React.FC<AiDiffWelcomeProps> = ({
  setShowWelcomeExperience,
  lessonId,
  lessonName,
  unitDisplayName,
}) => {
  const [currentWelcomeState, setCurrentWelcomeState] =
    React.useState<WelcomeState>('select_option');

  React.useEffect(() => {
    if (currentWelcomeState === WelcomeStates.finished) {
      setShowWelcomeExperience(false);
    }
  }, [currentWelcomeState, setShowWelcomeExperience]);

  const [selectedOption, setSelectedOption] = React.useState<
    'plan' | 'create' | null
  >(null);

  const optionButton = React.useCallback(
    (
      selectionKey: 'plan' | 'create' | null,
      iconName: string,
      title: string,
      description: string
    ) => {
      return (
        <button
          className={classNames(
            style.optionRow,
            selectionKey === selectedOption && style.selectedOption
          )}
          onClick={() => setSelectedOption(selectionKey)}
          type="button"
        >
          <FontAwesomeV6Icon
            iconName={iconName}
            iconFamily="duotone"
            className={style.optionIcon}
          />
          <div className={style.optionText}>
            <BodyTwoText>
              <StrongText>{title}</StrongText>
            </BodyTwoText>
            <BodyThreeText>{description}</BodyThreeText>
          </div>
        </button>
      );
    },
    [selectedOption]
  );

  const continueAndSkipButtons = React.useCallback(
    (nextState: WelcomeState) => {
      return (
        <div className={style.bottomButtons}>
          <Button
            onClick={() => setCurrentWelcomeState(WelcomeStates.finished)}
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
    [selectedOption]
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
              'plan',
              'folder-tree',
              'Plan',
              'Locate resources, brainstorm teaching strategies, ask questions about the curriculum, recommend a course'
            )}
            {optionButton(
              'create',
              'file-pen',
              'Create',
              'Differentiate assessment materials, generate lesson-aligned activities and practice problems'
            )}
          </div>
          {continueAndSkipButtons(nextState)}
        </div>
      );
    },
    [optionButton, continueAndSkipButtons]
  );

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
        return <div>End Page</div>;
      case WelcomeStates.finished:
      default:
        return <div>Finished</div>;
    }
  }, [currentWelcomeState, selectAnOptionPage, practicePage]);

  return currentWelcomePage;
};

export default AiDiffWelcome;
