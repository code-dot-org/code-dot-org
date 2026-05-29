import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC, useCallback, useEffect, useMemo, useState} from 'react';

import {postAichatCompletionMessage} from '@cdo/apps/aichat/aichatApi';
import {
  AichatContext,
  CompletedChatMessage,
  PendingChatMessage,
} from '@cdo/apps/aichat/types';
import WaitingAnimation from '@cdo/apps/aichat/views/WaitingAnimation';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {createUuid} from '@cdo/apps/utils';
import {
  AiChatClientTypes,
  AiInteractionStatus as Status,
} from '@cdo/generated-scripts/sharedConstants';
import matchJSON from '@cdo/static/tutor/match_example.json';
import multiSingleJson from '@cdo/static/tutor/multiple_choice_example.json';
import multiMultiJson from '@cdo/static/tutor/multiple_choice_multi_select.json';
import scrambleJSON from '@cdo/static/tutor/scramble_example.json';
import sortJSON from '@cdo/static/tutor/sort_example.json';

import {useAiTutorModelParameters} from '../../../hooks/useAiTutorModelParameters';
import {
  LessonDeepDiveData,
  MatchSolution,
  MultiSolution,
  PracticeProblem,
  ReflectionData,
  ScrambleSolution,
} from '../types';

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

interface SkillsCheckProps {
  lessonId: number;
  lessonName: string;
  lessonSummary: string;
  vocabulary: LessonDeepDiveData['vocabulary'];
  objectives: LessonDeepDiveData['objectives'];
  reflectionData: ReflectionData | null;
  onComplete: () => void;
}

const SkillsCheck: FC<SkillsCheckProps> = ({
  lessonId,
  lessonName,
  lessonSummary,
  vocabulary,
  objectives,
  reflectionData,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState<
    (MultiSolution | ScrambleSolution | MatchSolution)[] | null
  >(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const currentProblem = PROBLEMS[currentIndex];
  const isLast = currentIndex === PROBLEMS.length - 1;

  const goToNext = useCallback(() => {
    setCurrentIndex(i => i + 1);
    setStudentAnswer(null);
    setIsSubmitted(false);
    setIsCorrect(false);
    setFeedback(null);
    setFeedbackLoading(false);
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
              }`
          )
          .join('\n');
    }
    return prompt;
  }, [lessonName, lessonSummary, vocabulary, objectives, reflectionData]);

  const {modelParameters, loading} = useAiTutorModelParameters({
    aiTutorSystemPrompt: getSystemPrompt(),
    aiTutorJsonSchema: undefined,
  });

  const aichatContext: AichatContext = useMemo(
    () => ({
      clientType: AiChatClientTypes.LESSON_DEEP_DIVE,
      currentLevelId: null,
      scriptId: null,
      channelId: undefined,
      lessonId,
    }),
    [lessonId]
  );

  const createUserMessage = useCallback(
    () =>
      `The student got this practice problem ${
        isCorrect ? 'RIGHT' : 'WRONG'
      }.\n` +
      `Question: ${currentProblem.problem_text}\n` +
      `Correct answer: ${JSON.stringify(currentProblem.solution)}\n` +
      `Student's answer: ${JSON.stringify(studentAnswer)}\n` +
      `Tell the student if they got it right or wrong, then explain the answer.`,
    [isCorrect, currentProblem, studentAnswer]
  );

  const getAIFeedback = useCallback(async () => {
    if (!modelParameters || loading) return;
    const msg: PendingChatMessage & {updateId: string} = {
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: createUserMessage(),
      timestamp: Date.now(),
      updateId: createUuid(),
    };
    setFeedbackLoading(true);
    try {
      const messages: CompletedChatMessage[] =
        await postAichatCompletionMessage(
          msg,
          [],
          {...modelParameters},
          aichatContext
        );
      setFeedback(messages[messages.length - 1].chatMessageText);
    } catch (error) {
      console.log(error);
    }
    setFeedbackLoading(false);
  }, [modelParameters, loading, aichatContext, createUserMessage]);

  useEffect(() => {
    if (studentAnswer !== null) {
      getAIFeedback();
    }
  }, [studentAnswer, getAIFeedback]);

  const renderProblem = (index: number) => {
    const problem = PROBLEMS[index];
    const sharedProps = {
      problem,
      key: problem.id,
      submitted: isSubmitted,
      submitCallback: setIsSubmitted,
      correctCallback: setIsCorrect,
      studentAnswerCallback: setStudentAnswer,
    };
    switch (problem.type) {
      case 'multiple_choice_single_select':
      case 'multiple_choice_multi_select':
        return <MultipleChoice {...sharedProps} />;
      case 'scramble':
        return <Scramble {...sharedProps} />;
      case 'match':
        return <Match {...sharedProps} />;
      case 'sort':
        return <Sort {...sharedProps} />;
    }
  };

  return (
    <div className={styles.quiz}>
      <div className={styles.quizContent}>
        <p className={styles.overline}>Skills Check</p>
        <div style={{width: '80%'}}>{renderProblem(currentIndex)}</div>
        {isSubmitted && (
          <div className={styles.feedback}>
            <WaitingAnimation shouldDisplay={feedbackLoading} />
            {feedback && !feedbackLoading && (
              <SafeMarkdown unwrapped markdown={feedback} />
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
