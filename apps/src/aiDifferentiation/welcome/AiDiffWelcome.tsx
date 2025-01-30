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

import style from './ai-diff-welcome.module.scss';
import aiDiffStyle from '../ai-differentiation.module.scss';

type WelcomeState = 'select_option' | 'practice' | 'end_page' | 'finished';

const WelcomeStates: {[key in WelcomeState]: WelcomeState} = {
  select_option: 'select_option',
  practice: 'practice',
  end_page: 'end_page',
  finished: 'finished',
};

interface AiDiffWelcomeProps {
  setShowWelcomeExperience: (show: boolean) => void;
}

const AiDiffWelcome: React.FC<AiDiffWelcomeProps> = ({
  setShowWelcomeExperience,
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

  const selectAnOptionPage = React.useCallback(() => {
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
        <div className={style.bottomButtons}>
          <Button
            onClick={() => setCurrentWelcomeState(WelcomeStates.finished)}
            text="Skip"
            className={style.skipButton}
            color="gray"
            type="secondary"
          />
          <Button
            onClick={() => setCurrentWelcomeState(WelcomeStates.practice)}
            text="Continue"
            className={style.continueButton}
            disabled={!selectedOption}
          />
        </div>
      </div>
    );
  }, [optionButton, selectedOption]);

  const currentWelcomePage = React.useMemo(() => {
    switch (currentWelcomeState) {
      case WelcomeStates.select_option:
        return selectAnOptionPage();
      case WelcomeStates.practice:
        return <div>Practice</div>;
      case WelcomeStates.end_page:
        return <div>End Page</div>;
      case WelcomeStates.finished:
      default:
        return <div>Finished</div>;
    }
  }, [currentWelcomeState, selectAnOptionPage]);

  return <div className={aiDiffStyle.fabBackground}>{currentWelcomePage}</div>;
};

export default AiDiffWelcome;
