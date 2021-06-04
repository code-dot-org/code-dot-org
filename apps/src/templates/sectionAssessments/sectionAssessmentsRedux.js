import {SET_SECTION} from '@cdo/apps/redux/sectionDataRedux';
import {
  SET_SCRIPT,
  getSelectedScriptName
} from '@cdo/apps/redux/scriptSelectionRedux';

export const ALL_STUDENT_FILTER = 0;

/**
 * Initial state of sectionAssessmentsRedux
 * The redux state matches the structure of our API calls and our views don't
 * use this structure directly. Selectors filter and transform data to what they need.
 *
 * assessmentResponsesByScript - object - keys are scriptIds, values are objects of
 *  student ids to student response data for each assessment
 * assessmentQuestionsByScript - object - keys are scriptIds, values are objects of
 *   assessmentIds to question and answer information for each assessment
 * surveysByScript - object - keys are scriptIds, values are objects of
 *   assessmentIds to survey questions and anonymous responses
 * isLoading - boolean - indicates that requests for assessments and surveys have been
 * sent to the server but the client has not yet received a response
 * assessmentId - int - the level_group id of the assessment currently in view
 * questionIndex - int - the question index of the question currently in view in detail view
 * studentId - int - the studentId of the current student being filtered for.
 */
const initialState = {
  assessmentResponsesByScript: {},
  assessmentQuestionsByScript: {},
  feedbackByScript: {},
  surveysByScript: {},
  isLoading: false,
  assessmentId: 0,
  questionIndex: 0,
  studentId: ALL_STUDENT_FILTER
};

// Question types for assessments.
export const QuestionType = {
  MULTI: 'Multi',
  MATCH: 'Match',
  FREE_RESPONSE: 'FreeResponse'
};

// Question types for surveys.
const SurveyQuestionType = {
  MULTI: 'multi',
  FREE_RESPONSE: 'free_response'
};

const MultiAnswerStatus = {
  CORRECT: 'correct',
  INCORRECT: 'incorrect'
};

const ANSWER_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

export const ASSESSMENT_FEEDBACK_OPTION_ID = 0;

/* In order for the sorting of the submission timestamp column to work correctly in the SubmissionStatusAssessmentsTable, the submissionTimeStamp field must be a Date. So, we pass in arbitrary Dates in the past to handle when the assessment is in progress or not yet started. */
export const inProgressFakeTimestamp = new Date(
  '1990-01-01T20:52:05.000+00:00'
);
export const notStartedFakeTimestamp = new Date(
  '1980-01-01T20:52:05.000+00:00'
);

// Action type constants
const SET_ASSESSMENT_RESPONSES = 'sectionAssessments/SET_ASSESSMENT_RESPONSES';
const SET_ASSESSMENTS_QUESTIONS =
  'sectionAssessments/SET_ASSESSMENTS_QUESTIONS';
const SET_FEEDBACK = 'sectionAssessments/SET_FEEDBACK';
const SET_SURVEYS = 'sectionAssessments/SET_SURVEYS';
const START_LOADING_ASSESSMENTS =
  'sectionAssessments/START_LOADING_ASSESSMENTS';
const FINISH_LOADING_ASSESSMENTS =
  'sectionAssessments/FINISH_LOADING_ASSESSMENTS';
const SET_ASSESSMENT_ID = 'sectionAssessments/SET_ASSESSMENT_ID';
const SET_INITIAL_ASSESSMENT_ID =
  'sectionAssessments/SET_INITIAL_ASSESSMENT_ID';
const SET_STUDENT_ID = 'sectionAssessments/SET_STUDENT_ID';
const SET_QUESTION_INDEX = 'sectionAssessments/SET_QUESTION_INDEX';

// Action creators
export const setAssessmentResponses = (scriptId, assessments) => ({
  type: SET_ASSESSMENT_RESPONSES,
  scriptId,
  assessments
});
export const setAssessmentQuestions = (scriptId, assessments) => ({
  type: SET_ASSESSMENTS_QUESTIONS,
  scriptId,
  assessments
});
export const setFeedback = (scriptId, feedback) => ({
  type: SET_FEEDBACK,
  scriptId,
  feedback
});
export const startLoadingAssessments = () => ({
  type: START_LOADING_ASSESSMENTS
});
export const finishLoadingAssessments = () => ({
  type: FINISH_LOADING_ASSESSMENTS
});
export const setAssessmentId = assessmentId => ({
  type: SET_ASSESSMENT_ID,
  assessmentId: assessmentId
});
export const setInitialAssessmentId = scriptId => ({
  type: SET_INITIAL_ASSESSMENT_ID,
  scriptId: scriptId
});
export const setQuestionIndex = questionIndex => ({
  type: SET_QUESTION_INDEX,
  questionIndex: questionIndex
});
export const setStudentId = studentId => ({
  type: SET_STUDENT_ID,
  studentId: studentId
});
export const setSurveys = (scriptId, surveys) => ({
  type: SET_SURVEYS,
  scriptId,
  surveys
});

