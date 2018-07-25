import { PropTypes } from 'react';
/**
 * If custom PropType shapes are required in more than one file,
 * we define them here.
 */

// Represents a single student's free response to a free response
// assessment question.
export const freeResponsesDataPropType = PropTypes.shape({
  id:  PropTypes.number,
  name: PropTypes.string,
  response: PropTypes.string,
});

// Shapes for multiple choice overview

// Represents a single answer and the number of
// students who choose that answer
const answerDataPropType = PropTypes.shape({
  multipleChoiceOption: PropTypes.string,
  numAnswered: PropTypes.number,
  isCorrect: PropTypes.bool,
});

// Represents a single question and a section summary of answers
export const multipleChoiceDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  question: PropTypes.string.isRequired,
  questionNumber: PropTypes.number,
  answers: PropTypes.arrayOf(answerDataPropType),
  totalAnswered: PropTypes.number.isRequired,
  notAnswered: PropTypes.number.isRequired,
});

// Shapes for single student multiple choice tables

/**
 * Represents an individual student's response to a single
 * multiple choice question.
 * responses: returns strings such as 'A', or 'A, C'
 */
export const studentResponsePropType = PropTypes.shape({
  isCorrect: PropTypes.bool,
  responses: PropTypes.string,
});

// Represents a single student and a set of the student's answers for
// a single assessment's multiple choice questions
export const studentWithResponsesPropType = PropTypes.shape({
  id:  PropTypes.number,
  name: PropTypes.string,
  studentResponses: PropTypes.arrayOf(studentResponsePropType),
});

// Represents a single multiple choice question structure
export const multipleChoiceQuestionPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  question: PropTypes.string.isRequired,
  correctAnswer: PropTypes.string.isRequired,
});

export const QUESTION_CHARACTER_LIMIT = 110;
