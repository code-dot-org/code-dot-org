import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton, Typography} from '@mui/material';
import React, {useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import styles from './quiz-configuration-form.module.scss';

export interface QuizConfigurationData {
  title?: string;
  introText?: string;
  timeLimitMinutes?: number;
  showCorrectness: boolean;
  revealAnswerExplanation: boolean;
  purpose?: string;
  allowMultipleAttempts: boolean;
}

const PURPOSE_OPTIONS = [
  {value: 'exam', text: 'Exam'},
  {value: 'exam_simulation', text: 'Exam simulation'},
  {value: 'practice', text: 'Practice'},
  {value: 'check_for_understanding', text: 'Check for understanding'},
];

interface QuizConfigurationFormProps {
  quizId: number;
  initialValues: QuizConfigurationData;
  // Called with the server's saved values on success, so Quiz.tsx can sync
  // title/introText/timeLimitMinutes into its own state - lets a Preview
  // right after saving reflect the change without a page reload.
  onSaved: (updated: QuizConfigurationData) => void;
}

// The quiz-level settings _quiz_fields.html.haml used to own directly (now
// just a "Build Quiz Questions" link there) - moved here so the same
// in-product UI a teacher would eventually use (P2) can edit them, rather
// than depending on the levelbuilder-only Rails admin form. See
// LevelsController#update_quiz_configuration.
const QuizConfigurationForm: React.FunctionComponent<
  QuizConfigurationFormProps
> = ({quizId, initialValues, onSaved}) => {
  const [title, setTitle] = useState(initialValues.title || '');
  const [introText, setIntroText] = useState(initialValues.introText || '');
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
    // (Quiz's own time_limit_minutes validation), so a bad value shows up
    // immediately instead of after a round trip.
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
    setIsSaving(true);
    try {
      const response = await HttpClient.put(
        `/levels/${quizId}/quiz_configuration`,
        JSON.stringify({
          title,
          introText,
          timeLimitMinutes: parsedTimeLimitMinutes,
          showCorrectness,
          // The server validates this requires showCorrectness - sending
          // both together means that error, if any, shows up as a normal
          // inline save error rather than a confusing half-applied state.
          revealAnswerExplanation,
          purpose: purpose || null,
          allowMultipleAttempts,
        }),
        true,
        {'Content-Type': 'application/json'}
      );
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Something went wrong.');
        return;
      }
      const saved: QuizConfigurationData = await response.json();
      onSaved(saved);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.root}>
      {error && (
        <Typography variant="body3" color="error">
          {error}
        </Typography>
      )}

      <div className={styles.section}>
        <TextField
          label="Quiz title (optional)"
          name="title"
          size="s"
          className={styles.fullWidthField}
          placeholder="(defaults to Name)"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      <div className={styles.section}>
        <FormFieldWrapper
          color="black"
          size="s"
          label="Intro screen text (optional)"
          className={styles.fullWidthField}
        >
          <textarea
            className={styles.textarea}
            value={introText}
            onChange={e => setIntroText(e.target.value)}
          />
        </FormFieldWrapper>
      </div>

      <div className={styles.section}>
        <TextField
          label="Time limit (minutes, optional)"
          name="timeLimitMinutes"
          inputType="number"
          min={1}
          step={1}
          size="s"
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
        <SimpleDropdown
          name="purpose"
          size="s"
          labelText="Purpose"
          items={PURPOSE_OPTIONS}
          selectedValue={purpose}
          onChange={e => setPurpose(e.target.value)}
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
    </div>
  );
};

export default QuizConfigurationForm;
