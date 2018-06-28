import {SET_SECTION} from '@cdo/apps/redux/sectionDataRedux';

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
 */
const initialState = {
  assessmentResponsesByScript: {},
  assessmentQuestionsByScript: {},
  surveysByScript: {},
  isLoading: false,
  assessmentId: 0,
};

// Question types for assessments.
const QuestionType = {
  MULTI: 'Multi',
  FREE_RESPONSE: 'FreeResponse',
};

// Question types for surveys.
const SurveyQuestionType = {
  MULTI: 'multi',
  FREE_RESPONSE: 'free_response',
};

const MultiAnswerStatus = {
  CORRECT: 'correct',
  INCORRECT: 'incorrect'
};

const ANSWER_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// Action type constants
const SET_ASSESSMENT_RESPONSES = 'sectionAssessments/SET_ASSESSMENT_RESPONSES';
const SET_ASSESSMENTS_QUESTIONS = 'sectionAssessments/SET_ASSESSMENTS_QUESTIONS';
const SET_SURVEYS = 'sectionAssessments/SET_SURVEYS';
const START_LOADING_ASSESSMENTS = 'sectionAssessments/START_LOADING_ASSESSMENTS';
const FINISH_LOADING_ASSESSMENTS = 'sectionAssessments/FINISH_LOADING_ASSESSMENTS';
const SET_ASSESSMENT_ID = 'sectionAssessments/SET_ASSESSMENT_ID';

// Action creators
export const setAssessmentResponses = (scriptId, assessments) =>
  ({ type: SET_ASSESSMENT_RESPONSES, scriptId, assessments});
export const setAssessmentQuestions = (scriptId, assessments) =>
  ({ type: SET_ASSESSMENTS_QUESTIONS, scriptId, assessments});
export const startLoadingAssessments = () => ({ type: START_LOADING_ASSESSMENTS });
export const finishLoadingAssessments = () => ({ type: FINISH_LOADING_ASSESSMENTS });
export const setAssessmentId = (assessmentId) => ({ type: SET_ASSESSMENT_ID, assessmentId: assessmentId });
export const setSurveys = (scriptId, surveys) => ({ type: SET_SURVEYS, scriptId, surveys });

export const asyncLoadAssessments = (sectionId, scriptId) => {
  return async (dispatch, getState) => {
    const state = getState().sectionAssessments;

    // Don't load data if it's already stored in redux.
    if (state.assessmentResponsesByScript[scriptId]) {
      return;
    }

    dispatch(startLoadingAssessments());

    const loadResponses = loadAssessmentResponsesFromServer(sectionId, scriptId);
    const loadQuestions = loadAssessmentQuestionsFromServer(scriptId);
    const loadSurveys = loadSurveysFromServer(sectionId, scriptId);
    const [responses, questions, surveys] = await Promise.all([loadResponses, loadQuestions, loadSurveys]);

    dispatch(setAssessmentResponses(scriptId, responses));
    dispatch(setAssessmentQuestions(scriptId, questions));
    dispatch(setSurveys(scriptId, surveys));

    dispatch(finishLoadingAssessments());
  };
};