export const asyncLoadAssessments = (sectionId, scriptId) => {
  return (dispatch, getState) => {
    const state = getState().sectionAssessments;

    // Don't load data if it's already stored or if there is no script or no section selected.
    if (
      state.assessmentResponsesByScript[scriptId] ||
      !scriptId ||
      !sectionId
    ) {
      return;
    }

    dispatch(startLoadingAssessments());

    const loadResponses = loadAssessmentResponsesFromServer(
      sectionId,
      scriptId
    );
    const loadQuestions = loadAssessmentQuestionsFromServer(scriptId);
    const loadSurveys = loadSurveysFromServer(sectionId, scriptId);
    const loadFeedback = loadFeedbackFromServer(sectionId, scriptId);

    Promise.all([loadResponses, loadQuestions, loadSurveys, loadFeedback])
      .then(arrayOfValues => {
        dispatch(setAssessmentResponses(scriptId, arrayOfValues[0]));
        dispatch(setAssessmentQuestions(scriptId, arrayOfValues[1]));
        dispatch(setFeedback(scriptId, arrayOfValues[3]));
        dispatch(setSurveys(scriptId, arrayOfValues[2]));
        dispatch(setInitialAssessmentId(scriptId));
        dispatch(finishLoadingAssessments());
      })
      .catch(error => {
        // If any return an error, the UI will show that there are no assessments.
        dispatch(finishLoadingAssessments());
      });
  };
};

export default function sectionAssessments(state = initialState, action) {
  if (action.type === SET_SECTION) {
    /**
     * Setting the section is the first action to be called when switching
     * sections, which requires us to reset our state. This might need to change
     * once switching sections is in react/redux.
     */
    return {
      ...initialState
    };
  }
  if (action.type === SET_SCRIPT) {
    return {
      ...state,
      studentId: ALL_STUDENT_FILTER,
      questionIndex: 0
    };
  }
  if (action.type === SET_ASSESSMENT_ID) {
    return {
      ...state,
      assessmentId: action.assessmentId,
      questionIndex: 0,
      studentId: ALL_STUDENT_FILTER
    };
  }
  if (action.type === SET_INITIAL_ASSESSMENT_ID) {
    const assessmentId = getFirstAssessmentId(state, action.scriptId);
    return {
      ...state,
      assessmentId
    };
  }
  if (action.type === SET_STUDENT_ID) {
    return {
      ...state,
      studentId: action.studentId
    };
  }
  if (action.type === SET_QUESTION_INDEX) {
    return {
      ...state,
      questionIndex: action.questionIndex
    };
  }
  if (action.type === SET_ASSESSMENT_RESPONSES) {
    return {
      ...state,
      assessmentResponsesByScript: {
        ...state.assessmentResponsesByScript,
        [action.scriptId]: action.assessments
      }
    };
  }
  if (action.type === SET_FEEDBACK) {
    return {
      ...state,
      feedbackByScript: {
        ...state.feedbackByScript,
        [action.scriptId]: action.feedback
      }
    };
  }
  if (action.type === SET_SURVEYS) {
    return {
      ...state,
      surveysByScript: {
        ...state.surveysByScript,
        [action.scriptId]: action.surveys
      }
    };
  }
  if (action.type === SET_ASSESSMENTS_QUESTIONS) {
    return {
      ...state,
      assessmentQuestionsByScript: {
        ...state.assessmentQuestionsByScript,
        [action.scriptId]: action.assessments
      },
      // Default the assessmentId to the first assessment in the structure
      assessmentId: parseInt(Object.keys(action.assessments)[0])
    };
  }
  if (action.type === START_LOADING_ASSESSMENTS) {
    return {
      ...state,
      isLoading: true
    };
  }
  if (action.type === FINISH_LOADING_ASSESSMENTS) {
    return {
      ...state,
      isLoading: false
    };
  }

  return state;
}

// Selector functions

// Returns an array of objects, each indicating an assessment name and it's id
// for the assessments and surveys in the current script.
export const getCurrentScriptAssessmentList = state => {
  let tempAssessmentList = computeScriptAssessmentList(
    state.sectionAssessments,
    state.scriptSelection.scriptId
  );
  /* Only add the feedback option to the dropdown for CSD and CSP */
  if (doesCurrentCourseUseFeedback(state)) {
    tempAssessmentList = tempAssessmentList.concat({
      id: ASSESSMENT_FEEDBACK_OPTION_ID,
      name: 'All teacher feedback in this unit'
    });
  }
  return tempAssessmentList;
};

