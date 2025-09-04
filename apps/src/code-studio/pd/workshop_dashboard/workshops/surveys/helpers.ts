import {
  isQuestionType,
  LikertResults,
  SurveyQuestion,
} from '../../WorkshopFormTemplate/types';

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

export const prepLikertBreakdown = (breakdown: LikertResults['breakdown']) =>
  Object.entries(breakdown ?? {})
    .map(([key, value]) => ({
      ...value,
      className:
        Number(key) === 4 ? 'neutral' : Number(key) > 4 ? 'success' : 'error',
    }))
    .reverse();
