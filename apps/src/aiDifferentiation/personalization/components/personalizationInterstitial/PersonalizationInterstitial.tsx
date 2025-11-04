import Typography from '@mui/material/Typography';
import React from 'react';

import {PersonalizationQuestionType} from '../personalizationQuestion/personalizationQuestions';

import style from '../../personalization-information.module.scss';

type PersonalizationInterstitialsProps = {
  currentQuestion: PersonalizationQuestionType;
};

const PersonalizationInterstitial: React.FC<
  PersonalizationInterstitialsProps
> = ({currentQuestion}) => {
  return (
    <div className={style.personalizationInterstitial}>
      <Typography variant="h5">{currentQuestion.question}</Typography>
    </div>
  );
};

export default PersonalizationInterstitial;
