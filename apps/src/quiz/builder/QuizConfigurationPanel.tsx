import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import Toggle from '@code-dot-org/component-library/toggle';
import {Typography} from '@mui/material';
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

// Applied once, only when a purpose is chosen for the first time.
const PURPOSE_DEFAULTS: Record<
  string,
  {
    showIntroScreen: boolean;
    timeLimitMinutes: number | null;
    allowMultipleAttempts: boolean;
    showCorrectness: boolean;
    revealAnswerExplanation: boolean;
  }
> = {
  check_for_understanding: {
    showIntroScreen: false,
    timeLimitMinutes: null,
    allowMultipleAttempts: true,
    showCorrectness: true,
    revealAnswerExplanation: true,
  },
  practice: {
    showIntroScreen: false,
    timeLimitMinutes: null,
    allowMultipleAttempts: true,
    showCorrectness: true,
    revealAnswerExplanation: true,
  },
  exam: {
    showIntroScreen: true,
    timeLimitMinutes: null,
    allowMultipleAttempts: false,
    showCorrectness: false,
    revealAnswerExplanation: false,
  },
  exam_simulation: {
    showIntroScreen: true,
    timeLimitMinutes: null,
    allowMultipleAttempts: true,
    showCorrectness: true,
    revealAnswerExplanation: true,
  },
};

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

  // Every field autosaves individually.
  const handleSave = async (
    updatedConfigValues: Partial<{
      timeLimitMinutes: number | null;
      showCorrectness: boolean;
      revealAnswerExplanation: boolean;
      showIntroScreen: boolean;
      purpose: string | null;
      allowMultipleAttempts: boolean;
    }> = {}
  ): Promise<boolean> => {
    setError(null);
    // Blank means "no time limit" which will be set to null. Otherwise, we need a positive integer.
    const parsedTimeLimitMinutes =
      'timeLimitMinutes' in updatedConfigValues
        ? updatedConfigValues.timeLimitMinutes ?? null
        : timeLimitMinutes === ''
        ? null
        : Number(timeLimitMinutes);
    if (
      parsedTimeLimitMinutes !== null &&
      (!Number.isInteger(parsedTimeLimitMinutes) || parsedTimeLimitMinutes <= 0)
    ) {
      setError(
        'Time limit must be a whole number of minutes greater than 0, or left blank for no limit.'
      );
      return false;
    }
    const effectiveShowIntroScreen =
      updatedConfigValues.showIntroScreen ?? showIntroScreen;
    // Mirrors show_intro_screen_required_when_time_limit - a time limit
    // with no intro screen means a student could start the timer without
    // ever being told there is one.
    if (parsedTimeLimitMinutes !== null && !effectiveShowIntroScreen) {
      setError('Show intro screen is required when a time limit is set.');
      return false;
    }
    setIsSaving(true);
    try {
      const response = await HttpClient.put(
        `/levels/${quizId}/quiz_configuration`,
        JSON.stringify({
          timeLimitMinutes: parsedTimeLimitMinutes,
          showCorrectness,
          revealAnswerExplanation,
          showIntroScreen: effectiveShowIntroScreen,
          purpose: purpose || null,
          allowMultipleAttempts,
          ...updatedConfigValues,
        }),
        true,
        {'Content-Type': 'application/json'}
      );
      const saved: QuizConfigurationData = await response.json();
      onSaved(saved);
      return true;
    } catch (error) {
      setError(await saveErrorMessage(error));
      return false;
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
                disabled={isSaving}
                onClick={() => {
                  // Only reachable while purpose is unset (the chooser only
                  // shows then) - assumed to only happen for a brand-new quiz level.
                  const defaults = PURPOSE_DEFAULTS[option.value];
                  setPurpose(option.value);
                  setShowIntroScreen(defaults.showIntroScreen);
                  setTimeLimitMinutes(
                    defaults.timeLimitMinutes?.toString() ?? ''
                  );
                  setAllowMultipleAttempts(defaults.allowMultipleAttempts);
                  setShowCorrectness(defaults.showCorrectness);
                  setRevealAnswerExplanation(defaults.revealAnswerExplanation);
                  void handleSave({
                    purpose: option.value,
                    ...defaults,
                  }).then(ok => {
                    if (!ok) setPurpose('');
                  });
                }}
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
            disabled={isSaving}
            onChange={e => {
              const newPurpose = e.target.value;
              const previous = purpose;
              setPurpose(newPurpose);
              void handleSave({purpose: newPurpose}).then(ok => {
                if (!ok) setPurpose(previous);
              });
            }}
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
                disabled={isSaving}
                checked={showIntroScreen}
                onChange={e => {
                  const checked = e.target.checked;
                  setShowIntroScreen(checked);
                  void handleSave({showIntroScreen: checked}).then(ok => {
                    if (!ok) setShowIntroScreen(!checked);
                  });
                }}
              />
              <p className={styles.cardHelperText}>
                Edit intro screen contents in the workspace
              </p>
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
                className={styles.fullWidthField}
                placeholder="minutes"
                helperMessage="Leave unset for no time limit"
                disabled={isSaving}
                value={timeLimitMinutes}
                onChange={e => setTimeLimitMinutes(e.target.value)}
                // Saves on blur rather than per keystroke.
                onBlur={() => void handleSave()}
              />
            </div>
            <div className={styles.cardRow}>
              <Toggle
                name="allowMultipleAttempts"
                label="Allow multiple attempts"
                size="s"
                position="right"
                disabled={isSaving}
                checked={allowMultipleAttempts}
                onChange={e => {
                  const checked = e.target.checked;
                  setAllowMultipleAttempts(checked);
                  void handleSave({allowMultipleAttempts: checked}).then(ok => {
                    if (!ok) setAllowMultipleAttempts(!checked);
                  });
                }}
              />
            </div>
          </ConfigCard>

          <ConfigCard label="feedback">
            <div className={styles.cardRow}>
              <Toggle
                name="showCorrectness"
                label="Show correctness"
                size="s"
                position="right"
                disabled={isSaving}
                checked={showCorrectness}
                onChange={e => {
                  const checked = e.target.checked;
                  const previousReveal = revealAnswerExplanation;
                  setShowCorrectness(checked);
                  // Mirrors reveal_answer_explanation_requires_show_correctness -
                  // turning correctness off while explanation reveal is on would
                  // otherwise be silently invalid.
                  if (!checked) {
                    setRevealAnswerExplanation(false);
                  }
                  void handleSave({
                    showCorrectness: checked,
                    ...(!checked && {revealAnswerExplanation: false}),
                  }).then(ok => {
                    if (!ok) {
                      setShowCorrectness(!checked);
                      if (!checked) setRevealAnswerExplanation(previousReveal);
                    }
                  });
                }}
              />
              {showCorrectness && (
                <div className={styles.conditionalWrap}>
                  <Toggle
                    name="revealAnswerExplanation"
                    label="Reveal answer and explanation"
                    size="s"
                    position="right"
                    disabled={isSaving}
                    checked={revealAnswerExplanation}
                    onChange={e => {
                      const checked = e.target.checked;
                      setRevealAnswerExplanation(checked);
                      void handleSave({revealAnswerExplanation: checked}).then(
                        ok => {
                          if (!ok) setRevealAnswerExplanation(!checked);
                        }
                      );
                    }}
                  />
                  <p className={styles.cardHelperText}>
                    Reveal the correct answer and the explanation.
                  </p>
                </div>
              )}
            </div>
          </ConfigCard>
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