// Get the student responses for assessments in the current script and current assessment
export const getAssessmentResponsesForCurrentScript = state => {
  return (
    state.sectionAssessments.assessmentResponsesByScript[
      state.scriptSelection.scriptId
    ] || {}
  );
};

// Get the question structure for assessments in the current script and current assessment
export const getCurrentAssessmentQuestions = state => {
  const currentScriptData =
    state.sectionAssessments.assessmentQuestionsByScript[
      state.scriptSelection.scriptId
    ] || {};
  return currentScriptData[state.sectionAssessments.assessmentId];
};

// Returns an object with the question text and answers of the currently selected
// question in the current assessment.
export const getCurrentQuestion = state => {
  const emptyQuestion = {question: '', answers: []};
  const isSurvey = isCurrentAssessmentSurvey(state);
  if (isSurvey) {
    const surveys =
      state.sectionAssessments.surveysByScript[
        state.scriptSelection.scriptId
      ] || {};
    const currentSurvey = surveys[state.sectionAssessments.assessmentId];
    const questionsData = currentSurvey.levelgroup_results;
    const question = questionsData[state.sectionAssessments.questionIndex];
    if (question) {
      return {
        question: question.question,
        answers:
          question.type === SurveyQuestionType.MULTI &&
          question.answer_texts.map((answer, index) => {
            return {
              text: answer,
              correct: false,
              letter: ANSWER_LETTERS[index]
            };
          })
      };
    } else {
      return emptyQuestion;
    }
  } else {
    // Get question text for assessment.
    const assessment = getCurrentAssessmentQuestions(state) || {};
    const assessmentQuestions = assessment.questions;
    const question = assessmentQuestions
      ? assessmentQuestions[state.sectionAssessments.questionIndex]
      : null;
    if (question) {
      if (question.type === QuestionType.MULTI) {
        const answers =
          question.type === QuestionType.MULTI &&
          (question.answers || []).map((answer, index) => {
            return {...answer, letter: ANSWER_LETTERS[index]};
          });

        return {
          question: question.question_text,
          answers: answers,
          questionType: QuestionType.MULTI
        };
      } else if (question.type === QuestionType.FREE_RESPONSE) {
        return {
          question: question.question_text,
          answers: null,
          questionType: QuestionType.FREE_RESPONSE
        };
      } else if (question.type === QuestionType.MATCH) {
        const answers = question.answers.map(answer => {
          return answer.text;
        });
        const options = question.options.map(option => {
          return option.text;
        });
        return {
          question: question.question,
          answers: answers,
          options: options,
          questionType: QuestionType.MATCH
        };
      }
    } else {
      return emptyQuestion;
    }
  }
};

/**
 * Returns an array of objects, each of type questionStructurePropType
 * indicating the question and correct answers for each multiple choice
 * question in the currently selected assessment.
 */
export const getMultipleChoiceStructureForCurrentAssessment = state => {
  const assessmentsStructure = getCurrentAssessmentQuestions(state);
  if (!assessmentsStructure) {
    return [];
  }

  const questionData = assessmentsStructure.questions;

  // Transform that data into what we need for this particular table, in this case
  // questionStructurePropType structure.
  return questionData
    .filter(question => question.type === QuestionType.MULTI)
    .map(question => {
      return {
        id: question.level_id,
        question: question.question_text,
        questionNumber: question.question_index + 1,
        correctAnswer: getCorrectAnswer(question.answers)
      };
    });
};

/**
 * Returns an array of objects, each of type studentAnswerDataPropType
 * indicating the student responses to multiple choice questions for the
 * currently selected assessment.
 */
export const getStudentMCResponsesForCurrentAssessment = state => {
  const studentResponses = getAssessmentResponsesForCurrentScript(state);
  if (!studentResponses) {
    return {};
  }
  const studentId = state.sectionAssessments.studentId;
  const studentObject = studentResponses[studentId];
  if (!studentObject) {
    return {};
  }

  const currentAssessmentId = state.sectionAssessments.assessmentId;
  const studentAssessment =
    studentObject.responses_by_assessment[currentAssessmentId];

  // If the student has not submitted this assessment, don't display results.
  if (!studentAssessment) {
    return {};
  }

  // Transform that data into what we need for this particular table, in this case
  // is the structure studentAnswerDataPropType
  return {
    id: studentId,
    name: studentObject.student_name,
    studentResponses: studentAssessment.level_results
      .filter(answer => answer.type === QuestionType.MULTI)
      .map(answer => {
        return {
          responses: indexesToAnswerString(answer.student_result),
          isCorrect: answer.status === MultiAnswerStatus.CORRECT
        };
      })
  };
};

/*
 * Get the match questions in the current assessment
 */
