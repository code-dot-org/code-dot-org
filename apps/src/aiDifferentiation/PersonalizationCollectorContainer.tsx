import Button from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import TextField from '@code-dot-org/component-library/textField';
import {StrongText} from '@code-dot-org/component-library/typography';
import React from 'react';

import i18n from '@cdo/locale';

import PersonalizationQuestion from './PersonalizationQuestion';
import {PERSONALIZATION_PROMPTS} from './personalizationQuestions';

import style from './personalization-information.module.scss';

const PersonalizationCollectorContainer: React.FC = () => {
  const [questionsNumber, setQuestionsNumber] = React.useState(0);
  const [selectedGoals, setSelectedGoals] = React.useState<number[]>([]);

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

  const numberOfYearsTeachingAnswer = React.useCallback(() => {
    return (
      <div>
        {' '}
        I've been teaching for{' '}
        <TextField
          size="m"
          name="years-teaching"
          onChange={() => {
            console.log('change'); // some sort of "save to object function needed"
          }}
          inputType="number"
        />
        years!
      </div>
    );
  }, []);

  const classroomVisionAnswer = React.useCallback(() => {
    return (
      <div>
        <StrongText>Describe your ideal classroom environment:</StrongText>
        <TextField
          size="m"
          name="classroom-vision"
          onChange={() => {
            console.log('change'); // some sort of "save to object function needed"
          }}
          inputType="text"
        />
        For example, you could say, “A collaborative learning community” or “A
        creative, engaging space”
      </div>
    );
  }, []);

  const challengeAnswer = React.useCallback(() => {
    return (
      <div>
        <StrongText>Describe your challenge</StrongText>
        <TextField
          size="m"
          name="classroom-vision"
          onChange={() => {
            console.log('change'); // some sort of "save to object function needed"
          }}
          inputType="text"
        />
      </div>
    );
  }, []);

  const confidenceAnswer = React.useCallback(() => {
    return (
      <div>
        <Button text="0" onClick={() => {}} />
        <Button text="1" onClick={() => {}} />
        <Button text="2" onClick={() => {}} />
      </div>
    );
  }, []);

  const goalsAnswer = React.useCallback(() => {
    const handleGoalToggle = (index: number) => {
      setSelectedGoals(prev => {
        if (prev.includes(index)) {
          // Remove the index if it's already selected
          return prev.filter(i => i !== index);
        } else {
          // Add the index if it's not selected
          return [...prev, index];
        }
      });
    };

    const goalPrompt = PERSONALIZATION_PROMPTS[2];

    return (
      <div>
        {goalPrompt.choices.map((choice, index) => (
          <Checkbox
            key={index}
            label={choice}
            checked={selectedGoals.includes(index)}
            onChange={() => handleGoalToggle(index)}
            name={`goal-${index}`}
          />
        ))}
        {/* Debug info - remove this later */}
        <div style={{marginTop: '10px', fontSize: '12px', color: '#666'}}>
          Selected goal indices: {selectedGoals.join(', ')}
        </div>
      </div>
    );
  }, [selectedGoals]);

  const determineAnswerType = React.useCallback(() => {
    const currentQuestion = PERSONALIZATION_PROMPTS[questionsNumber];
    switch (currentQuestion.order) {
      case 1:
        return numberOfYearsTeachingAnswer();
      case 2:
        return confidenceAnswer();
      case 3:
        return goalsAnswer();
      case 4:
        return classroomVisionAnswer();
      case 5:
        return <div>Support preferences answer options here</div>;
      case 6:
        return challengeAnswer();
      default:
        return <div>Error: question not found</div>;
    }
  }, [
    challengeAnswer,
    classroomVisionAnswer,
    confidenceAnswer,
    goalsAnswer,
    numberOfYearsTeachingAnswer,
    questionsNumber,
  ]);

  return (
    <div className={style.carouselContainer}>
      <PersonalizationQuestion questionNumber={questionsNumber} />
      {determineAnswerType()}

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
