import {Button as MuiButton, Typography} from '@mui/material';
import React, {useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import styles from './QuizQuestionAuthor.module.scss';

interface QuizChoice {
  id: string;
  text: string;
}

interface QuizQuestionData {
  id: number;
  type: string;
  questionName: string;
  stem?: string;
  choices?: QuizChoice[];
  // Only present for questions created this session (see
  // LevelsController#create_quiz_question) - the initial/student-facing
  // payload deliberately excludes correct answers, so pre-existing
  // questions won't show one here yet. Follow-up work, not a bug.
  correctChoiceId?: string;
}

interface QuizQuestionAuthorProps {
  quizId: number;
  initialQuestions: QuizQuestionData[];
}

const EMPTY_CHOICE = (): QuizChoice => ({id: '', text: ''});

// POC scope: MultipleChoiceQuestion only, no question bank browsing/reuse -
// see LevelsController#author_quiz_questions/#create_quiz_question.
const QuizQuestionAuthor: React.FunctionComponent<QuizQuestionAuthorProps> = ({
  quizId,
  initialQuestions,
}) => {
  const [questions, setQuestions] =
    useState<QuizQuestionData[]>(initialQuestions);
  const [questionName, setQuestionName] = useState('');
  const [stem, setStem] = useState('');
  const [choices, setChoices] = useState<QuizChoice[]>([
    EMPTY_CHOICE(),
    EMPTY_CHOICE(),
  ]);
  const [correctChoiceId, setCorrectChoiceId] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Collapsed by default - existing questions render as a list of summary
  // cards, and this form only shows once the levelbuilder asks to add one.
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  const updateChoiceText = (index: number, text: string) =>
    setChoices(prev =>
      prev.map((choice, i) => (i === index ? {...choice, text} : choice))
    );

  const addChoice = () => setChoices(prev => [...prev, EMPTY_CHOICE()]);

  const removeChoice = (index: number) => {
    setChoices(prev => prev.filter((_, i) => i !== index));
    // Choice ids are positional (see below), so removing one shifts every
    // later id - simplest safe thing is to make the levelbuilder re-pick.
    setCorrectChoiceId('');
  };

  const resetForm = () => {
    setQuestionName('');
    setStem('');
    setChoices([EMPTY_CHOICE(), EMPTY_CHOICE()]);
    setCorrectChoiceId('');
    setError(null);
  };

  const cancelAddQuestion = () => {
    resetForm();
    setIsAddingQuestion(false);
  };

  const createQuestion = async () => {
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

    // Choice ids just need to be stable/unique within this question - letter
    // them positionally (a, b, c...) rather than asking the levelbuilder to
    // invent ids themselves.
    const lettered = choices.map((choice, index) => ({
      ...choice,
      id: String.fromCharCode(97 + index),
    }));

    const response = await HttpClient.post(
      `/levels/${quizId}/quiz_questions`,
      JSON.stringify({
        questionName,
        stem,
        choices: lettered,
        correctChoiceId,
      }),
      true,
      {'Content-Type': 'application/json'}
    );

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || 'Something went wrong.');
      return;
    }

    const created = await response.json();
    setQuestions(prev => [...prev, created]);
    resetForm();
    setIsAddingQuestion(false);
  };

  return (
    <div>
      <h1>Author Quiz Questions</h1>

      <h2>Existing questions</h2>
      <ol className={styles.questionCardList}>
        {questions.map((question, index) => (
          <li key={question.id} className={styles.questionCard}>
            <Typography variant="body3" className={styles.questionCardIndex}>
              {index + 1}
            </Typography>
            <Typography variant="body2" className={styles.questionCardPrompt}>
              {question.stem || question.questionName}
            </Typography>
            <Typography
              variant="overline3"
              className={styles.questionCardBadge}
            >
              Multiple Choice
            </Typography>
          </li>
        ))}
      </ol>

      {!isAddingQuestion && (
        <MuiButton
          variant="outlined"
          color="secondary"
          size="medium"
          type="button"
          onClick={() => setIsAddingQuestion(true)}
        >
          + Add question
        </MuiButton>
      )}

      {isAddingQuestion && (
        <div className={styles.addQuestionForm}>
          <h2>New multiple choice question</h2>
          {error && (
            <Typography variant="body3" color="error">
              {error}
            </Typography>
          )}
          <div>
            <label>
              Question name
              <input
                type="text"
                value={questionName}
                onChange={e => setQuestionName(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Stem
              <textarea value={stem} onChange={e => setStem(e.target.value)} />
            </label>
          </div>
          <div>
            <p>Choices (select the correct one):</p>
            {choices.map((choice, index) => {
              const choiceId = String.fromCharCode(97 + index);
              return (
                <div key={index}>
                  <input
                    type="radio"
                    name="correctChoice"
                    checked={correctChoiceId === choiceId}
                    onChange={() => setCorrectChoiceId(choiceId)}
                  />
                  <input
                    type="text"
                    value={choice.text}
                    onChange={e => updateChoiceText(index, e.target.value)}
                    placeholder={`Choice ${choiceId}`}
                  />
                  {choices.length > 2 && (
                    <MuiButton
                      variant="outlined"
                      color="secondary"
                      size="small"
                      type="button"
                      onClick={() => removeChoice(index)}
                    >
                      Remove
                    </MuiButton>
                  )}
                </div>
              );
            })}
            <MuiButton
              variant="outlined"
              color="secondary"
              size="small"
              type="button"
              onClick={addChoice}
            >
              Add choice
            </MuiButton>
          </div>
          <MuiButton
            variant="contained"
            color="primary"
            size="medium"
            type="button"
            onClick={() => createQuestion()}
          >
            Create question
          </MuiButton>
          <MuiButton
            variant="text"
            color="secondary"
            size="medium"
            type="button"
            onClick={cancelAddQuestion}
          >
            Cancel
          </MuiButton>
        </div>
      )}
    </div>
  );
};

export default QuizQuestionAuthor;