export const getMatchStructureForCurrentAssessment = state => {
  const assessmentsStructure = getCurrentAssessmentQuestions(state);
  if (!assessmentsStructure) {
    return [];
  }

  const questionData = assessmentsStructure.questions;

  // Transform that data into what we need for this particular table, in this case
  // questionStructurePropType structure.
  return questionData
    .filter(question => question.type === QuestionType.MATCH)
    .map(question => {
      return {
        id: question.level_id,
        question: question.question,
        questionNumber: question.question_index + 1,
        answers: question.answers,
        options: question.options
      };
    });
};

/*
 * Get the match questions responses in the current assessment
 */
export const getStudentMatchResponsesForCurrentAssessment = state => {
  const studentResponses = getAssessmentResponsesForCurrentScript(state);
  if (!studentResponses) {
    return {};
  }
  const studentId = state.sectionAssessments.studentId;
  const studentObject = studentResponses[studentId];
  if (!studentObject) {
    return {};
  }

  const currentAssessmentId = state.sectionAssessments.assessmentId;
  const studentAssessment =
    studentObject.responses_by_assessment[currentAssessmentId];

  // If the student has not submitted this assessment, don't display results.
  if (!studentAssessment) {
    return {};
  }

  // Transform that data into what we need for this particular table, in this case
  // is the structure studentAnswerDataPropType
  return {
    id: studentId,
    name: studentObject.student_name,
    studentResponses: studentAssessment.level_results
      .filter(answer => answer.type === QuestionType.MATCH)
      .map(answer => {
        return {
          responses: answer.student_result
        };
      })
  };
};

// Get an array of objects indicating what each student answered for the current
// question in view.
export const getStudentAnswersForCurrentQuestion = state => {
  const studentResponses = getAssessmentResponsesForCurrentScript(state);
  if (!studentResponses || isCurrentAssessmentSurvey(state)) {
    return [];
  }

  const questionIndex = state.sectionAssessments.questionIndex;
  let studentAnswers = [];

  // For each student, look up their responses to the currently selected assessment.
  Object.keys(studentResponses).forEach(studentId => {
    studentId = parseInt(studentId, 10);
    const studentObject = studentResponses[studentId];
    const currentAssessmentId = state.sectionAssessments.assessmentId;
    let studentAssessment =
      studentObject.responses_by_assessment[currentAssessmentId] || {};

    const responsesArray = studentAssessment.level_results || [];
    const question = responsesArray[questionIndex];
    if (question) {
      if (question.type === QuestionType.MULTI) {
        studentAnswers.push({
          id: studentId,
          name: studentObject.student_name,
          answer: question.student_result
            ? indexesToAnswerString(question.student_result)
            : '-',
          correct: question.status === 'correct'
        });
      }
    }
  });
  return studentAnswers;
};

/**
 * Returns an array of objects, each representing a free response question
 * and all the students' responses to that question.
 */
export const getAssessmentsFreeResponseResults = state => {
  const assessmentsStructure = getCurrentAssessmentQuestions(state);
  if (!assessmentsStructure) {
    return [];
  }

  // Initialize an object for each question, with the questionText and
  // an empty array of responses.
  const questionData = assessmentsStructure.questions;
  const questionsAndResults = questionData
    .filter(question => question.type === QuestionType.FREE_RESPONSE)
    .map(question => ({
      questionText: question.question_text,
      questionNumber: question.question_index + 1,
      responses: []
    }));

  const studentResponses = getAssessmentResponsesForCurrentScript(state);

  let currentStudentsIds = Object.keys(studentResponses);
  // Filter by current selected student.
  if (state.sectionAssessments.studentId !== ALL_STUDENT_FILTER) {
    if (!currentStudentHasResponses(state)) {
      return [];
    } else {
      currentStudentsIds = [state.sectionAssessments.studentId];
    }
  }

  // For each student, look up their responses to the currently selected assessment.
  currentStudentsIds.forEach(studentId => {
    studentId = parseInt(studentId, 10);
    const studentObject = studentResponses[studentId];
    const currentAssessmentId = state.sectionAssessments.assessmentId;
    let studentAssessment =
      studentObject.responses_by_assessment[currentAssessmentId] || {};

    const responsesArray = studentAssessment.level_results || [];
    responsesArray
      .filter(result => result.type === QuestionType.FREE_RESPONSE)
      .forEach((response, index) => {
        if (questionsAndResults[index]) {
          questionsAndResults[index].responses.push({
            id: studentId,
            name: studentObject.student_name,
            response: response.student_result
          });
        }
      });
  });
  return questionsAndResults;
};

/**
 * Returns an array of objects, each of type freeResponseQuestionsPropType
 * indicating the question and responses to free response questions for the
 * currently selected survey.
 */
