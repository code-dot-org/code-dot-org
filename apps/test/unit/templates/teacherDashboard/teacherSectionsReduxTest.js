import { assert } from '../../../util/configuredChai';
import reducer, {
  setValidLoginTypes,
  setValidGrades,
  setValidCourses,
  setValidScripts,
  setSections,
  assignments,
  currentAssignmentIndex,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

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

const validCourses = [
  {
    id: 29,
    name: "CS Discoveries",
    script_name: "csd",
    category: "Full Courses",
    position: 1,
    category_priority: -1,
  },
  {
    id: 30,
    name: "CS Principles",
    script_name: "csp",
    category: "Full Courses",
    position: 0,
    category_priority: -1,
  }];

  const validScripts = [
  {
    id: 1,
    name: "Accelerated Course",
    script_name: "20-hour",
    category: "CS Fundamentals",
    position: 0,
    category_priority: 0,
  },
  {
    id: 2,
    name: "Hour of Code *",
    script_name: "Hour of Code",
    category: "Hour of Code",
    position: 1,
    category_priority: 0,
  },
  {
    id: 3,
    name: "edit-code *",
    script_name: "edit-code",
    category: "other",
    position: null,
    category_priority: 3,
  },
  {
    id: 4,
    name: "events *",
    script_name: "events",
    category: "other",
    position: null,
    category_priority: 3,
  },
  {
    id: 36,
    name: "Course 3",
    script_name: "course3",
    category: "CS Fundamentals",
    position: 3,
    category_priority: 0,
  },
  {
    id: 46,
    name: "Infinity Play Lab",
    script_name: "infinity",
    category: "Hour of Code",
    position: 12,
    category_priority: 0,
  }
];

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

  describe('assignments', () => {
    const state = {
      validCourses,
      validScripts
    };

    it('concats courses and scripts', () => {
      const assignmentList = assignments(state);
      assert.equal(assignmentList.length, validCourses.length + validScripts.length);
      assert.equal(assignmentList[0].name, validCourses[0].name);
      assert.equal(assignmentList[2].name, validScripts[0].name);
    });

    it('gives each assignment an index', () => {
      const assignmentList = assignments(state);
      assignmentList.forEach((assignment, index) => {
        assert.equal(assignment.index, index);
      });
    });
  });

  describe('currentAssignmentIndex', () => {
    const stateWithSection = section => {
      const state1 = reducer(initialState, setValidCourses(validCourses));
      const state2 = reducer(state1, setValidScripts(validScripts));
      return reducer(state2, setSections(sections.concat(section)));
    };

    it('returns null if the section has no course/script', () => {
      const state = stateWithSection({
        id: 101,
        courseId: null,
        scriptId: null,
        // unnecessary fields truncated as they're unneeded here
      });

      assert.equal(currentAssignmentIndex(state, 101), null);
    });

    it('returns the index of the course if the section is assigned a course', () => {
      const state = stateWithSection({
        id: 101,
        courseId: validCourses[1].id,
        scriptId: null,
        // unnecessary fields truncated as they're unneeded here
      });
      assert.equal(currentAssignmentIndex(state, 101), 1);
    });

    it('returns the index of the script if the section is assigned a script', () => {
      const state = stateWithSection({
        id: 101,
        courseId: null,
        scriptId: validScripts[1].id,
        // unnecessary fields truncated as they're unneeded here
      });
      assert.equal(currentAssignmentIndex(state, 101), validCourses.length + 1);
    });

    it('returns the index of the course  if the section is assigned a course and a script', () => {
      const state = stateWithSection({
        id: 101,
        courseId: validCourses[1].id,
        scriptId: validScripts[1].id,
        // unnecessary fields truncated as they're unneeded here
      });
      assert.equal(currentAssignmentIndex(state, 101), 1);
    });
  });
});
