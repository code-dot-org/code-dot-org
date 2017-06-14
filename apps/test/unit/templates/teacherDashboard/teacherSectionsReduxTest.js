import { assert } from '../../../util/configuredChai';
import _ from 'lodash';
import reducer, {
  setValidLoginTypes,
  setValidGrades,
  setValidCourses,
  setValidScripts,
  setSections,
  assignments,
  currentAssignmentIndex,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

// Our actual student object are much more complex than this, but really all we
// care about is how many there are.
const fakeStudents = num => _.range(num).map(x => ({id: x}));

const sections = [
  {
    id: 11,
    location: "/v2/sections/11",
    name: "brent_section",
    login_type: "picture",
    grade: "2",
    code: "PMTKVH",
    stage_extras: false,
    pairing_allowed: true,
    script: null,
    course_id: 29,
    students: fakeStudents(10)
  },
  {
    id: 12,
    location: "/v2/sections/12",
    name: "section2",
    login_type: "picture",
    grade: "11",
    code: "DWGMFX",
    stage_extras: false,
    pairing_allowed: true,
    script: {
      id: 36,
      name: 'course3'
    },
    course_id: null,
    students: fakeStudents(1)
  },
  {
    id: 307,
    location: "/v2/sections/307",
    name: "plc",
    login_type: "email",
    grade: "10",
    code: "WGYXTR",
    stage_extras: true,
    pairing_allowed: false,
    script: {
      id: 46,
      name: 'infinity'
    },
    course_id: null,
    students: []
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
      assert.deepEqual(Object.keys(nextState.sections), ['11', '12', '307']);
      assert.strictEqual(nextState.sections[11].id, 11);
      assert.strictEqual(nextState.sections[12].id, 12);
      assert.strictEqual(nextState.sections[307].id, 307);
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
    const stateWithSection = (id, courseId, scriptId) => {
      const section = {
        id: id,
        course_id: courseId,
        students: [],
        // unnecessary fields truncated as they're unneeded here
      };
      if (scriptId) {
        section.script = { id: scriptId };
      }
      const state1 = reducer(initialState, setValidCourses(validCourses));
      const state2 = reducer(state1, setValidScripts(validScripts));
      return reducer(state2, setSections(sections.concat(section)));
    };

    it('returns null if the section has no course/script', () => {
      const state = stateWithSection(101, null, null);
      assert.equal(currentAssignmentIndex(state, 101), null);
    });

    it('returns the index of the course if the section is assigned a course', () => {
      const state = stateWithSection(101, validCourses[1].id, null);
      assert.equal(currentAssignmentIndex(state, 101), 1);
    });

    it('returns the index of the script if the section is assigned a script', () => {
      const state = stateWithSection(101, null, validScripts[1].id);
      assert.equal(currentAssignmentIndex(state, 101), validCourses.length + 1);
    });

    it('returns the index of the course  if the section is assigned a course and a script', () => {
      const state = stateWithSection(101, validCourses[1].id, validScripts[1].id);
      assert.equal(currentAssignmentIndex(state, 101), 1);
    });
  });
});
