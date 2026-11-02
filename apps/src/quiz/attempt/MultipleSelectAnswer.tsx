import React from 'react';

import {QuizQuestionSummary} from '../types';
import {selectedAnswerLabel} from '../utils';

import ChoiceAnswer from './ChoiceAnswer';
import {
  ChoiceResultStatus,
  MultipleSelectQuestionResponse,
  QuizQuestionResult,
} from './types';

type MultipleSelectResult = QuizQuestionResult & MultipleSelectQuestionResponse;

function getMultipleSelectStatus(
  isSelected: boolean,
  correctChoiceIds: string[] | null,
  choiceId: string
): ChoiceResultStatus {
  // showCorrectness off - still show what was selected, ungraded.
  if (!correctChoiceIds) {
    return isSelected ? 'selected_ungraded' : 'neutral';
  }
  const isCorrectAnswer = correctChoiceIds.includes(choiceId);
  if (isSelected) {
    return isCorrectAnswer ? 'correct' : 'incorrect';
  }
  return isCorrectAnswer ? 'correct' : 'neutral';
}

function getSrText(
  status: ChoiceResultStatus,
  isSelected: boolean,
  answerLabel: string
): string | undefined {
  switch (status) {
    case 'correct':
      return isSelected
        ? `${answerLabel}, correct`
        : 'Correct answer, not selected';
    case 'incorrect':
      return `${answerLabel}, incorrect`;
    case 'selected_ungraded':
      return answerLabel;
  }
}

const MultipleSelectAnswer: React.FunctionComponent<{
  question: QuizQuestionSummary;
  result: MultipleSelectResult;
  isViewingStudent?: boolean;
}> = ({question, result, isViewingStudent}) => {
  const selectedChoiceIds = result.responseData.selectedChoiceIds ?? [];
  const correctChoiceIds =
    result.correct === null ? null : result.correctChoiceIds ?? null;
  const answerLabel = selectedAnswerLabel(isViewingStudent);
  const choices = (question.choices ?? []).map(choice => {
    const isSelected = selectedChoiceIds.includes(choice.id);
    const status = getMultipleSelectStatus(
      isSelected,
      correctChoiceIds,
      choice.id
    );
    return {
      ...choice,
      status,
      isSelected,
      srText: getSrText(status, isSelected, answerLabel),
    };
  });

  return <ChoiceAnswer indicator="checkbox" choices={choices} />;
};

export default MultipleSelectAnswer;