export const getSurveyFreeResponseQuestions = state => {
  const surveysStructure =
    state.sectionAssessments.surveysByScript[state.scriptSelection.scriptId] ||
    {};
  const currentSurvey = surveysStructure[state.sectionAssessments.assessmentId];
  if (!currentSurvey) {
    return [];
  }

  const questionData = currentSurvey.levelgroup_results;

  return questionData
    .filter(question => question.type === SurveyQuestionType.FREE_RESPONSE)
    .map(question => {
      return {
        questionText: question.question,
        questionNumber: question.question_index + 1,
        answers: question.results.map((response, index) => {
          return {index: index, response: response.result};
        })
      };
    });
};

/**
 * Returns an array of objects, each of type multipleChoiceDataPropType
 * indicating a multiple choice question and the percent of responses received
 * for each answer.
 */
export const getMultipleChoiceSurveyResults = state => {
  const surveysStructure =
    state.sectionAssessments.surveysByScript[state.scriptSelection.scriptId] ||
    {};
  const currentSurvey = surveysStructure[state.sectionAssessments.assessmentId];
  if (!currentSurvey) {
    return [];
  }

  const questionData = currentSurvey.levelgroup_results;

  // Filter to multiple choice questions.
  return questionData
    .filter(question => question.type === SurveyQuestionType.MULTI)
    .map((question, index) => {
      // Calculate the total responses for each answer.

      const totalAnswered = question.results.length;
      // Each value of answerTotals represents the number of responses received for
      // the answer in that index.
      const answerTotals = [];
      // Initialize each answer to 0 responses.
      for (let i = 0; i < question.answer_texts.length; i++) {
        answerTotals[i] = 0;
      }
      let notAnswered = 0;

      // For each response, add 1 to the correct value in answerTotals.
      for (let i = 0; i < totalAnswered; i++) {
        const answerIndex = question.results[i].answer_index;
        if (answerIndex >= 0) {
          answerTotals[answerIndex]++;
        } else {
          notAnswered++;
        }
      }

      return {
        id: index,
        question: question.question,
        questionNumber: question.question_index + 1,
        answers: question.answer_texts.map((answer, index) => {
          return {
            multipleChoiceOption: ANSWER_LETTERS[index],
            percentAnswered: Math.floor(
              (answerTotals[index] / totalAnswered) * 100
            ),
            text: answer
          };
        }),
        notAnswered: Math.floor((notAnswered / totalAnswered) * 100),
        totalAnswered: totalAnswered
      };
    });
};

// Returns a boolean.  The selector function checks if the current assessment Id
// is in the surveys structure.
export const isCurrentAssessmentSurvey = state => {
  const scriptId = state.scriptSelection.scriptId;
  const surveysStructure =
    state.sectionAssessments.surveysByScript[scriptId] || {};

  const currentAssessmentId = state.sectionAssessments.assessmentId;
  return Object.keys(surveysStructure).includes(currentAssessmentId + '');
};

/** Get data for students assessments multiple choice table
 * Returns an object, each of type studentOverviewDataPropType with
 * the value of the key being an object that contains the number
 * of multiple choice answered correctly by a student, total number
 * of multiple choice options, check for if the student submitted the
 * assessment and a timestamp that indicates when a student submitted
 * the assessment.
 */
export const getStudentsMCandMatchSummaryForCurrentAssessment = state => {
  const studentResponses = getAssessmentResponsesForCurrentScript(state);
  if (!studentResponses) {
    return [];
  }

  // Get a set of all students from sectionDataRedux.
  let allStudentsByIds = {};
  state.sectionData.section.students.forEach(student => {
    allStudentsByIds[student.id] = {
      student_name: student.name,
      responses_by_assessment: {}
    };
  });

  // Combine the list of all students with the list of student responses.
  allStudentsByIds = {
    ...allStudentsByIds,
    ...studentResponses
  };

  let currentStudentsIds = Object.keys(allStudentsByIds);
  // Filter by current selected student.
  if (state.sectionAssessments.studentId !== ALL_STUDENT_FILTER) {
    currentStudentsIds = [state.sectionAssessments.studentId];
  }

  const studentsSummaryArray = currentStudentsIds.map(studentId => {
    studentId = parseInt(studentId, 10);
    const studentsObject = allStudentsByIds[studentId];
    const currentAssessmentId = state.sectionAssessments.assessmentId;
    const studentsAssessment =
      studentsObject.responses_by_assessment[currentAssessmentId];

    // If the student has not submitted this assessment
    if (!studentsAssessment) {
      return {
        id: studentId,
        name: studentsObject.student_name,
        isSubmitted: false,
        inProgress: false,
        submissionTimeStamp: notStartedFakeTimestamp
      };
    }
    // Transform that data into what we need for this particular table, in this case
    // it is the structure studentOverviewDataPropType

    /* In progress assessments have a timestamp from the server indicating when the student last worked on the assessment. We don't display that timestamp in the SubmissionStatusAssessmentsTable, but we use it here to check if the assessment has been started. */
    const inProgress =
      studentsAssessment.timestamp && !studentsAssessment.submitted;
    const submissionTimeStamp = inProgress
      ? inProgressFakeTimestamp
      : new Date(studentsAssessment.timestamp);

    return {
      id: studentId,
      name: studentsObject.student_name,
      numMultipleChoiceCorrect: studentsAssessment.multi_correct,
      numMultipleChoice: studentsAssessment.multi_count,
      numMatchCorrect: studentsAssessment.match_correct,
      numMatch: studentsAssessment.match_count,
      inProgress: inProgress,
      isSubmitted: studentsAssessment.submitted,
      submissionTimeStamp: submissionTimeStamp,
      url: studentsAssessment.url
    };
  });

  return studentsSummaryArray;
};

