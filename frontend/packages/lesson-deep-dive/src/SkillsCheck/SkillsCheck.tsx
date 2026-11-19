import {
  type ComponentType,
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useApiClient} from '@code-dot-org/core/api';
import {
  LessonObjectiveReflectionValues,
  PracticeProblemDeliveryContext,
  PracticeProblemTypes,
} from '@code-dot-org/shared-constants';

import {
  listPracticeProblemAttempts,
  listPracticeProblems,
  savePracticeProblemAttempt,
  updatePracticeProblemAttemptFeedback,
} from '../api';
import {type VocabularyItem} from '../ReviewModalities/VocabularyFlashcards';
import {
  type LessonObjective,
  type MatchSolution,
  type MultiSolution,
  type PracticeProblem,
  type ReflectionData,
  type ScrambleSolution,
} from '../types';

import matchJSON from './examples/match_example.json';
import multiSingleJson from './examples/multiple_choice_example.json';
import multiMultiJson from './examples/multiple_choice_multi_select.json';
import scrambleJSON from './examples/scramble_example.json';
import sortJSON from './examples/sort_example.json';
import Match from './QuestionTypes/Match';
import MultipleChoice from './QuestionTypes/MultipleChoice';
import Scramble from './QuestionTypes/Scramble';
import Sort from './QuestionTypes/Sort';

import styles from './skills-check.module.scss';

const PROBLEMS: PracticeProblem[] = [
  multiSingleJson as PracticeProblem,
  multiMultiJson as PracticeProblem,
  matchJSON as PracticeProblem,
  scrambleJSON as PracticeProblem,
  sortJSON as PracticeProblem,
];

export interface TutorFeedbackProps {
  systemPrompt: string;
  userMessage: string;
  lessonId: number;
  onFeedback: (feedback: string) => void;
}

interface SkillsCheckProps {
  lessonId: number;
  lessonName: string;
  lessonSummary: string;
  vocabulary: VocabularyItem[];
  objectives: LessonObjective[];
  reflectionData: ReflectionData | null;
  onComplete: () => void;
  TutorFeedback: ComponentType<TutorFeedbackProps>;
}

