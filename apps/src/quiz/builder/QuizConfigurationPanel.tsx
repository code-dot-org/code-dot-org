import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import Toggle from '@code-dot-org/component-library/toggle';
import {Button as MuiButton, Typography} from '@mui/material';
import React, {useState} from 'react';

import HttpClient, {isNetworkError} from '@cdo/apps/util/HttpClient';

import styles from './quiz-configuration-panel.module.scss';

export interface QuizConfigurationData {
  displayName?: string;
  customIntroText?: string;
  timeLimitMinutes?: number;
  showCorrectness: boolean;
  revealAnswerExplanation: boolean;
  showIntroScreen: boolean;
  purpose?: string;
  allowMultipleAttempts: boolean;
}

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

const ConfigCard: React.FunctionComponent<{
  label: string;
  children: React.ReactNode;
}> = ({label, children}) => (
  <div className={styles.configCard}>
    <div className={styles.configCardHeader}>{label}</div>
    <div className={styles.configCardContent}>{children}</div>
  </div>
);

interface QuizConfigurationPanelProps {
  quizId: number;
  initialValues: QuizConfigurationData;
  // Called with the server's saved values on success, so a caller can sync
  // its own copy of the configuration without a page reload.
  onSaved: (updated: QuizConfigurationData) => void;
}

const QuizConfigurationPanel: React.FunctionComponent<
  QuizConfigurationPanelProps
> = ({quizId, initialValues, onSaved}) => {
  // Kept as a string while editing so the field can be genuinely empty
  // (no time limit) rather than snapping to 0 - converted to a number or
  // null on save.
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    initialValues.timeLimitMinutes?.toString() || ''
  );
  const [showCorrectness, setShowCorrectness] = useState(
    initialValues.showCorrectness
  );
  const [revealAnswerExplanation, setRevealAnswerExplanation] = useState(
    initialValues.revealAnswerExplanation
  );
  const [showIntroScreen, setShowIntroScreen] = useState(
    initialValues.showIntroScreen
  );
  const [purpose, setPurpose] = useState(initialValues.purpose || '');
  const [allowMultipleAttempts, setAllowMultipleAttempts] = useState(
    initialValues.allowMultipleAttempts
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    // Blank means "no time limit" - QuizConfigurationData needs a real
    // positive integer otherwise. Checked here too, not just server-side
    // (the Quiz model's time_limit_minutes validation), so a bad value
    // shows up immediately instead of after a round trip.
    const parsedTimeLimitMinutes =
      timeLimitMinutes === '' ? null : Number(timeLimitMinutes);
    if (
      parsedTimeLimitMinutes !== null &&
      (!Number.isInteger(parsedTimeLimitMinutes) || parsedTimeLimitMinutes <= 0)
    ) {
      setError(
        'Time limit must be a whole number of minutes greater than 0, or left blank for no limit.'
      );
      return;
    }
    // Mirrors show_intro_screen_required_when_time_limit - a time limit
    // with no intro screen means a student could start the timer without
    // ever being told there is one.
    if (parsedTimeLimitMinutes !== null && !showIntroScreen) {
      setError('Show intro screen is required when a time limit is set.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await HttpClient.put(
        `/levels/${quizId}/quiz_configuration`,
        JSON.stringify({
          timeLimitMinutes: parsedTimeLimitMinutes,
          showCorrectness,
          revealAnswerExplanation,
          showIntroScreen,
          purpose: purpose || null,
          allowMultipleAttempts,
        }),
        true,
        {'Content-Type': 'application/json'}
      );
      const saved: QuizConfigurationData = await response.json();
      onSaved(saved);
    } catch (error) {
      setError(await saveErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.panel}>
      {error && (
        <Typography variant="body3" color="error">
          {error}
        </Typography>
      )}

      {!purpose ? (
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
                onClick={() => setPurpose(option.value)}
              >
                <span className={styles.optionName}>{option.text}</span>
                <span className={styles.optionDescription}>
                  {option.chooserDescription}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.section}>
          <SimpleDropdown
            name="purpose"
            size="s"
            labelText="Purpose"
            items={PURPOSE_OPTIONS}
            selectedValue={purpose}
            onChange={e => setPurpose(e.target.value)}
            styleAsFormField
            className={styles.fullWidthDropdown}
          />
        </div>
      )}

      {purpose && (
        <>
          <ConfigCard label="content">
            <div className={styles.cardRow}>
              <Toggle
                name="showIntroScreen"
                label="Show intro screen"
                size="s"
                position="right"
                checked={showIntroScreen}
                onChange={e => setShowIntroScreen(e.target.checked)}
              />
            </div>
            <p className={styles.cardHelperText}>
              Edit intro screen contents in the workspace
            </p>
          </ConfigCard>

          <div className={styles.section}>
            <TextField
              label="Time limit (minutes, optional)"
              name="timeLimitMinutes"
              inputType="number"
              min={1}
              step={1}
              size="s"
              className={styles.fullWidthField}
              value={timeLimitMinutes}
              onChange={e => setTimeLimitMinutes(e.target.value)}
            />
          </div>

          <div className={styles.section}>
            <Checkbox
              name="showCorrectness"
              label="Show correctness"
              size="s"
              checked={showCorrectness}
              onChange={e => {
                setShowCorrectness(e.target.checked);
                // Mirrors reveal_answer_explanation_requires_show_correctness -
                // turning correctness off while explanation reveal is on would
                // otherwise be silently invalid until the next save attempt.
                if (!e.target.checked) {
                  setRevealAnswerExplanation(false);
                }
              }}
            />
          </div>

          <div className={styles.section}>
            <Checkbox
              name="revealAnswerExplanation"
              label="Reveal answer/explanations (requires Show correctness)"
              size="s"
              checked={revealAnswerExplanation}
              disabled={!showCorrectness}
              onChange={e => setRevealAnswerExplanation(e.target.checked)}
            />
          </div>

          <div className={styles.section}>
            <Checkbox
              name="allowMultipleAttempts"
              label="Allow multiple attempts"
              size="s"
              checked={allowMultipleAttempts}
              onChange={e => setAllowMultipleAttempts(e.target.checked)}
            />
          </div>

          <MuiButton
            variant="contained"
            color="primary"
            size="medium"
            type="button"
            loading={isSaving}
            disabled={isSaving}
            onClick={() => handleSave()}
          >
            Save
          </MuiButton>
        </>
      )}
    </div>
  );
};

async function saveErrorMessage(error: unknown): Promise<string> {
  if (isNetworkError(error)) {
    try {
      const data = await error.response.json();
      if (typeof data.error === 'string' && data.error) {
        return data.error;
      }
    } catch {
      // Response body was not JSON.
    }
  }
  return 'Something went wrong.';
}

export default QuizConfigurationPanel;