/**
 * @returns {array} of objects with keys corresponding to columns
 * of CSV to download. Columns are defined as CSV_SUBMISSION_STATUS_HEADERS in SubmissionStatusAssessmentsContainer
 */
export const getExportableSubmissionStatusData = state => {
  let summaryStudentStatus = [];
  const studentStatus = getStudentsMCandMatchSummaryForCurrentAssessment(state);

  studentStatus.forEach(student => {
    summaryStudentStatus.push({
      studentName: student.name,
      numMultipleChoiceCorrect: student.numMultipleChoiceCorrect,
      numMultipleChoice: student.numMultipleChoice,
      numMatchCorrect: student.numMatchCorrect,
      numMatch: student.numMatch,
      submissionTimestamp: student.submissionTimeStamp
    });
  });
  return summaryStudentStatus;
};

// Returns an array of objects corresponding to each question and the
// number of students who answered each answer.
export const getMultipleChoiceSectionSummary = state => {
  // Set up an initial structure based on the multiple choice assessment questions.
  // Initialize numAnswered for each answer to 0, and totalAnswered for each
  // question to 0.
  const assessmentsStructure = getCurrentAssessmentQuestions(state);
  if (!assessmentsStructure) {
    return [];
  }
  const questionData = assessmentsStructure.questions;
  const multiQuestions = questionData.filter(
    question => question.type === QuestionType.MULTI
  );
  const results = multiQuestions.map(question => {
    return {
      id: question.level_id,
      question: question.question_text,
      questionNumber: question.question_index + 1,
      answers: question.answers.map((answer, index) => {
        return {
          multipleChoiceOption: ANSWER_LETTERS[index],
          isCorrect: answer.correct,
          numAnswered: 0
        };
      }),
      totalAnswered: 0,
      notAnswered: 0
    };
  });

  // Calculate the number of students who answered each option and fill
  // in the initialized results structure above.
  const studentResponses = getAssessmentResponsesForCurrentScript(state);
  if (!studentResponses) {
    return [];
  }
  Object.keys(studentResponses).forEach(studentId => {
    studentId = parseInt(studentId, 10);
    const studentObject = studentResponses[studentId];
    const currentAssessmentId = state.sectionAssessments.assessmentId;
    const studentAssessment =
      studentObject.responses_by_assessment[currentAssessmentId] || {};

    const studentResults = studentAssessment.level_results || [];
    const multiResults = studentResults.filter(
      result => result.type === QuestionType.MULTI
    );
    multiResults.forEach((response, questionIndex) => {
      // student_result is either [] and not answered or a series of letters
      // that the student selected.
      results[questionIndex].totalAnswered++;
      if (response.status === 'unsubmitted') {
        results[questionIndex].notAnswered++;
      } else {
        (response.student_result || []).forEach(answer => {
          results[questionIndex].answers[answer].numAnswered++;
        });
      }
    });
  });

  return results;
};

// Returns an array of objects corresponding to each match question and the
// number of students who answered each answer.
export const getMatchSectionSummary = state => {
  const assessmentsStructure = getCurrentAssessmentQuestions(state);
  if (!assessmentsStructure) {
    return [];
  }
  const questionData = assessmentsStructure.questions;
  const matchQuestions = questionData.filter(
    question => question.type === QuestionType.MATCH
  );

  const results = matchQuestions.map(question => {
    return {
      id: question.level_id,
      question: question.question,
      questionNumber: question.question_index + 1,
      options: question.options.map((option, indexO) => {
        return {
          option: question.options[indexO].text,
          id: indexO,
          totalAnswered: 0,
          notAnswered: 0,
          answers: question.answers.map((answer, indexA) => {
            return {
              answer: question.answers[indexA].text,
              isCorrect: indexA === indexO,
              numAnswered: 0
            };
          })
        };
      })
    };
  });

  // Calculate the number of students who answered each option and fill
  // in the initialized results structure above.
  const studentResponses = getAssessmentResponsesForCurrentScript(state);
  if (!studentResponses) {
    return [];
  }

  Object.keys(studentResponses).forEach(studentId => {
    studentId = parseInt(studentId, 10);
    const studentObject = studentResponses[studentId];
    const currentAssessmentId = state.sectionAssessments.assessmentId;
    const studentAssessment =
      studentObject.responses_by_assessment[currentAssessmentId] || {};

    const studentResults = studentAssessment.level_results || [];
    const matchResults = studentResults.filter(
      result => result.type === QuestionType.MATCH
    );

    matchResults.forEach((response, questionIndex) => {
      (response.student_result || []).forEach((answer, index) => {
        results[questionIndex].options[index].totalAnswered++;
        if (response.status[index] === 'unsubmitted') {
          results[questionIndex].options[index].notAnswered++;
        } else {
          results[questionIndex].options[index].answers[answer].numAnswered++;
        }
      });
    });
  });

  return results;
};