const SkillsCheck: FC<SkillsCheckProps> = ({
  lessonId,
  lessonName,
  lessonSummary,
  vocabulary,
  objectives,
  reflectionData,
  onComplete,
  TutorFeedback,
}) => {
  const api = useApiClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState<
    (MultiSolution | ScrambleSolution | MatchSolution)[] | null
  >(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [practiceProblems, setPracticeProblems] = useState(PROBLEMS);
  const [problemAttemptId, setProblemAttemptId] = useState(0);
  const [problemFetchLoading, setProblemFetchLoading] = useState(true);

  const currentProblem = useMemo(
    () => practiceProblems[currentIndex],
    [practiceProblems, currentIndex],
  );
  const isLast = useMemo(
    () => currentIndex === practiceProblems.length - 1,
    [practiceProblems, currentIndex],
  );

  const goToNext = useCallback(() => {
    setCurrentIndex(i => i + 1);
    setStudentAnswer(null);
    setIsSubmitted(false);
    setIsCorrect(false);
    setFeedback(null);
    setProblemAttemptId(0);
  }, []);

  const getSystemPrompt = useCallback(() => {
    let prompt =
      `You are a tutor giving feedback on a practice problem related to their lesson. ` +
      `Be specific and encouraging. Be kind when telling a student they got something wrong. ` +
      `This is not a chat — just leave a short feedback for the student to read. ` +
      `The student has just finished a lesson titled "${lessonName}". ` +
      `Lesson summary: ${lessonSummary}.`;

    if (vocabulary.length > 0) {
      prompt +=
        `\nVocabulary from this lesson:\n` +
        vocabulary.map(v => `- ${v.word}: ${v.definition}`).join('\n');
    }

    if (reflectionData) {
      prompt +=
        `\nStudent reflection on lesson objectives:\n` +
        objectives
          .map(
            o =>
              `- "${o.description}": ${
                reflectionData.objectiveReflections[o.id] ?? 'not rated'
              }`,
          )
          .join('\n');
    }
    return prompt;
  }, [lessonName, lessonSummary, vocabulary, objectives, reflectionData]);

  const createUserMessage = useCallback(
    () =>
      `The student got this practice problem ${
        isCorrect ? 'RIGHT' : 'WRONG'
      }.\n` +
      `Question: ${currentProblem.problem_text}\n` +
      `Correct answer: ${JSON.stringify(currentProblem.solution)}\n` +
      `Student's answer: ${JSON.stringify(studentAnswer)}\n` +
      `Tell the student if they got it right or wrong, then explain the answer.`,
    [isCorrect, currentProblem, studentAnswer],
  );

  const createPracticeProblemAttempt = useCallback(() => {
    if (currentProblem.id < 1 || studentAnswer === null) {
      return;
    }
    savePracticeProblemAttempt(api.transport, {
      practice_problem_id: currentProblem.id,
      correct: isCorrect,
      delivery_context_type:
        PracticeProblemDeliveryContext.AI_TUTOR_LESSON_DEEP_DIVE,
      attempt: {solution: studentAnswer},
      delivery_context_metadata: {lesson_id: lessonId},
    })
      .then(attempt => {
        setProblemAttemptId(attempt.id);
      })
      .catch(error => console.log(error));
  }, [api, currentProblem, isCorrect, lessonId, studentAnswer]);

  const updateAttemptFeedback = useCallback(() => {
    if (feedback && problemAttemptId < 1) {
      updatePracticeProblemAttemptFeedback(
        api.transport,
        problemAttemptId,
        feedback,
      ).catch(error => console.log(error));
    }
  }, [api, feedback, problemAttemptId]);

  const createPracticeProblemAttemptRef = useRef(createPracticeProblemAttempt);
  createPracticeProblemAttemptRef.current = createPracticeProblemAttempt;

  useEffect(() => {
    if (studentAnswer !== null) {
      createPracticeProblemAttemptRef.current();
    }
  }, [studentAnswer]);

  const objectiveIds = useMemo(() => {
    if (
      !reflectionData ||
      Object.keys(reflectionData.objectiveReflections).length === 0
    ) {
      return objectives.map(o => o.id);
    }
    return Object.entries(reflectionData.objectiveReflections)
      .filter(
        ([, value]) =>
          value === LessonObjectiveReflectionValues.LOST ||
          value === LessonObjectiveReflectionValues.UNSURE,
      )
      .map(([objectiveId]) => objectiveId);
  }, [reflectionData, objectives]);

  const fetchPracticeProblems = useCallback(() => {
    listPracticeProblems(api.transport, objectiveIds)
      .then(problems => {
        if (problems.length === 0) return;
        return listPracticeProblemAttempts(
          api.transport,
          problems.map(p => p.id),
        ).then(attempts => {
          const attemptedIds = new Set(
            attempts.map(a => a.practice_problem_id),
          );
          const filteredProbs = problems.filter(p => !attemptedIds.has(p.id));
          if (filteredProbs && filteredProbs.length > 0) {
            setPracticeProblems(filteredProbs);
          }
        });
      })
      .finally(() => {
        setProblemFetchLoading(false);
      });
  }, [api, objectiveIds]);

  useEffect(() => {
    fetchPracticeProblems();
  }, [fetchPracticeProblems]);

  useEffect(() => {
    if (feedback && problemAttemptId !== 0) {
      updateAttemptFeedback();
    }
  }, [feedback, problemAttemptId, updateAttemptFeedback]);

  const renderProblem = (index: number) => {
    const problem = practiceProblems[index];
    const sharedProps = {
      problem,
      key: problem.id,
      submitted: isSubmitted,
      submitCallback: setIsSubmitted,
      correctCallback: setIsCorrect,
      studentAnswerCallback: setStudentAnswer,
    };
    switch (problem.type) {
      case PracticeProblemTypes.MULTIPLE_CHOICE_SINGLE:
      case PracticeProblemTypes.MULTIPLE_CHOICE_MULTI:
        return <MultipleChoice {...sharedProps} />;
      case PracticeProblemTypes.SCRAMBLE:
        return <Scramble {...sharedProps} />;
      case PracticeProblemTypes.MATCH:
        return <Match {...sharedProps} />;
      case PracticeProblemTypes.SORT:
        return <Sort {...sharedProps} />;
    }
  };

  return (
    <div className={styles.quiz}>
      <div className={styles.quizContent}>
        <p className={styles.overline}>Skills Check</p>
        {!problemFetchLoading && (
          <div style={{width: '80%'}}>{renderProblem(currentIndex)}</div>
        )}
        {isSubmitted && (
          <div className={styles.feedback}>
            {studentAnswer !== null && (
              <TutorFeedback
                systemPrompt={getSystemPrompt()}
                userMessage={createUserMessage()}
                lessonId={lessonId}
                onFeedback={setFeedback}
              />
            )}
          </div>
        )}
      </div>
      <footer className={styles.footer}>
        {isSubmitted && !isLast && (
          <button
            type="button"
            className={styles.nextButton}
            onClick={goToNext}
          >
            Next question
            <FontAwesomeV6Icon iconName="arrow-right" />
          </button>
        )}
        {isSubmitted && isLast && (
          <button
            type="button"
            className={styles.submitButton}
            onClick={onComplete}
          >
            Continue
          </button>
        )}
      </footer>
    </div>
  );
};

export default SkillsCheck;
