import { PropTypes } from 'react';

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

// Shapes for single student multiple choice tables

// Represents an individual students response to a single
// multiple choice question.
export const studentResponsePropType = PropTypes.shape({
  isCorrect: PropTypes.bool,
  answers: PropTypes.string,
});

// Represents a single student and a set of there answers for
// a single assessment's multiple choice questions
export const studentAnswerDataPropType = PropTypes.shape({
  id:  PropTypes.string,
  name: PropTypes.string,
  studentAnswers: PropTypes.arrayOf(studentResponsePropType).isRequired,
});


