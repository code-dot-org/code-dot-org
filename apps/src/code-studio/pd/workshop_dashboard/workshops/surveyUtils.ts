import {
  LikertResults,
  Breakdown,
  PromoterResults,
  SurveyQuestion,
} from './types';

export const isQuestionType = <T extends SurveyQuestion['question_type']>(
  question: SurveyQuestion | undefined,
  type: T
): question is Extract<SurveyQuestion, {question_type: T}> => {
  return !!question && question.question_type === type;
};

export const getQuestionDescription = (question: SurveyQuestion) => {
  if (
    isQuestionType(question, 'likert') ||
    isQuestionType(question, 'promoter')
  ) {
    return `${question.results.total_responses} responses`;
  }
  if (
    isQuestionType(question, 'multiSelect') &&
    question.question_name === 'barriers_implementation_curriculum'
  ) {
    if (!question.results.total_respondents) {
      return '';
    }
    const numWithBarriers =
      question.results.total_respondents -
      (question.results.breakdown?.none?.count ?? 0);
    return `${numWithBarriers} teachers reported at least 1 or more barriers to implementation`;
  }
  return '';
};

export const prepLikertBreakdown = (
  breakdown: LikertResults['breakdown']
): Breakdown[] =>
  Object.entries(breakdown ?? {})
    .map(
      ([key, value]): Breakdown => ({
        ...value,
        color:
          Number(key) === 4 ? 'neutral' : Number(key) > 4 ? 'success' : 'error',
      })
    )
    .reverse();

export const prepPromoterBreakdown = (
  breakdown: PromoterResults['breakdown']
): Breakdown[] =>
  Object.entries(breakdown ?? {}).map(([key, value]) => ({
    ...value,
    label: value.label.replace(/\D+/, ''),
    color: Number(key) > 8 ? 'success' : Number(key) > 6 ? 'warning' : 'error',
  }));