/**
 * Selector function that takes in the state.
 * @returns {number} total count of students who have submitted
 * the current assessment.
 */
export const countSubmissionsForCurrentAssessment = state => {
  const currentAssessmentId = state.sectionAssessments.assessmentId;
  if (!currentAssessmentId) {
    return 0;
  }
  const isSurvey = isCurrentAssessmentSurvey(state);
  if (isSurvey) {
    const surveysStructure =
      state.sectionAssessments.surveysByScript[
        state.scriptSelection.scriptId
      ] || {};
    const currentSurvey = surveysStructure[currentAssessmentId];
    if (!currentSurvey || currentSurvey.levelgroup_results.length === 0) {
      return 0;
    }
    return currentSurvey.levelgroup_results[0].results.length;
  } else {
    const studentResponses = getAssessmentResponsesForCurrentScript(state);
    let totalSubmissions = 0;
    Object.values(studentResponses).forEach(student => {
      if (
        Object.keys(student.responses_by_assessment).includes(
          currentAssessmentId + ''
        )
      ) {
        totalSubmissions++;
      }
    });
    return totalSubmissions;
  }
};

/**
 * @returns {array} of objects with keys corresponding to columns
 * of CSV to download. Columns are defined as CSV_SURVEY_HEADERS and CSV_ASSESSMENT_HEADERS.
 */
export const getExportableData = state => {
  const isSurvey = isCurrentAssessmentSurvey(state);
  if (isSurvey) {
    return getExportableSurveyData(state);
  } else {
    return getExportableAssessmentData(state);
  }
};

/**
 * @returns {array} of objects with keys corresponding to columns
 * of CSV to download. Columns are lesson, questionNumber, questionText, answer, numberAnswered.
 */
export const getExportableSurveyData = state => {
  const currentAssessmentId = state.sectionAssessments.assessmentId;
  const surveys =
    state.sectionAssessments.surveysByScript[state.scriptSelection.scriptId] ||
    {};
  const currentSurvey = surveys[currentAssessmentId];
  let responses = [];

  for (let i = 0; i < currentSurvey.levelgroup_results.length; i++) {
    const questionResults = currentSurvey.levelgroup_results[i];
    const rowBase = {
      lesson: currentSurvey.lesson_name,
      questionNumber: questionResults.question_index + 1,
      questionText: questionResults.question
    };

    if (questionResults.type === SurveyQuestionType.MULTI) {
      for (
        let answerIndex = 0;
        answerIndex < questionResults.answer_texts.length;
        answerIndex++
      ) {
        responses.push({
          ...rowBase,
          answer: questionResults.answer_texts[answerIndex],
          numberAnswered: questionResults.results.filter(
            result => result.answer_index === answerIndex
          ).length
        });
      }
    } else if (questionResults.type === SurveyQuestionType.FREE_RESPONSE) {
      for (let j = 0; j < questionResults.results.length; j++) {
        responses.push({
          ...rowBase,
          answer: questionResults.results[j].result,
          numberAnswered: 1
        });
      }
    }
  }

  return responses;
};

/**
 * @returns {array} of objects with keys corresponding to columns
 * of CSV to download. Columns are studentName, lesson, timestamp, question, response, and correct.
 */
export const getExportableAssessmentData = state => {
  let responses = [];
  const currentAssessmentId = state.sectionAssessments.assessmentId;
  const studentResponses = getAssessmentResponsesForCurrentScript(state);

  Object.keys(studentResponses).forEach(studentId => {
    studentId = parseInt(studentId, 10);
    const studentObject = studentResponses[studentId];
    const studentAssessment =
      studentObject.responses_by_assessment[currentAssessmentId];

    if (studentAssessment && studentAssessment.level_results) {
      for (
        let questionIndex = 0;
        questionIndex < studentAssessment.level_results.length;
        questionIndex++
      ) {
        const response = studentAssessment.level_results[questionIndex];
        responses.push({
          studentName: studentObject.student_name,
          lesson: studentAssessment.lesson,
          timestamp: studentAssessment.timestamp,
          question: questionIndex + 1,
          response:
            response.type === QuestionType.MULTI
              ? indexesToAnswerString(response.student_result)
              : response.student_result,
          correct: response.status
        });
      }
    }
  });

  return responses;
};

