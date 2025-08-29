import Button from '@code-dot-org/component-library/button';
import React from 'react';

import i18n from '@cdo/locale';

import PersonalizationQuestion from './PersonalizationQuestion';
import {PERSONALIZATION_PROMPTS} from './personalizationQuestions';

import style from './personalization-information.module.scss';

const PersonalizationCollectorContainer: React.FC = () => {
  const [questionsNumber, setQuestionsNumber] = React.useState(0);

  const NEXT = 1;
  const BACK = -1;

  const onCarouselPress = (direction: number) => {
    if (
      (direction === BACK && questionsNumber === 0) ||
      (direction === NEXT &&
        questionsNumber === PERSONALIZATION_PROMPTS.length - 1)
    ) {
      return;
    }
    setQuestionsNumber(questionsNumber + direction);
  };

  return (
    <div className={style.carouselContainer}>
      <PersonalizationQuestion questionNumber={questionsNumber} />

      <div className={style.navigationButtons}>
        <Button
          id={'back-button'}
          text={i18n.back()}
          type="secondary"
          color="gray"
          size="m"
          onClick={() => onCarouselPress(BACK)}
          iconLeft={{iconName: 'angle-left'}}
        />
        <Button
          id={'next-button'}
          text={i18n.next()}
          type="primary"
          size="m"
          onClick={() => onCarouselPress(NEXT)}
          iconRight={{iconName: 'angle-right'}}
        />
      </div>
    </div>
  );
};

export default PersonalizationCollectorContainer;
