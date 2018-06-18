import { PropTypes } from 'react';
/**
 * If custom PropType shapes are required in more than one file,
 * we define them here.
 */

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
  id:  PropTypes.string,
  name: PropTypes.string,
  studentResponses: PropTypes.arrayOf(studentResponsePropType).isRequired,
});

// Represents a single multiple choice question structure
export const multipleChoiceQuestionPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  question: PropTypes.string.isRequired,
  correctAnswer: PropTypes.string.isRequired,
});
