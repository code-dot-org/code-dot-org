import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import RadioButton from '@code-dot-org/component-library/radioButton';
import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton, Typography} from '@mui/material';
import React, {useState} from 'react';

import SearchBox from '@cdo/apps/levelbuilder/lesson-editor/SearchBox';

import styles from './quiz-question-form.module.scss';

interface QuizChoice {
  id: string;
  text: string;
}

// A Standard is identified by (frameworkShortcode, shortcode) across this
// request/response boundary, not by its raw id - matches how
// LessonsController/StandardsEditor.jsx already do this for lessons. Shape
// matches Standard#summarize_for_lesson_edit.
export interface QuizStandard {
  frameworkShortcode: string;
  frameworkName: string;
  shortcode: string;
  description: string;
}

interface StandardSearchOption {
  value: string;
  label: string;
  standard: QuizStandard;
}

const isSameStandard = (a: QuizStandard, b: QuizStandard) =>
  a.frameworkShortcode === b.frameworkShortcode && a.shortcode === b.shortcode;

export interface QuizQuestionFormValues {
  questionName: string;
  stem: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  // Shown to students only once the quiz's own reveal_answer_explanation
  // setting allows it - see QuizAttempt#question_results.
  explanation?: string;
  standards?: QuizStandard[];
  // Which page of the quiz this question renders on for students - see
  // QuizLevelQuestion. Defaults to 1.
  page: number;
}

const EMPTY_CHOICE = (): QuizChoice => ({
  id: crypto.randomUUID(),
  text: '',
});

const letterForIndex = (index: number) => String.fromCharCode(97 + index);

interface QuizQuestionFormProps {
  // Omitted when creating a new question.
  initialValues?: QuizQuestionFormValues;
  isEditing: boolean;
  // Resolves to an error message on failure (e.g. a server-side validation
  // error), or undefined on success - keeps the parent from needing to know
  // about this form's internal error display.
  onSave: (values: QuizQuestionFormValues) => Promise<string | undefined>;
  onCancel: () => void;
}

