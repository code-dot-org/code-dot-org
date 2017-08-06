import sinon from 'sinon';
import { assert, expect } from '../../../util/configuredChai';
import {stubRedux, restoreRedux, registerReducers, getStore} from '@cdo/apps/redux';
import reducer, {
  USER_EDITABLE_SECTION_PROPS,
  PENDING_NEW_SECTION_ID,
  setStudioUrl,
  setOAuthProvider,
  setValidLoginTypes,
  setValidGrades,
  setValidAssignments,
  setSections,
  updateSection,
  newSection,
  removeSection,
  beginEditingNewSection,
  beginEditingSection,
  editSectionProperties,
  cancelEditingSection,
  finishEditingSection,
  asyncLoadSectionData,
  assignmentId,
  assignmentNames,
  assignmentPaths,
  sectionFromServerSection,
  isAddingSection,
  isEditingSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

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
    studentCount: 10,
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
    studentCount: 1,
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
      id: 112,
      name: 'csp1'
    },
    course_id: 29,
    studentCount: 0,
  }
];

const validCourses = [
  {
    id: 29,
    name: "CS Discoveries",
    script_name: "csd",
    category: "Full Courses",
    position: 1,
    category_priority: 0,
  },
  {
    id: 30,
    name: "CS Principles",
    script_name: "csp",
    category: "Full Courses",
    position: 0,
    category_priority: 0,
    script_ids: [112, 113],
  }];

  const validScripts = [
  {
    id: 1,
    name: "Accelerated Course",
    script_name: "20-hour",
    category: "CS Fundamentals International",
    position: 0,
    category_priority: 3,
  },
  {
    id: 2,
    name: "Hour of Code *",
    script_name: "Hour of Code",
    category: "Hour of Code",
    position: 1,
    category_priority: 2,
  },
  {
    id: 3,
    name: "edit-code *",
    script_name: "edit-code",
    category: "other",
    position: null,
    category_priority: 15,
  },
  {
    id: 4,
    name: "events *",
    script_name: "events",
    category: "other",
    position: null,
    category_priority: 15,
  },
  {
    id: 112,
    name: "Unit 1: The Internet",
    script_name: "csp1",
    category: "'16-'17 CS Principles",
    position: 0,
    category_priority: 7,
  },
  {
    id: 113,
    name: "Unit 2: Digital Information",
    script_name: "csp2",
    category: "'16-'17 CS Principles",
    position: 1,
    category_priority: 7,
  }
];

