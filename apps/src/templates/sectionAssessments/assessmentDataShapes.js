import PropTypes from 'prop-types';
/**
 * If custom PropType shapes are required in more than one file,
 * we define them here.
 */

// Represents a single student's free response to a free response
// assessment question.
export const freeResponsesDataPropType = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  response: PropTypes.string
});

// Shapes for multiple choice overview

// Represents a single answer and the number of
// students who choose that answer
const multipleChoiceAnswerDataPropType = PropTypes.shape({
  multipleChoiceOption: PropTypes.string,
  numAnswered: PropTypes.number,
  isCorrect: PropTypes.bool
});

// Represents a single question and a section summary of answers
export const multipleChoiceDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  question: PropTypes.string.isRequired,
  questionNumber: PropTypes.number,
  answers: PropTypes.arrayOf(multipleChoiceAnswerDataPropType),
  totalAnswered: PropTypes.number.isRequired,
  notAnswered: PropTypes.number.isRequired
});

// Shapes for single student multiple choice tables

/**
 * Represents an individual student's response to a single
 * multiple choice question.
 * responses: returns strings such as 'A', or 'A, C'
 */
export const studentMCResponsePropType = PropTypes.shape({
  isCorrect: PropTypes.bool,
  responses: PropTypes.string
});

// Represents a single student and a set of the student's answers for
// a single assessment's multiple choice questions
export const studentWithMCResponsesPropType = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  studentResponses: PropTypes.arrayOf(studentMCResponsePropType)
});

// Represents a single multiple choice question structure
export const multipleChoiceQuestionPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  question: PropTypes.string.isRequired,
  correctAnswer: PropTypes.string.isRequired
});

// Shapes for match overview

// Represents a single answer for a single option of a match question and a section summary of answers
const answerDataPropTypeMatch = PropTypes.shape({
  answer: PropTypes.string,
  isCorrect: PropTypes.bool,
  numAnswered: PropTypes.number
});

// Represents a single option of a match question and a section summary of answers
export const optionDataPropTypeMatch = PropTypes.shape({
  option: PropTypes.string,
  totalAnswered: PropTypes.number,
  notAnswered: PropTypes.number,
  id: PropTypes.number,
  answers: PropTypes.arrayOf(answerDataPropTypeMatch)
});

// Represents a single match question and a section summary of answers
export const matchDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  question: PropTypes.string.isRequired,
  questionNumber: PropTypes.number,
  options: PropTypes.arrayOf(optionDataPropTypeMatch)
});

// Shapes for single student match tables

/**
 * Represents an individual student's response to a single
 * match question.
 */
export const studentMatchResponsePropType = PropTypes.shape({
  responses: PropTypes.array
});

// Represents a single student and a set of the student's answers for
// a single assessment's match questions
export const studentWithMatchResponsesPropType = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  studentResponses: PropTypes.arrayOf(studentMatchResponsePropType)
});

// Represents a single match question structure
export const matchQuestionPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  question: PropTypes.string.isRequired,
  questionNumber: PropTypes.number.isRequired,
  answers: PropTypes.array,
  options: PropTypes.array
});

// Represents a single match question structure
export const matchDetailsQuestionPropType = PropTypes.shape({
  question: PropTypes.string.isRequired,
  questionType: PropTypes.string,
  answers: PropTypes.array,
  options: PropTypes.array
});

// Summary of student answers for match and multiple choice questions
export const studentOverviewDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  numMultipleChoiceCorrect: PropTypes.number,
  numMultipleChoice: PropTypes.number,
  numMatchCorrect: PropTypes.number,
  numMatch: PropTypes.number,
  submissionTimeStamp: PropTypes.string.isRequired,
  isSubmitted: PropTypes.bool.isRequired,
  url: PropTypes.string
});

export const QUESTION_CHARACTER_LIMIT = 110;
