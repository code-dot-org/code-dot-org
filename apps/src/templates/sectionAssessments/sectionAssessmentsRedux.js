import {SET_SECTION} from '@cdo/apps/redux/sectionDataRedux';

 // Initial state of sectionAssessmentsRedux
 // TODO(caleybrock): define a shape for sectionAssessment data that gets stored in redux.
 // assessmentId is the id of the assessment currently in view
const initialState = {
  assessmentsByScript: {},
  assessmentsStructureByScript: {},
  isLoadingAssessments: false,
  assessmentId: 0,
};

const SET_ASSESSMENTS = 'sectionAssessments/SET_ASSESSMENTS';
const SET_ASSESSMENTS_STRUCTURE = 'sectionAssessments/SET_ASSESSMENTS_STRUCTURE';
const START_LOADING_ASSESSMENTS = 'sectionAssessments/START_LOADING_ASSESSMENTS';
const FINISH_LOADING_ASSESSMENTS = 'sectionAssessments/FINISH_LOADING_ASSESSMENTS';
const SET_ASSESSMENT_ID = 'sectionAssessments/SET_ASSESSMENT_ID';

// Action creators
export const setAssessments = (scriptId, assessments) => ({ type: SET_ASSESSMENTS, scriptId, assessments});
export const setAssessmentsStructure = (scriptId, assessments) =>
  ({ type: SET_ASSESSMENTS_STRUCTURE, scriptId, assessments});
export const startLoadingAssessments = () => ({ type: START_LOADING_ASSESSMENTS });
export const finishLoadingAssessments = () => ({ type: FINISH_LOADING_ASSESSMENTS });
export const setAssessmentId = (assessmentId) => ({ type: SET_ASSESSMENT_ID, assessmentId: assessmentId });

export const asyncLoadAssessments = (sectionId, scriptId) => {
  return async (dispatch, getState) => {
    const state = getState().sectionAssessments;

    // Don't load data if it's already stored in redux.
    if (state.assessmentsByScript[scriptId]) {
      return;
    }

    dispatch(startLoadingAssessments());

    const loadResponses = loadAssessmentsFromServer(sectionId, scriptId);
    const loadStructure = loadAssessmentsStructureFromServer(scriptId);
    const [responses, structure] = await Promise.all([loadResponses, loadStructure]);

    dispatch(setAssessments(scriptId, responses));
    dispatch(setAssessmentsStructure(scriptId, structure));

    dispatch(finishLoadingAssessments(responses, structure));
  };
};

export default function sectionAssessments(state=initialState, action) {
  if (action.type === SET_SECTION) {
    // Setting the section is the first action to be called when switching
    // sections, which requires us to reset our state. This might need to change
    // once switching sections is in react/redux.
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
  if (action.type === SET_ASSESSMENTS) {
    return {
      ...state,
      assessmentsByScript: {
        ...state.assessmentsByScript,
        [action.scriptId]: action.assessments
      }
    };
  }
  if (action.type === SET_ASSESSMENTS_STRUCTURE) {
    return {
      ...state,
      assessmentsStructureByScript: {
        ...state.assessmentsStructureByScript,
        [action.scriptId]: action.assessments
      },
      // Default the assessmentId to the first assessment in the structure
      assessmentId: parseInt(Object.keys(action.assessments)[0]),
    };
  }
  if (action.type === START_LOADING_ASSESSMENTS) {
    return {
      ...state,
      isLoadingAssessments: true
    };
  }
  if (action.type === FINISH_LOADING_ASSESSMENTS) {
    return {
      ...state,
      isLoadingAssessments: false
    };
  }

  return state;
}

// Selector functions

// Returns an array of objects, each indicating an assessment name and it's id
// for the assessments in the current script.
export const getCurrentScriptAssessmentList = (state) => {
  const assessmentStructure = state.sectionAssessments.assessmentsStructureByScript[state.scriptSelection.scriptId] || {};
  return Object.values(assessmentStructure).map(assessment => {
    return {
      id: assessment.id,
      name: assessment.name,
    };
  });
};

// Get the student responses for assessments in the current script and current assessment
export const getAssessmentResponsesForCurrentScript = (state) => {
  return state.sectionAssessments.assessmentsByScript[state.scriptSelection.scriptId] || {};
};

// Get the question structure for assessments in the current script and current assessment
export const getCurrentAssessmentStructure = (state) => {
  const currentScriptData = state.sectionAssessments.assessmentsStructureByScript[state.scriptSelection.scriptId]
    || {};
  return currentScriptData[state.sectionAssessments.assessmentId];
};

// Gets the multiple choice structure for a current assessment.
// TODO(caleybrock): needs to be tested.
export const getMultipleChoiceStructureForCurrentAssessment = (state) => {
  const assessmentsStructure = getCurrentAssessmentStructure(state);
  if (!assessmentsStructure) {
    return [];
  }

  const questionData = assessmentsStructure.questions;

  // Transform that data into what we need for this particular table, in this case
  // questionStructurePropType structure.
  return questionData.filter(question => question.type === 'Multi').map(question => {
    return {
      id: question.level_id,
      question: question.question_text,
      correctAnswer: getCorrectAnswer(question.answers),
    };
  });
};

// Returns an array of objects, each of type studentAnswerDataPropType
// indicating the student answers to multiple choice questions for the
// currently selected assessment.
// TODO(caleybrock): needs to be tested.
export const getStudentMCResponsesForCurrentAssessment = (state) => {
  const studentResponses = getAssessmentResponsesForCurrentScript(state);
  if (!studentResponses) {
    return [];
  }

  const studentResponsesArray = Object.keys(studentResponses).map(studentId => {
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
      studentAnswers: studentAssessment.level_results.map(answer => {
        return {
          answers: answer.student_result || '',
          isCorrect: answer.status === 'correct',
        };
      })
    };
  }).filter(studentData => studentData);

  return studentResponsesArray;
};

// Helpers

// Takes in an array of objects {answerText: '', correct: true/false} and
// returns the corresponding letter to the option with the correct answer.
// Ex - [{correct: false}, {correct: true}] --> returns 'B'
const getCorrectAnswer = (answerArr) => {
  if (!answerArr) {
    return '';
  }
  const correctIndex = answerArr.findIndex(answer => answer.correct);
  // TODO(caleybrock): Add letter options to response from the server so they are
  // consistent with the structure, but for now look up letter in this array.
  const letterArr = ['A','B', 'C', 'D', 'E', 'F', 'G', 'H'];
  return letterArr[correctIndex];
};

// Requests to the server for assessment data

// Loads the assessment responses
const loadAssessmentsFromServer = (sectionId, scriptId) => {
  let payload = {section_id: sectionId};
  if (scriptId) {
    payload.script_id = scriptId;
  }
  // TODO(caleybrock): also fetch /dashboardapi/section_surveys
  return $.ajax({
    url: `/dashboardapi/assessments/section_responses`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8',
    data: payload
  });
};

// Loads the assessment question structure
const loadAssessmentsStructureFromServer = (scriptId) => {
  const payload = {script_id: scriptId};
  return $.ajax({
    url: `/dashboardapi/assessments`,
    method: 'GET',
    contentType: 'application/json;charset=UTF-8',
    data: payload,
  });
};
