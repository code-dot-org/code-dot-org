import React, {useEffect, useState} from 'react';

import {LabProps, LevelProperties} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

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

const Quiz: React.FunctionComponent<LabProps> = ({levelProperties}) => {
  const {
    id: levelId,
    scriptId,
    quizQuestions,
  } = levelProperties as QuizLevelProperties;
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const isResourcePanelCollapsed = useAppSelector(
    state => state.lab2View.isStandaloneCollapsed
  );
  // Quiz has no top tab content today - the AI Tutor tab isn't built yet (it
  // needs hiddenContextCallback/aiTutorSystemPrompt, neither of which is
  // wired up here), so there's nothing to expand the panel into, and the
  // collapse toggle itself never renders (ResourcePanel hides it when there
  // are no tabs). Without this, isResourcePanelCollapsed can never become
  // true, and the panel would stay at its wide min-width forever. Revisit
  // once the AI Tutor tab actually exists.
  const hasResourcePanelTabs = false;

  useEffect(() => {
    if (!scriptId) {
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
  }, [levelId, scriptId]);

  // One submit for the whole quiz: post every answered question's response,
  // then finalize the attempt so score/max_score get totaled server-side.
  const submitQuiz = async () => {
    if (!attemptId) {
      return;
    }

    const answeredQuestions = (quizQuestions || []).filter(
      question => selections[question.id]
    );
    await Promise.all(
      answeredQuestions.map(question =>
        HttpClient.post(
          '/quiz_question_responses',
          JSON.stringify({
            quizAttemptId: attemptId,
            quizQuestionId: question.id,
            responseData: {selectedChoiceId: selections[question.id]},
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
        hasEdited={Object.keys(selections).length > 0}
        hideNavigation
      />
      <div className={styles.divider} />
      <div className={styles.content}>
        <p>Quiz: {levelProperties.name} (not yet implemented)</p>
        {!scriptId && <p>Preview outside a script has no attempt tracking.</p>}
        <ul>
          {(quizQuestions || []).map(question => (
            <li key={question.id}>
              <p>{question.stem || question.questionName}</p>
              {question.choices && (
                <div>
                  {question.choices.map(choice => (
                    <label key={choice.id} style={{display: 'block'}}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={choice.id}
                        checked={selections[question.id] === choice.id}
                        disabled={!!result}
                        onChange={() =>
                          setSelections(prev => ({
                            ...prev,
                            [question.id]: choice.id,
                          }))
                        }
                      />
                      {choice.text}
                    </label>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
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
  );
};

export default Quiz;
