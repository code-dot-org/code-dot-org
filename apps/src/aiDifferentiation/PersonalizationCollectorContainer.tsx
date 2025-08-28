import Button from '@code-dot-org/component-library/button';
import React from 'react';

import i18n from '@cdo/locale';

import PersonalizationQuestion from './PersonalizationQuestion';
import {PERSONALIZATION_PROMPTS} from './personalizationQuestions';

import style from './personalization-information.module.scss';

const PersonalizationCollectorContainer: React.FC = () => {
  const [questionsNumber, setQuestionsNumber] = React.useState(0);

  const onCarouselPress = (direction: -1 | 1) => {
    if (
      (direction === -1 && questionsNumber === 0) ||
      (direction === 1 &&
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
          onClick={() => onCarouselPress(-1)}
          iconLeft={{iconName: 'angle-left'}}
        />
        <Button
          id={'next-button'}
          text={i18n.next()}
          type="primary"
          size="m"
          onClick={() => onCarouselPress(1)}
          iconRight={{iconName: 'angle-right'}}
        />
      </div>
    </div>
  );
};

export default PersonalizationCollectorContainer;
