import {Typography} from '@mui/material';
import React from 'react';

import {PERSONALIZATION_PROMPTS} from './personalizationQuestions';

import style from './../../personalization-information.module.scss';

interface PersonalizationQuestionProps {
  questionNumber: number;
}

const PersonalizationQuestion: React.FC<PersonalizationQuestionProps> = ({
  questionNumber,
}) => {
  const prompt = PERSONALIZATION_PROMPTS[questionNumber];

  return (
    <div className={style.questionContainer}>
      <Typography variant="h3" gutterBottom>
        {prompt.question}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {prompt.subhead}
      </Typography>
    </div>
  );
};

export default PersonalizationQuestion;
