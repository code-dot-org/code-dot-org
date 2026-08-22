import Dialog from '@code-dot-org/component-library/dialog';
import {Button as MuiButton, Typography} from '@mui/material';
import React, {useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import QuizQuestionForm, {
  QuizQuestionFormValues,
  QuizStandard,
} from './QuizQuestionForm';

import styles from './quiz-builder.module.scss';

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
  standards?: QuizStandard[];
  // Determines whether removing it from this quiz can also offer permanent deletion,
  // and (with usedInPublishedUnit) whether editing it prompts for
  // edit-in-place vs. save-as-new-version.
  attachedToOtherQuizzes?: boolean;
  // If true, editing always forks regardless of what the client requests.
  usedInPublishedUnit?: boolean;
  // Which page of the quiz this question renders on for students - nil for
  // a bank question not (yet) attached to this quiz. Defaults to 1.
  page?: number;
}

interface QuizBuilderProps {
  quizId: number;
  quizTitle: string;
  questions: QuizQuestionData[];
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestionData[]>>;
  // Called after destroy_quiz_question (not detach_quiz_question) succeeds,
  // so QuizQuestionBank's already-fetched results can drop a question that
  // no longer exists anywhere - see Quiz.tsx's destroyedQuestionIds.
  onQuestionDestroyed: (questionId: number) => void;
  onQuestionSaved: () => void;
}

