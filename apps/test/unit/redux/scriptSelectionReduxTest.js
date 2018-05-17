import { assert } from '../../util/configuredChai';
import scriptSelection, {
  setValidScripts,
  setScriptId,
} from '@cdo/apps/redux/scriptSelectionRedux';
import { setSection } from '@cdo/apps/redux/sectionDataRedux';


const fakeValidScripts = [
  {
    category: 'category1',
    category_priority: 1,
    id: 456,
    name: 'Script Name',
    position: 23
  },
  {
    category: 'csp',
    category_priority: 1,
    id: 300,
    name: 'csp1',
    position: 23
  },
  {
    // Use a different category to make sure we aren't relying on it to group
    // units within courses.
    category: 'other csp',
    category_priority: 1,
    id: 301,
    name: 'csp2',
    position: 23
  },
  // Include Express Course to use as default if needed
  {
    category: "CS Fundamentals",
    category_priority: 1,
    id: 182,
    name: "Express Course",
    position: 6,
    script_name: "express",
  },
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
    name: 'csp2',
  }
};

const fakeValidCourses = [
  {
    id: 99,
    script_ids: [300, 301]
  }
];

describe('scriptSelectionRedux', () => {
  const initialState = scriptSelection(undefined, {});

  describe('setScriptId', () => {
    it('sets the script id', () => {
      const action = setScriptId(130);
      const nextState = scriptSelection(initialState, action);
      assert.deepEqual(nextState.scriptId, 130);
    });
  });

  describe('setSection', () => {
    it('sets the section data and assigned scriptId', () => {
      const action = setSection(fakeSectionData);
      const nextState = scriptSelection(initialState, action);
      assert.deepEqual(nextState.scriptId, 300);
    });

    it('sets the section data with no default scriptId', () => {
      const sectionDataWithNoScript = {
        ...fakeSectionData,
        script: null,
      };
      const action = setSection(sectionDataWithNoScript);
      const nextState = scriptSelection(initialState, action);
      assert.deepEqual(nextState.scriptId, null);
    });
  });

  describe('setValidScripts', () => {

    it('does not override already assigned scriptId', () => {
      const studentScriptIds = [];
      const validCourses = [];
      const action = setValidScripts(fakeValidScripts, studentScriptIds, validCourses);
      const nextState = scriptSelection({
        ...initialState,
        scriptId: 100
      }, action);
      assert.deepEqual(nextState.scriptId, 100);
    });

    it('includes Express Course if nothing assigned and no progress', () => {
      const studentScriptIds = [];
      const validCourses = [];
      const action = setValidScripts(fakeValidScripts, studentScriptIds, validCourses);
      const nextState = scriptSelection(initialState, action);
      assert.deepEqual(nextState.validScripts, fakeValidScripts.filter(script => script.name === "Express Course"));
    });

    it('filters validScripts to those included in studentScriptIds', () => {
      const studentScriptIds = [456];
      const validCourses = [];
      const action = setValidScripts(fakeValidScripts, studentScriptIds, validCourses);
      const nextState = scriptSelection(initialState, action);
      assert.deepEqual(nextState.validScripts, fakeValidScripts.filter(script => script.id === 456));
    });

    it('includes other course units when filtering validScripts', () => {
      const studentScriptIds = [300];
      const validCourses = fakeValidCourses;
      const action = setValidScripts(fakeValidScripts, studentScriptIds, validCourses);
      const nextState = scriptSelection(initialState, action);
      const expectedScripts = [fakeValidScripts[1], fakeValidScripts[2]];
      assert.deepEqual(expectedScripts, nextState.validScripts);
    });

    it('includes units of the assigned course when filtering validScripts', () => {
      const studentScriptIds = [];
      const validCourses = fakeValidCourses;
      const assignedCourseId = 99;
      const action = setValidScripts(fakeValidScripts, studentScriptIds, validCourses, assignedCourseId);
      const nextState = scriptSelection(initialState, action);
      const expectedScripts = [fakeValidScripts[1], fakeValidScripts[2]];
      assert.deepEqual(expectedScripts, nextState.validScripts);
    });

  });
});
