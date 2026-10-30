import React from 'react';

import {QuizQuestionSummary} from '../../types';
import {selectedAnswerLabel} from '../../utils';
import {
  ChoiceResultStatus,
  MultipleChoiceQuestionResponse,
  QuizQuestionResult,
} from '../types';

import ChoiceAnswer from './ChoiceAnswer';

type MultipleChoiceResult = QuizQuestionResult & MultipleChoiceQuestionResponse;

function getMultipleChoiceStatus(
  choiceId: string,
  result: MultipleChoiceResult
): ChoiceResultStatus {
  const isSelected = choiceId === result.responseData.selectedChoiceId;
  const isCorrectAnswer = choiceId === result.correctChoiceId;

  // showCorrectness off - still show what was picked, ungraded.
  if (result.correct === null) {
    return isSelected ? 'selected_ungraded' : 'neutral';
  }

  // showCorrectness is on.
  if (isSelected) {
    return result.correct ? 'correct' : 'incorrect';
  }
  return isCorrectAnswer ? 'correct' : 'neutral';
}

function getSrText(
  status: ChoiceResultStatus,
  answerLabel: string
): string | undefined {
  switch (status) {
    case 'correct':
      return 'Correct answer';
    case 'incorrect':
      return `${answerLabel}, incorrect`;
    case 'selected_ungraded':
      return answerLabel;
  }
}

const MultipleChoiceAnswer: React.FunctionComponent<{
  question: QuizQuestionSummary;
  result: MultipleChoiceResult;
  isViewingStudent?: boolean;
}> = ({question, result, isViewingStudent}) => {
  const answerLabel = selectedAnswerLabel(isViewingStudent);

  const choices = (question.choices ?? []).map(choice => {
    const status = getMultipleChoiceStatus(choice.id, result);
    return {
      ...choice,
      status,
      isSelected: choice.id === result.responseData.selectedChoiceId,
      srText: getSrText(status, answerLabel),
    };
  });

  return <ChoiceAnswer indicator="radio" choices={choices} />;
};

export default MultipleChoiceAnswer;