// POC scope: MultipleChoiceQuestion only - see
// LevelsController#build_quiz_questions/#create_quiz_question.
const QuizBuilder: React.FunctionComponent<QuizBuilderProps> = ({
  quizId,
  quizTitle,
  questions,
  setQuestions,
  onQuestionDestroyed,
  onQuestionSaved,
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
  // Metadata about the question being edited - only needed to
  // decide the edit-in-place-vs-fork question on save.
  const [editingQuestionMetadata, setEditingQuestionMetadata] = useState<{
    usedInPublishedUnit: boolean;
    attachedToOtherQuizzes: boolean;
  } | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Non-null while the remove-confirmation Dialog is open for this question.
  const [pendingRemoval, setPendingRemoval] = useState<QuizQuestionData | null>(
    null
  );
  const [isRemoving, setIsRemoving] = useState(false);
  // Non-null while the save-confirmation Dialog is open (only shown when a
  // question is attached elsewhere but not forced to fork).
  const [pendingSaveChoice, setPendingSaveChoice] = useState<{
    resolve: (choice: 'edit' | 'fork' | 'cancel') => void;
  } | null>(null);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingQuestionId(null);
    setEditingInitialValues(null);
    setEditingQuestionMetadata(null);
  };

  const startAddQuestion = () => {
    setLoadError(null);
    setEditingQuestionId(null);
    setEditingInitialValues(null);
    setEditingQuestionMetadata(null);
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
        standards: data.standards || [],
        page: data.page || 1,
      });
      setEditingQuestionMetadata({
        usedInPublishedUnit: !!data.usedInPublishedUnit,
        attachedToOtherQuizzes: !!data.attachedToOtherQuizzes,
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
    let editMode: 'edit' | 'fork' | undefined;

    if (isEditing && editingQuestionMetadata?.usedInPublishedUnit) {
      // Forced regardless of choice - the server enforces this anyway, but
      // sending it explicitly keeps intent clear. No dialog: there's no
      // real choice to offer here.
      editMode = 'fork';
    } else if (isEditing && editingQuestionMetadata?.attachedToOtherQuizzes) {
      const choice = await new Promise<'edit' | 'fork' | 'cancel'>(resolve =>
        setPendingSaveChoice({resolve})
      );
      setPendingSaveChoice(null);
      if (choice === 'cancel') {
        return undefined;
      }
      editMode = choice;
    }

    const endpoint = isEditing
      ? `/levels/${quizId}/quiz_questions/${editingQuestionId}`
      : `/levels/${quizId}/quiz_questions`;
    const response = await (isEditing ? HttpClient.put : HttpClient.post)(
      endpoint,
      JSON.stringify({...values, editMode}),
      true,
      {'Content-Type': 'application/json'}
    );

    if (!response.ok) {
      const data = await response.json();
      return data.error || 'Something went wrong.';
    }

    const saved = await response.json();
    // Matches on editingQuestionId, not saved.id - a fork means the server
    // hands back a different id than what was being edited, so matching on
    // saved.id would leave a stale duplicate instead of replacing it.
    setQuestions(prev =>
      isEditing
        ? prev.map(question =>
            question.id === editingQuestionId ? saved : question
          )
        : [...prev, saved]
    );
    closeForm();
    onQuestionSaved();
    return undefined;
  };

  // Opens the remove-confirmation Dialog for this question - see its render
  // below for the attachedToOtherQuizzes-dependent button set.
  const startRemoveQuestion = (question: QuizQuestionData) => {
    setLoadError(null);
    setPendingRemoval(question);
  };

  // destroy=false hits detach_quiz_question (join only); destroy=true hits
  // destroy_quiz_question (join + the QuizQuestion record, server-verified
  // to be unused elsewhere first - see LevelsController#destroy_quiz_question).
  const confirmRemoveQuestion = async (destroy: boolean) => {
    if (!pendingRemoval) {
      return;
    }
    setIsRemoving(true);
    try {
      const endpoint = destroy
        ? `/levels/${quizId}/quiz_questions/${pendingRemoval.id}`
        : `/levels/${quizId}/quiz_questions/${pendingRemoval.id}/detach`;
      const response = await HttpClient.delete(endpoint, true);
      if (!response.ok) {
        setLoadError('Could not remove this question.');
        return;
      }
      if (destroy) {
        const data = await response.json();
        if (data.destroyed) {
          onQuestionDestroyed(pendingRemoval.id);
        }
      }
      setQuestions(prev => prev.filter(q => q.id !== pendingRemoval.id));
      setPendingRemoval(null);
    } finally {
      setIsRemoving(false);
    }
  };

  // For now, just work with multiple choice questions.
  const multipleChoiceQuestions = questions.filter(
    question => question.type === 'MultipleChoiceQuestion'
  );

  return (
    <div>
      <Typography variant="h2">{quizTitle}</Typography>

      <h2>
        {multipleChoiceQuestions.length === 1
          ? '1 question'
          : `${multipleChoiceQuestions.length} questions`}
      </h2>
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
                    disabled={isFormOpen || isLoadingQuestion || isRemoving}
                    onClick={() => startEditQuestion(question)}
                  >
                    Edit
                  </MuiButton>
                  <MuiButton
                    variant="outlined"
                    color="secondary"
                    size="small"
                    type="button"
                    disabled={isFormOpen || isLoadingQuestion || isRemoving}
                    onClick={() => startRemoveQuestion(question)}
                  >
                    Remove
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

      {pendingRemoval &&
        (pendingRemoval.attachedToOtherQuizzes ? (
          <Dialog
            title="Remove this question?"
            description="It's still used in another quiz, so it will remain in the question bank."
            primaryButtonProps={{
              children: 'Remove from quiz',
              color: 'error',
              onClick: () => confirmRemoveQuestion(false),
              loading: isRemoving,
            }}
            secondaryButtonProps={{
              children: 'Cancel',
              onClick: () => setPendingRemoval(null),
              disabled: isRemoving,
            }}
            onClose={() => setPendingRemoval(null)}
          />
        ) : (
          <Dialog
            title="Remove this question?"
            description="This question isn't used anywhere else. Delete it permanently, or just remove it from this quiz and keep it in the question bank?"
            primaryButtonProps={{
              children: 'Delete permanently',
              color: 'error',
              onClick: () => confirmRemoveQuestion(true),
              loading: isRemoving,
            }}
            secondaryButtonProps={{
              children: 'Cancel',
              onClick: () => setPendingRemoval(null),
              disabled: isRemoving,
            }}
            customBottomContent={
              <MuiButton
                variant="text"
                color="secondary"
                size="small"
                type="button"
                disabled={isRemoving}
                onClick={() => confirmRemoveQuestion(false)}
              >
                Remove from quiz only
              </MuiButton>
            }
            onClose={() => setPendingRemoval(null)}
          />
        ))}

      {pendingSaveChoice && (
        <Dialog
          title="Save changes to this question?"
          description="This question is also used in another quiz. Saving as a new version keeps the other quiz's copy untouched; saving for all quizzes changes it everywhere it's used."
          primaryButtonProps={{
            children: 'Save as new version',
            onClick: () => pendingSaveChoice.resolve('fork'),
          }}
          secondaryButtonProps={{
            children: 'Cancel',
            onClick: () => pendingSaveChoice.resolve('cancel'),
          }}
          customBottomContent={
            <MuiButton
              variant="text"
              color="secondary"
              size="small"
              type="button"
              onClick={() => pendingSaveChoice.resolve('edit')}
            >
              Save for all quizzes
            </MuiButton>
          }
          onClose={() => pendingSaveChoice.resolve('cancel')}
        />
      )}
    </div>
  );
};

export default QuizBuilder;
