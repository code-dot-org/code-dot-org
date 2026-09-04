import React, {useState} from 'react';

import {getAppOptionsIsBuildingQuizQuestions} from '@cdo/apps/lab2/projects/utils';
import {LabProps, LevelProperties} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';

import QuizConfigurationPanel, {
  QuizConfigurationData,
} from './builder/QuizConfigurationPanel';

import styles from './quiz-view.module.scss';

interface QuizLevelProperties extends LevelProperties {
  unitId?: number;
  displayName?: string;
  customIntroText?: string;
  timeLimitMinutes?: number;
  // boolean setting arrives as the literal string "true"/"false", see toBool below.
  showCorrectness?: boolean | string;
  revealAnswerExplanation?: boolean | string;
  showIntroScreen?: boolean | string;
  purpose?: string;
  allowMultipleAttempts?: boolean | string;
}

const toBool = (value: boolean | string | undefined) =>
  value === true || value === 'true';

const Quiz: React.FunctionComponent<LabProps> = ({levelProperties}) => {
  const {
    id: levelId,
    displayName: initialDisplayName,
    customIntroText: initialCustomIntroText,
    timeLimitMinutes: initialTimeLimitMinutes,
    showCorrectness: initialShowCorrectness,
    revealAnswerExplanation: initialRevealAnswerExplanation,
    showIntroScreen: initialShowIntroScreen,
    purpose: initialPurpose,
    allowMultipleAttempts: initialAllowMultipleAttempts,
  } = levelProperties as QuizLevelProperties;

  const [quizConfig, setQuizConfig] = useState<QuizConfigurationData>({
    displayName: initialDisplayName,
    customIntroText: initialCustomIntroText,
    timeLimitMinutes: initialTimeLimitMinutes,
    showCorrectness: toBool(initialShowCorrectness),
    revealAnswerExplanation: toBool(initialRevealAnswerExplanation),
    showIntroScreen: toBool(initialShowIntroScreen),
    purpose: initialPurpose,
    allowMultipleAttempts: toBool(initialAllowMultipleAttempts),
  });

  const isBuilderMode = !!getAppOptionsIsBuildingQuizQuestions();

  if (!isBuilderMode) {
    return <div>This is a Quiz level.</div>;
  }

  return (
    <div className={styles.quiz}>
      <div className={styles.resourcePanel}>
        <ResourcePanel
          levelProperties={levelProperties}
          isRunning={false}
          hasRun={false}
          hasEdited={false}
          hideAllNavigation
          configurationContent={
            <QuizConfigurationPanel
              quizId={levelId}
              initialValues={quizConfig}
              onSaved={setQuizConfig}
            />
          }
        />
      </div>
      <div className={styles.divider} />
      <div className={styles.content}>Quiz builder workspace placeholder</div>
    </div>
  );
};

export default Quiz;
