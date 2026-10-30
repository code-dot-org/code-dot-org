import Checkbox from '@code-dot-org/component-library/checkbox';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import TextField from '@code-dot-org/component-library/textField';
import {Typography} from '@mui/material';
import React from 'react';

import i18n from '@cdo/locale';

import {
  TEACHER_GOAL_PROMPT,
  SUPPORT_PREFERENCES_PROMPT,
} from './personalizationQuestion/personalizationQuestions';

import style from './../personalization-information.module.scss';

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
      <Typography className={style.bodyText} variant="body1" gutterBottom>
        {i18n.yearsTeaching()}
      </Typography>
      <input
        type="number"
        name="years-teaching"
        className={style.answer}
        value={yearsTeaching > 0 ? yearsTeaching : ''}
        onChange={handleChange}
      />
      <Typography className={style.bodyText} variant="body1" gutterBottom>
        {i18n.years()}
      </Typography>
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
    <div className={style.classroomVisionArea}>
      <Typography variant="strong">
        {i18n.idealClassroomDescription()}
      </Typography>
      <textarea
        name="classroom-vision"
        value={classroomVision}
        onChange={handleChange}
        className={style.freeResponseBox}
        rows={4}
      />
      {i18n.idealClassroomHelperText()}
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
      <Typography variant="strong">{i18n.describeYourChallenge()}</Typography>
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
  const handleChange = (value: string) => {
    setSelectedConfidence(parseInt(value));
  };

  // Create buttons array for SegmentedButtons
  const confidenceButtons = Array.from({length: 11}, (_, index) => ({
    label: index.toString(),
    value: index.toString(),
    id: `confidence-${index}`,
  }));

  return (
    <div>
      <div className={style.confidenceButtons}>
        <SegmentedButtons
          buttons={confidenceButtons}
          selectedButtonValue={selectedConfidence.toString()}
          onChange={handleChange}
          type="withLabel"
          size="m"
          color="primary"
        />
      </div>
      <div className={style.confidenceContinuum}>
        <Typography variant="body3" gutterBottom>
          {i18n.confidenceLow()}
        </Typography>
        <Typography variant="body3" gutterBottom>
          {i18n.confidenceHigh()}
        </Typography>
      </div>
    </div>
  );
};

interface GoalsAnswerProps {
  selectedGoals: string[];
  setSelectedGoals: (goals: string[]) => void;
  otherGoalText: string;
  setOtherGoalText: (text: string) => void;
}

export const GoalsAnswer: React.FC<GoalsAnswerProps> = ({
  selectedGoals,
  setSelectedGoals,
  otherGoalText,
  setOtherGoalText,
}) => {
  const handleGoalToggle = (choice: string) => {
    if (selectedGoals.includes(choice)) {
      setSelectedGoals(selectedGoals.filter(goal => goal !== choice));
    } else {
      setSelectedGoals([...selectedGoals, choice]);
    }
  };

  const handleOtherTextChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOtherGoalText(event.target.value);
  };

  const isOtherSelected = selectedGoals.includes('Other');

  return (
    <div className={style.multiSelectContainer}>
      {TEACHER_GOAL_PROMPT.choices?.map((choice, index) => (
        <Checkbox
          key={index}
          label={choice}
          checked={selectedGoals.includes(choice)}
          onChange={() => handleGoalToggle(choice)}
          name={`goal-${index}`}
        />
      ))}

      {isOtherSelected && (
        <div className={style.otherTextFieldContainer}>
          <TextField
            size="m"
            name="other-goal-text"
            label={i18n.describeYourGoal()}
            placeholder="Please describe your other goal..."
            onChange={handleOtherTextChange}
            value={otherGoalText}
            inputType="text"
            className={style.otherTextField}
          />
        </div>
      )}
    </div>
  );
};

interface SupportAnswerProps {
  selectedSupports: string[];
  setSelectedSupports: (supports: string[]) => void;
  otherSupportText: string;
  setOtherSupportText: (text: string) => void;
}

export const SupportAnswer: React.FC<SupportAnswerProps> = ({
  selectedSupports,
  setSelectedSupports,
  otherSupportText,
  setOtherSupportText,
}) => {
  const handleSupportToggle = (choice: string) => {
    if (selectedSupports.includes(choice)) {
      setSelectedSupports(
        selectedSupports.filter(support => support !== choice)
      );
    } else {
      setSelectedSupports([...selectedSupports, choice]);
    }
  };

  const handleOtherTextChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOtherSupportText(event.target.value);
  };

  const isOtherSelected = selectedSupports.includes('Other');

  return (
    <div className={style.multiSelectContainer}>
      {SUPPORT_PREFERENCES_PROMPT.choices?.map((choice, index) => (
        <Checkbox
          key={index}
          label={choice}
          checked={selectedSupports.includes(choice)}
          onChange={() => handleSupportToggle(choice)}
          name={`support-${index}`}
        />
      ))}

      {/* Show text area when "Other" is selected */}
      {isOtherSelected && (
        <div className={style.otherTextFieldContainer}>
          <TextField
            size="m"
            name="other-support-text"
            onChange={handleOtherTextChange}
            value={otherSupportText}
            inputType="text"
            label={i18n.describeYourAdditionalSupport()}
            className={style.otherTextField}
          />
        </div>
      )}
    </div>
  );
};
