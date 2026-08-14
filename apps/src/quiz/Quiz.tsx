import React, {useEffect, useState} from 'react';

import {getAppOptionsAuthoringQuizQuestions} from '@cdo/apps/lab2/projects/utils';
import {LabProps, LevelProperties} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import QuizQuestionAuthor from './authoring/QuizQuestionAuthor';

import styles from './quiz-view.module.scss';

interface QuizChoice {
  id: string;
  text: string;
}

interface QuizQuestionSummary {
  id: number;
  type: string;
  questionName: string;
  stem?: string;
  choices?: QuizChoice[];
  explanation?: string;
}

interface QuizLevelProperties extends LevelProperties {
  scriptId?: number;
  quizQuestions?: QuizQuestionSummary[];
}

interface AttemptResult {
  score: number | null;
  maxScore: number | null;
}

// A single question's in-progress answer: one choice id (multiple choice),
// several choice ids (multiple select), or free text (free response).
type QuestionResponseValue = string | string[];

const isAnswered = (value: QuestionResponseValue | undefined) =>
  Array.isArray(value) ? value.length > 0 : !!value;

// Shapes response_data to match what each subtype's #grade expects - see
// MultipleChoiceQuestion/MultipleSelectQuestion/FreeResponseQuestion.
const buildResponseData = (
  question: QuizQuestionSummary,
  value: QuestionResponseValue | undefined
) => {
  if (question.type === 'MultipleSelectQuestion') {
    return {selectedChoiceIds: Array.isArray(value) ? value : []};
  }
  if (question.type === 'FreeResponseQuestion') {
    return {text: typeof value === 'string' ? value : ''};
  }
  return {selectedChoiceId: typeof value === 'string' ? value : ''};
};

const Quiz: React.FunctionComponent<LabProps> = ({levelProperties}) => {
  const {
    id: levelId,
    scriptId,
    quizQuestions,
  } = levelProperties as QuizLevelProperties;
  const isAuthoringMode = !!getAppOptionsAuthoringQuizQuestions();
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [responses, setResponses] = useState<
    Record<number, QuestionResponseValue>
  >({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const isResourcePanelCollapsed = useAppSelector(
    state => state.lab2View.isStandaloneCollapsed
  );
  // Outside authoring mode, Quiz has no top tab content today - the AI
  // Tutor tab isn't built yet (it needs hiddenContextCallback/
  // aiTutorSystemPrompt, neither of which is wired up here), so there's
  // nothing to expand the panel into, and the collapse toggle itself never
  // renders (ResourcePanel hides it when there are no tabs). In authoring
  // mode the Question Bank tab always exists.
  const hasResourcePanelTabs = isAuthoringMode;

  useEffect(() => {
    // Don't start a student attempt while a levelbuilder is authoring.
    if (isAuthoringMode || !scriptId) {
      return;
    }
    HttpClient.post(
      '/quiz_attempts',
      JSON.stringify({levelId, scriptId}),
      true,
      {'Content-Type': 'application/json'}
    )
      .then(response => response.json())
      .then(data => {
        setAttemptId(data.id);
        // P0 allows only one attempt: if this attempt was already
        // submitted (e.g. the student reloaded the page), restore its
        // result instead of showing an editable quiz again.
        if (data.submittedAt) {
          setResult({score: data.score, maxScore: data.maxScore});
        }
      });
  }, [isAuthoringMode, levelId, scriptId]);

  const setResponse = (questionId: number, value: QuestionResponseValue) =>
    setResponses(prev => ({...prev, [questionId]: value}));

  const toggleMultiSelectChoice = (questionId: number, choiceId: string) =>
    setResponses(prev => {
      const current = (prev[questionId] as string[]) || [];
      const next = current.includes(choiceId)
        ? current.filter(id => id !== choiceId)
        : [...current, choiceId];
      return {...prev, [questionId]: next};
    });

  // One submit for the whole quiz: post every answered question's response,
  // then finalize the attempt so score/max_score get totaled server-side.
  const submitQuiz = async () => {
    if (!attemptId) {
      return;
    }

    const answeredQuestions = (quizQuestions || []).filter(question =>
      isAnswered(responses[question.id])
    );
    await Promise.all(
      answeredQuestions.map(question =>
        HttpClient.post(
          '/quiz_question_responses',
          JSON.stringify({
            quizAttemptId: attemptId,
            quizQuestionId: question.id,
            responseData: buildResponseData(question, responses[question.id]),
          }),
          true,
          {'Content-Type': 'application/json'}
        )
      )
    );

    const finalizeResponse = await HttpClient.put(
      `/quiz_attempts/${attemptId}`,
      JSON.stringify({}),
      true,
      {'Content-Type': 'application/json'}
    );
    const data = await finalizeResponse.json();
    setResult({score: data.score, maxScore: data.maxScore});
  };

  return (
    <div id="quiz-lab" className={styles.quiz}>
      <ResourcePanel
        className={
          hasResourcePanelTabs && !isResourcePanelCollapsed
            ? styles.resourcePanel
            : styles.resourcePanelCollapsed
        }
        levelProperties={levelProperties}
        isRunning={false}
        hasRun={false}
        hasEdited={Object.keys(responses).length > 0}
        hideAllNavigation
        questionBankContent={
          isAuthoringMode ? (
            <p>Question bank browsing and filtering coming soon.</p>
          ) : undefined
        }
      />
      <div className={styles.divider} />
      <div className={styles.content}>
        {isAuthoringMode ? (
          <QuizQuestionAuthor
            quizId={levelId as number}
            initialQuestions={quizQuestions || []}
          />
        ) : (
          <>
            <p>Quiz: {levelProperties.name}</p>
            {!scriptId && (
              <p>Preview outside a script has no attempt tracking.</p>
            )}
            <ol>
              {(quizQuestions || []).map(question => (
                <li key={question.id}>
                  <p>{question.stem || question.questionName}</p>

                  {question.type === 'MultipleChoiceQuestion' &&
                    question.choices && (
                      <div>
                        {question.choices.map(choice => (
                          <label key={choice.id} style={{display: 'block'}}>
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={choice.id}
                              checked={responses[question.id] === choice.id}
                              disabled={!!result}
                              onChange={() =>
                                setResponse(question.id, choice.id)
                              }
                            />
                            {choice.text}
                          </label>
                        ))}
                      </div>
                    )}

                  {question.type === 'MultipleSelectQuestion' &&
                    question.choices && (
                      <div>
                        {question.choices.map(choice => (
                          <label key={choice.id} style={{display: 'block'}}>
                            <input
                              type="checkbox"
                              value={choice.id}
                              checked={(
                                (responses[question.id] as string[]) || []
                              ).includes(choice.id)}
                              disabled={!!result}
                              onChange={() =>
                                toggleMultiSelectChoice(question.id, choice.id)
                              }
                            />
                            {choice.text}
                          </label>
                        ))}
                      </div>
                    )}

                  {question.type === 'FreeResponseQuestion' && (
                    <textarea
                      value={(responses[question.id] as string) || ''}
                      disabled={!!result}
                      rows={4}
                      style={{width: '100%'}}
                      onChange={e => setResponse(question.id, e.target.value)}
                    />
                  )}
                </li>
              ))}
            </ol>
            <button
              type="button"
              disabled={!attemptId || !!result}
              onClick={() => submitQuiz()}
            >
              Submit Quiz
            </button>
            {result && (
              <p>
                Final score: {result.score} / {result.maxScore}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Quiz;
