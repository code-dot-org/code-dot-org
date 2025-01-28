import React from 'react';

import style from './ai-differentiation.module.scss';

type WelcomeState = 'select_option' | 'practice' | 'end_page' | 'finished';

const WelcomeStates = {
  select_option: 'select_option',
  practice: 'practice',
  end_page: 'end_page',
  finished: 'finished',
};

interface AiDiffWelcomeProps {}

const AiDiffWelcome: React.FC<AiDiffWelcomeProps> = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentWelcomeState, setCurrentWelcomeState] =
    React.useState<WelcomeState>('select_option');

  const currentWelcomePage = React.useMemo(() => {
    switch (currentWelcomeState) {
      case WelcomeStates.select_option:
        return <div className={style.fabBackground}>Select an option</div>;
      case WelcomeStates.practice:
        return <div className={style.fabBackground}>Practice</div>;
      case WelcomeStates.end_page:
        return <div className={style.fabBackground}>End Page</div>;
      case WelcomeStates.finished:
      default:
        return <div className={style.fabBackground}>Finished</div>;
    }
  }, [currentWelcomeState]);

  return currentWelcomePage;
};

export default AiDiffWelcome;
