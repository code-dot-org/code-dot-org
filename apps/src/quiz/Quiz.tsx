import RadioButton from '@code-dot-org/component-library/radioButton';
import classNames from 'classnames';
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
  // Student-facing heading, same role `title` plays on Multi/Match/
  // FreeResponse/LevelGroup levels - see Quiz#serialized_attrs. Falls back
  // to the level's internal `name` when unset, since `name` can't be
  // changed once a level is in a script.
  title?: string;
}

interface AttemptResult {
  score: number | null;
  maxScore: number | null;
}

// A single question's in-progress answer: a chosen choice id. P0 is
// multiple choice only for now - see the filter in the quiz-taking view
// below; this will need to widen again (e.g. string | string[]) once
// MultipleSelectQuestion/FreeResponseQuestion come back.
type QuestionResponseValue = string;

const isAnswered = (value: QuestionResponseValue | undefined) => !!value;

// Shapes response_data to match what MultipleChoiceQuestion#grade expects.
const buildResponseData = (value: QuestionResponseValue | undefined) => ({
  selectedChoiceId: value || '',
});

const Quiz: React.FunctionComponent<LabProps> = ({levelProperties}) => {
  const {
    id: levelId,
    name,
    title,
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

  // P0 scope: multiple choice only - see the filter in the quiz-taking view
  // below.
  const multipleChoiceQuestions = (quizQuestions || []).filter(
    question => question.type === 'MultipleChoiceQuestion'
  );

  // One submit for the whole quiz: post every answered question's response,
  // then finalize the attempt so score/max_score get totaled server-side.
  const submitQuiz = async () => {
    if (!attemptId) {
      return;
    }

    const answeredQuestions = multipleChoiceQuestions.filter(question =>
      isAnswered(responses[question.id])
    );
    await Promise.all(
      answeredQuestions.map(question =>
        HttpClient.post(
          '/quiz_question_responses',
          JSON.stringify({
            quizAttemptId: attemptId,
            quizQuestionId: question.id,
            responseData: buildResponseData(responses[question.id]),
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
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <p>Quiz: {title || name}</p>
              {!scriptId && (
                <p>Preview outside a script has no attempt tracking.</p>
              )}
            </div>
            <ol className={styles.questionList}>
              {multipleChoiceQuestions.map((question, index) => (
                <li key={question.id} className={styles.questionSection}>
                  <p className={styles.questionEyebrow}>
                    Question {index + 1} of {multipleChoiceQuestions.length}
                  </p>
                  <p>{question.stem || question.questionName}</p>

                  {question.choices && (
                    <fieldset className={styles.answers}>
                      <legend className={styles.answersLegend}>
                        Answer options
                      </legend>
                      {question.choices.map(choice => {
                        const isChecked = responses[question.id] === choice.id;
                        return (
                          <div
                            key={choice.id}
                            className={classNames(
                              styles.answerOption,
                              isChecked && styles.answerOptionChecked
                            )}
                          >
                            <RadioButton
                              checked={isChecked}
                              name={`question-${question.id}`}
                              value={choice.id}
                              disabled={!!result}
                              onChange={() =>
                                setResponse(question.id, choice.id)
                              }
                            >
                              <span className={styles.answerOptionLetter}>
                                {choice.id.toUpperCase()}.
                              </span>
                              <span>{choice.text}</span>
                            </RadioButton>
                          </div>
                        );
                      })}
                    </fieldset>
                  )}
                </li>
              ))}
            </ol>
            <div className={styles.cardFooter}>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
