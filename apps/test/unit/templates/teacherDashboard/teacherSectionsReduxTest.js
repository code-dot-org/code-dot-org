import sinon from 'sinon';
import {assert, expect} from '../../../util/reconfiguredChai';
import {
  __testing_stubRedux,
  __testing_restoreRedux,
  registerReducers,
  getStore,
} from '@cdo/apps/redux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import reducer, {
  __testInterface__,
  setAuthProviders,
  setRosterProvider,
  setCourseOfferings,
  setSections,
  selectSection,
  removeSection,
  beginCreatingSection,
  beginEditingSection,
  editSectionProperties,
  cancelEditingSection,
  finishEditingSection,
  asyncLoadSectionData,
  assignmentNames,
  assignmentPaths,
  sectionFromServerSection,
  isAddingSection,
  beginImportRosterFlow,
  cancelImportRosterFlow,
  importOrUpdateRoster,
  isRosterDialogOpen,
  sectionCode,
  sectionName,
  sectionProvider,
  isSectionProviderManaged,
  getVisibleSections,
  sectionsNameAndId,
  getSectionRows,
  sortedSectionsList,
  sortSectionsList,
  assignToSection,
  NO_SECTION,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {OAuthSectionTypes} from '@cdo/apps/lib/ui/accounts/constants';
import {courseOfferings} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

const {
  EDIT_SECTION_SUCCESS,
  IMPORT_ROSTER_FLOW_BEGIN,
  IMPORT_ROSTER_FLOW_LIST_LOADED,
  PENDING_NEW_SECTION_ID,
  USER_EDITABLE_SECTION_PROPS,
} = __testInterface__;

const createdAt = '2019-10-21T23:45:34.345Z';

const sections = [
  {
    id: 11,
    location: '/v2/sections/11',
    name: 'My Section',
    courseVersionName: 'csd-2017',
    login_type: 'picture',
    participant_type: 'student',
    grades: ['2'],
    code: 'PMTKVH',
    lesson_extras: false,
    tts_autoplay_enabled: false,
    pairing_allowed: true,
    sharing_disabled: false,
    course_offering_id: 2,
    course_version_id: 3,
    unit_id: null,
    createdAt: createdAt,
    studentCount: 10,
    hidden: false,
    restrict_section: false,
    post_milestone_disabled: false,
  },
  {
    id: 12,
    location: '/v2/sections/12',
    name: 'My Other Section',
    courseVersionName: 'coursea-2017',
    login_type: 'picture',
    participant_type: 'student',
    grades: ['11'],
    code: 'DWGMFX',
    lesson_extras: false,
    tts_autoplay_enabled: false,
    pairing_allowed: true,
    sharing_disabled: false,
    course_offering_id: 1,
    course_version_id: 1,
    unit_id: null,
    createdAt: createdAt,
    studentCount: 1,
    hidden: false,
    restrict_section: false,
    post_milestone_disabled: false,
  },
  {
    id: 307,
    location: '/v2/sections/307',
    name: 'My Third Section',
    courseVersionName: undefined,
    login_type: 'email',
    participant_type: 'student',
    grades: ['10'],
    code: 'WGYXTR',
    lesson_extras: true,
    tts_autoplay_enabled: false,
    pairing_allowed: false,
    sharing_disabled: false,
    course_offering_id: 3,
    course_version_id: 5,
    unit_id: 7,
    createdAt: createdAt,
    studentCount: 0,
    hidden: false,
    restrict_section: false,
    post_milestone_disabled: false,
  },
];

const students = [
  {
    id: 1,
    name: 'StudentA',
    sectionId: 'id',
    sharingDisabled: false,
  },
  {
    id: 2,
    name: 'StudentB',
    sectionId: 'id',
    sharingDisabled: false,
  },
];

