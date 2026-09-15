import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import Toggle from '@code-dot-org/component-library/toggle';
import {Alert} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {networkErrorMessage} from './networkError';

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

interface QuizConfigurableFields {
  showIntroScreen: boolean;
  timeLimitMinutes: number | null;
  allowMultipleAttempts: boolean;
  showCorrectness: boolean;
  revealAnswerExplanation: boolean;
}

// Applied once, only when a purpose is chosen for the first time.
const PURPOSE_DEFAULTS: Record<string, QuizConfigurableFields> = {
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
  <fieldset className={styles.configCard}>
    <legend className={styles.configCardHeader}>{label}</legend>
    <div className={styles.configCardContent}>{children}</div>
  </fieldset>
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
  // (no time limit) rather than snapping to 0 - converted to a number or null on save.
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    initialValues.timeLimitMinutes?.toString() || ''
  );
  const [timeLimitMinutesAtFocus, setTimeLimitMinutesAtFocus] =
    useState(timeLimitMinutes);
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
  const [savingField, setSavingField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLimitError, setTimeLimitError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const previousSavingFieldRef = useRef<string | null>(null);
  useEffect(() => {
    if (previousSavingFieldRef.current && !savingField) {
      panelRef.current
        ?.querySelector<HTMLElement>(
          `[name="${previousSavingFieldRef.current}"]`
        )
        ?.focus();
    }
    previousSavingFieldRef.current = savingField;
  }, [savingField]);

  // Every field autosaves individually.
  const handleSave = async (
    updatedConfigValues: Partial<QuizConfigurableFields> & {
      purpose?: string | null;
    } = {},
    savingFieldName: string | null = null
  ): Promise<boolean> => {
    setError(null);
    setTimeLimitError(null);
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
      const message =
        'Time limit must be a whole number of minutes greater than 0, or left blank for no limit.';
      setError(message);
      setTimeLimitError(message);
      return false;
    }
    const effectiveShowIntroScreen =
      updatedConfigValues.showIntroScreen ?? showIntroScreen;
    if (parsedTimeLimitMinutes !== null && !effectiveShowIntroScreen) {
      setError('Show intro screen is required when a time limit is set.');
      return false;
    }
    setSavingField(savingFieldName);
    try {
      // Only the field(s) this save actually touches are sent.
      const body: Partial<QuizConfigurableFields> & {
        purpose?: string | null;
      } = {...updatedConfigValues};
      if (savingFieldName === 'timeLimitMinutes') {
        body.timeLimitMinutes = parsedTimeLimitMinutes;
      }
      const response = await HttpClient.put(
        `/levels/${quizId}/quiz_configuration`,
        JSON.stringify(body),
        true,
        {'Content-Type': 'application/json'}
      );
      const saved: QuizConfigurationData = await response.json();
      onSaved(saved);
      return true;
    } catch (error) {
      setError(await networkErrorMessage(error));
      return false;
    } finally {
      setSavingField(null);
    }
  };

  const handleChoosePurpose = (purposeValue: string) => {
    const defaults = PURPOSE_DEFAULTS[purposeValue];
    setPurpose(purposeValue);
    setShowIntroScreen(defaults.showIntroScreen);
    setTimeLimitMinutes(defaults.timeLimitMinutes?.toString() ?? '');
    setAllowMultipleAttempts(defaults.allowMultipleAttempts);
    setShowCorrectness(defaults.showCorrectness);
    setRevealAnswerExplanation(defaults.revealAnswerExplanation);
    void handleSave(
      {
        purpose: purposeValue,
        ...defaults,
      },
      'purpose'
    ).then(ok => {
      if (!ok) setPurpose('');
    });
  };

  const handlePurposeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPurpose = e.target.value;
    const previous = purpose;
    setPurpose(newPurpose);
    void handleSave({purpose: newPurpose}, 'purpose').then(ok => {
      if (!ok) setPurpose(previous);
    });
  };

  const handleShowIntroScreenChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    setShowIntroScreen(checked);
    void handleSave({showIntroScreen: checked}, 'showIntroScreen').then(ok => {
      if (!ok) setShowIntroScreen(!checked);
    });
  };

  const handleTimeLimitFocus = () => {
    setTimeLimitMinutesAtFocus(timeLimitMinutes);
  };

  const handleTimeLimitBlur = () => {
    if (timeLimitMinutes !== timeLimitMinutesAtFocus) {
      void handleSave(undefined, 'timeLimitMinutes');
    }
  };

  const handleAllowMultipleAttemptsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    setAllowMultipleAttempts(checked);
    void handleSave(
      {allowMultipleAttempts: checked},
      'allowMultipleAttempts'
    ).then(ok => {
      if (!ok) setAllowMultipleAttempts(!checked);
    });
  };

  const handleShowCorrectnessChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    const previousReveal = revealAnswerExplanation;
    setShowCorrectness(checked);
    if (!checked) {
      setRevealAnswerExplanation(false);
    }
    void handleSave(
      {
        showCorrectness: checked,
        ...(!checked && {revealAnswerExplanation: false}),
      },
      'showCorrectness'
    ).then(ok => {
      if (!ok) {
        setShowCorrectness(!checked);
        if (!checked) {
          setRevealAnswerExplanation(previousReveal);
        }
      }
    });
  };

  const handleRevealAnswerExplanationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    setRevealAnswerExplanation(checked);
    void handleSave(
      {revealAnswerExplanation: checked},
      'revealAnswerExplanation'
    ).then(ok => {
      if (!ok) setRevealAnswerExplanation(!checked);
    });
  };

  return (
    <div className={styles.panel} ref={panelRef}>
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
                disabled={savingField === 'purpose'}
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
              disabled={savingField === 'purpose'}
              onChange={handlePurposeChange}
              styleAsFormField
              className={styles.fullWidthDropdown}
            />
          </div>
          <ConfigCard label="content">
            <div className={styles.cardRow}>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Show intro screen</span>
                <Toggle
                  name="showIntroScreen"
                  aria-label="Show intro screen"
                  size="s"
                  disabled={savingField === 'showIntroScreen'}
                  checked={showIntroScreen}
                  onChange={handleShowIntroScreenChange}
                />
              </div>
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
                color="gray"
                className={styles.fullWidthField}
                placeholder="minutes"
                helperMessage="Leave unset for no time limit"
                errorMessage={timeLimitError ?? undefined}
                disabled={savingField === 'timeLimitMinutes'}
                value={timeLimitMinutes}
                onChange={e => setTimeLimitMinutes(e.target.value)}
                onFocus={handleTimeLimitFocus}
                onBlur={handleTimeLimitBlur}
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
                  disabled={savingField === 'allowMultipleAttempts'}
                  checked={allowMultipleAttempts}
                  onChange={handleAllowMultipleAttemptsChange}
                />
              </div>
            </div>
          </ConfigCard>
          <ConfigCard label="feedback">
            <div className={styles.cardRow}>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Show correctness</span>
                <Toggle
                  name="showCorrectness"
                  aria-label="Show correctness"
                  size="s"
                  disabled={savingField === 'showCorrectness'}
                  checked={showCorrectness}
                  onChange={handleShowCorrectnessChange}
                />
              </div>
              {showCorrectness && (
                <div className={styles.conditionalWrap}>
                  <div className={styles.toggleRow}>
                    <span className={styles.toggleLabel}>
                      Reveal answer and explanation
                    </span>
                    <Toggle
                      name="revealAnswerExplanation"
                      aria-label="Reveal answer and explanation"
                      size="s"
                      disabled={savingField === 'revealAnswerExplanation'}
                      checked={revealAnswerExplanation}
                      onChange={handleRevealAnswerExplanationChange}
                    />
                  </div>
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

export default QuizConfigurationPanel;