export default function sectionAssessments(state=initialState, action) {
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
  if (action.type === SET_ASSESSMENT_ID) {
    return {
      ...state,
      assessmentId: action.assessmentId,
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
      assessmentId: parseInt(Object.keys(action.assessments)[0]),
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
export const getCurrentScriptAssessmentList = (state) => {
  const assessmentStructure = state.sectionAssessments.assessmentQuestionsByScript[state.scriptSelection.scriptId] || {};
  const assessments = Object.values(assessmentStructure).map(assessment => {
    return {
      id: assessment.id,
      name: assessment.name,
    };
  });

  const surveysStructure = state.sectionAssessments.surveysByScript[state.scriptSelection.scriptId] || {};
  const surveys = Object.keys(surveysStructure).map(surveyId => {
    return {
      id: parseInt(surveyId),
      name: surveysStructure[surveyId].stage_name,
    };
  });

  return assessments.concat(surveys);
};

// Get the student responses for assessments in the current script and current assessment
export const getAssessmentResponsesForCurrentScript = (state) => {
  return state.sectionAssessments.assessmentResponsesByScript[state.scriptSelection.scriptId] || {};
};

// Get the question structure for assessments in the current script and current assessment
export const getCurrentAssessmentQuestions = (state) => {
  const currentScriptData = state.sectionAssessments.assessmentQuestionsByScript[state.scriptSelection.scriptId]
    || {};
  return currentScriptData[state.sectionAssessments.assessmentId];
};

/**
 * Returns an array of objects, each of type questionStructurePropType
 * indicating the question and correct answers for each multiple choice
 * question in the currently selected assessment.
 */
export const getMultipleChoiceStructureForCurrentAssessment = (state) => {
  const assessmentsStructure = getCurrentAssessmentQuestions(state);
  if (!assessmentsStructure) {
    return [];
  }

  const questionData = assessmentsStructure.questions;

  // Transform that data into what we need for this particular table, in this case
  // questionStructurePropType structure.
  return questionData.filter(question => question.type === QuestionType.MULTI).map(question => {
    return {
      id: question.level_id,
      question: question.question_text,
      questionNumber: question.question_index + 1,
      correctAnswer: getCorrectAnswer(question.answers),
    };
  });
};

/**
 * Returns an array of objects, each of type studentAnswerDataPropType
 * indicating the student responses to multiple choice questions for the
 * currently selected assessment.
 */
export const getStudentMCResponsesForCurrentAssessment = (state) => {
  const studentResponses = getAssessmentResponsesForCurrentScript(state);
  if (!studentResponses) {
    return [];
  }

  const studentResponsesArray = Object.keys(studentResponses).map(studentId => {
    studentId = (parseInt(studentId, 10));
    const studentObject = studentResponses[studentId];
    const currentAssessmentId = state.sectionAssessments.assessmentId;
    const studentAssessment = studentObject.responses_by_assessment[currentAssessmentId];

    // If the student has not submitted this assessment, don't display results.
    if (!studentAssessment) {
      return;
    }

    // Transform that data into what we need for this particular table, in this case
    // is the structure studentAnswerDataPropType
    return {
      id: studentId,
      name: studentObject.student_name,
      studentResponses: studentAssessment.level_results.filter(answer => answer.type === QuestionType.MULTI)
        .map(answer => {
          return {
            responses: indexesToAnswerString(answer.student_result),
            isCorrect: answer.status === MultiAnswerStatus.CORRECT,
          };
        })
    };
  }).filter(studentData => studentData);

  return studentResponsesArray;
};

/**
 * Returns an array of objects, each representing a free response question
 * and all the students' responses to that question.
 */
export const getAssessmentsFreeResponseResults = (state) => {
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
      responses: [],
    }));

  const studentResponses = getAssessmentResponsesForCurrentScript(state);

  // For each student, look up their responses to the currently selected assessment.
  Object.keys(studentResponses).forEach(studentId => {
    studentId = (parseInt(studentId, 10));
    const studentObject = studentResponses[studentId];
    const currentAssessmentId = state.sectionAssessments.assessmentId;
    let studentAssessment = studentObject.responses_by_assessment[currentAssessmentId] || {};

    const responsesArray = studentAssessment.level_results || [];
    responsesArray.filter(result => result.type === QuestionType.FREE_RESPONSE).forEach((response, index) => {
      questionsAndResults[index].responses.push({
        id: studentId,
        name: studentObject.student_name,
        response: response.student_result,
      });
    });
  });
  return questionsAndResults;
};

/**
 * Returns an array of objects, each of type freeResponseQuestionsPropType
 * indicating the question and responses to free response questions for the
 * currently selected survey.
 */
export const getSurveyFreeResponseQuestions = (state) => {
  const surveysStructure = state.sectionAssessments.surveysByScript[state.scriptSelection.scriptId] || {};
  const currentSurvey = surveysStructure[state.sectionAssessments.assessmentId];
  if (!currentSurvey) {
    return [];
  }

  const questionData = currentSurvey.levelgroup_results;

  return questionData.filter(question => question.type === SurveyQuestionType.FREE_RESPONSE).map(question => {
    return {
      questionText: question.question,
      questionNumber: question.question_index + 1,
      answers: question.results.map((response, index) => {
        return {index: index, response: response.result};
      }),
    };
  });
};

/**
 * Returns an array of objects, each of type multipleChoiceSurveyDataPropType
 * indicating a multiple choice question and the percent of responses received
 * for each answer.
 */
export const getMultipleChoiceSurveyResults = (state) => {
  const surveysStructure = state.sectionAssessments.surveysByScript[state.scriptSelection.scriptId] || {};
  const currentSurvey = surveysStructure[state.sectionAssessments.assessmentId];
  if (!currentSurvey) {
    return [];
  }

  const questionData = currentSurvey.levelgroup_results;

  // Filter to multiple choice questions.
  return questionData.filter(question => question.type === SurveyQuestionType.MULTI).map((question, index) => {
    // Calculate the total responses for each answer.

    const totalAnswered = question.results.length;
    // Each value of answerTotals represents the number of responses received for
    // the answer in that index.
    const answerTotals = [];
    // Initialize each answer to 0 responses.
    for (let i = 0; i< question.answer_texts.length; i++) {
      answerTotals[i] = 0;
    }
    let notAnswered = 0;

    // For each response, add 1 to the correct value in answerTotals.
    for (let i = 0; i<totalAnswered; i++) {
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
          percentAnswered: Math.floor((answerTotals[index]/totalAnswered) * 100),
        };
      }),
      notAnswered: Math.floor((notAnswered/totalAnswered) * 100),
    };
  });
};

