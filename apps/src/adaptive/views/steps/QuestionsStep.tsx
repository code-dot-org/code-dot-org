import React, {useMemo} from 'react';

import {SwappableQuizAttemptWorkspace} from '@cdo/apps/quiz/attempt/QuizAttemptWorkspace';
import {QuizAttemptData} from '@cdo/apps/quiz/attempt/types';

import {useLocalAttemptSource} from '../../progress/localAttemptSource';
import {
  MultipleChoiceQuestion,
  QuestionsStep as QuestionsStepContent,
} from '../../types';

import styles from './stepPlayer.module.scss';

interface QuestionsStepProps {
  step: QuestionsStepContent;
  attempts: QuizAttemptData[];
  onSaveAttempts: (attempts: QuizAttemptData[]) => void;
  continueLabel: string;
  onComplete: () => void;
}

const QuestionsStep: React.FunctionComponent<QuestionsStepProps> = ({
  step,
  attempts,
  onSaveAttempts,
  continueLabel,
  onComplete,
}) => {
  const attemptSource = useLocalAttemptSource(step, attempts, onSaveAttempts);
  const quizQuestions = useMemo(
    () =>
      step.questions.filter(
        (q): q is MultipleChoiceQuestion => q.type === 'MultipleChoiceQuestion'
      ),
    [step.questions]
  );

  return (
    <div className={styles.questionsStep}>
      <SwappableQuizAttemptWorkspace
        levelName={step.title}
        quizQuestions={quizQuestions}
        displayName={step.title}
        customIntroText={step.description}
        showIntroScreen={step.showIntroScreen}
        showCorrectness={step.showCorrectness}
        allowMultipleAttempts={step.allowMultipleAttempts}
        attemptSource={attemptSource}
        onNextLevel={onComplete}
        nextLevelLabel={continueLabel}
      />
    </div>
  );
};

export default QuestionsStep;
