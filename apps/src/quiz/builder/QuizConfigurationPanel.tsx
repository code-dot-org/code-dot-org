import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import Toggle from '@code-dot-org/component-library/toggle';
import {Alert, Tooltip} from '@mui/material';
import React, {useEffect, useId, useState} from 'react';

import {INTRO_SCREEN_LOCKED_REASON} from './constants';
import {configError, timeLimitError} from './quizConfig';
import {QuizConfigurationData} from './types';

import styles from './quiz-configuration-panel.module.scss';

const PURPOSE_OPTIONS = [
  {
    value: 'check_for_understanding',
    text: 'Check for understanding',
    chooserDescription: 'A quick signal check during a lesson.',
  },
  {
    value: 'practice',
    text: 'Practice',
    chooserDescription: 'For building skill on the content.',
  },
  {
    value: 'exam',
    text: 'Exam',
    chooserDescription: 'A formal assessment of learning.',
  },
  {
    value: 'exam_simulation',
    text: 'Exam simulation',
    chooserDescription: 'Cert-style timed exam practice.',
  },
];

interface QuizConfigurableFields {
  showIntroScreen: boolean;
  timeLimitMinutes: number | null;
  allowMultipleAttempts: boolean;
  showCorrectness: boolean;
  revealAnswerExplanation: boolean;
  showQuestionsAfterSubmit: boolean;
}

// Applied once, only when a purpose is chosen for the first time.
const PURPOSE_DEFAULTS: Record<string, QuizConfigurableFields> = {
  check_for_understanding: {
    showIntroScreen: false,
    timeLimitMinutes: null,
    allowMultipleAttempts: true,
    showCorrectness: true,
    revealAnswerExplanation: true,
    showQuestionsAfterSubmit: true,
  },
  practice: {
    showIntroScreen: false,
    timeLimitMinutes: null,
    allowMultipleAttempts: true,
    showCorrectness: true,
    revealAnswerExplanation: true,
    showQuestionsAfterSubmit: true,
  },
  exam: {
    showIntroScreen: true,
    timeLimitMinutes: null,
    allowMultipleAttempts: false,
    showCorrectness: false,
    revealAnswerExplanation: false,
    showQuestionsAfterSubmit: false,
  },
  exam_simulation: {
    showIntroScreen: true,
    timeLimitMinutes: null,
    allowMultipleAttempts: true,
    showCorrectness: true,
    revealAnswerExplanation: false,
    showQuestionsAfterSubmit: false,
  },
};

const ConfigCard: React.FunctionComponent<{
  label: string;
  children: React.ReactNode;
}> = ({label, children}) => (
  <fieldset className={styles.configCard}>
    <legend className={styles.configCardHeader}>{label}</legend>
    <div className={styles.configCardContent}>{children}</div>
  </fieldset>
);

interface QuizConfigurationPanelProps {
  // The configuration as edited so far, saved with Save quiz.
  values: QuizConfigurationData;
  onChange: (fields: Partial<QuizConfigurationData>) => void;
}

const QuizConfigurationPanel: React.FunctionComponent<
  QuizConfigurationPanelProps