// Returns a boolean.  The selector function checks if the current assessment Id
// is in the surveys structure.
export const isCurrentAssessmentSurvey = (state) => {
  const scriptId = state.scriptSelection.scriptId;
  const surveysStructure = state.sectionAssessments.surveysByScript[scriptId] || {};

  const currentAssessmentId = state.sectionAssessments.assessmentId;
  return Object.keys(surveysStructure).includes(currentAssessmentId.toString());
};

/** Get data for students assessments multiple choice table
 * Returns an object, each of type studentOverviewDataPropType with
 * the value of the key being an object that contains the number
 * of multiple choice answered correctly by a student, total number
 * of multiple choice options, check for if the student submitted the
 * assessment and a timestamp that indicates when a student submitted
 * the assessment.
 */
export const getStudentsMCSummaryForCurrentAssessment = (state) => {
  const summaryOfStudentsMCData = getAssessmentResponsesForCurrentScript(state);
  if (!summaryOfStudentsMCData) {
    return [];
  }

  const studentsSummaryArray = Object.keys(summaryOfStudentsMCData).map(studentId => {
    studentId = (parseInt(studentId, 10));
    const studentsObject = summaryOfStudentsMCData[studentId];
    const currentAssessmentId = state.sectionAssessments.assessmentId;
    const studentsAssessment = studentsObject.responses_by_assessment[currentAssessmentId];

    // If the student has not submitted this assessment, don't display results.
    if (!studentsAssessment) {
      return;
    }
    // Transform that data into what we need for this particular table, in this case
    // it is the structure studentOverviewDataPropType
    return {
      id: studentId,
      name: studentsObject.student_name,
      numMultipleChoiceCorrect: studentsAssessment.multi_correct,
      numMultipleChoice: studentsAssessment.multi_count,
      isSubmitted: studentsAssessment.submitted,
      submissionTimeStamp: studentsAssessment.timestamp,
    };
  }).filter(studentOverviewData => studentOverviewData);

  return studentsSummaryArray;
};

// Returns an array of objects corresponding to each question and the
// number of students who answered each answer.
export const getMultipleChoiceSectionSummary = (state) => {
  // Set up an initial structure based on the multiple choice assessment questions.
  // Initialize numAnswered for each answer to 0, and totalAnswered for each
  // question to 0.
  const assessmentsStructure = getCurrentAssessmentQuestions(state);
  if (!assessmentsStructure) {
    return [];
  }
  const questionData = assessmentsStructure.questions;
  const multiQuestions = questionData.filter(question => question.type === QuestionType.MULTI);
  const results = multiQuestions.map(question => {
    return {
      id: question.level_id,
      question: question.question_text,
      questionNumber: question.question_index + 1,
      answers: question.answers.map((answer, index) => {
        return {
          multipleChoiceOption: ANSWER_LETTERS[index],
          isCorrect: answer.correct,
          numAnswered: 0,
        };
      }),
      totalAnswered: 0,
      notAnswered: 0,
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
    const studentAssessment = studentObject.responses_by_assessment[currentAssessmentId] || {};

    const studentResults = studentAssessment.level_results || [];
    const multiResults = studentResults.filter(result => result.type === QuestionType.MULTI);
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

/**
 * Selector function that takes in the state.
 * @returns {number} total count of students who have submitted
 * the current assessment.
 */
export const countSubmissionsForCurrentAssessment = (state) => {
  const currentAssessmentId = state.sectionAssessments.assessmentId;
  const isSurvey = isCurrentAssessmentSurvey(state);
  if (isSurvey) {
    const surveysStructure = state.sectionAssessments.surveysByScript[state.scriptSelection.scriptId] || {};
    const currentSurvey = surveysStructure[currentAssessmentId];
    if (!currentSurvey) {
      return 0;
    }
    return currentSurvey.levelgroup_results[0].results.length;
  } else {
    const studentResponses = getAssessmentResponsesForCurrentScript(state);
    let totalSubmissions = 0;
    Object.values(studentResponses).forEach((student) => {
      if (Object.keys(student.responses_by_assessment).includes(currentAssessmentId.toString())) {
        totalSubmissions++;
      }
    });
    return totalSubmissions;
  }
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
const loadAssessmentQuestionsFromServer = (scriptId) => {
  const payload = {script_id: scriptId};
  return $.ajax({
    url: `/dashboardapi/assessments`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8',
    data: payload,
  });
};

// Loads survey questions and anonymous responses.
const loadSurveysFromServer = (sectionId, scriptId) => {
  const payload = {script_id: scriptId, section_id: sectionId};
  return $.ajax({
    url: `/dashboardapi/assessments/section_surveys`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8',
    data: payload,
  });
};
