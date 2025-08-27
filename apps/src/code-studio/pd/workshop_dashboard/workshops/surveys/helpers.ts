import {isQuestionType, SurveyQuestion} from '../../WorkshopFormTemplate/types';

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
    if (question.results.total_respondents === 0) {
      return '';
    }
    const numWithBarriers =
      question.results.total_respondents -
      (question.results.breakdown.none?.count ?? 0);
    return `${numWithBarriers} teachers reported at least 1 or more barriers to implementation`;
  }
  return '';
};
