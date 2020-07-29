import sinon from 'sinon';
import {assert, expect} from '../../../util/deprecatedChai';
import {
  stubRedux,
  restoreRedux,
  registerReducers,
  getStore
} from '@cdo/apps/redux';
import reducer, {
  __testInterface__,
  setAuthProviders,
  setRosterProvider,
  setValidGrades,
  setValidAssignments,
  setSections,
  selectSection,
  removeSection,
  beginEditingNewSection,
  beginEditingSection,
  editSectionProperties,
  cancelEditingSection,
  finishEditingSection,
  editSectionLoginType,
  asyncLoadSectionData,
  assignmentId,
  assignmentNames,
  assignmentPaths,
  sectionFromServerSection,
  isAddingSection,
  isEditingSection,
  beginImportRosterFlow,
  cancelImportRosterFlow,
  importOrUpdateRoster,
  isRosterDialogOpen,
  sectionCode,
  sectionName,
  sectionProvider,
  isSectionProviderManaged,
  getVisibleSections,
  isSaveInProgress,
  sectionsNameAndId,
  getSectionRows,
  sortedSectionsList,
  sortSectionsList,
  NO_SECTION
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {OAuthSectionTypes} from '@cdo/apps/templates/teacherDashboard/shapes';

const {
  EDIT_SECTION_SUCCESS,
  IMPORT_ROSTER_FLOW_BEGIN,
  IMPORT_ROSTER_FLOW_LIST_LOADED,
  PENDING_NEW_SECTION_ID,
  USER_EDITABLE_SECTION_PROPS
} = __testInterface__;

const createdAt = '2019-10-21T23:45:34.345Z';

const sections = [
  {
    id: 11,
    location: '/v2/sections/11',
    name: 'My Section',
    login_type: 'picture',
    grade: '2',
    code: 'PMTKVH',
    lesson_extras: false,
    pairing_allowed: true,
    sharing_disabled: false,
    script: null,
    course_id: 29,
    createdAt: createdAt,
    studentCount: 10,
    hidden: false
  },
  {
    id: 12,
    location: '/v2/sections/12',
    name: 'My Other Section',
    login_type: 'picture',
    grade: '11',
    code: 'DWGMFX',
    lesson_extras: false,
    pairing_allowed: true,
    sharing_disabled: false,
    script: {
      id: 36,
      name: 'course3'
    },
    course_id: null,
    createdAt: createdAt,
    studentCount: 1,
    hidden: false
  },
  {
    id: 307,
    location: '/v2/sections/307',
    name: 'My Third Section',
    login_type: 'email',
    grade: '10',
    code: 'WGYXTR',
    lesson_extras: true,
    pairing_allowed: false,
    sharing_disabled: false,
    script: {
      id: 112,
      name: 'csp1-2017'
    },
    course_id: 29,
    createdAt: createdAt,
    studentCount: 0,
    hidden: false
  }
];

const validCourses = [
  {
    id: 29,
    name: 'CS Discoveries 2017',
    script_name: 'csd-2017',
    category: 'Full Courses',
    position: 1,
    category_priority: 0,
    assignment_family_title: 'CS Discoveries',
    assignment_family_name: 'csd',
    version_year: '2017'
  },
  {
    id: 30,
    name: 'CS Principles 2017',
    script_name: 'csp-2017',
    category: 'Full Courses',
    position: 0,
    category_priority: 0,
    script_ids: [112, 113],
    assignment_family_title: 'CS Principles',
    assignment_family_name: 'csp',
    version_year: '2017'
  }
];

const validScripts = [
  {
    id: 1,
    name: 'Accelerated Course',
    script_name: '20-hour',
    category: 'CS Fundamentals International',
    position: 0,
    category_priority: 3
  },
  {
    id: 2,
    name: 'Hour of Code *',
    script_name: 'Hour of Code',
    category: 'Hour of Code',
    position: 1,
    category_priority: 2
  },
  {
    id: 3,
    name: 'edit-code *',
    script_name: 'edit-code',
    category: 'other',
    position: null,
    category_priority: 15
  },
  {
    id: 4,
    name: 'events *',
    script_name: 'events',
    category: 'other',
    position: null,
    category_priority: 15
  },
  {
    id: 36,
    name: 'Course 3',
    script_name: 'course3',
    category: 'other',
    position: null,
    category_priority: 3,
    lesson_extras_available: true
  },
  {
    id: 112,
    name: 'Unit 1: The Internet',
    script_name: 'csp1-2017',
    category: "'16-'17 CS Principles",
    position: 0,
    category_priority: 7
  },
  {
    id: 113,
    name: 'Unit 2: Digital Information',
    script_name: 'csp2-2017',
    category: "'16-'17 CS Principles",
    position: 1,
    category_priority: 7
  },
  {
    id: 208,
    name: 'Course A (2018)',
    script_name: 'coursea-2018',
    category: 'CS Fundamentals (2018)',
    position: 0,
    category_priority: 4,
    assignment_family_title: 'Course A',
    assignment_family_name: 'coursea',
    version_year: '2018'
  },
  {
    id: 209,
    name: 'Course A (2017)',
    script_name: 'coursea-2017',
    category: 'CS Fundamentals (2017)',
    position: 0,
    category_priority: 4,
    assignment_family_title: 'Course A',
    assignment_family_name: 'coursea',
    version_year: '2017',
    is_stable: true
  },
  {
    id: 37,
    name: 'Express Course',
    script_name: 'express-2018',
    category: 'other',
    position: null,
    category_priority: 3,
    lesson_extras_available: true
  }
];

const students = [
  {
    id: 1,
    name: 'StudentA',
    sectionId: 'id',
    sharingDisabled: false
  },
  {
    id: 2,
    name: 'StudentB',
    sectionId: 'id',
    sharingDisabled: false
  }
];

describe('teacherSectionsRedux', () => {
  const initialState = reducer(undefined, {});
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({teacherSections: reducer});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  const getState = () => store.getState();

  describe('setAuthProviders', () => {
    it("sets teacher's auth providers", () => {
      const action = setAuthProviders([
        'google_oauth2',
        'clever',
        'email',
        'windowslive'
      ]);
      const nextState = reducer(initialState, action);
      assert.deepEqual(nextState.providers, [
        'google_classroom',
        'clever',
        'email',
        'windowslive'
      ]);
    });
  });

  describe('setRosterProvider', () => {
    it("sets section's roster provider", () => {
      const action = setRosterProvider('google_classroom');
      const nextState = reducer(initialState, action);
      assert.deepEqual(nextState.rosterProvider, 'google_classroom');
    });

    it("does not set section's roster provider if it is not an OAuth provider", () => {
      const action = setRosterProvider('word');
      const nextState = reducer(initialState, action);
      assert.deepEqual(nextState.rosterProvider, null);
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
    const action = setValidAssignments(validCourses, validScripts);
    const nextState = reducer(initialState, action);

    it('combines validCourse and scripts into an object keyed by assignId', () => {
      assert.equal(
        Object.keys(nextState.validAssignments).length,
        validCourses.length + validScripts.length
      );
    });

    it('adds courseId/scriptId/assignId to courses', () => {
      const assignId = assignmentId(validCourses[0].id, null);
      assert.strictEqual(nextState.validAssignments[assignId].courseId, 29);
      assert.strictEqual(nextState.validAssignments[assignId].scriptId, null);
      assert.strictEqual(
        nextState.validAssignments[assignId].assignId,
        assignId
      );
    });

    it('adds courseId/scriptId/assignId to scripts', () => {
      const assignId = assignmentId(null, validScripts[0].id);
      assert.strictEqual(nextState.validAssignments[assignId].courseId, null);
      assert.strictEqual(nextState.validAssignments[assignId].scriptId, 1);
      assert.strictEqual(
        nextState.validAssignments[assignId].assignId,
        assignId
      );
    });

    it('adds path to courses', () => {
      const assignId = assignmentId(validCourses[0].id, null);
      assert.strictEqual(
        nextState.validAssignments[assignId].path,
        '/courses/csd-2017'
      );
    });

    it('adds path to scripts', () => {
      const assignId = assignmentId(null, validScripts[0].id);
      assert.strictEqual(
        nextState.validAssignments[assignId].path,
        '/s/20-hour'
      );
    });

    it('adds scriptAssignIds for a course', () => {
      const assignId = assignmentId(validCourses[1].id, null);
      assert.deepEqual(nextState.validAssignments[assignId].scriptAssignIds, [
        assignmentId(null, 112),
        assignmentId(null, 113)
      ]);
    });

    it('adds assignmentFamily for a course', () => {
      const assignmentFamilies = nextState.assignmentFamilies;
      ['csd', 'csp'].forEach(courseName => {
        assert(
          assignmentFamilies.find(
            af => af.assignment_family_name === courseName
          )
        );
      });
    });

    it('infer assignment family and version for a script not in a course', () => {
      const {assignmentFamilies, validAssignments} = nextState;
      const courselessScript = validScripts[0];
      assert(
        assignmentFamilies.find(
          af => af.assignment_family_name === courselessScript.script_name
        )
      );

      const assignId = assignmentId(null, courselessScript.id);
      const assignment = validAssignments[assignId];
      assert.equal('Accelerated Course', assignment.name);
      assert.equal('20-hour', assignment.assignment_family_name);
      assert.equal('2017', assignment.version_year);
    });

    it('sets assignment family, version and is_stable from validScripts for a script not in a course', () => {
      const {assignmentFamilies, validAssignments} = nextState;
      assert(
        assignmentFamilies.find(af => af.assignment_family_name === 'coursea')
      );

      let assignId = assignmentId(null, validScripts[7].id);
      let assignment = validAssignments[assignId];
      assert.equal('Course A (2018)', assignment.name);
      assert.equal('coursea', assignment.assignment_family_name);
      assert.equal('2018', assignment.version_year);
      assert(!assignment.is_stable);

      assignId = assignmentId(null, validScripts[8].id);
      assignment = validAssignments[assignId];
      assert.equal('Course A (2017)', assignment.name);
      assert.equal('coursea', assignment.assignment_family_name);
      assert.equal('2017', assignment.version_year);
      assert.equal(true, assignment.is_stable);
    });

    it('does not add assignmentFamily for a script that is in a course', () => {
      const assignmentFamilies = nextState.assignmentFamilies;
      const scriptInCourse = validScripts[4];
      assert(
        assignmentFamilies.find(
          af => af.assignment_family_name === scriptInCourse.script_name
        )
      );
    });
  });

  describe('setSections', () => {
    const startState = reducer(
      initialState,
      setValidAssignments(validCourses, validScripts)
    );

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

    it('sets sectionsAreLoaded', () => {
      const action = setSections(sections);
      const nextState = reducer(startState, action);
      assert.strictEqual(nextState.sectionsAreLoaded, true);
    });

    it('does not set selectedSectionId if passed multiple sections', () => {
      const action = setSections(sections);
      const nextState = reducer(startState, action);
      assert.strictEqual(nextState.selectedSectionId, NO_SECTION);
    });

    it('does set selectedSectionId if passed a single section', () => {
      const action = setSections(sections.slice(0, 1));
      const nextState = reducer(startState, action);
      assert.strictEqual(
        nextState.selectedSectionId,
        sections[0].id.toString()
      );
    });

    it('throws rather than let us destroy data', () => {
      const action = setSections(sections);
      const nextState = reducer(startState, action);

      // Second action provides same sections, but only name/id
      const action2 = setSections(
        sections.map(section => ({
          id: section.id,
          name: section.name
        }))
      );
      assert.throws(() => {
        reducer(nextState, action2);
      });
    });

    it('does not throw if we set the same data twice', () => {
      const action = setSections(sections);
      const nextState = reducer(startState, action);
      const action2 = setSections(sections);
      reducer(nextState, action2);
    });
  });

  describe('selectSection', () => {
    const firstSectionId = sections[0].id.toString();
    it('can change the selected section', () => {
      const sectionState = reducer(undefined, setSections(sections));

      assert.equal(sectionState.selectedSectionId, NO_SECTION);

      const action = selectSection(firstSectionId);
      const nextState = reducer(sectionState, action);
      assert.equal(nextState.selectedSectionId, firstSectionId);
    });

    it('selects no section if we have no sections', () => {
      const initialState = reducer(undefined, {});
      assert.equal(Object.keys(initialState.sectionIds).length, 0);

      const action = selectSection(firstSectionId);
      const sectionState = reducer(initialState, action);
      assert.equal(sectionState.selectedSectionId, NO_SECTION);
    });

    it('selects no section if we try selecting a non-existent section', () => {
      let sectionState = reducer(undefined, setSections(sections));
      assert.equal(sectionState.selectedSectionId, NO_SECTION);

      const action = selectSection('99999');
      sectionState = reducer(initialState, action);
      assert.equal(sectionState.selectedSectionId, NO_SECTION);
    });
  });

  describe('removeSection', () => {
    const stateWithSections = reducer(initialState, setSections(sections));

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

    it('doesnt let you remove a non-existent section', () => {
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
        stageExtras: true,
        pairingAllowed: true,
        sharingDisabled: false,
        studentCount: 0,
        code: '',
        courseId: null,
        scriptId: null,
        hidden: false,
        isAssigned: undefined
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
        name: 'My Other Section',
        loginType: 'picture',
        grade: '11',
        providerManaged: false,
        code: 'DWGMFX',
        stageExtras: false,
        pairingAllowed: true,
        sharingDisabled: false,
        scriptId: 36,
        courseId: null,
        createdAt: createdAt,
        studentCount: 1,
        hidden: false,
        isAssigned: undefined
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
    ['id', 'studentCount', 'code', 'providerManaged'].forEach(
      uneditableProp => {
        it(`does not allow editing ${uneditableProp}`, () => {
          expect(() =>
            reducer(
              editingNewSectionState,
              editSectionProperties({[uneditableProp]: 'newValue'})
            )
          ).to.throw();
        });
      }
    );

    it('can edit multiple props at once', () => {
      const state = reducer(
        editingNewSectionState,
        editSectionProperties({
          name: 'newName',
          courseId: 61
        })
      );
      expect(state.sectionBeingEdited.name).to.equal('newName');
      expect(state.sectionBeingEdited.courseId).to.equal(61);
    });

    it('when editing multiple props, throws if any are uneditable', () => {
      expect(() =>
        reducer(
          editingNewSectionState,
          editSectionProperties({
            name: 'newName',
            courseId: 61,
            providerManaged: false // Uneditable!
          })
        )
      ).to.throw();
    });

    it('switching script assignment updates stage extras value from script', () => {
      let state = reducer(
        editingNewSectionState,
        setValidAssignments(validCourses, validScripts)
      );
      state = reducer(state, editSectionProperties({scriptId: 1}));
      expect(state.sectionBeingEdited.stageExtras).to.equal(false);

      state = reducer(state, editSectionProperties({scriptId: 36}));
      expect(state.sectionBeingEdited.stageExtras).to.equal(true);

      state = reducer(state, editSectionProperties({scriptId: 37}));
      expect(state.sectionBeingEdited.stageExtras).to.equal(true);
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
    let server;

    // Fake server responses to reuse in our tests
    const newSectionDefaults = {
      id: 13,
      name: 'Untitled Section',
      login_type: 'email',
      grade: undefined,
      providerManaged: false,
      lesson_extras: false,
      pairing_allowed: true,
      student_count: 0,
      code: 'BCDFGH',
      courseId: null,
      scriptId: null,
      createdAt: createdAt,
      hidden: false
    };

    function successResponse(customProps = {}) {
      const editingSectionId = state().sectionBeingEdited.id;
      const existingSection = sections.find(s => s.id === editingSectionId);
      return [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify({
          ...(existingSection || newSectionDefaults),
          id: existingSection ? editingSectionId : 13,
          ...customProps
        })
      ];
    }

    const failureResponse = [500, {}, ''];

    function state() {
      return getState().teacherSections;
    }

    beforeEach(function() {
      // Stub server responses
      server = sinon.fakeServer.create();

      // Test with a real redux store, not just the reducer, because this
      // action depends on the redux-thunk extension.
      store.dispatch(setSections(sections));
    });

    afterEach(function() {
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
      server.respondWith('POST', '/dashboardapi/sections', successResponse());

      store.dispatch(finishEditingSection());
      expect(state().saveInProgress).to.be.true;

      server.respond();
      expect(state().saveInProgress).to.be.false;
    });

    it('makes saveInProgress false after the server responds with failure', () => {
      store.dispatch(beginEditingNewSection());
      server.respondWith('POST', '/dashboardapi/sections', failureResponse);

      store.dispatch(finishEditingSection()).catch(() => {});
      expect(state().saveInProgress).to.be.true;

      server.respond();
      expect(state().saveInProgress).to.be.false;
    });

    it('resolves a returned promise when the server responds with success', () => {
      store.dispatch(beginEditingNewSection());
      server.respondWith('POST', '/dashboardapi/sections', successResponse());

      const promise = store.dispatch(finishEditingSection());
      server.respond();
      return expect(promise).to.be.fulfilled;
    });

    it('rejects a returned promise when the server responds with failure', () => {
      store.dispatch(beginEditingNewSection());
      server.respondWith('POST', '/dashboardapi/sections', failureResponse);

      const promise = store.dispatch(finishEditingSection());
      server.respond();
      return expect(promise).to.be.rejected;
    });

    it('clears sectionBeingEdited after the server responds with success', () => {
      store.dispatch(beginEditingNewSection());
      server.respondWith('POST', '/dashboardapi/sections', successResponse());

      store.dispatch(finishEditingSection());
      expect(state().sectionBeingEdited).not.to.be.null;

      server.respond();
      expect(state().sectionBeingEdited).to.be.null;
    });

    it('keeps sectionBeingEdited after the server responds with failure', () => {
      store.dispatch(beginEditingNewSection());
      const originalSectionBeingEdited = state().sectionBeingEdited;
      expect(originalSectionBeingEdited).not.to.be.null;
      server.respondWith('POST', '/dashboardapi/sections', failureResponse);

      store.dispatch(finishEditingSection()).catch(() => {});
      expect(state().sectionBeingEdited).to.equal(originalSectionBeingEdited);

      server.respond();
      expect(state().sectionBeingEdited).to.equal(originalSectionBeingEdited);
    });

    it('adds a new section to the sections map on success', () => {
      const originalSections = state().sections;
      store.dispatch(beginEditingNewSection());
      store.dispatch(
        editSectionProperties({
          name: 'Aquarius PM Block 2',
          loginType: 'picture',
          grade: '3'
        })
      );
      server.respondWith(
        'POST',
        '/dashboardapi/sections',
        successResponse({
          name: 'Aquarius PM Block 2',
          login_type: 'picture',
          grade: '3'
        })
      );

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
          sharingDisabled: undefined,
          studentCount: undefined,
          code: 'BCDFGH',
          courseId: undefined,
          scriptId: null,
          createdAt: createdAt,
          hidden: false,
          isAssigned: undefined
        }
      });
    });

    it('updates an edited section in the section map on success', () => {
      const sectionId = 12;
      store.dispatch(beginEditingSection(sectionId));
      store.dispatch(editSectionProperties({grade: 'K'}));

      // Set up matching server response
      server.respondWith(
        'PATCH',
        `/dashboardapi/sections/${sectionId}`,
        successResponse({grade: 'K'})
      );

      store.dispatch(finishEditingSection());
      expect(state().sectionBeingEdited).to.have.property('grade', 'K');
      expect(state().sections[sectionId]).to.have.property('grade', '11');

      server.respond();
      expect(state().sectionBeingEdited).to.be.null;
      expect(state().sections[sectionId]).to.have.property('grade', 'K');
    });

    it('does not modify sections map on failure', () => {
      store.dispatch(beginEditingNewSection());
      server.respondWith('POST', '/dashboardapi/sections', failureResponse);
      const originalSections = state().sections;

      store.dispatch(finishEditingSection()).catch(() => {});
      server.respond();
      expect(state().sections).to.equal(originalSections);
    });
  });

  describe('editSectionLoginType', () => {
    let server;

    // Fake server responses to reuse in our tests
    const newSectionDefaults = {
      id: 13,
      name: 'Untitled Section',
      login_type: 'email',
      grade: undefined,
      providerManaged: false,
      lesson_extras: false,
      pairing_allowed: true,
      student_count: 0,
      code: 'BCDFGH',
      course_id: null,
      script_id: null,
      hidden: false
    };

    function successResponse(sectionId, customProps = {}) {
      const existingSection = sections.find(s => s.id === sectionId);
      return [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify({
          ...(existingSection || newSectionDefaults),
          id: existingSection ? sectionId : 13,
          ...customProps
        })
      ];
    }

    function state() {
      return getState().teacherSections;
    }

    beforeEach(function() {
      // Stub server responses
      server = sinon.fakeServer.create();

      // Test with a real redux store, not just the reducer, because this
      // action depends on the redux-thunk extension.
      store.dispatch(setSections(sections));
    });

    afterEach(function() {
      server.restore();
    });

    it('sets and clears saveInProgress', () => {
      const sectionId = 12;
      server.autoRespond = true;
      server.respondWith(
        'PATCH',
        `/dashboardapi/sections/${sectionId}`,
        successResponse(sectionId)
      );

      expect(isSaveInProgress(getState())).to.be.false;

      const promise = store.dispatch(editSectionLoginType(sectionId, 'word'));
      expect(isSaveInProgress(getState())).to.be.true;
      return expect(promise).to.be.fulfilled.then(() => {
        expect(isSaveInProgress(getState())).to.be.false;
      });
    });

    it('updates an edited section in the section map on success', () => {
      const sectionId = 12;
      server.autoRespond = true;
      server.respondWith(
        'PATCH',
        `/dashboardapi/sections/${sectionId}`,
        successResponse(sectionId, {login_type: 'word'})
      );

      expect(state().sections[sectionId].loginType).to.equal('picture');

      const promise = store.dispatch(editSectionLoginType(sectionId, 'word'));
      return expect(promise).to.be.fulfilled.then(() => {
        expect(state().sections[sectionId].loginType).to.equal('word');
      });
    });
  });

  describe('asyncLoadSectionData', () => {
    let server;

    function successResponse(response = []) {
      return [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(response)
      ];
    }

    const failureResponse = [500, {}, 'CustomErrorBody'];

    function state() {
      return getState().teacherSections;
    }

    beforeEach(function() {
      // Stub server responses
      server = sinon.fakeServer.create();
      sinon.stub(console, 'error');
    });

    afterEach(function() {
      console.error.restore();
      server.restore();
    });

    it('immediately sets asyncLoadComplete to false', () => {
      store.dispatch(asyncLoadSectionData());
      expect(state().asyncLoadComplete).to.be.false;
    });

    it('sets asyncLoadComplete to true after success responses', () => {
      const promise = store.dispatch(asyncLoadSectionData('id'));

      expect(server.requests).to.have.length(4);
      server.respondWith('GET', '/dashboardapi/sections', successResponse());
      server.respondWith('GET', '/dashboardapi/courses', successResponse());
      server.respondWith(
        'GET',
        '/dashboardapi/sections/valid_scripts',
        successResponse()
      );
      server.respondWith(
        'GET',
        '/dashboardapi/sections/id/students',
        successResponse()
      );
      server.respond();

      return promise.then(() => {
        expect(state().asyncLoadComplete).to.be.true;
      });
    });

    it('sets asyncLoadComplete to true after first failure response', () => {
      const promise = store.dispatch(asyncLoadSectionData());

      server.respondWith('GET', '/dashboardapi/sections', failureResponse);
      server.respond();

      return promise.then(() => {
        expect(state().asyncLoadComplete).to.be.true;
        expect(console.error).to.have.been.calledOnce;
        expect(console.error.getCall(0).args[0])
          .to.include('url: /dashboardapi/sections')
          .and.to.include('status: 500')
          .and.to.include('statusText: Internal Server Error')
          .and.to.include('responseText: CustomErrorBody');
      });
    });

    it('sets sections from server response', () => {
      const promise = store.dispatch(asyncLoadSectionData());
      expect(state().sections).to.deep.equal({});

      expect(server.requests).to.have.length(3);
      server.respondWith(
        'GET',
        '/dashboardapi/sections',
        successResponse(sections)
      );
      server.respondWith('GET', '/dashboardapi/courses', successResponse());
      server.respondWith(
        'GET',
        '/dashboardapi/sections/valid_scripts',
        successResponse()
      );
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
      server.respondWith(
        'GET',
        '/dashboardapi/courses',
        successResponse(validCourses)
      );
      server.respondWith(
        'GET',
        '/dashboardapi/sections/valid_scripts',
        successResponse(validScripts)
      );
      server.respond();

      return promise.then(() => {
        expect(Object.keys(state().validAssignments)).to.have.length(
          validCourses.length + validScripts.length
        );
      });
    });

    it('sets students from server responses', () => {
      const promise = store.dispatch(asyncLoadSectionData('id'));
      expect(state().validAssignments).to.deep.equal({});

      expect(server.requests).to.have.length(4);
      server.respondWith('GET', '/dashboardapi/sections', successResponse());
      server.respondWith('GET', '/dashboardapi/courses', successResponse());
      server.respondWith(
        'GET',
        '/dashboardapi/sections/valid_scripts',
        successResponse()
      );
      server.respondWith(
        'GET',
        '/dashboardapi/sections/id/students',
        successResponse(students)
      );
      server.respond();

      return promise.then(() => {
        expect(Object.keys(state().selectedStudents)).to.have.length(
          students.length
        );
      });
    });
  });

  describe('sectionFromServerSection', () => {
    const serverSection = {
      id: 11,
      location: '/v2/sections/11',
      name: 'My Section',
      login_type: 'picture',
      grade: '2',
      code: 'PMTKVH',
      lesson_extras: false,
      pairing_allowed: true,
      script: null,
      course_id: 29,
      createdAt: createdAt,
      studentCount: 10,
      hidden: false
    };

    it('transfers some fields directly, mapping from snake_case to camelCase', () => {
      const section = sectionFromServerSection(serverSection);
      assert.strictEqual(section.id, serverSection.id);
      assert.strictEqual(section.name, serverSection.name);
      assert.strictEqual(section.login_type, serverSection.loginType);
      assert.strictEqual(section.grade, serverSection.grade);
      assert.strictEqual(section.code, serverSection.code);
      assert.strictEqual(section.lesson_extras, serverSection.stageExtras);
      assert.strictEqual(section.pairing_allowed, serverSection.pairingAllowed);
      assert.strictEqual(
        section.sharing_disabled,
        serverSection.sharingDisabled
      );
      assert.strictEqual(section.course_id, serverSection.courseId);
      assert.strictEqual(section.hidden, serverSection.hidden);
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
    const stateWithAssigns = reducer(
      initialState,
      setValidAssignments(validCourses, validScripts)
    );
    const stateWithSections = reducer(stateWithAssigns, setSections(sections));
    const stateWithUnassignedSection = reducer(stateWithSections, {
      type: EDIT_SECTION_SUCCESS,
      sectionId: '12',
      serverSection: {
        ...sections[1],
        course_id: null,
        script: null
      }
    });
    const stateWithInvalidScriptAssignment = reducer(stateWithSections, {
      type: EDIT_SECTION_SUCCESS,
      sectionId: '12',
      serverSection: {
        ...sections[1],
        course_id: null,
        script: {id: 35, name: 'netsim'}
      }
    });
    const stateWithInvalidCourseAssignment = reducer(stateWithSections, {
      type: EDIT_SECTION_SUCCESS,
      sectionId: '12',
      serverSection: {
        ...sections[1],
        course_id: 9999,
        script: null
      }
    });

    const assignedSection = stateWithUnassignedSection.sections['11'];
    const unassignedSection = stateWithUnassignedSection.sections['12'];
    const assignedSectionWithUnit = stateWithUnassignedSection.sections['307'];
    const invalidScriptSection =
      stateWithInvalidScriptAssignment.sections['12'];
    const invalidCourseSection =
      stateWithInvalidCourseAssignment.sections['12'];

    it('assignmentNames returns the name if the section is assigned a course/script', () => {
      const names = assignmentNames(
        stateWithUnassignedSection.validAssignments,
        assignedSection
      );
      assert.deepEqual(names, ['CS Discoveries 2017']);
    });

    it('assignmentNames returns the names of course and script if assigned both', () => {
      const names = assignmentNames(
        stateWithUnassignedSection.validAssignments,
        assignedSectionWithUnit
      );
      assert.deepEqual(names, ['CS Discoveries 2017', 'Unit 1: The Internet']);
    });

    it('assignmentName returns empty array if unassigned', () => {
      const names = assignmentNames(
        stateWithUnassignedSection.validAssignments,
        unassignedSection
      );
      assert.deepEqual(names, []);
    });

    it('assignmentName returns empty array if assigned script is not a valid assignment', () => {
      const names = assignmentNames(
        stateWithInvalidScriptAssignment.validAssignments,
        invalidScriptSection
      );
      assert.deepEqual(names, []);
    });

    it('assignmentName returns empty array if assigned course is not a valid assignment', () => {
      const names = assignmentNames(
        stateWithInvalidCourseAssignment.validAssignments,
        invalidCourseSection
      );
      assert.deepEqual(names, []);
    });

    it('assignmentPaths returns the path if the section is assigned a course/script', () => {
      const paths = assignmentPaths(
        stateWithUnassignedSection.validAssignments,
        assignedSection
      );
      assert.deepEqual(paths, ['/courses/csd-2017']);
    });

    it('assignmentPaths returns the paths of course and script if assigned both', () => {
      const paths = assignmentPaths(
        stateWithUnassignedSection.validAssignments,
        assignedSectionWithUnit
      );
      assert.deepEqual(paths, ['/courses/csd-2017', '/s/csp1-2017']);
    });

    it('assignmentPaths returns empty array if unassigned', () => {
      const paths = assignmentPaths(
        stateWithUnassignedSection,
        unassignedSection
      );
      assert.deepEqual(paths, []);
    });

    it('assignmentPaths returns empty array if assigned script is not a valid assignment', () => {
      const paths = assignmentPaths(
        stateWithInvalidScriptAssignment,
        invalidScriptSection
      );
      assert.deepEqual(paths, []);
    });

    it('assignmentPaths returns empty array if assigned course is not a valid assignment', () => {
      const paths = assignmentPaths(
        stateWithInvalidCourseAssignment,
        invalidCourseSection
      );
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

  describe('the beginImportRosterFlow action', () => {
    let server;
    beforeEach(() => {
      server = sinon.fakeServer.create();
      // set up some default success responses
      server.respondWith(
        'GET',
        '/dashboardapi/google_classrooms',
        successResponse()
      );
      server.respondWith(
        'GET',
        '/dashboardapi/clever_classrooms',
        successResponse()
      );
    });
    afterEach(() => server.restore());

    const successResponse = (body = {}) => [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(body)
    ];

    const failureResponse = [500, {}, 'test-failure-body'];

    const withGoogle = () =>
      store.dispatch(setRosterProvider(OAuthSectionTypes.google_classroom));
    const withClever = () =>
      store.dispatch(setRosterProvider(OAuthSectionTypes.clever));

    it('throws if no oauth provider has been set', () => {
      return expect(store.dispatch(beginImportRosterFlow())).to.be.rejected;
    });

    it('does nothing if the roster dialog was already open', () => {
      withGoogle();
      store.dispatch({type: IMPORT_ROSTER_FLOW_BEGIN});
      expect(isRosterDialogOpen(getState())).to.be.true;
      const promise = store.dispatch(beginImportRosterFlow());
      expect(isRosterDialogOpen(getState())).to.be.true;
      expect(server.requests).to.have.length(0);
      return expect(promise).to.be.fulfilled;
    });

    it('opens the roster dialog if it was closed', () => {
      withGoogle();
      expect(isRosterDialogOpen(getState())).to.be.false;
      const promise = store.dispatch(beginImportRosterFlow());
      expect(isRosterDialogOpen(getState())).to.be.true;
      server.respond();
      return expect(promise).to.be.fulfilled;
    });

    it('requests one api for Google Classroom', () => {
      withGoogle();
      const promise = store.dispatch(beginImportRosterFlow());
      expect(server.requests).to.have.length(1);
      expect(server.requests[0].method).to.equal('GET');
      expect(server.requests[0].url).to.equal(
        '/dashboardapi/google_classrooms'
      );
      server.respond();
      return expect(promise).to.be.fulfilled;
    });

    it('requests a different api for Clever', () => {
      withClever();
      const promise = store.dispatch(beginImportRosterFlow());
      expect(server.requests).to.have.length(1);
      expect(server.requests[0].method).to.equal('GET');
      expect(server.requests[0].url).to.equal(
        '/dashboardapi/clever_classrooms'
      );
      server.respond();
      return expect(promise).to.be.fulfilled;
    });

    it('sets the classroom list on success', () => {
      withGoogle();
      server.respondWith(
        'GET',
        '/dashboardapi/google_classrooms',
        successResponse({courses: [1, 2, 3]})
      );
      expect(getState().teacherSections.classrooms).to.be.null;
      expect(getState().teacherSections.loadError).to.be.null;

      const promise = store.dispatch(beginImportRosterFlow());
      expect(getState().teacherSections.classrooms).to.be.null;
      expect(getState().teacherSections.loadError).to.be.null;

      server.respond();
      expect(getState().teacherSections.classrooms).to.deep.equal([1, 2, 3]);
      expect(getState().teacherSections.loadError).to.be.null;
      return expect(promise).to.be.fulfilled;
    });

    it('sets the loadError on failure', () => {
      withGoogle();
      server.respondWith(
        'GET',
        '/dashboardapi/google_classrooms',
        failureResponse
      );
      expect(getState().teacherSections.classrooms).to.be.null;
      expect(getState().teacherSections.loadError).to.be.null;

      const promise = store.dispatch(beginImportRosterFlow());
      expect(getState().teacherSections.classrooms).to.be.null;
      expect(getState().teacherSections.loadError).to.be.null;

      server.respond();
      expect(getState().teacherSections.classrooms).to.be.null;
      expect(getState().teacherSections.loadError).to.deep.equal({
        status: 500,
        message: 'Unknown error.'
      });
      return expect(promise).to.be.rejected;
    });
  });

  describe('the cancelImportRosterFlow action', () => {
    it('closes the roster dialog if it was open', () => {
      store.dispatch({type: IMPORT_ROSTER_FLOW_BEGIN});
      expect(isRosterDialogOpen(getState())).to.be.true;
      store.dispatch(cancelImportRosterFlow());
      expect(isRosterDialogOpen(getState())).to.be.false;
    });

    it('clears the classroom list', () => {
      store.dispatch({
        type: IMPORT_ROSTER_FLOW_LIST_LOADED,
        classrooms: [1, 2, 3]
      });
      expect(getState().teacherSections.classrooms).to.deep.equal([1, 2, 3]);
      store.dispatch(cancelImportRosterFlow());
      expect(getState().teacherSections.classrooms).to.be.null;
    });
  });

  describe('the importOrUpdateRoster action', () => {
    let server;
    const TEST_COURSE_ID = 'test-course-id';
    const TEST_COURSE_NAME = 'test-course-name';

    beforeEach(() => {
      server = sinon.fakeServer.create();
      // We have chained server requests separated by promises in these
      // tests, so have the fake server respond immediately becaue it's
      // difficult to trigger the fake responses at the right times.
      server.respondImmediately = true;
      // set up some default success responses
      server.respondWith(
        'GET',
        `/dashboardapi/import_google_classroom?courseId=${TEST_COURSE_ID}&courseName=${TEST_COURSE_NAME}`,
        successResponse({})
      );
      server.respondWith(
        'GET',
        `/dashboardapi/import_clever_classroom?courseId=${TEST_COURSE_ID}&courseName=${TEST_COURSE_NAME}`,
        successResponse({})
      );
      server.respondWith('GET', '/dashboardapi/sections', successResponse([]));
      server.respondWith('GET', '/dashboardapi/courses', successResponse([]));
      server.respondWith(
        'GET',
        '/dashboardapi/sections/valid_scripts',
        successResponse([])
      );
    });
    afterEach(() => server.restore());

    const successResponse = (body = {}) => [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(body)
    ];

    const withGoogle = () =>
      store.dispatch(setRosterProvider(OAuthSectionTypes.google_classroom));
    const withClever = () =>
      store.dispatch(setRosterProvider(OAuthSectionTypes.clever));

    it('immediately clears the classroom list', () => {
      withGoogle();
      store.dispatch({
        type: IMPORT_ROSTER_FLOW_LIST_LOADED,
        classrooms: [1, 2, 3]
      });
      expect(getState().teacherSections.classrooms).to.deep.equal([1, 2, 3]);

      const promise = store.dispatch(
        importOrUpdateRoster(TEST_COURSE_ID, TEST_COURSE_NAME)
      );
      expect(getState().teacherSections.classrooms).to.be.null;

      return expect(promise).to.be.fulfilled;
    });

    it('uses one api for Google Classroom', () => {
      withGoogle();
      const promise = store.dispatch(
        importOrUpdateRoster(TEST_COURSE_ID, TEST_COURSE_NAME)
      );

      expect(server.requests).to.have.length(1);
      expect(server.requests[0].method).to.equal('GET');
      expect(server.requests[0].url).to.equal(
        '/dashboardapi/import_google_classroom?courseId=test-course-id&courseName=test-course-name'
      );

      return expect(promise).to.be.fulfilled;
    });

    it('uses a different api for Clever', () => {
      withClever();
      const promise = store.dispatch(
        importOrUpdateRoster(TEST_COURSE_ID, TEST_COURSE_NAME)
      );

      expect(server.requests).to.have.length(1);
      expect(server.requests[0].method).to.equal('GET');
      expect(server.requests[0].url).to.equal(
        '/dashboardapi/import_clever_classroom?courseId=test-course-id&courseName=test-course-name'
      );

      return expect(promise).to.be.fulfilled;
    });

    it('closes the dialog on success', () => {
      withClever();
      store.dispatch({type: IMPORT_ROSTER_FLOW_BEGIN});
      expect(isRosterDialogOpen(getState())).to.be.true;

      const promise = store.dispatch(
        importOrUpdateRoster(TEST_COURSE_ID, TEST_COURSE_NAME)
      );
      expect(isRosterDialogOpen(getState())).to.be.true;

      return expect(promise).to.be.fulfilled.then(() => {
        expect(isRosterDialogOpen(getState())).to.be.false;
      });
    });

    it('reloads the section data on success', () => {
      // Set up custom server sections response
      server.respondWith(
        'GET',
        '/dashboardapi/sections',
        successResponse(sections)
      );

      withClever();
      store.dispatch({type: IMPORT_ROSTER_FLOW_BEGIN});
      expect(getState().teacherSections.sections).to.deep.equal({});

      const promise = store.dispatch(
        importOrUpdateRoster(TEST_COURSE_ID, TEST_COURSE_NAME)
      );
      return expect(promise).to.be.fulfilled.then(() => {
        expect(server.requests).to.have.length(4);
        expect(server.requests[1].method).to.equal('GET');
        expect(server.requests[1].url).to.equal('/dashboardapi/sections');
        expect(server.requests[2].method).to.equal('GET');
        expect(server.requests[2].url).to.equal('/dashboardapi/courses');
        expect(server.requests[3].method).to.equal('GET');
        expect(server.requests[3].url).to.equal(
          '/dashboardapi/sections/valid_scripts'
        );
        expect(Object.keys(getState().teacherSections.sections)).to.have.length(
          sections.length
        );
      });
    });

    it('starts editing the new section on success', () => {
      // Set up custom section import response
      server.respondWith(
        'GET',
        `/dashboardapi/import_google_classroom?courseId=${TEST_COURSE_ID}&courseName=${TEST_COURSE_NAME}`,
        successResponse({
          id: 1111
        })
      );
      // Set up custom section load response to simulate the new section
      server.respondWith(
        'GET',
        '/dashboardapi/sections',
        successResponse([...sections, {id: 1111}])
      );

      withGoogle();
      store.dispatch({type: IMPORT_ROSTER_FLOW_BEGIN});
      expect(getState().teacherSections.sectionBeingEdited).to.be.null;

      const promise = store.dispatch(
        importOrUpdateRoster(TEST_COURSE_ID, TEST_COURSE_NAME)
      );
      return expect(promise).to.be.fulfilled.then(() => {
        expect(getState().teacherSections.sectionBeingEdited).not.to.be.null;
        expect(getState().teacherSections.sectionBeingEdited.id).to.equal(1111);
      });
    });
  });

  describe('the sectionCode selector', () => {
    it('undefined if the section is not found', () => {
      expect(sectionCode(getState(), 42)).to.be.undefined;
    });

    it('the section code if the section is found', () => {
      store.dispatch(setSections(sections));
      expect(sectionCode(getState(), 11)).to.equal('PMTKVH');
    });
  });

  describe('the sectionName selector', () => {
    it('undefined if the section is not found', () => {
      expect(sectionName(getState(), 42)).to.be.undefined;
    });

    it('the section name if the section is found', () => {
      store.dispatch(setSections(sections));
      expect(sectionName(getState(), 11)).to.equal('My Section');
    });
  });

  describe('the sectionProvider selector', () => {
    beforeEach(() => store.dispatch(setRosterProvider('google_classroom')));

    it('null if the section is not found', () => {
      expect(sectionProvider(getState(), 42)).to.be.null;
    });

    it('null if the section is not provider managed', () => {
      store.dispatch(setSections(sections));
      expect(sectionProvider(getState(), 11)).to.be.null;
    });

    it('the current user oauth provider if the section is provider managed', () => {
      store.dispatch(
        setSections([
          {
            id: 11,
            name: 'google test section',
            login_type: 'google_classroom',
            code: 'G-123456',
            studentCount: 10,
            providerManaged: true
          }
        ])
      );
      expect(sectionProvider(getState(), 11)).to.equal('google_classroom');
    });
  });

  describe('the isSectionProviderManaged selector', () => {
    it('false if the section is not found', () => {
      expect(isSectionProviderManaged(getState(), 42)).to.be.false;
    });

    it('false if the section is not provider managed', () => {
      store.dispatch(setSections(sections));
      expect(isSectionProviderManaged(getState(), 11)).to.be.false;
    });

    it('true if the section is provider managed', () => {
      store.dispatch(
        setSections([
          {
            id: 11,
            name: 'google test section',
            login_type: 'google_classroom',
            code: 'G-123456',
            studentCount: 10,
            providerManaged: true
          }
        ])
      );
      expect(isSectionProviderManaged(getState(), 11)).to.be.true;
    });
  });

  describe('getVisibleSections', () => {
    it('filters out hidden sections', () => {
      const expectedVisibleSections = [
        {id: 11, hidden: false},
        {id: 1, hidden: null}
      ];
      const state = {
        teacherSections: {
          sections: {
            2: {id: 2, hidden: true},
            ...expectedVisibleSections
          }
        }
      };
      const actualVisibleSections = getVisibleSections(state);

      assert.deepEqual(expectedVisibleSections, actualVisibleSections);
    });

    it('returns an empty array if there are no visible sections', () => {
      const state = {
        teacherSections: {
          sections: {
            2: {id: 2, hidden: true},
            1: {id: 1, hidden: true}
          }
        }
      };
      const visibleSections = getVisibleSections(state);

      expect(visibleSections.length).to.equal(0);
    });

    it('does not error if there are no sections', () => {
      const state = {
        teacherSections: {
          sections: {}
        }
      };
      const visibleSections = getVisibleSections(state);

      expect(visibleSections.length).to.equal(0);
    });
  });

  describe('sectionsNameAndId', () => {
    it('returns name and id for each section', () => {
      const state = reducer(undefined, setSections(sections));
      const expected = [
        {
          id: 307,
          name: 'My Third Section'
        },
        {
          id: 12,
          name: 'My Other Section'
        },
        {
          id: 11,
          name: 'My Section'
        }
      ];
      assert.deepEqual(sectionsNameAndId(state), expected);
    });
  });

  describe('getSectionRows', () => {
    it('returns appropriate section data', () => {
      const sectionState = reducer(initialState, setSections(sections));
      const state = reducer(
        sectionState,
        setValidAssignments(validCourses, validScripts)
      );

      const data = getSectionRows({teacherSections: state}, [11, 12]);
      const expected = [
        {
          id: 11,
          name: 'My Section',
          loginType: 'picture',
          studentCount: 10,
          code: 'PMTKVH',
          grade: '2',
          providerManaged: false,
          hidden: false,
          assignmentNames: ['CS Discoveries 2017'],
          assignmentPaths: ['/courses/csd-2017']
        },
        {
          id: 12,
          name: 'My Other Section',
          loginType: 'picture',
          studentCount: 1,
          code: 'DWGMFX',
          grade: '11',
          providerManaged: false,
          hidden: false,
          assignmentNames: ['Course 3'],
          assignmentPaths: ['/s/course3']
        }
      ];
      assert.deepEqual(data, expected);
    });
  });

  describe('sortedSectionsList', () => {
    it('creates a sorted array from a dictionary object', () => {
      const state = reducer(undefined, setSections(sections));
      const expected = sections
        .map(section => sectionFromServerSection(section))
        .reverse();
      assert.deepEqual(sortedSectionsList(state.sections), expected);
    });
  });

  describe('sortSectionsList', () => {
    it('sorts an array of sections by descending id', () => {
      const expected = sections.reverse();
      assert.deepEqual(sortSectionsList(sections), expected);
    });
  });
});