// One multiple choice question's create/edit fields. Mount a fresh instance
// (e.g. keyed by question id, or a constant key for "new") per open of the
// form, rather than reusing one across different questions - its field
// state is local and only seeded once, from `initialValues`.
const QuizQuestionForm: React.FunctionComponent<QuizQuestionFormProps> = ({
  initialValues,
  isEditing,
  onSave,
  onCancel,
}) => {
  const [questionName, setQuestionName] = useState(
    initialValues?.questionName || ''
  );
  const [stem, setStem] = useState(initialValues?.stem || '');
  const [choices, setChoices] = useState<QuizChoice[]>(
    initialValues?.choices?.length
      ? initialValues.choices
      : [EMPTY_CHOICE(), EMPTY_CHOICE()]
  );
  const [correctChoiceId, setCorrectChoiceId] = useState(
    initialValues?.correctChoiceId || ''
  );
  const [explanation, setExplanation] = useState(
    initialValues?.explanation || ''
  );
  const [standards, setStandards] = useState<QuizStandard[]>(
    initialValues?.standards || []
  );
  const [page, setPage] = useState(initialValues?.page || 1);
  const [error, setError] = useState<string | null>(null);

  const addStandard = (standard: QuizStandard) =>
    setStandards(prev =>
      prev.some(s => isSameStandard(s, standard)) ? prev : [...prev, standard]
    );

  const removeStandard = (standard: QuizStandard) =>
    setStandards(prev => prev.filter(s => !isSameStandard(s, standard)));

  const onStandardSearchSelect = (option: StandardSearchOption) => {
    if (option) {
      addStandard(option.standard);
    }
  };

  const constructStandardOptions = (json: QuizStandard[]) => ({
    options: json
      .filter(standard => !standards.some(s => isSameStandard(s, standard)))
      .map(standard => ({
        value: `${standard.frameworkShortcode}-${standard.shortcode}`,
        label: `${standard.frameworkShortcode.toUpperCase()} - ${
          standard.shortcode
        } - ${standard.description}`,
        standard,
      })),
  });

  const updateChoiceText = (id: string, text: string) =>
    setChoices(prev =>
      prev.map(choice => (choice.id === id ? {...choice, text} : choice))
    );

  const addChoice = () => setChoices(prev => [...prev, EMPTY_CHOICE()]);

  const removeChoice = (id: string) => {
    setChoices(prev => prev.filter(choice => choice.id !== id));
    if (id === correctChoiceId) {
      setCorrectChoiceId('');
    }
  };

  const handleSave = async () => {
    setError(null);

    const missing = [];
    if (!questionName) {
      missing.push('a question name');
    }
    if (!stem) {
      missing.push('a stem');
    }
    if (choices.some(choice => !choice.text)) {
      missing.push('text for every choice');
    }
    if (!correctChoiceId) {
      missing.push('a correct choice selected');
    }
    if (missing.length > 0) {
      setError(`Missing: ${missing.join(', ')}.`);
      return;
    }

    // Letter ids positionally (a, b, c...) on persist; map the selected
    // row so correctChoiceId still points at the same choice.
    const lettered = choices.map((choice, index) => ({
      ...choice,
      id: letterForIndex(index),
    }));
    const selectedIndex = choices.findIndex(
      choice => choice.id === correctChoiceId
    );

    const saveError = await onSave({
      questionName,
      stem,
      choices: lettered,
      correctChoiceId: lettered[selectedIndex]?.id ?? '',
      explanation,
      standards,
      page,
    });
    if (saveError) {
      setError(saveError);
    }
  };

  return (
    <div className={styles.root}>
      <Typography variant="h6">
        {isEditing
          ? 'Edit multiple choice question'
          : 'New multiple choice question'}
      </Typography>
      {error && (
        <Typography variant="body3" color="error">
          {error}
        </Typography>
      )}

      <div className={styles.section}>
        <TextField
          label="Question name"
          name="questionName"
          size="s"
          className={styles.fullWidthField}
          value={questionName}
          onChange={e => setQuestionName(e.target.value)}
        />
      </div>

      <div className={styles.section}>
        <TextField
          label="Page"
          name="page"
          inputType="number"
          size="s"
          value={page}
          onChange={e => setPage(Math.max(1, Number(e.target.value) || 1))}
        />
      </div>

      <div className={styles.section}>
        <Typography variant="overline3" component="span">
          Stem
        </Typography>

        <FormFieldWrapper
          color="black"
          size="s"
          className={styles.fullWidthField}
        >
          <textarea
            className={styles.textarea}
            value={stem}
            onChange={e => setStem(e.target.value)}
          />
        </FormFieldWrapper>
      </div>

      <div className={styles.section}>
        <Typography variant="overline3" className={styles.sectionHeading}>
          Answer options (select the correct one)
        </Typography>
        <div className={styles.optionList}>
          {choices.map((choice, index) => {
            const choiceLetter = letterForIndex(index);
            return (
              <div key={choice.id} className={styles.optionRow}>
                <RadioButton
                  checked={correctChoiceId === choice.id}
                  name="correctChoice"
                  value={choice.id}
                  ariaLabel={`Mark choice ${choiceLetter} as correct`}
                  onChange={() => setCorrectChoiceId(choice.id)}
                />
                <div className={styles.optionField}>
                  <TextField
                    name={`choice-${choice.id}`}
                    size="s"
                    className={styles.fullWidthField}
                    value={choice.text}
                    placeholder={`Choice ${choiceLetter}`}
                    onChange={e => updateChoiceText(choice.id, e.target.value)}
                  />
                </div>
                {choices.length > 2 && (
                  <div className={styles.rowActions}>
                    <MuiButton
                      variant="outlined"
                      color="secondary"
                      size="small"
                      type="button"
                      onClick={() => removeChoice(choice.id)}
                    >
                      Remove
                    </MuiButton>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <MuiButton
          variant="outlined"
          color="secondary"
          size="small"
          type="button"
          className={styles.addRow}
          onClick={addChoice}
        >
          Add choice
        </MuiButton>
      </div>

      <div className={styles.section}>
        <details className={styles.collapsibleSection}>
          <summary className={styles.collapsibleSummary}>
            <Typography variant="overline3" component="span">
              Explanation (optional)
            </Typography>
          </summary>
          <FormFieldWrapper
            color="black"
            size="s"
            className={styles.fullWidthField}
            helperMessage="Shown to students only if the quiz's Reveal answer explanations setting is on."
          >
            <textarea
              className={styles.textarea}
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
            />
          </FormFieldWrapper>
        </details>
      </div>

      <div className={styles.section}>
        <details className={styles.collapsibleSection}>
          <summary className={styles.collapsibleSummary}>
            <Typography variant="overline3" component="span">
              Standards (optional)
            </Typography>
          </summary>
          <SearchBox
            key={standards
              .map(s => `${s.frameworkShortcode}-${s.shortcode}`)
              .join(',')}
            onSearchSelect={onStandardSearchSelect}
            searchUrl="standards/search"
            constructOptions={constructStandardOptions}
          />
          {standards.length > 0 && (
            <div className={styles.optionList}>
              {standards.map(standard => (
                <div
                  key={`${standard.frameworkShortcode}-${standard.shortcode}`}
                  className={styles.optionRow}
                >
                  <Typography variant="body3" className={styles.optionField}>
                    {standard.frameworkShortcode.toUpperCase()} -{' '}
                    {standard.shortcode} - {standard.description}
                  </Typography>
                  <div className={styles.rowActions}>
                    <MuiButton
                      variant="outlined"
                      color="secondary"
                      size="small"
                      type="button"
                      onClick={() => removeStandard(standard)}
                    >
                      Remove
                    </MuiButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </details>
      </div>

      <div className={styles.actions}>
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          type="button"
          onClick={() => handleSave()}
        >
          {isEditing ? 'Save changes' : 'Create question'}
        </MuiButton>
        <MuiButton
          variant="text"
          color="secondary"
          size="medium"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </MuiButton>
      </div>
    </div>
  );
};

export default QuizQuestionForm;
