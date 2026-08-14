import React, {useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

interface QuizChoice {
  id: string;
  text: string;
}

interface QuizQuestionData {
  id: number;
  type: string;
  questionName: string;
  question: {
    stem?: string;
    choices?: QuizChoice[];
    correct_choice_id?: string;
  };
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
  };

  const createQuestion = async () => {
    setError(null);
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
  };

  const canSubmit =
    !!questionName &&
    !!stem &&
    !!correctChoiceId &&
    choices.every(choice => !!choice.text);

  return (
    <div style={{display: 'flex', height: '100%'}}>
      <div
        style={{
          width: '20%',
          minWidth: '200px',
          borderRight: '1px solid #ccc',
          padding: '16px',
        }}
      >
        <h2>Question Bank</h2>
      </div>
      <div style={{flex: 1, padding: '16px'}}>
        <h1>Author Quiz Questions</h1>

        <h2>Existing questions</h2>
        <ul>
          {questions.map(question => (
            <li key={question.id}>
              [{question.type}] {question.questionName}:{' '}
              {question.question.stem}
            </li>
          ))}
        </ul>

        <h2>New multiple choice question</h2>
        {error && <p style={{color: 'red'}}>{error}</p>}
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
                  <button type="button" onClick={() => removeChoice(index)}>
                    Remove
                  </button>
                )}
              </div>
            );
          })}
          <button type="button" onClick={addChoice}>
            Add choice
          </button>
        </div>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => createQuestion()}
        >
          Create question
        </button>
      </div>
    </div>
  );
};

export default QuizQuestionAuthor;
