import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {FC, useCallback, useMemo, useState, useEffect} from 'react';

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
import matchJson from '@cdo/static/tutor/match_example.json';
import multiSingleJson from '@cdo/static/tutor/multiple_choice_example.json';
import multiMultiJson from '@cdo/static/tutor/multiple_choice_multi_select.json';
import scrambleJson from '@cdo/static/tutor/scramble_example.json';
import sortJson from '@cdo/static/tutor/sort_example.json';

import {useAiTutorModelParameters} from '../../hooks/useAiTutorModelParameters';

import PracticeMatch from './PracticeMatch';
import PracticeMultipleChoice from './PracticeMultipleChoice';
import PracticeScramble from './PracticeScramble';
import PracticeSort from './PracticeSort';
import {
  LessonDeepDiveData,
  MatchSolution,
  MultiSolution,
  PracticeProblem,
  ReflectionData,
  ScrambleSolution,
} from './types';

import styles from './practice-problems.module.scss';

const PracticeProblems: PracticeProblem[] = [
  multiMultiJson as PracticeProblem,
  multiSingleJson as PracticeProblem,
  scrambleJson as PracticeProblem,
  matchJson as PracticeProblem,
  sortJson as PracticeProblem,
];

interface PracticeBoxProps {
  lessonId: number;
  lessonName: string;
  lessonSummary: string;
  vocabulary: LessonDeepDiveData['vocabulary'];
  objectives: LessonDeepDiveData['objectives'];
  reflectionData: ReflectionData | null;
}

const PracticeBox: FC<PracticeBoxProps> = ({
  lessonId,
  lessonName,
  lessonSummary,
  vocabulary,
  objectives,
  reflectionData,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState<
    (MultiSolution | ScrambleSolution | MatchSolution)[] | null
  >(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, PracticeProblems.length - 1));
    setIsSubmitted(false);
    setIsCorrect(false);
    setStudentAnswer(null);
    setFeedback(null);
    setFeedbackLoading(false);
  }, []);

  const isLast = currentIndex === PracticeProblems.length - 1;

  const getSystemPrompt = () => {
    let prompt = `You are a tutor giving feedback on a practice problem related to their lesson.
    You should reinforce the concepts in the lesson, provide guidance for misunderstandings, and
    tell the student how to improve their practice problem
    answer if they were not correct. Be specific and encouraging. Be kind when telling a student that they got something wrong.
    This is not a chat, you are just leaving a short feedback for the student to read.
    The student has just finished a lesson titled "${lessonName}".
    'Lesson summary:'${lessonSummary}.`;

    const vocabList = vocabulary
      .map(v => `- ${v.word}: ${v.definition}`)
      .join('\n');

    if (vocabulary.length > 0) {
      prompt += `\nVocabulary from this lesson:\n${vocabList}`;
    }

    if (reflectionData) {
      prompt += `\nStudent reflection on lesson objectives:\n${objectives
        .map(o => {
          const rating = reflectionData.objectiveReflections[o.id];
          return `- "${o.description}": ${rating ?? 'not rated'}`;
        })
        .join('\n')}`;
    }
    return prompt;
  };

  const aiTutorSystemPrompt = getSystemPrompt();

  //stuff for aiTutor feedback
  const {modelParameters, loading} = useAiTutorModelParameters({
    aiTutorSystemPrompt,
    aiTutorJsonSchema: undefined,
  });

  const aichatContext: AichatContext = useMemo(() => {
    return {
      clientType: AiChatClientTypes.LESSON_DEEP_DIVE,
      currentLevelId: null,
      scriptId: null,
      channelId: undefined,
      lessonId: lessonId,
    };
  }, [lessonId]);

  const createUserMessage = useCallback(() => {
    let prompt = `\nThe student got this practice problem ${
      isCorrect ? 'RIGHT' : 'WRONG'
    }.`;
    prompt += `\nThe practice problem question was: ${
      PracticeProblems[currentIndex].problem_text
    }
    and the correct answer was ${JSON.stringify(
      PracticeProblems[currentIndex].solution
    )}`;
    prompt += `\nThe Student's answer was ${JSON.stringify(studentAnswer)}`;
    prompt += `Tell the student if they got the practice problem right or wrong, then explain the answer.`;
    return prompt;
  }, [currentIndex, isCorrect, studentAnswer]);

  const getAIFeedback = useCallback(async () => {
    const newUserMessage: PendingChatMessage & {updateId: string} = {
      role: Role.USER,
      status: Status.UNKNOWN,
      chatMessageText: createUserMessage(),
      timestamp: Date.now(),
      updateId: createUuid(),
    };
    let messages: CompletedChatMessage[] = [];
    setFeedbackLoading(true);
    try {
      if (modelParameters && !loading) {
        messages = await postAichatCompletionMessage(
          newUserMessage,
          [],
          {...modelParameters},
          aichatContext
        );
        setFeedback(messages[messages.length - 1].chatMessageText);
      }
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

  const renderBox = (index: number) => {
    switch (PracticeProblems[index].type) {
      case 'multiple_choice_single_select':
        return (
          <PracticeMultipleChoice
            problem={PracticeProblems[index]}
            key={PracticeProblems[index].id}
            submitted={isSubmitted}
            submitCallback={setIsSubmitted}
            correctCallback={setIsCorrect}
            studentAnswerCallback={setStudentAnswer}
          />
        );
      case 'multiple_choice_multi_select':
        return (
          <PracticeMultipleChoice
            problem={PracticeProblems[index]}
            key={PracticeProblems[index].id}
            submitted={isSubmitted}
            submitCallback={setIsSubmitted}
            correctCallback={setIsCorrect}
            studentAnswerCallback={setStudentAnswer}
          />
        );
      case 'scramble':
        return (
          <PracticeScramble
            problem={PracticeProblems[index]}
            key={PracticeProblems[index].id}
            submitted={isSubmitted}
            submitCallback={setIsSubmitted}
            correctCallback={setIsCorrect}
            studentAnswerCallback={setStudentAnswer}
          />
        );
      case 'match':
        return (
          <PracticeMatch
            problem={PracticeProblems[index]}
            key={PracticeProblems[index].id}
            submitted={isSubmitted}
            submitCallback={setIsSubmitted}
            correctCallback={setIsCorrect}
            studentAnswerCallback={setStudentAnswer}
          />
        );
      case 'sort':
        return (
          <PracticeSort
            problem={PracticeProblems[index]}
            key={PracticeProblems[index].id}
            submitted={isSubmitted}
            submitCallback={setIsSubmitted}
            correctCallback={setIsCorrect}
            studentAnswerCallback={setStudentAnswer}
          />
        );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.prompt}>
          <Typography variant="h2" sx={{fontSize: {xs: '1.5rem', sm: '2rem'}}}>
            Let's Practice!!
          </Typography>
          <div className={styles.container}>
            <div className={styles.box}>{renderBox(currentIndex)}</div>
            {isSubmitted && (
              <div className={styles.nextButtonContainer}>
                <WaitingAnimation shouldDisplay={feedbackLoading} />
                {feedback !== null && !feedbackLoading && (
                  <Typography variant="body1">
                    <SafeMarkdown unwrapped markdown={feedback} />
                  </Typography>
                )}
                {!isLast && (
                  <button
                    type="button"
                    className={styles.nextButton}
                    onClick={goToNext}
                    aria-label="Next"
                    disabled={feedbackLoading || !isSubmitted}
                  >
                    <Typography variant="body1">Next Question</Typography>
                    <FontAwesomeV6Icon iconName="circle-arrow-right" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeBox;
