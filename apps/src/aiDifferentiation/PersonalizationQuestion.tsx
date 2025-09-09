import {
  BodyTwoText,
  Heading3,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {PERSONALIZATION_PROMPTS} from './personalizationQuestions';

import style from './personalization-information.module.scss';

interface PersonalizationQuestionProps {
  questionNumber: number;
}

const PersonalizationQuestion: React.FC<PersonalizationQuestionProps> = ({
  questionNumber,
}) => {
  const prompt = PERSONALIZATION_PROMPTS[questionNumber];

  return (
    <div className={style.questionContainer}>
      <Heading3>{prompt.question}</Heading3>
      <BodyTwoText>{prompt.subhead}</BodyTwoText>
    </div>
  );
};

export default PersonalizationQuestion;
