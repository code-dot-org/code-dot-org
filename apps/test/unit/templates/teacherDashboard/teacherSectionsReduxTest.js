import { assert } from '../../../util/configuredChai';
import reducer, {
  setValidLoginTypes,
  setValidGrades,
  setValidCourses,
  setValidScripts,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

describe('teacherSectionsRedux', () => {
  const initialState = reducer(undefined, {});

  describe('setValidLoginTypes', () => {
    it('sets a list of valid login types', () => {
      const action = setValidLoginTypes(['email', 'password', 'picture']);
      const nextState = reducer(initialState, action);
      assert.deepEqual(nextState.validLoginTypes, ['email', 'password', 'picture']);
    });
  });

  describe('setValidGrades', () => {
    it('sets a list of valid grades', () => {
      const action = setValidGrades(['K', '1', '2']);
      const nextState = reducer(initialState, action);
      assert.deepEqual(nextState.validGrades, ['K', '1', '2']);
    });
  });

  describe('setValidCourses', () => {
    it('adds courseId/scriptId to courses', () => {
      const action = setValidCourses([{
        id: 29,
        name: "CS Discoveries",
        script_name: "csd",
        category: "Full Courses",
        position: 1,
        category_priority: -1,
      }]);
      const nextState = reducer(initialState, action);
      assert.strictEqual(nextState.validCourses[0].courseId, 29);
      assert.strictEqual(nextState.validCourses[0].scriptId, null);
    });
  });

  describe('setValidScripts', () => {
    it('adds courseId/scriptId to courses', () => {
      const action = setValidScripts([{
        id: 1,
        name: "Accelerated Course",
        script_name: "20-hour",
        category: "CS Fundamentals",
        position: 0,
        category_priority: 0,
      }]);
      const nextState = reducer(initialState, action);
      assert.strictEqual(nextState.validScripts[0].courseId, null);
      assert.strictEqual(nextState.validScripts[0].scriptId, 1);
    });
  });

  describe('setSections', () => {
    const sections = [
      {
        id: 11,
        courseId: 29,
        scriptId: null,
        name: "brent_section",
        loginType: "word",
        grade: null,
        stageExtras: false,
        pairingAllowed: true,
        numStudents: 10,
        code: "PMTKVH",
        assignmentName: "CS Discoveries",
        assignmentPath: "//localhost-studio.code.org:3000/courses/csd"
      },
      {
        id: 12,
        courseId: null,
        scriptId: 36,
        name: "section2",
        loginType: "picture",
        grade: "11",
        stageExtras: false,
        pairingAllowed: true,
        numStudents: 1,
        code: "DWGMFX",
        assignmentName: "Course 3",
        assignmentPath: "//localhost-studio.code.org:3000/s/course3"
      },
      {
        id: 307,
        courseId: null,
        scriptId: 46,
        name: "plc",
        loginType: "email",
        grade: "10",
        stageExtras: false,
        pairingAllowed: true,
        numStudents: 0,
        code: "WGYXTR",
        assignmentName: "Infinity Play Lab",
        assignmentPath: "//localhost-studio.code.org:3000/s/infinity"
      }
    ];

    it('adds an id for each section', () => {
      const action = setSections(sections);
      const nextState = reducer(initialState, action);
      assert.deepEqual(nextState.sectionIds, [11, 12, 307]);
    });

    it('groups our sections by id', () => {
      const action = setSections(sections);
      const nextState = reducer(initialState, action);
      assert.deepEqual(nextState.sections, {
        11: sections[0],
        12: sections[1],
        307: sections[2]
      });
    });
  });

  // TODO - tests for selectors
});
