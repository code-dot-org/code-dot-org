import Button, {buttonColors} from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import TextField from '@code-dot-org/component-library/textField';
import {
  StrongText,
  BodyOneText,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {
  TEACHER_GOAL_PROMPT,
  SUPPORT_PREFERENCES_PROMPT,
} from './personalizationQuestions';

import style from './personalization-information.module.scss';

interface NumberOfYearsTeachingAnswerProps {
  yearsTeaching: number;
  setYearsTeaching: (years: number) => void;
}

export const NumberOfYearsTeachingAnswer: React.FC<
  NumberOfYearsTeachingAnswerProps
> = ({yearsTeaching, setYearsTeaching}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value) || 0;
    setYearsTeaching(value);
  };

  return (
    <div className={style.numberOfYearsArea}>
      <BodyOneText className={style.bodyText}>
        I've been teaching for
      </BodyOneText>
      <input
        type="number"
        name="years-teaching"
        className={style.answer}
        value={yearsTeaching > 0 ? yearsTeaching : ''}
        onChange={handleChange}
      />
      <BodyOneText className={style.bodyText}>years!</BodyOneText>
    </div>
  );
};

interface ClassroomVisionAnswerProps {
  classroomVision: string;
  setClassroomVision: (vision: string) => void;
}

export const ClassroomVisionAnswer: React.FC<ClassroomVisionAnswerProps> = ({
  classroomVision,
  setClassroomVision,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setClassroomVision(event.target.value);
  };

  return (
    <div>
      <StrongText>Describe your ideal classroom environment:</StrongText>
      <textarea
        name="classroom-vision"
        value={classroomVision}
        onChange={handleChange}
        className={style.freeResponseBox}
        rows={4}
      />
      For example, you could say, "A collaborative learning community" or "A
      creative, engaging space"
    </div>
  );
};

interface ChallengeAnswerProps {
  challenge: string;
  setChallenge: (challenge: string) => void;
}

export const ChallengeAnswer: React.FC<ChallengeAnswerProps> = ({
  challenge,
  setChallenge,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChallenge(event.target.value);
  };

  return (
    <div>
      <StrongText>Describe your challenge</StrongText>
      <textarea
        name="classroom-challenge"
        value={challenge}
        onChange={handleChange}
        className={style.freeResponseBox}
        rows={4}
      />
    </div>
  );
};

interface ConfidenceAnswerProps {
  selectedConfidence: number;
  setSelectedConfidence: (confidence: number) => void;
}

export const ConfidenceAnswer: React.FC<ConfidenceAnswerProps> = ({
  selectedConfidence,
  setSelectedConfidence,
}) => {
  const handleButtonClick = (index: number) => {
    setSelectedConfidence(index);
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
};

interface GoalsAnswerProps {
  selectedGoals: number[];
  setSelectedGoals: (goals: number[]) => void;
  otherGoalText: string;
  setOtherGoalText: (text: string) => void;
}

export const GoalsAnswer: React.FC<GoalsAnswerProps> = ({
  selectedGoals,
  setSelectedGoals,
  otherGoalText,
  setOtherGoalText,
}) => {
  const handleGoalToggle = (index: number) => {
    if (selectedGoals.includes(index)) {
      setSelectedGoals(selectedGoals.filter(i => i !== index));
    } else {
      setSelectedGoals([...selectedGoals, index]);
    }
  };

  const handleOtherTextChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOtherGoalText(event.target.value);
  };

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
};

interface SupportAnswerProps {
  selectedSupports: number[];
  setSelectedSupports: (supports: number[]) => void;
  otherSupportText: string;
  setOtherSupportText: (text: string) => void;
}

export const SupportAnswer: React.FC<SupportAnswerProps> = ({
  selectedSupports,
  setSelectedSupports,
  otherSupportText,
  setOtherSupportText,
}) => {
  const handleSupportToggle = (index: number) => {
    if (selectedSupports.includes(index)) {
      setSelectedSupports(selectedSupports.filter(i => i !== index));
    } else {
      setSelectedSupports([...selectedSupports, index]);
    }
  };

  const handleOtherTextChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOtherSupportText(event.target.value);
  };

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
};
