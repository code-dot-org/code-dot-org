import React from 'react';

import {Button} from '../componentLibrary/button';
import {Heading3, Heading6} from '../componentLibrary/typography';

import style from './ai-differentiation.module.scss';

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

  const selectAnOptionPage = React.useCallback(() => {
    return (
      <div className={style.selectOption}>
        <div className={style.selectOptionPage}>
          <Heading3>Pick a skill to practice</Heading3>
          <Heading6 className={style.selectOptionSubtitle}>
            Using AI in multiple ways increases productivity.
          </Heading6>
          <span>Plan</span>
          <span>Create</span>
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
          />
        </div>
      </div>
    );
  }, []);

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

  return <div className={style.fabBackground}>{currentWelcomePage}</div>;
};

export default AiDiffWelcome;
