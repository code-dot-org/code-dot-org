import Button, {buttonColors} from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import TextField from '@code-dot-org/component-library/textField';
import {
  StrongText,
  BodyOneText,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import i18n from '@cdo/locale';

import PersonalizationQuestion from './PersonalizationQuestion';
import {
  PERSONALIZATION_PROMPTS,
  TEACHER_GOAL_PROMPT,
  SUPPORT_PREFERENCES_PROMPT,
} from './personalizationQuestions';

import style from './personalization-information.module.scss';

const PersonalizationCollectorContainer: React.FC = () => {
  const [questionsNumber, setQuestionsNumber] = React.useState(0);
  const [selectedGoals, setSelectedGoals] = React.useState<number[]>([]);
  const [selectedSupports, setSelectedSupports] = React.useState<number[]>([]);
  const [otherSupportText, setOtherSupportText] = React.useState('');
  const [otherGoalText, setOtherGoalText] = React.useState('');
  const [selectedConfidence, setSelectedConfidence] =
    React.useState<number>(-1);

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
      <div className={style.numberOfYearsArea}>
        <BodyOneText className={style.bodyText}>
          I've been teaching for
        </BodyOneText>
        <input
          type="number"
          name="years-teaching"
          className={style.answer}
          onChange={() => {
            console.log('change'); // some sort of "save to object function needed"
          }}
        />
        <BodyOneText>years!</BodyOneText>
      </div>
    );
  }, []);

  const classroomVisionAnswer = React.useCallback(() => {
    return (
      <div>
        <StrongText>Describe your ideal classroom environment:</StrongText>
        <textarea
          name="classroom-vision"
          onChange={() => {
            console.log('change'); // some sort of "save to object function needed"
          }}
          className={style.freeResponseBox}
          rows={4}
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
        <textarea
          name="classroom-challenge"
          onChange={() => {
            console.log('change'); // some sort of "save to object function needed"
          }}
          className={style.freeResponseBox}
          rows={4}
        />
      </div>
    );
  }, []);

  const confidenceAnswer = React.useCallback(() => {
    const handleButtonClick = (index: number) => {
      setSelectedConfidence(index);
      console.log('Selected confidence:', index);
    };

    const determineColor = (index: number) => {
      if (selectedConfidence === index) {
        return buttonColors.purple;
      } else {
        return buttonColors.white;
      }
    };

    return (
      <div>
        <div className={style.confidenceButtons}>
          <Button
            type={'primary'}
            color={determineColor(0)}
            text="0"
            onClick={() => handleButtonClick(0)}
          />
          <Button
            type={'primary'}
            color={determineColor(1)}
            text="1"
            onClick={() => handleButtonClick(1)}
          />
          <Button
            type={'primary'}
            color={determineColor(2)}
            text="2"
            onClick={() => handleButtonClick(2)}
          />
          <Button
            type={'primary'}
            color={determineColor(3)}
            text="3"
            onClick={() => handleButtonClick(3)}
          />
          <Button
            type={'primary'}
            color={determineColor(4)}
            text="4"
            onClick={() => handleButtonClick(4)}
          />
          <Button
            type={'primary'}
            color={determineColor(5)}
            text="5"
            onClick={() => handleButtonClick(5)}
          />
          <Button
            type={'primary'}
            color={determineColor(6)}
            text="6"
            onClick={() => handleButtonClick(6)}
          />
          <Button
            type={'primary'}
            color={determineColor(7)}
            text="7"
            onClick={() => handleButtonClick(7)}
          />
          <Button
            type={'primary'}
            color={determineColor(8)}
            text="8"
            onClick={() => handleButtonClick(8)}
          />
          <Button
            type={'primary'}
            color={determineColor(9)}
            text="9"
            onClick={() => handleButtonClick(9)}
          />
          <Button
            type={'primary'}
            color={determineColor(10)}
            text="10"
            onClick={() => handleButtonClick(10)}
          />
        </div>
        <div className={style.confidenceContinuum}>
          <BodyThreeText>Not confident at all</BodyThreeText>
          <BodyThreeText>Extremely confident</BodyThreeText>
        </div>
      </div>
    );
  }, [selectedConfidence]);

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

    const handleOtherTextChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setOtherGoalText(event.target.value);
    };

    // Find the index of "Other" option
    const otherIndex = TEACHER_GOAL_PROMPT.choices.findIndex(
      choice => choice === 'Other'
    );
    const isOtherSelected = selectedGoals.includes(otherIndex);

    return (
      <div className={style.multiSelectContainer}>
        {TEACHER_GOAL_PROMPT.choices.map((choice, index) => (
          <Checkbox
            key={index}
            label={choice}
            checked={selectedGoals.includes(index)}
            onChange={() => handleGoalToggle(index)}
            name={`goal-${index}`}
          />
        ))}

        {isOtherSelected && (
          <div style={{marginTop: '10px'}}>
            <TextField
              size="m"
              name="other-goal-text"
              placeholder="Please describe your other goal..."
              onChange={handleOtherTextChange}
              value={otherGoalText}
              inputType="text"
            />
          </div>
        )}

        {/* Debug info - remove this later */}
        <div style={{marginTop: '10px', fontSize: '12px', color: '#666'}}>
          Selected goal indices: {selectedGoals.join(', ')}
        </div>
      </div>
    );
  }, [otherGoalText, selectedGoals]);

  const supportAnswer = React.useCallback(() => {
    const handleSupportToggle = (index: number) => {
      setSelectedSupports(prev => {
        if (prev.includes(index)) {
          // Remove the index if it's already selected
          return prev.filter(i => i !== index);
        } else {
          // Add the index if it's not selected
          return [...prev, index];
        }
      });
    };

    const handleOtherTextChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setOtherSupportText(event.target.value);
    };

    // Find the index of "Other" option
    const otherIndex = SUPPORT_PREFERENCES_PROMPT.choices.findIndex(
      choice => choice === 'Other'
    );
    const isOtherSelected = selectedSupports.includes(otherIndex);

    return (
      <div className={style.multiSelectContainer}>
        {SUPPORT_PREFERENCES_PROMPT.choices.map((choice, index) => (
          <Checkbox
            key={index}
            label={choice}
            checked={selectedSupports.includes(index)}
            onChange={() => handleSupportToggle(index)}
            name={`support-${index}`}
          />
        ))}

        {/* Show text area when "Other" is selected */}
        {isOtherSelected && (
          <div style={{marginTop: '10px'}}>
            <TextField
              size="m"
              name="other-support-text"
              placeholder="Please describe your other support preference..."
              onChange={handleOtherTextChange}
              value={otherSupportText}
              inputType="text"
            />
          </div>
        )}

        {/* Debug info - remove this later */}
        <div style={{marginTop: '10px', fontSize: '12px', color: '#666'}}>
          Selected support indices: {selectedSupports.join(', ')}
          {otherSupportText && <div>Other text: "{otherSupportText}"</div>}
        </div>
      </div>
    );
  }, [selectedSupports, otherSupportText]);

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
        return supportAnswer();
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
    supportAnswer,
  ]);

  return (
    <div className={style.carouselContainer}>
      <PersonalizationQuestion questionNumber={questionsNumber} />
      <div className={style.answerContainer}>{determineAnswerType()}</div>

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