describe('teacherSectionsRedux', () => {
  const initialState = reducer(undefined, {});
  let store;

  beforeEach(() => {
    __testing_stubRedux();
    registerReducers({teacherSections: reducer});
    store = getStore();
  });

  afterEach(() => {
    __testing_restoreRedux();
  });

  const getState = () => store.getState();

  describe('setAuthProviders', () => {
    it("sets teacher's auth providers", () => {
      const action = setAuthProviders([
        'google_oauth2',
        'clever',
        'email',
        'windowslive',
      ]);
      const nextState = reducer(initialState, action);
      assert.deepEqual(nextState.providers, [
        'google_classroom',
        'clever',
        'email',
        'windowslive',
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

  describe('setSections', () => {
    const startState = reducer(
      initialState,
      setCourseOfferings(courseOfferings)
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
      assert.strictEqual(nextState.selectedSectionId, sections[0].id);
    });

    it('throws rather than let us destroy data', () => {
      const action = setSections(sections);
      const nextState = reducer(startState, action);

      // Second action provides same sections, but only name/id
      const action2 = setSections(
        sections.map(section => ({
          id: section.id,
          name: section.name,
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

  describe('beginCreatingSection', () => {
    it('populates sectionBeingEdited if no course provided', () => {
      assert.isNull(initialState.sectionBeingEdited);
      const state = reducer(initialState, beginCreatingSection());
      assert.deepEqual(state.sectionBeingEdited, {
        id: PENDING_NEW_SECTION_ID,
        name: '',
        loginType: undefined,
        grades: [''],
        participantType: undefined,
        providerManaged: false,
        lessonExtras: true,
        ttsAutoplayEnabled: false,
        pairingAllowed: true,
        sharingDisabled: false,
        studentCount: 0,
        code: '',
        courseId: null,
        courseOfferingId: null,
        courseVersionId: null,
        unitId: null,
        hidden: false,
        isAssigned: undefined,
        restrictSection: false,
      });
    });

    it('populates sectionBeingEdited with provided course', () => {
      assert.isNull(initialState.sectionBeingEdited);
      const courseOfferingId = 1;
      const courseVersionId = 2;
      const unitId = 3;
      const state = reducer(
        initialState,
        beginCreatingSection(courseOfferingId, courseVersionId, unitId)
      );
      assert.deepEqual(state.sectionBeingEdited, {
        id: PENDING_NEW_SECTION_ID,
        name: '',
        loginType: undefined,
        grades: [''],
        participantType: undefined,
        providerManaged: false,
        lessonExtras: true,
        ttsAutoplayEnabled: false,
        pairingAllowed: true,
        sharingDisabled: false,
        studentCount: 0,
        code: '',
        courseId: null,
        courseOfferingId: courseOfferingId,
        courseVersionId: courseVersionId,
        unitId: unitId,
        hidden: false,
        isAssigned: undefined,
        restrictSection: false,
      });
    });
  });

  describe('beginEditingSection', () => {
    it('populates sectionBeingEdited if no section provided', () => {
      assert.isNull(initialState.sectionBeingEdited);
      const state = reducer(initialState, beginEditingSection());
      assert.deepEqual(state.sectionBeingEdited, {
        id: PENDING_NEW_SECTION_ID,
        name: '',
        loginType: undefined,
        grades: [''],
        participantType: undefined,
        providerManaged: false,
        lessonExtras: true,
        ttsAutoplayEnabled: false,
        pairingAllowed: true,
        sharingDisabled: false,
        studentCount: 0,
        code: '',
        courseId: null,
        courseOfferingId: null,
        courseVersionId: null,
        unitId: null,
        hidden: false,
        isAssigned: undefined,
        restrictSection: false,
      });
    });

    it('populates sectionBeingEdited', () => {
      const stateWithSections = reducer(initialState, setSections(sections));
      assert.isNull(stateWithSections.sectionBeingEdited);
      const state = reducer(stateWithSections, beginEditingSection(12));
      assert.deepEqual(state.sectionBeingEdited, {
        id: 12,
        name: 'My Other Section',
        courseVersionName: 'coursea-2017',
        loginType: 'picture',
        grades: ['11'],
        participantType: 'student',
        providerManaged: false,
        code: 'DWGMFX',
        lessonExtras: false,
        ttsAutoplayEnabled: false,
        pairingAllowed: true,
        sharingDisabled: false,
        courseOfferingId: 1,
        courseVersionId: 1,
        unitId: null,
        courseId: undefined,
        createdAt: createdAt,
        studentCount: 1,
        hidden: false,
        isAssigned: undefined,
        restrictSection: false,
        postMilestoneDisabled: false,
        codeReviewExpiresAt: null,
        isAssignedCSA: undefined,
      });
    });
  });

  describe('editSectionProperties', () => {
    let editingNewSectionState;

    before(() => {
      editingNewSectionState = reducer(initialState, beginEditingSection());
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
          courseId: 61,
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
            providerManaged: false, // Uneditable!
          })
        )
      ).to.throw();
    });

    it('switching script assignment updates lesson extras value to default value if no lesson extras value passed', () => {
      let state = reducer(
        editingNewSectionState,
        setCourseOfferings(courseOfferings)
      );
      state = reducer(
        state,
        editSectionProperties({unitId: 1, lessonExtras: false})
      );
      expect(state.sectionBeingEdited.lessonExtras).to.equal(false);

      state = reducer(state, editSectionProperties({unitId: 36}));
      expect(state.sectionBeingEdited.lessonExtras).to.equal(true);
    });

    it('switching script assignment and passing lesson extras value results in lesson extras being set to the passed value', () => {
      let state = reducer(
        editingNewSectionState,
        setCourseOfferings(courseOfferings)
      );
      state = reducer(
        state,
        editSectionProperties({unitId: 1, lessonExtras: false})
      );
      expect(state.sectionBeingEdited.lessonExtras).to.equal(false);

      state = reducer(
        state,
        editSectionProperties({unitId: 36, lessonExtras: true})
      );
      expect(state.sectionBeingEdited.lessonExtras).to.equal(true);
    });

    it('when updating script assignment for a section, ttsAutoplayEnabled defaults to false if no value provided', () => {
      let state = editingNewSectionState;
      state = reducer(state, editSectionProperties({unitId: 2}));
      expect(state.sectionBeingEdited.ttsAutoplayEnabled).to.equal(false);

      state = reducer(state, editSectionProperties({unitId: 37}));
      expect(state.sectionBeingEdited.ttsAutoplayEnabled).to.equal(false);
    });

    it('when updating script assignment for a section and setting ttsAutoplayEnabled sets to passed value', () => {
      let state = editingNewSectionState;
      state = reducer(
        state,
        editSectionProperties({unitId: 2, ttsAutoplayEnabled: true})
      );
      expect(state.sectionBeingEdited.ttsAutoplayEnabled).to.equal(true);

      state = reducer(
        state,
        editSectionProperties({unitId: 37, ttsAutoplayEnabled: false})
      );
      expect(state.sectionBeingEdited.ttsAutoplayEnabled).to.equal(false);
    });
  });

  describe('cancelEditingSection', () => {
    it('clears sectionBeingEdited', () => {
      const initialState = reducer(initialState, beginEditingSection());
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
      participant_type: 'student',
      grades: undefined,
      providerManaged: false,
      lesson_extras: false,
      tts_autoplay_enabled: false,
      pairing_allowed: true,
      student_count: 0,
      code: 'BCDFGH',
      courseOfferingId: null,
      courseVersionId: null,
      unitId: null,
      createdAt: createdAt,
      hidden: false,
      restrict_section: false,
      post_milestone_disabled: false,
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
          ...customProps,
        }),
      ];
    }

    const failureResponse = [500, {}, ''];

    function state() {
      return getState().teacherSections;
    }

    beforeEach(function () {
      // Stub server responses
      server = sinon.fakeServer.create();

      // Test with a real redux store, not just the reducer, because this
      // action depends on the redux-thunk extension.
      store.dispatch(setSections(sections));
    });

    afterEach(function () {
      server.restore();
    });

    it('immediately makes saveInProgress true', () => {
      store.dispatch(beginEditingSection());
      expect(state().saveInProgress).to.be.false;

      store.dispatch(finishEditingSection());
      expect(state().saveInProgress).to.be.true;
    });

    it('makes saveInProgress false after the server responds with success', () => {
      store.dispatch(beginEditingSection());
      server.respondWith('POST', '/dashboardapi/sections', successResponse());

      store.dispatch(finishEditingSection());
      expect(state().saveInProgress).to.be.true;

      server.respond();
      expect(state().saveInProgress).to.be.false;
    });

    it('makes saveInProgress false after the server responds with failure', () => {
      store.dispatch(beginEditingSection());
      server.respondWith('POST', '/dashboardapi/sections', failureResponse);

      store.dispatch(finishEditingSection()).catch(() => {});
      expect(state().saveInProgress).to.be.true;

      server.respond();
      expect(state().saveInProgress).to.be.false;
    });

    it('resolves a returned promise when the server responds with success', () => {
      store.dispatch(beginEditingSection());
      server.respondWith('POST', '/dashboardapi/sections', successResponse());

      const promise = store.dispatch(finishEditingSection());
      server.respond();
      return expect(promise).to.be.fulfilled;
    });

    it('rejects a returned promise when the server responds with failure', () => {
      store.dispatch(beginEditingSection());
      server.respondWith('POST', '/dashboardapi/sections', failureResponse);

      const promise = store.dispatch(finishEditingSection());
      server.respond();
      return expect(promise).to.be.rejected;
    });

    it('clears sectionBeingEdited after the server responds with success', () => {
      store.dispatch(beginEditingSection());
      server.respondWith('POST', '/dashboardapi/sections', successResponse());

      store.dispatch(finishEditingSection());
      expect(state().sectionBeingEdited).not.to.be.null;

      server.respond();
      expect(state().sectionBeingEdited).to.be.null;
    });

    it('keeps sectionBeingEdited after the server responds with failure', () => {
      store.dispatch(beginEditingSection());
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
      store.dispatch(beginEditingSection());
      store.dispatch(
        editSectionProperties({
          name: 'Aquarius PM Block 2',
          loginType: 'picture',
          grades: ['3'],
        })
      );
      server.respondWith(
        'POST',
        '/dashboardapi/sections',
        successResponse({
          name: 'Aquarius PM Block 2',
          login_type: 'picture',
          grades: ['3'],
          participantType: 'student',
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
          courseVersionName: undefined,
          loginType: 'picture',
          grades: ['3'],
          participantType: 'student',
          providerManaged: false,
          lessonExtras: false,
          ttsAutoplayEnabled: false,
          pairingAllowed: true,
          sharingDisabled: undefined,
          studentCount: undefined,
          code: 'BCDFGH',
          courseOfferingId: undefined,
          courseVersionId: undefined,
          unitId: undefined,
          courseId: undefined,
          createdAt: createdAt,
          hidden: false,
          isAssigned: undefined,
          restrictSection: false,
          postMilestoneDisabled: false,
          codeReviewExpiresAt: null,
          isAssignedCSA: undefined,
        },
      });
    });

    it('updates an edited section in the section map on success', () => {
      const sectionId = 12;
      store.dispatch(beginEditingSection(sectionId));
      store.dispatch(editSectionProperties({grades: ['K']}));

      // Set up matching server response
      server.respondWith(
        'PATCH',
        `/dashboardapi/sections/${sectionId}`,
        successResponse({grades: ['K']})
      );

      store.dispatch(finishEditingSection());
      expect(state().sectionBeingEdited.grades).to.eql(['K']);
      expect(state().sections[sectionId].grades).to.eql(['11']);

      server.respond();
      expect(state().sectionBeingEdited).to.be.null;
      expect(state().sections[sectionId].grades).to.eql(['K']);
    });

    it('does not modify sections map on failure', () => {
      store.dispatch(beginEditingSection());
      server.respondWith('POST', '/dashboardapi/sections', failureResponse);
      const originalSections = state().sections;

      store.dispatch(finishEditingSection()).catch(() => {});
      server.respond();
      expect(state().sections).to.equal(originalSections);
    });
  });

  describe('asyncLoadSectionData', () => {
    let server;

    function successResponse(response = []) {
      return [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(response),
      ];
    }

    const failureResponse = [500, {}, 'CustomErrorBody'];

    function state() {
      return getState().teacherSections;
    }

    beforeEach(function () {
      // Stub server responses
      server = sinon.fakeServer.create();
      sinon.stub(console, 'error');
    });

    afterEach(function () {
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
      server.respondWith(
        'GET',
        '/dashboardapi/sections/valid_course_offerings',
        successResponse()
      );
      server.respondWith(
        'GET',
        '/dashboardapi/sections/available_participant_types',
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
      server.respondWith(
        'GET',
        '/dashboardapi/sections/valid_course_offerings',
        successResponse()
      );
      server.respondWith(
        'GET',
        '/dashboardapi/sections/available_participant_types',
        successResponse({availableParticipantTypes: ['student']})
      );
      server.respond();

      return promise.then(() => {
        expect(Object.keys(state().sections)).to.have.length(sections.length);
      });
    });

    it('sets courseOfferings from server responses', () => {
      const promise = store.dispatch(asyncLoadSectionData());
      expect(state().courseOfferings).to.deep.equal({});

      expect(server.requests).to.have.length(3);
      server.respondWith('GET', '/dashboardapi/sections', successResponse());
      server.respondWith(
        'GET',
        '/dashboardapi/sections/valid_course_offerings',
        successResponse(courseOfferings)
      );
      server.respondWith(
        'GET',
        '/dashboardapi/sections/available_participant_types',
        successResponse({availableParticipantTypes: ['student']})
      );
      server.respond();

      return promise.then(() => {
        expect(Object.keys(state().courseOfferings)).to.have.length(
          Object.keys(courseOfferings).length
        );
      });
    });

    it('sets availableParticipantTypes from server responses', () => {
      const promise = store.dispatch(asyncLoadSectionData());
      expect(state().courseOfferings).to.deep.equal({});

      expect(server.requests).to.have.length(3);
      server.respondWith('GET', '/dashboardapi/sections', successResponse());
      server.respondWith(
        'GET',
        '/dashboardapi/sections/valid_course_offerings',
        successResponse(courseOfferings)
      );
      server.respondWith(
        'GET',
        '/dashboardapi/sections/available_participant_types',
        successResponse({availableParticipantTypes: ['student', 'teacher']})
      );
      server.respond();

      return promise.then(() => {
        expect(state().availableParticipantTypes).to.have.length(2);
      });
    });

    it('sets students from server responses', () => {
      const promise = store.dispatch(asyncLoadSectionData('id'));
      expect(state().courseOfferings).to.deep.equal({});

      expect(server.requests).to.have.length(4);
      server.respondWith('GET', '/dashboardapi/sections', successResponse());
      server.respondWith(
        'GET',
        '/dashboardapi/sections/valid_course_offerings',
        successResponse(courseOfferings)
      );
      server.respondWith(
        'GET',
        '/dashboardapi/sections/available_participant_types',
        successResponse({availableParticipantTypes: ['student']})
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
      grades: ['2'],
      code: 'PMTKVH',
      lesson_extras: false,
      pairing_allowed: true,
      script_id: null,
      course_id: 29,
      createdAt: createdAt,
      studentCount: 10,
      hidden: false,
      restrict_section: false,
      post_milestone_disabled: false,
    };

    it('transfers some fields directly, mapping from snake_case to camelCase', () => {
      const section = sectionFromServerSection(serverSection);
      assert.strictEqual(section.id, serverSection.id);
      assert.strictEqual(section.name, serverSection.name);
      assert.strictEqual(section.login_type, serverSection.loginType);
      assert.strictEqual(section.grades, serverSection.grades);
      assert.strictEqual(section.code, serverSection.code);
      assert.strictEqual(section.lesson_extras, serverSection.lessonExtras);
      assert.strictEqual(
        section.tts_autoplay_enabled,
        serverSection.ttsAutoplayEnabled
      );
      assert.strictEqual(section.pairing_allowed, serverSection.pairingAllowed);
      assert.strictEqual(
        section.sharing_disabled,
        serverSection.sharingDisabled
      );
      assert.strictEqual(section.course_id, serverSection.courseId);
      assert.strictEqual(section.hidden, serverSection.hidden);
      assert.strictEqual(
        section.restrict_section,
        serverSection.restrictSection
      );
      assert.strictEqual(
        section.post_milestone_disabled,
        serverSection.postMilestoneDisabled
      );
    });

    it('sets student count', () => {
      const section = sectionFromServerSection(serverSection);
      assert.equal(section.studentCount, 10);
    });
  });

  describe('assignmentNames/assignmentPaths', () => {
    const stateWithAssigns = reducer(
      initialState,
      setCourseOfferings(courseOfferings)
    );
    const stateWithSections = reducer(stateWithAssigns, setSections(sections));
    const stateWithUnassignedSection = reducer(stateWithSections, {
      type: EDIT_SECTION_SUCCESS,
      sectionId: '12',
      serverSection: {
        ...sections[1],
        course_offering_id: null,
        course_version_id: null,
        unit_id: null,
      },
    });
    const stateWithInvalidUnitAssignment = reducer(stateWithSections, {
      type: EDIT_SECTION_SUCCESS,
      sectionId: '12',
      serverSection: {
        ...sections[1],
        course_offering_id: 2,
        course_version_id: 3,
        unit_id: 9999,
      },
    });
    const stateWithInvalidCourseOfferingAssignment = reducer(
      stateWithSections,
      {
        type: EDIT_SECTION_SUCCESS,
        sectionId: '12',
        serverSection: {
          ...sections[1],
          course_offering_id: 9999,
          course_version_id: 9999,
          unit_id: null,
        },
      }
    );

    const assignedSection = stateWithUnassignedSection.sections['11'];
    const unassignedSection = stateWithUnassignedSection.sections['12'];
    const assignedSectionWithUnit = stateWithUnassignedSection.sections['307'];
    const invalidScriptSection = stateWithInvalidUnitAssignment.sections['12'];
    const invalidCourseSection =
      stateWithInvalidCourseOfferingAssignment.sections['12'];

    it('assignmentNames returns the name if the section is assigned a course/script', () => {
      const names = assignmentNames(
        stateWithUnassignedSection.courseOfferings,
        assignedSection
      );
      assert.deepEqual(names, ['CS Discoveries 2017']);
    });

    it('assignmentNames returns the names of course and script if assigned both', () => {
      const names = assignmentNames(
        stateWithUnassignedSection.courseOfferings,
        assignedSectionWithUnit
      );
      assert.deepEqual(names, ['CS A', 'Unit 1']);
    });

    it('assignmentName returns empty array if unassigned', () => {
      const names = assignmentNames(
        stateWithUnassignedSection.courseOfferings,
        unassignedSection
      );
      assert.deepEqual(names, []);
    });

    it('assignmentName returns just the course if assigned unit is not a valid assignment', () => {
      const names = assignmentNames(
        stateWithInvalidUnitAssignment.courseOfferings,
        invalidScriptSection
      );
      assert.deepEqual(names, ['CS Discoveries 2017']);
    });

    it('assignmentName returns empty array if assigned course is not a valid assignment', () => {
      const names = assignmentNames(
        stateWithInvalidCourseOfferingAssignment.courseOfferings,
        invalidCourseSection
      );
      assert.deepEqual(names, []);
    });

    it('assignmentPaths returns the path if the section is assigned a course/script', () => {
      const paths = assignmentPaths(
        stateWithUnassignedSection.courseOfferings,
        assignedSection
      );
      assert.deepEqual(paths, ['/courses/csd-2017']);
    });

    it('assignmentPaths returns the paths of course and script if assigned both', () => {
      const paths = assignmentPaths(
        stateWithUnassignedSection.courseOfferings,
        assignedSectionWithUnit
      );
      assert.deepEqual(paths, ['/courses/csa-2022', '/s/csa1-2022']);
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
        stateWithInvalidUnitAssignment,
        invalidScriptSection
      );
      assert.deepEqual(paths, []);
    });

    it('assignmentPaths returns empty array if assigned course offering and course version is not a valid assignment', () => {
      const paths = assignmentPaths(
        stateWithInvalidCourseOfferingAssignment,
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
      const state = reducer(initialState, beginEditingSection());
      assert(isAddingSection(state));
    });

    it('is false when editing an existing section', () => {
      const stateWithSections = reducer(initialState, setSections(sections));
      const state = reducer(stateWithSections, beginEditingSection(12));
      assert.isFalse(isAddingSection(state));
    });

    it('is false after editing is cancelled', () => {
      const initialState = reducer(initialState, beginEditingSection());
      const state = reducer(initialState, cancelEditingSection());
      assert.isFalse(isAddingSection(state));
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
      JSON.stringify(body),
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
        message: 'Unknown error.',
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
        classrooms: [1, 2, 3],
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
      server.respondWith(
        'GET',
        '/dashboardapi/sections/valid_course_offerings',
        successResponse([])
      );
      server.respondWith(
        'GET',
        '/dashboardapi/sections/available_participant_types',
        successResponse({availableParticipantTypes: ['student']})
      );
      server.respondWith(
        'GET',
        '/dashboardapi/sections/available_participant_types',
        successResponse({availableParticipantTypes: ['student']})
      );
    });
    afterEach(() => server.restore());

    const successResponse = (body = {}) => [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(body),
    ];

    const withGoogle = () =>
      store.dispatch(setRosterProvider(OAuthSectionTypes.google_classroom));
    const withClever = () =>
      store.dispatch(setRosterProvider(OAuthSectionTypes.clever));

    it('immediately clears the classroom list', () => {
      withGoogle();
      store.dispatch({
        type: IMPORT_ROSTER_FLOW_LIST_LOADED,
        classrooms: [1, 2, 3],
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
        expect(server.requests[2].url).to.equal(
          '/dashboardapi/sections/valid_course_offerings'
        );
        expect(server.requests[3].method).to.equal('GET');
        expect(server.requests[3].url).to.equal(
          '/dashboardapi/sections/available_participant_types'
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
          id: 1111,
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
            providerManaged: true,
          },
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
            providerManaged: true,
          },
        ])
      );
      expect(isSectionProviderManaged(getState(), 11)).to.be.true;
    });
  });

  describe('getVisibleSections', () => {
    it('filters out hidden sections', () => {
      const expectedVisibleSections = [
        {id: 11, hidden: false},
        {id: 1, hidden: null},
      ];
      const state = {
        teacherSections: {
          sections: {
            2: {id: 2, hidden: true},
            ...expectedVisibleSections,
          },
        },
      };
      const actualVisibleSections = getVisibleSections(state);

      assert.deepEqual(expectedVisibleSections, actualVisibleSections);
    });

    it('returns an empty array if there are no visible sections', () => {
      const state = {
        teacherSections: {
          sections: {
            2: {id: 2, hidden: true},
            1: {id: 1, hidden: true},
          },
        },
      };
      const visibleSections = getVisibleSections(state);

      expect(visibleSections.length).to.equal(0);
    });

    it('does not error if there are no sections', () => {
      const state = {
        teacherSections: {
          sections: {},
        },
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
          name: 'My Third Section',
        },
        {
          id: 12,
          name: 'My Other Section',
        },
        {
          id: 11,
          name: 'My Section',
        },
      ];
      assert.deepEqual(sectionsNameAndId(state), expected);
    });
  });

  describe('getSectionRows', () => {
    it('returns appropriate section data', () => {
      const sectionState = reducer(initialState, setSections(sections));
      const state = reducer(sectionState, setCourseOfferings(courseOfferings));

      const data = getSectionRows({teacherSections: state}, [11, 12]);
      const expected = [
        {
          id: 11,
          name: 'My Section',
          courseVersionName: 'csd-2017',
          loginType: 'picture',
          studentCount: 10,
          code: 'PMTKVH',
          grades: ['2'],
          participantType: 'student',
          providerManaged: false,
          hidden: false,
          assignmentNames: ['CS Discoveries 2017'],
          assignmentPaths: ['/courses/csd-2017'],
        },
        {
          id: 12,
          name: 'My Other Section',
          courseVersionName: 'coursea-2017',
          loginType: 'picture',
          studentCount: 1,
          code: 'DWGMFX',
          grades: ['11'],
          participantType: 'student',
          providerManaged: false,
          hidden: false,
          assignmentNames: ['Course A'],
          assignmentPaths: ['/s/coursea-2017'],
        },
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

  describe('AnalyticsReporter events', () => {
    let analyticsSpy;

    beforeEach(() => {
      store.dispatch(setSections(sections));
      analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');
    });

    afterEach(() => {
      analyticsSpy.restore();
    });

    it('sends an event when course offering is assigned', () => {
      const testSection = getState().teacherSections.sections[11];
      store.dispatch(assignToSection(testSection.id, 100, 101, 102, 103));
      expect(analyticsSpy).to.be.called.once;
      assert.deepEqual(analyticsSpy.getCall(0).lastArg, {
        sectionName: testSection.name,
        sectionId: testSection.id,
        sectionLoginType: testSection.loginType,
        previousUnitId: testSection.unitId,
        previousCourseId: testSection.courseOfferingId,
        previousCourseVersionId: testSection.courseVersionId,
        newUnitId: 103,
        newCourseId: 101,
        newCourseVersionId: 102,
      });
    });

    it('sends an event when unit is changed', () => {
      const testSection = getState().teacherSections.sections[11];
      store.dispatch(
        assignToSection(
          testSection.id,
          testSection.courseId,
          testSection.courseOfferingId,
          testSection.courseVersionId,
          7
        )
      );
      expect(analyticsSpy).to.be.called.once;
      assert.deepEqual(analyticsSpy.getCall(0).lastArg, {
        sectionName: testSection.name,
        sectionId: testSection.id,
        sectionLoginType: testSection.loginType,
        previousUnitId: testSection.unitId,
        previousCourseId: testSection.courseOfferingId,
        previousCourseVersionId: testSection.courseVersionId,
        newUnitId: 7,
        newCourseId: testSection.courseOfferingId,
        newCourseVersionId: testSection.courseVersionId,
      });
    });

    it('doesnt send an event when course offering is unchanged', () => {
      store.dispatch(assignToSection(11, 2, 2, 3, null));
      expect(analyticsSpy).to.not.be.called;
    });
  });
});