describe('teacherSectionsRedux', () => {
  const initialState = reducer(undefined, {});

  describe('setStudioUrl', () => {
    it('sets our url', () => {
      const action = setStudioUrl('//test-studio.code.org');
      const nextState = reducer(initialState, action);
      assert.equal(nextState.studioUrl, '//test-studio.code.org');
    });
  });

  describe('setOAuthProvider', () => {
    it('sets oauth provider', () => {
      const action = setOAuthProvider('clever');
      const nextState = reducer(initialState, action);
      assert.equal(nextState.provider, 'clever');
    });
  });

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

  describe('setValidAssignments', () => {
    const startState = reducer(initialState, setStudioUrl('//test-studio.code.org'));
    const action = setValidAssignments(validCourses, validScripts);
    const nextState = reducer(startState, action);

    it('combines validCourse and scripts into an object keyed by assignId', () => {
      assert.equal(Object.keys(nextState.validAssignments).length,
        validCourses.length + validScripts.length);
    });

    it('adds courseId/scriptId/assignId to courses', () => {
      const assignId = assignmentId(validCourses[0].id, null);
      assert.strictEqual(nextState.validAssignments[assignId].courseId, 29);
      assert.strictEqual(nextState.validAssignments[assignId].scriptId, null);
      assert.strictEqual(nextState.validAssignments[assignId].assignId, assignId);
    });

    it('adds courseId/scriptId/assignId to scripts', () => {
      const assignId = assignmentId(null, validScripts[0].id);
      assert.strictEqual(nextState.validAssignments[assignId].courseId, null);
      assert.strictEqual(nextState.validAssignments[assignId].scriptId, 1);
      assert.strictEqual(nextState.validAssignments[assignId].assignId, assignId);
    });

    it('adds path to courses', () => {
      const assignId = assignmentId(validCourses[0].id, null);
      assert.strictEqual(nextState.validAssignments[assignId].path,
        '//test-studio.code.org/courses/csd');
    });

    it('adds path to scripts', () => {
      const assignId = assignmentId(null, validScripts[0].id);
      assert.strictEqual(nextState.validAssignments[assignId].path,
        '//test-studio.code.org/s/20-hour');
    });

    it('adds scriptAssignIds for a course', () => {
      const assignId = assignmentId(validCourses[1].id, null);
      assert.deepEqual(nextState.validAssignments[assignId].scriptAssignIds,
        [assignmentId(null, 112), assignmentId(null, 113)]);
    });

    it('adds primaryAssignmentId for a course', () => {
      const primaryIds = nextState.primaryAssignmentIds;
      validCourses.forEach(course => {
        assert(primaryIds.includes(assignmentId(course.id, null)));
      });
    });

    it('adds primaryAssignmentId for a script that is not in a course', () => {
      const primaryIds = nextState.primaryAssignmentIds;
      const courselessScript = validScripts[0];
      assert(!primaryIds.includes(courselessScript.id));
    });

    it('does not add primaryAssignmentId for a script that is in a course', () => {
      const primaryIds = nextState.primaryAssignmentIds;
      const scriptInCourse = validScripts[4];
      assert(!primaryIds.includes(scriptInCourse.id));
    });
  });

  describe('setSections', () => {
    const stateWithUrl = reducer(initialState, setStudioUrl('//test-studio.code.org'));
    const startState = reducer(stateWithUrl, setValidAssignments(validCourses, validScripts));

    it('adds an id for each section', () => {
      const action = setSections(sections);
      const nextState = reducer(startState, action);
      assert.deepEqual(nextState.sectionIds, [11, 12, 307]);
    });

    it('groups our sections by id', () => {
      const action = setSections(sections);
      const nextState = reducer(startState, action);
      assert.deepEqual(Object.keys(nextState.sections), ['11', '12', '307']);
      assert.strictEqual(nextState.sections[11].id, 11);
      assert.strictEqual(nextState.sections[12].id, 12);
      assert.strictEqual(nextState.sections[307].id, 307);
    });

    it('empties the store when reset param is set', () => {
      const action = setSections([{
        id: 308,
        location: "/v2/sections/308",
        name: "added_section",
        login_type: "email",
        grade: "2",
        code: "ZVTKVH",
        stage_extras: false,
        pairing_allowed: true,
        script: null,
        course_id: 29,
        studentCount: 0,
      }], true);

      const state = reducer(startState, setSections(sections));
      assert.deepEqual(Object.keys(state.sections), ['11', '12', '307']);
      assert.deepEqual(state.sectionIds, [11, 12, 307]);

      const finalState = reducer(state, action);
      assert.deepEqual(finalState.sectionIds, [308]);
      assert.deepEqual(Object.keys(finalState.sections), ['308']);
    });
  });

  describe('updateSection', () => {
    // create a state that has our sections set, and valid courses/scripts
    const stateWithUrl = reducer(initialState, setStudioUrl('//test-studio.code.org'));
    const stateWithAssigns = reducer(stateWithUrl, setValidAssignments(validCourses, validScripts));
    const stateWithSections = reducer(stateWithAssigns, setSections(sections));

    const updatedSection = {
      ...sections[0],
      // change login type from picture to word
      login_type: 'word'
    };

    const newServerSection = {
      id: 21,
      location: "/v2/sections/21",
      name: "brent_section",
      login_type: "picture",
      grade: "2",
      code: "ABCDEF",
      stage_extras: false,
      pairing_allowed: true,
      script: null,
      course_id: 29,
      studentCount: 10,
    };

    it('does not change our list of section ids when updating a persisted section', () => {
      const action = updateSection(sections[0].id, updatedSection);
      const state = reducer(stateWithSections, action);
      assert.strictEqual(state.sectionIds, stateWithSections.sectionIds);
    });

    it('modifies the given section id', () => {
      const sectionId = sections[0].id;
      const action = updateSection(sectionId, updatedSection);
      const state = reducer(stateWithSections, action);

      assert.strictEqual(stateWithSections.sections[sectionId].loginType, 'picture');
      assert.strictEqual(state.sections[sectionId].loginType, 'word');

      // Other fields should remain unchanged
      Object.keys(stateWithSections.sections[sectionId]).forEach(field => {
        if (field !== 'loginType') {
          assert.strictEqual(state.sections[sectionId][field],
            stateWithSections.sections[sectionId][field]);
        }
      });
    });

    it('does not modify other section ids', () => {
      const action = updateSection(sections[0].id, updatedSection);
      const state = reducer(stateWithSections, action);
      const otherSectionId = sections[1].id;

      assert.strictEqual(state.sections[otherSectionId],
        stateWithSections.sections[otherSectionId]);
    });

    it('replaces the sectionId of a non-persisted section', () => {
      const stateWithNewSection = reducer(stateWithSections, newSection());
      assert.deepEqual(stateWithNewSection.sectionIds, [-1, 11, 12 ,307]);

      const action = updateSection(-1, newServerSection);
      const state = reducer(stateWithNewSection, action);
      assert.deepEqual(state.sectionIds, [21, 11, 12 ,307]);
    });

    it(`adds the sectionId of a non-persisted section if it wasn't in the list`, () => {
      assert.deepEqual(stateWithSections.sectionIds, [11, 12 ,307]);

      const action = updateSection(-1, newServerSection);
      const state = reducer(stateWithSections, action);
      assert.deepEqual(state.sectionIds, [21, 11, 12 ,307]);
    });

    it('replaces the section of a non-persisted section', () => {
      const stateWithNewSection = reducer(stateWithSections, newSection());

      const action = updateSection(-1, newServerSection);
      const state = reducer(stateWithNewSection, action);
      assert.strictEqual(state.sections[-1], undefined);
      assert.strictEqual(state.sections[21].id, 21);
    });

    it(`adds the section of a non-persisted section if it wasn't in the list`, () => {
      const action = updateSection(-1, newServerSection);
      const state = reducer(stateWithSections, action);
      assert.strictEqual(state.sections[-1], undefined);
      assert.strictEqual(state.sections[21].id, 21);
    });
  });

  describe('newSection', () => {
    it('creates a new section', () => {
      const action = newSection();
      const state = reducer(initialState, action);

      assert.strictEqual(state.sectionIds[0], -1);
      assert(state.sections[-1]);
    });

    it('initializes new section without a courseId assigned', () => {
      const action = newSection();
      const state = reducer(initialState, action);
      assert.deepEqual(state.sections[-1], {
        id: -1,
        name: '',
        loginType: 'word',
        grade: '',
        providerManaged: false,
        stageExtras: false,
        pairingAllowed: true,
        studentCount: 0,
        code: '',
        courseId: null,
        scriptId: null
      });
    });

    it('initializes a new section with a courseId assigned', () => {
      const action = newSection(29);
      const stateWithAssigns = reducer(initialState, setValidAssignments(validCourses, validScripts));
      const state = reducer(stateWithAssigns, action);
      assert.deepEqual(state.sections[-1], {
        id: -1,
        name: '',
        loginType: 'word',
        grade: '',
        providerManaged: false,
        stageExtras: false,
        pairingAllowed: true,
        studentCount: 0,
        code: '',
        courseId: 29,
        scriptId: null
      });
    });

    it('updates our nextTempId', () => {
      const action = newSection();
      const state = reducer(initialState, action);
      assert.strictEqual(state.nextTempId, -2);
    });
  });

  describe('removeSection', () => {
    const startState = reducer(initialState, newSection());
    const stateWithSections = reducer(initialState, setSections(sections));

    it('removes sectionId for non-persisted section', () => {
      const action = removeSection(-1);
      const state = reducer(startState, action);
      assert.equal(state.sectionIds.includes(-1), false);
    });

    it('removes non-persisted section', () => {
      const action = removeSection(-1);
      const state = reducer(startState, action);
      assert.strictEqual(state.sections[-1], undefined);
    });

    it('removes sectionid for a persisted section', () => {
      const sectionId = sections[0].id;
      const action = removeSection(sectionId);
      const state = reducer(stateWithSections, action);
      assert.equal(state.sectionIds.includes(sectionId), false);
    });

    it('removes a persisted section', () => {
      const sectionId = sections[0].id;
      const action = removeSection(sectionId);
      const state = reducer(stateWithSections, action);
      assert.strictEqual(state.sections[sectionId], undefined);
    });

    it('doesnt let you remove a non-existent section',  () => {
      assert.throws(() => {
        reducer(stateWithSections, removeSection(1234));
      });
    });
  });

  describe('beginEditingNewSection', () => {
    it('populates sectionBeingEdited', () => {
      assert.isNull(initialState.sectionBeingEdited);
      const state = reducer(initialState, beginEditingNewSection());
      assert.deepEqual(state.sectionBeingEdited, {
        id: PENDING_NEW_SECTION_ID,
        name: '',
        loginType: undefined,
        grade: '',
        providerManaged: false,
        stageExtras: false,
        pairingAllowed: true,
        studentCount: 0,
        code: '',
        courseId: null,
        scriptId: null
      });
    });
  });

  describe('beginEditingSection', () => {
    it('populates sectionBeingEdited', () => {
      const stateWithSections = reducer(initialState, setSections(sections));
      assert.isNull(stateWithSections.sectionBeingEdited);
      const state = reducer(stateWithSections, beginEditingSection(12));
      assert.deepEqual(state.sectionBeingEdited, {
        id: 12,
        name: "section2",
        loginType: "picture",
        grade: "11",
        providerManaged: false,
        code: "DWGMFX",
        stageExtras: false,
        pairingAllowed: true,
        scriptId: 36,
        courseId: null,
        studentCount: 1,
      });
    });
  });

  describe('editSectionProperties', () => {
    let editingNewSectionState;

    before(() => {
      editingNewSectionState = reducer(initialState, beginEditingNewSection());
    });

    it('throws if not currently editing a section', () => {
      expect(() => {
        reducer(initialState, editSectionProperties({name: 'New Name'}));
      }).to.throw();
    });

    // Enumerate user-editable section properties
    USER_EDITABLE_SECTION_PROPS.forEach(editableProp => {
      it(`allows editing ${editableProp}`, () => {
        const state = reducer(
          editingNewSectionState,
          editSectionProperties({[editableProp]: 'newValue'})
        );
        expect(state.sectionBeingEdited[editableProp]).to.equal('newValue');
      });
    });

    // Check some uneditable section properties
    [
      'id',
      'studentCount',
      'code',
      'providerManaged',
    ].forEach(uneditableProp => {
      it(`does not allow editing ${uneditableProp}`, () => {
        expect(() => reducer(
          editingNewSectionState,
          editSectionProperties({[uneditableProp]: 'newValue'})
        )).to.throw();
      });
    });

    it('can edit multiple props at once', () => {
      const state = reducer(
        editingNewSectionState,
        editSectionProperties({
          name: 'newName',
          courseId: 61,
        })
      );
      expect(state.sectionBeingEdited.name).to.equal('newName');
      expect(state.sectionBeingEdited.courseId).to.equal(61);
    });

    it('when editing multiple props, throws if any are uneditable', () => {
      expect(() => reducer(
        editingNewSectionState,
        editSectionProperties({
          name: 'newName',
          courseId: 61,
          providerManaged: false, // Uneditable!
        })
      )).to.throw();
    });
  });

  describe('cancelEditingSection', () => {
    it('clears sectionBeingEdited', () => {
      const initialState = reducer(initialState, beginEditingNewSection());
      assert.isNotNull(initialState.sectionBeingEdited);
      const state = reducer(initialState, cancelEditingSection());
      assert.isNull(state.sectionBeingEdited);
    });
  });

  describe('finishEditingSection', () => {
    let server, store;

    // Fake server responses to reuse in our tests
    const newSectionDefaults = {
      id: 13,
      name: 'New Section',
      login_type: 'email',
      grade: undefined,
      providerManaged: false,
      stage_extras: false,
      pairing_allowed: true,
      student_count: 0,
      code: 'BCDFGH',
      course_id: null,
      script_id: null,
    };

    function successResponse(customProps = {}) {
      const editingSectionId = state().sectionBeingEdited.id;
      const existingSection = sections.find(s => s.id === editingSectionId);
      return [
        200,
        {"Content-Type": "application/json"},
        JSON.stringify({
          ...(existingSection || newSectionDefaults),
          id: existingSection ? editingSectionId : 13,
          ...customProps,
        })
      ];
    }

    const failureResponse = [500, {}, ''];

    function state() {
      return store.getState().teacherSections;
    }

    beforeEach(function () {
      // Stub server responses
      server = sinon.fakeServer.create();

      // Test with a real redux store, not just the reducer, because this
      // action depends on the redux-thunk extension.
      stubRedux();
      registerReducers({teacherSections: reducer});
      store = getStore();
      store.dispatch(setSections(sections));
    });

    afterEach(function () {
      restoreRedux();
      server.restore();
    });

    it('immediately makes saveInProgress true', () => {
      store.dispatch(beginEditingNewSection());
      expect(state().saveInProgress).to.be.false;

      store.dispatch(finishEditingSection());
      expect(state().saveInProgress).to.be.true;
    });

    it('makes saveInProgress false after the server responds with success', () => {
      store.dispatch(beginEditingNewSection());
      server.respondWith('POST', '/v2/sections', successResponse());

      store.dispatch(finishEditingSection());
      expect(state().saveInProgress).to.be.true;

      server.respond();
      expect(state().saveInProgress).to.be.false;
    });

    it('makes saveInProgress false after the server responds with failure', () => {
      store.dispatch(beginEditingNewSection());
      server.respondWith('POST', '/v2/sections', failureResponse);

      store.dispatch(finishEditingSection()).catch(() => {});
      expect(state().saveInProgress).to.be.true;

      server.respond();
      expect(state().saveInProgress).to.be.false;
    });

    it('resolves a returned promise when the server responds with success', () => {
      store.dispatch(beginEditingNewSection());
      server.respondWith('POST', '/v2/sections', successResponse());

      const promise = store.dispatch(finishEditingSection());
      server.respond();
      return expect(promise).to.be.fulfilled;
    });

    it('rejects a returned promise when the server responds with failure', () => {
      store.dispatch(beginEditingNewSection());
      server.respondWith('POST', '/v2/sections', failureResponse);

      const promise = store.dispatch(finishEditingSection());
      server.respond();
      return expect(promise).to.be.rejected;
    });

    it('clears sectionBeingEdited after the server responds with success', () => {
      store.dispatch(beginEditingNewSection());
      server.respondWith('POST', '/v2/sections', successResponse());

      store.dispatch(finishEditingSection());
      expect(state().sectionBeingEdited).not.to.be.null;

      server.respond();
      expect(state().sectionBeingEdited).to.be.null;
    });

    it('keeps sectionBeingEdited after the server responds with failure', () => {
      store.dispatch(beginEditingNewSection());
      const originalSectionBeingEdited = state().sectionBeingEdited;
      expect(originalSectionBeingEdited).not.to.be.null;
      server.respondWith('POST', '/v2/sections', failureResponse);

      store.dispatch(finishEditingSection()).catch(() => {});
      expect(state().sectionBeingEdited).to.equal(originalSectionBeingEdited);

      server.respond();
      expect(state().sectionBeingEdited).to.equal(originalSectionBeingEdited);
    });

    it('adds a new section to the sections map on success', () => {
      const originalSections = state().sections;
      store.dispatch(beginEditingNewSection());
      store.dispatch(editSectionProperties({
        name: 'Aquarius PM Block 2',
        loginType: 'picture',
        grade: '3',
      }));
      server.respondWith('POST', '/v2/sections', successResponse({
        name: 'Aquarius PM Block 2',
        login_type: 'picture',
        grade: '3',
      }));

      store.dispatch(finishEditingSection());
      expect(state().sections).to.equal(originalSections);

      server.respond();
      expect(state().sections).to.deep.equal({
        ...originalSections,
        [13]: {
          id: 13,
          name: 'Aquarius PM Block 2',
          loginType: 'picture',
          grade: '3',
          providerManaged: false,
          stageExtras: false,
          pairingAllowed: true,
          studentCount: undefined,
          code: 'BCDFGH',
          courseId: null,
          scriptId: null,
        }
      });
    });

    it('updates an edited section in the section map on success', () => {
      const sectionId = 12;
      store.dispatch(beginEditingSection(sectionId));
      store.dispatch(editSectionProperties({grade: 'K'}));

      // Set up matching server response
      server.respondWith('POST', `/v2/sections/${sectionId}/update`,
        successResponse({grade: 'K'}));

      store.dispatch(finishEditingSection());
      expect(state().sectionBeingEdited).to.have.property('grade', 'K');
      expect(state().sections[sectionId]).to.have.property('grade', '11');

      server.respond();
      expect(state().sectionBeingEdited).to.be.null;
      expect(state().sections[sectionId]).to.have.property('grade', 'K');
    });

    it('does not modify sections map on failure', () => {
      store.dispatch(beginEditingNewSection());
      server.respondWith('POST', '/v2/sections', failureResponse);
      const originalSections = state().sections;

      store.dispatch(finishEditingSection()).catch(() => {});
      server.respond();
      expect(state().sections).to.equal(originalSections);
    });
  });

  describe('asyncLoadSectionData', () => {
    let server, store;

    function successResponse(response = []) {
      return [
        200,
        {"Content-Type": "application/json"},
        JSON.stringify(response)
      ];
    }

    const failureResponse = [500, {}, 'CustomErrorBody'];

    function state() {
      return store.getState().teacherSections;
    }

    beforeEach(function () {
      // Stub server responses
      server = sinon.fakeServer.create();

      // Test with a real redux store, not just the reducer, because this
      // action depends on the redux-thunk extension.
      stubRedux();
      registerReducers({teacherSections: reducer});
      store = getStore();
    });

    afterEach(function () {
      restoreRedux();
      server.restore();
    });

    it('immediately sets asyncLoadComplete to false', () => {
      store.dispatch(asyncLoadSectionData());
      expect(state().asyncLoadComplete).to.be.false;
    });

    it('sets asyncLoadComplete to true after success responses', () => {
      const promise = store.dispatch(asyncLoadSectionData());

      expect(server.requests).to.have.length(3);
      server.respondWith('GET', '/dashboardapi/sections', successResponse());
      server.respondWith('GET', '/dashboardapi/courses', successResponse());
      server.respondWith('GET', '/v2/sections/valid_scripts', successResponse());
      server.respond();

      return promise.then(() => {
        expect(state().asyncLoadComplete).to.be.true;
      });
    });

    it('sets asyncLoadComplete to true after first failure response', () => {
      console.error.reset(); // Already stubbed in tests
      const promise = store.dispatch(asyncLoadSectionData());

      server.respondWith('GET', '/dashboardapi/sections', failureResponse);
      server.respond();

      return promise.then(() => {
        expect(state().asyncLoadComplete).to.be.true;
        expect(console.error).to.have.been.calledOnce;
        expect(console.error.getCall(0).args[0])
          .to.include('url: /dashboardapi/sections')
          .and
          .to.include('status: 500')
          .and
          .to.include('statusText: Internal Server Error')
          .and
          .to.include('responseText: CustomErrorBody');
      });
    });

    it('sets sections from server response', () => {
      const promise = store.dispatch(asyncLoadSectionData());
      expect(state().sections).to.deep.equal({});

      expect(server.requests).to.have.length(3);
      server.respondWith('GET', '/dashboardapi/sections', successResponse(sections));
      server.respondWith('GET', '/dashboardapi/courses', successResponse());
      server.respondWith('GET', '/v2/sections/valid_scripts', successResponse());
      server.respond();

      return promise.then(() => {
        expect(Object.keys(state().sections)).to.have.length(sections.length);
      });
    });

    it('sets validAssignments from server responses', () => {
      const promise = store.dispatch(asyncLoadSectionData());
      expect(state().validAssignments).to.deep.equal({});

      expect(server.requests).to.have.length(3);
      server.respondWith('GET', '/dashboardapi/sections', successResponse());
      server.respondWith('GET', '/dashboardapi/courses', successResponse(validCourses));
      server.respondWith('GET', '/v2/sections/valid_scripts', successResponse(validScripts));
      server.respond();

      return promise.then(() => {
        expect(Object.keys(state().validAssignments)).to.have.length(
          validCourses.length + validScripts.length
        );
      });
    });
  });

  describe('sectionFromServerSection', () => {
    const serverSection = {
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
      studentCount: 10,
    };

    it('transfers some fields directly, mapping from snake_case to camelCase', () => {
      const section = sectionFromServerSection(serverSection);
      assert.strictEqual(section.id, serverSection.id);
      assert.strictEqual(section.name, serverSection.name);
      assert.strictEqual(section.login_type, serverSection.loginType);
      assert.strictEqual(section.grade, serverSection.grade);
      assert.strictEqual(section.code, serverSection.code);
      assert.strictEqual(section.stage_extras, serverSection.stageExtras);
      assert.strictEqual(section.pairing_allowed, serverSection.pairingAllowed);
      assert.strictEqual(section.course_id, serverSection.courseId);
    });

    it('maps from a script object to a script_id', () => {
      const sectionWithoutScript = sectionFromServerSection(serverSection);
      assert.strictEqual(sectionWithoutScript.scriptId, null);

      const sectionWithScript = sectionFromServerSection({
        ...serverSection,
        script: {
          id: 1,
          name: 'Accelerated Course'
        }
      });
      assert.strictEqual(sectionWithScript.scriptId, 1);
    });

    it('sets student count', () => {
      const section = sectionFromServerSection(serverSection);
      assert.equal(section.studentCount, 10);
    });
  });

  describe('assignmentNames/assignmentPaths', () => {
    const stateWithUrl = reducer(initialState, setStudioUrl('//test-studio.code.org'));
    const stateWithAssigns = reducer(stateWithUrl, setValidAssignments(validCourses, validScripts));
    const stateWithSections = reducer(stateWithAssigns, setSections(sections));
    const stateWithNewSection = reducer(stateWithSections, newSection());

    const unassignedSection = stateWithNewSection.sections["-1"];
    const assignedSection = stateWithNewSection.sections["11"];
    const assignedSectionWithUnit = stateWithNewSection.sections["307"];

    it('assignmentNames returns the name if the section is assigned a course/script', () => {
      const names = assignmentNames(stateWithNewSection.validAssignments, assignedSection);
      assert.deepEqual(names, ['CS Discoveries']);
    });

    it('assignmentNames returns the names of course and script if assigned both', () => {
      const names = assignmentNames(stateWithNewSection.validAssignments, assignedSectionWithUnit);
      assert.deepEqual(names, ['CS Discoveries', 'Unit 1: The Internet']);
    });

    it('assignmentName returns empty array if unassigned', () => {
      const names = assignmentNames(stateWithNewSection.validAssignments, unassignedSection);
      assert.deepEqual(names, []);
    });

    it('assignmentPaths returns the path if the section is assigned a course/script', () => {
      const paths = assignmentPaths(stateWithNewSection.validAssignments, assignedSection);
      assert.deepEqual(paths, ['//test-studio.code.org/courses/csd']);
    });

    it('assignmentPaths returns the paths of course and script if assigned both', () => {
      const paths = assignmentPaths(stateWithNewSection.validAssignments, assignedSectionWithUnit);
      assert.deepEqual(paths, ['//test-studio.code.org/courses/csd', '//test-studio.code.org/s/csp1']);
    });

    it('assignmentPaths returns empty array if unassigned', () => {
      const paths = assignmentPaths(stateWithNewSection, unassignedSection);
      assert.deepEqual(paths, []);
    });
  });

  describe('isAddingSection', () => {
    it('is false in initial state', () => {
      assert.isFalse(isAddingSection(initialState));
    });

    it('is true when creating a new section', () => {
      const state = reducer(initialState, beginEditingNewSection());
      assert(isAddingSection(state));
    });

    it('is false when editing an existing section', () => {
      const stateWithSections = reducer(initialState, setSections(sections));
      const state = reducer(stateWithSections, beginEditingSection(12));
      assert.isFalse(isAddingSection(state));
    });

    it('is false after editing is cancelled', () => {
      const initialState = reducer(initialState, beginEditingNewSection());
      const state = reducer(initialState, cancelEditingSection());
      assert.isFalse(isAddingSection(state));
    });
  });

  describe('isEditingSection', () => {
    it('is false in initial state', () => {
      assert.isFalse(isEditingSection(initialState));
    });

    it('is false when creating a new section', () => {
      const state = reducer(initialState, beginEditingNewSection());
      assert.isFalse(isEditingSection(state));
    });

    it('is true when editing an existing section', () => {
      const stateWithSections = reducer(initialState, setSections(sections));
      const state = reducer(stateWithSections, beginEditingSection(12));
      assert(isEditingSection(state));
    });

    it('is false after editing is cancelled', () => {
      const initialState = reducer(initialState, beginEditingNewSection());
      const state = reducer(initialState, cancelEditingSection());
      assert.isFalse(isEditingSection(state));
    });
  });
});
