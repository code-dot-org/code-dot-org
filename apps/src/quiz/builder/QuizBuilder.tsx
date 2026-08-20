import {Button as MuiButton, Typography} from '@mui/material';
import React, {useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import QuizQuestionForm, {QuizQuestionFormValues} from './QuizQuestionForm';

import styles from './QuizBuilder.module.scss';

export interface QuizChoice {
  id: string;
  text: string;
}

export interface QuizQuestionData {
  id: number;
  type: string;
  questionName: string;
  stem?: string;
  choices?: QuizChoice[];
  // Present for questions created, edited, or fetched via the question
  // bank this session (see LevelsController#create_quiz_question/
  // #update_quiz_question/#index_quiz_questions) - the student-facing
  // payload (Quiz#summarize_for_lab2_properties) deliberately excludes
  // correct answers, so a question has none here until then.
  correctChoiceId?: string;
  explanation?: string;
}

interface QuizBuilderProps {
  quizId: number;
  quizTitle: string;
  questions: QuizQuestionData[];
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestionData[]>>;
}

// POC scope: MultipleChoiceQuestion only - see
// LevelsController#build_quiz_questions/#create_quiz_question.
const QuizBuilder: React.FunctionComponent<QuizBuilderProps> = ({
  quizId,
  quizTitle,
  questions,
  setQuestions,
}) => {
  // Only one form open at a time: null editingQuestionId + isFormOpen means
  // the "new question" form (rendered after the list); a non-null
  // editingQuestionId means that question's card shows the form in place of
  // its summary row instead.
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null
  );
  const [editingInitialValues, setEditingInitialValues] =
    useState<QuizQuestionFormValues | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingQuestionId(null);
    setEditingInitialValues(null);
  };

  const startAddQuestion = () => {
    setLoadError(null);
    setEditingQuestionId(null);
    setEditingInitialValues(null);
    setIsFormOpen(true);
  };

  // Fetches the question's full data - unlike the summary already in
  // `questions`, this includes correctChoiceId (see
  // LevelsController#show_quiz_question).
  const startEditQuestion = async (question: QuizQuestionData) => {
    setLoadError(null);
    setIsLoadingQuestion(true);
    try {
      const response = await HttpClient.get(
        `/levels/${quizId}/quiz_questions/${question.id}`
      );
      if (!response.ok) {
        setLoadError('Could not load this question.');
        return;
      }
      const data: QuizQuestionData = await response.json();
      setEditingInitialValues({
        questionName: data.questionName,
        stem: data.stem || '',
        choices: data.choices || [],
        correctChoiceId: data.correctChoiceId || '',
        explanation: data.explanation || '',
      });
      setEditingQuestionId(question.id);
      setIsFormOpen(true);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Passed to QuizQuestionForm as onSave - POSTs a new question or PUTs an
  // update depending on whether we're editing, then reflects the result
  // into `questions` and closes the form. Returns an error message on
  // failure instead of throwing, so the form can show it inline.
  const saveQuestion = async (
    values: QuizQuestionFormValues
  ): Promise<string | undefined> => {
    const isEditing = editingQuestionId !== null;
    const endpoint = isEditing
      ? `/levels/${quizId}/quiz_questions/${editingQuestionId}`
      : `/levels/${quizId}/quiz_questions`;
    const response = await (isEditing ? HttpClient.put : HttpClient.post)(
      endpoint,
      JSON.stringify(values),
      true,
      {'Content-Type': 'application/json'}
    );

    if (!response.ok) {
      const data = await response.json();
      return data.error || 'Something went wrong.';
    }

    const saved = await response.json();
    setQuestions(prev =>
      isEditing
        ? prev.map(question => (question.id === saved.id ? saved : question))
        : [...prev, saved]
    );
    closeForm();
    return undefined;
  };

  // For now, just work with multiple choice questions.
  const multipleChoiceQuestions = questions.filter(
    question => question.type === 'MultipleChoiceQuestion'
  );

  return (
    <div>
      <Typography variant="overline3">Build Quiz Questions</Typography>
      <Typography variant="h2">{quizTitle}</Typography>

      <h2>Current quiz questions</h2>
      <ol className={styles.questionCardList}>
        {multipleChoiceQuestions.map((question, index) => {
          const isEditingThis = editingQuestionId === question.id;
          return (
            <li
              key={question.id}
              className={
                isEditingThis ? styles.questionCardEditing : styles.questionCard
              }
            >
              {isEditingThis ? (
                <QuizQuestionForm
                  key={question.id}
                  initialValues={editingInitialValues || undefined}
                  isEditing
                  onSave={saveQuestion}
                  onCancel={closeForm}
                />
              ) : (
                <>
                  <Typography
                    variant="body3"
                    className={styles.questionCardIndex}
                  >
                    {index + 1}
                  </Typography>
                  <Typography
                    variant="body2"
                    className={styles.questionCardPrompt}
                  >
                    {question.stem || question.questionName}
                  </Typography>
                  <Typography
                    variant="overline3"
                    className={styles.questionCardBadge}
                  >
                    Multiple Choice
                  </Typography>
                  <MuiButton
                    variant="outlined"
                    color="secondary"
                    size="small"
                    type="button"
                    disabled={isFormOpen || isLoadingQuestion}
                    onClick={() => startEditQuestion(question)}
                  >
                    Edit
                  </MuiButton>
                </>
              )}
            </li>
          );
        })}
      </ol>

      {loadError && (
        <Typography variant="body3" color="error">
          {loadError}
        </Typography>
      )}

      {!isFormOpen && (
        <MuiButton
          variant="outlined"
          color="secondary"
          size="medium"
          type="button"
          disabled={isLoadingQuestion}
          onClick={startAddQuestion}
        >
          + Add question
        </MuiButton>
      )}

      {isFormOpen && editingQuestionId === null && (
        <div className={styles.addQuestionForm}>
          <QuizQuestionForm
            key="new"
            isEditing={false}
            onSave={saveQuestion}
            onCancel={closeForm}
          />
        </div>
      )}
    </div>
  );
};

export default QuizBuilder;
