import {assert} from '../../util/reconfiguredChai';
import unitSelection, {
  setValidScripts,
  setScriptId,
  getSelectedScriptName,
  getSelectedScriptDescription
} from '@cdo/apps/redux/unitSelectionRedux';
import {setSection} from '@cdo/apps/redux/sectionDataRedux';

const fakeValidScripts = [
  {
    category: 'category1',
    category_priority: 1,
    id: 456,
    name: 'Script Name',
    position: 23,
    description: 'Description of Script'
  },
  {
    category: 'csp',
    category_priority: 1,
    id: 300,
    name: 'csp1',
    position: 23,
    description: 'CSP Unit 1'
  },
  {
    // Use a different category to make sure we aren't relying on it to group
    // units within courses.
    category: 'other csp',
    category_priority: 1,
    id: 301,
    name: 'csp2',
    position: 23,
    description: 'CSP Unit 2'
  },
  // Include Express Course to use as default if needed
  {
    category: 'CS Fundamentals',
    category_priority: 1,
    id: 182,
    name: 'Corso Rapido',
    position: 6,
    script_name: 'express-2017',
    description: 'CSF Spanish Course'
  }
];

const fakeSectionData = {
  id: 123,
  students: [
    {
      id: 1,
      name: 'studentb'
    },
    {
      id: 2,
      name: 'studenta'
    }
  ],
  script: {
    id: 300,
    name: 'csp2'
  }
};

const fakeValidCourses = [
  {
    id: 99,
    script_ids: [300, 301]
  }
];

describe('unitSelectionRedux', () => {
  const initialState = unitSelection(undefined, {});

  describe('getSelectedScriptName', () => {
    it('returns the script name of the selected script', () => {
      const state = {
        unitSelection: {
          scriptId: 2,
          validScripts: [
            {id: 1, script_name: 'Wrong script!'},
            {id: 2, script_name: 'Right script!'}
          ]
        }
      };
      assert.equal(getSelectedScriptName(state), 'Right script!');
    });

    it('returns null if no script is selected', () => {
      const state = {
        unitSelection: {
          scriptId: null,
          validScripts: [
            {id: 1, script_name: 'Wrong script!'},
            {id: 2, script_name: 'Right script!'}
          ]
        }
      };
      assert.equal(getSelectedScriptName(state), null);
    });
  });

  describe('getSelectedScriptDescription', () => {
    it('returns the script description of the selected script', () => {
      const state = {
        unitSelection: {
          scriptId: 182,
          validScripts: fakeValidScripts
        }
      };
      assert.equal(getSelectedScriptDescription(state), 'CSF Spanish Course');
    });

    it('returns null if no script is selected', () => {
      const state = {
        unitSelection: {
          scriptId: null,
          validScripts: fakeValidScripts
        }
      };
      assert.equal(getSelectedScriptDescription(state), null);
    });
  });

  describe('setScriptId', () => {
    it('sets the script id', () => {
      const action = setScriptId(130);
      const nextState = unitSelection(initialState, action);
      assert.deepEqual(nextState.scriptId, 130);
    });
  });

  describe('setSection', () => {
    it('sets the section data and assigned scriptId', () => {
      const action = setSection(fakeSectionData);
      const nextState = unitSelection(initialState, action);
      assert.deepEqual(nextState.scriptId, 300);
    });

    it('sets the section data with no default scriptId', () => {
      const sectionDataWithNoScript = {
        ...fakeSectionData,
        script: null
      };
      const action = setSection(sectionDataWithNoScript);
      const nextState = unitSelection(initialState, action);
      assert.deepEqual(nextState.scriptId, null);
    });
  });

  describe('setValidScripts', () => {
    it('does not override already assigned scriptId', () => {
      const studentScriptIds = [];
      const validCourses = [];
      const action = setValidScripts(
        fakeValidScripts,
        studentScriptIds,
        validCourses
      );
      const nextState = unitSelection(
        {
          ...initialState,
          scriptId: 100
        },
        action
      );
      assert.deepEqual(nextState.scriptId, 100);
    });

    it('includes express-2017 if nothing assigned and no progress', () => {
      const studentScriptIds = [];
      const validCourses = [];
      const action = setValidScripts(
        fakeValidScripts,
        studentScriptIds,
        validCourses
      );
      const nextState = unitSelection(initialState, action);
      assert.deepEqual(
        nextState.validScripts,
        fakeValidScripts.filter(script => script.script_name === 'express-2017')
      );
    });

    it('filters validScripts to those included in studentScriptIds', () => {
      const studentScriptIds = [456];
      const validCourses = [];
      const action = setValidScripts(
        fakeValidScripts,
        studentScriptIds,
        validCourses
      );
      const nextState = unitSelection(initialState, action);
      assert.deepEqual(
        nextState.validScripts,
        fakeValidScripts.filter(script => script.id === 456)
      );
    });

    it('includes other course units when filtering validScripts', () => {
      const studentScriptIds = [300];
      const validCourses = fakeValidCourses;
      const action = setValidScripts(
        fakeValidScripts,
        studentScriptIds,
        validCourses
      );
      const nextState = unitSelection(initialState, action);
      const expectedScripts = [fakeValidScripts[1], fakeValidScripts[2]];
      assert.deepEqual(expectedScripts, nextState.validScripts);
    });

    it('includes units of the assigned course when filtering validScripts if course_id provided', () => {
      const studentScriptIds = [];
      const validCourses = fakeValidCourses;
      const assignedCourseId = 99;
      const action = setValidScripts(
        fakeValidScripts,
        studentScriptIds,
        validCourses,
        {course_id: assignedCourseId}
      );
      const nextState = unitSelection(initialState, action);
      const expectedScripts = [fakeValidScripts[1], fakeValidScripts[2]];
      assert.deepEqual(expectedScripts, nextState.validScripts);
    });

    it('includes units of the assigned course when filtering validScripts if script_id of a script for course provided', () => {
      const studentScriptIds = [];
      const validCourses = fakeValidCourses;
      const action = setValidScripts(
        fakeValidScripts,
        studentScriptIds,
        validCourses,
        {script: {id: 300}}
      );
      const nextState = unitSelection(initialState, action);
      const expectedScripts = [fakeValidScripts[1], fakeValidScripts[2]];
      assert.deepEqual(expectedScripts, nextState.validScripts);
    });
  });
});
