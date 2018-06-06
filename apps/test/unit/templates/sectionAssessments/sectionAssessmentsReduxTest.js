import {assert} from '../../../util/configuredChai';
import sectionAssessments, {
  setAssessments,
  setAssessmentsStructure,
  startLoadingAssessments,
  finishLoadingAssessments,
  setAssessmentId,
  getMultipleChoiceStructureForCurrentAssessment,
  getStudentMCResponsesForCurrentAssessment,
} from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import {setSection} from '@cdo/apps/redux/sectionDataRedux';

describe('sectionAssessmentsRedux', () => {
  const initialState = sectionAssessments(undefined, {});

  describe('setSection', () => {
    it('resets all other state to initialState', () => {
      const currentState = {
        isLoadingAssessments: true,
        assessmentsByScript: {
          1: [{question: "a question", puzzle: 2}],
        }
      };
      const newSection = {id: 2, students: []};
      const action = setSection(newSection);
      const nextState = sectionAssessments(currentState, action);
      assert.deepEqual(nextState, initialState);
    });
  });

  describe('setAssessments', () => {
    it('associates the assessment data to the correct script', () => {
      const scriptId = 2;
      const assessmentData = [{question: "a question", puzzle: 1}];
      const action = setAssessments(scriptId, assessmentData);
      const nextState = sectionAssessments(initialState, action);
      const actualAssessmentData = nextState.assessmentsByScript[scriptId];
      assert.deepEqual(actualAssessmentData, assessmentData);
    });
  });

  describe('setAssessmentsStructure', () => {
    it('associates the assessment structure data to the correct script', () => {
      const scriptId = 2;
      const assessmentData = {
        139: {
          id: 139,
          name: "Assessment for Chapter 1",
          questions: {123: {type: "Multi", question_text: "A question", answers: [{text: "answer 1", correct: true}] }}
        }
      };
      const action = setAssessmentsStructure(scriptId, assessmentData);
      const nextState = sectionAssessments(initialState, action);
      const actualAssessmentData = nextState.assessmentsStructureByScript[scriptId];
      assert.deepEqual(actualAssessmentData, assessmentData);
      assert.deepEqual(nextState.assessmentId, 139);
    });
  });

  describe('setAssessmentId', () => {
    it('sets the id of the current assessment in view', () => {
      const action = setAssessmentId(456);
      const nextState = sectionAssessments(initialState, action);
      assert.deepEqual(nextState.assessmentId, 456);
    });
  });

  describe('startLoadingAssessments', () => {
    it('sets isLoadingAssessments to true', () => {
      const action = startLoadingAssessments();
      const nextState = sectionAssessments(initialState, action);
      assert.isTrue(nextState.isLoadingAssessments);
    });
  });

  describe('finishLoadingAssessments', () => {
    it('sets isLoadingAssessments to false', () => {
      const action = finishLoadingAssessments();
      const nextState = sectionAssessments(initialState, action);
      assert.isFalse(nextState.isLoadingAssessments);
    });
  });

  describe('Selector functions', () => {
    let rootState;
    beforeEach(() => {
      rootState = {
        sectionAssessments: initialState,
        scriptSelection: {
          scriptId: 3
        }
      };
    });

    afterEach(()=>{
      rootState = {};
    });

    describe('getMultipleChoiceStructureForCurrentAssessment', () => {
      it('returns an empty array when no assessments in redux', () => {
        const result = getMultipleChoiceStructureForCurrentAssessment(rootState);
        assert.deepEqual(result, []);
      });
    });

    describe('getStudentMCResponsesForCurrentAssessment', () => {
      it('returns an empty array when no assessments in redux', () => {
        const result = getStudentMCResponsesForCurrentAssessment(rootState);
        assert.deepEqual(result, []);
      });
    });
  });
});