> = ({values, onChange}) => {
  // Kept as text while editing so the field can be empty (no time limit)
  // rather than snapping to 0.
  const [timeLimitText, setTimeLimitText] = useState(
    values.timeLimitMinutes?.toString() ?? ''
  );
  // Picking a purpose can also set the time limit.
  useEffect(() => {
    const typed = timeLimitText === '' ? undefined : Number(timeLimitText);
    if (!Object.is(typed, values.timeLimitMinutes ?? undefined)) {
      setTimeLimitText(values.timeLimitMinutes?.toString() ?? '');
    }
    // Only an outside change to the value should replace the text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.timeLimitMinutes]);
  const {
    purpose,
    showIntroScreen,
    allowMultipleAttempts,
    showCorrectness,
    revealAnswerExplanation,
    showQuestionsAfterSubmit,
  } = values;
  // A timed quiz needs its intro screen.
  const isIntroScreenLocked =
    values.timeLimitMinutes !== undefined &&
    values.timeLimitMinutes !== null &&
    showIntroScreen;
  const introScreenLockedMessageId = useId();
  const error = configError(values);
  const fieldTimeLimitError = timeLimitError(values);

  const handleChoosePurpose = (purposeValue: string) => {
    const {timeLimitMinutes, ...defaults} = PURPOSE_DEFAULTS[purposeValue];
    onChange({
      purpose: purposeValue,
      ...defaults,
      timeLimitMinutes: timeLimitMinutes ?? undefined,
    });
  };

  // A timed quiz needs its intro screen, so setting a time limit turns it on.
  const handleTimeLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setTimeLimitText(text);
    onChange(
      text === ''
        ? {timeLimitMinutes: undefined}
        : {timeLimitMinutes: Number(text), showIntroScreen: true}
    );
  };

  // Turning either off hides the answer and explanation, so it's turned off.
  const handleShowCorrectnessChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    onChange({
      showCorrectness: checked,
      ...(!checked && {revealAnswerExplanation: false}),
    });
  };

  const handleShowQuestionsAfterSubmitChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    onChange({
      showQuestionsAfterSubmit: checked,
      ...(!checked && {revealAnswerExplanation: false}),
    });
  };

  return (
    <div className={styles.panel}>
      {error && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}

      {!purpose && (
        <div className={styles.chooserSection}>
          <div className={styles.chooserHeader}>
            <p className={styles.chooserTitle}>What is this quiz for?</p>
            <p className={styles.chooserSubtitle}>
              Applies typical settings (you can change these).
            </p>
          </div>
          <div className={styles.optionsList}>
            {PURPOSE_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                className={styles.optionCard}
                onClick={() => handleChoosePurpose(option.value)}
              >
                <span className={styles.optionName}>{option.text}</span>
                <span className={styles.optionDescription}>
                  {option.chooserDescription}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {purpose && (
        <>
          <div className={styles.section}>
            <SimpleDropdown
              name="purpose"
              size="s"
              color="gray"
              labelText="Purpose"
              items={PURPOSE_OPTIONS}
              selectedValue={purpose}
              onChange={e => onChange({purpose: e.target.value})}
              styleAsFormField
              className={styles.fullWidthDropdown}
            />
          </div>
          <ConfigCard label="content">
            <div className={styles.cardRow}>
              <TextField
                label="Quiz display name"
                name="displayName"
                size="s"
                inputType="text"
                color="gray"
                className={styles.fullWidthField}
                helperMessage="Leave unset to use level name as quiz title"
                value={values.displayName ?? ''}
                onChange={e => onChange({displayName: e.target.value})}
              />
            </div>
            <div className={styles.cardRow}>
              <div className={styles.toggleWithHelper}>
                <Tooltip
                  title={isIntroScreenLocked ? INTRO_SCREEN_LOCKED_REASON : ''}
                  placement="top-end"
                >
                  <div className={styles.toggleRow}>
                    <span className={styles.toggleLabel}>
                      Show intro screen
                    </span>
                    <Toggle
                      name="showIntroScreen"
                      aria-label="Show intro screen"
                      size="s"
                      disabled={isIntroScreenLocked}
                      aria-describedby={
                        isIntroScreenLocked
                          ? introScreenLockedMessageId
                          : undefined
                      }
                      checked={showIntroScreen}
                      onChange={e =>
                        onChange({showIntroScreen: e.target.checked})
                      }
                    />
                  </div>
                </Tooltip>
                {/* A disabled toggle can't take focus, so the tooltip is mouse-only. */}
                {isIntroScreenLocked && (
                  <span
                    id={introScreenLockedMessageId}
                    className={styles.visuallyHidden}
                  >
                    {INTRO_SCREEN_LOCKED_REASON}
                  </span>
                )}
                <p className={styles.cardHelperText}>
                  Edit intro screen contents in the workspace
                </p>
              </div>
            </div>
          </ConfigCard>
          <ConfigCard label="rules">
            <div className={styles.cardRow}>
              <TextField
                label="Set time limit"
                name="timeLimitMinutes"
                inputType="number"
                min={1}
                step={1}
                size="s"
                color="gray"
                className={styles.fullWidthField}
                placeholder="minutes"
                helperMessage="Leave unset for no time limit"
                errorMessage={fieldTimeLimitError ?? undefined}
                value={timeLimitText}
                onChange={handleTimeLimitChange}
              />
            </div>
            <div className={styles.cardRow}>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>
                  Allow multiple attempts
                </span>
                <Toggle
                  name="allowMultipleAttempts"
                  aria-label="Allow multiple attempts"
                  size="s"
                  checked={allowMultipleAttempts}
                  onChange={e =>
                    onChange({allowMultipleAttempts: e.target.checked})
                  }
                />
              </div>
            </div>
          </ConfigCard>
          <ConfigCard label="feedback">
            <div className={styles.cardRow}>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>
                  Show questions after submit
                </span>
                <Toggle
                  name="showQuestionsAfterSubmit"
                  aria-label="Show questions after submit"
                  size="s"
                  checked={showQuestionsAfterSubmit}
                  onChange={handleShowQuestionsAfterSubmitChange}
                />
              </div>
            </div>
            <div className={styles.cardRow}>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Show correctness</span>
                <Toggle
                  name="showCorrectness"
                  aria-label="Show correctness"
                  size="s"
                  checked={showCorrectness}
                  onChange={handleShowCorrectnessChange}
                />
              </div>
              {showCorrectness && showQuestionsAfterSubmit && (
                <div className={styles.conditionalWrap}>
                  <div className={styles.toggleRow}>
                    <span className={styles.toggleLabel}>
                      Reveal answer and explanation
                    </span>
                    <Toggle
                      name="revealAnswerExplanation"
                      aria-label="Reveal answer and explanation"
                      size="s"
                      checked={revealAnswerExplanation}
                      onChange={e =>
                        onChange({revealAnswerExplanation: e.target.checked})
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </ConfigCard>
        </>
      )}
    </div>
  );
};

export default QuizConfigurationPanel;
