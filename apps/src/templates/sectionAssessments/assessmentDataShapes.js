import { PropTypes } from 'react';

export const studentAnswerDataPropType = PropTypes.shape({
  id:  PropTypes.string,
  name: PropTypes.string,
  studentAnswers: PropTypes.array.isRequired,
});

export const answerDataPropType = PropTypes.shape({
  multipleChoiceOption: PropTypes.string,
  percentAnswered: PropTypes.number,
  isCorrectAnswer: PropTypes.bool,
});

export const questionDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  question: PropTypes.string.isRequired,
  answers: PropTypes.arrayOf(answerDataPropType),
  notAnswered: PropTypes.number.isRequired,
});