/**
 * @returns {array} of objects with keys corresponding to columns
 * of CSV to download. Columns are studentName, lesson, level, key concept, rubric, comment, timestamp, .
 */
export const getExportableFeedbackData = state => {
  let feedback = [];
  let feedbackForCurrentScript =
    state.sectionAssessments.feedbackByScript[state.scriptSelection.scriptId] ||
    {};

  Object.keys(feedbackForCurrentScript).forEach(feedbackId => {
    feedbackId = parseInt(feedbackId, 10);
    feedback.push(feedbackForCurrentScript[feedbackId]);
  });

  return feedback;
};

/*
 * Only show feedback option if its CSD and CSP
 * */
export const doesCurrentCourseUseFeedback = state => {
  const scriptName = getSelectedScriptName(state) || '';
  return scriptName.includes('csp') || scriptName.includes('csd');
};

export const isCurrentScriptCSD = state => {
  const scriptName = getSelectedScriptName(state) || '';
  return scriptName.includes('csd');
};

/**
 *  @returns {boolean} true if current studentId has submitted responses for current script.
 */
export const currentStudentHasResponses = state => {
  return !!getAssessmentResponsesForCurrentScript(state).hasOwnProperty(
    state.sectionAssessments.studentId
  );
};

// Helpers

/**
 * Takes in an array of objects {answerText: '', correct: true/false} and
 * returns the corresponding letters to the options with the correct answers.
 * Ex - [{correct: false}, {correct: true}] --> returns 'B'
 */
export function getCorrectAnswer(answerArr) {
  const correctIndexes = answerArr
    .map(({correct}, i) => (correct ? i : null))
    .filter(i => i !== null);
  return indexesToAnswerString(correctIndexes);
}

/**
 * Takes in an array of integers and returns the corresponding letters
 * representing correct answers.
 * Ex - [1] --> returns 'B', [0, 2] --> returns 'A, C'
 */
export function indexesToAnswerString(answerArr) {
  if (!answerArr) {
    return '';
  }
  return answerArr.map(index => ANSWER_LETTERS[index]).join(', ');
}

/**
 * Return the id of the first assessment or survey in the list.
 *
 * @param state {Object} the sectionAssessments branch of the redux state tree.
 * @param scriptId
 * @returns {number|undefined} The id of the first assessment or survey.
 */
const getFirstAssessmentId = (state, scriptId) =>
  computeScriptAssessmentList(state, scriptId).map(a => a.id)[0];

/**
 * Returns a list of ids and names of assessments and surveys.
 *
 * @param state {Object} the sectionAssessments branch of the redux state tree.
 * @param scriptId {number|string}
 * @returns {Array}
 */
const computeScriptAssessmentList = (state, scriptId) => {
  const assessmentStructure = state.assessmentQuestionsByScript[scriptId] || {};
  const assessments = Object.values(assessmentStructure).map(assessment => {
    return {
      id: assessment.id,
      name: assessment.name
    };
  });

  const surveysStructure = state.surveysByScript[scriptId] || {};
  const surveys = Object.keys(surveysStructure).map(surveyId => {
    return {
      id: parseInt(surveyId),
      name: surveysStructure[surveyId].lesson_name
    };
  });

  return assessments.concat(surveys);
};

// Requests to the server for assessment data

// Loads the assessment responses.
const loadAssessmentResponsesFromServer = (sectionId, scriptId) => {
  let payload = {section_id: sectionId};
  if (scriptId) {
    payload.script_id = scriptId;
  }
  return $.ajax({
    url: `/dashboardapi/assessments/section_responses`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8',
    data: payload
  });
};

// Loads the assessment question structure.
const loadAssessmentQuestionsFromServer = scriptId => {
  const payload = {script_id: scriptId};
  return $.ajax({
    url: `/dashboardapi/assessments`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8',
    data: payload
  });
};

// Loads survey questions and anonymous responses.
const loadSurveysFromServer = (sectionId, scriptId) => {
  const payload = {script_id: scriptId, section_id: sectionId};
  return $.ajax({
    url: `/dashboardapi/assessments/section_surveys`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8',
    data: payload
  });
};

// Loads comment and rubric feedback.
const loadFeedbackFromServer = (sectionId, scriptId) => {
  const payload = {script_id: scriptId, section_id: sectionId};
  return $.ajax({
    url: `/dashboardapi/assessments/section_feedback`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8',
    data: payload
  });
};
