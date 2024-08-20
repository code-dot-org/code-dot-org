import {render, screen} from '@testing-library/react';
import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import {
  PublishedState,
  InstructionType,
  InstructorAudience,
  ParticipantAudience,
} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import createResourcesReducer, {
  initResources,
} from '@cdo/apps/levelbuilder/lesson-editor/resourcesEditorRedux';
import UnitEditor from '@cdo/apps/levelbuilder/unit-editor/UnitEditor';
import reducers, {
  init,
} from '@cdo/apps/levelbuilder/unit-editor/unitEditorRedux';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers,
} from '@cdo/apps/redux';
import * as utils from '@cdo/apps/utils';

import {assert, expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('UnitEditor', () => {
  let defaultProps, store;
  beforeEach(() => {
    sinon.stub(utils, 'navigateToHref');
    stubRedux();

    registerReducers({
      ...reducers,
      isRtl,
      resources: createResourcesReducer('teacherResource'),
      studentResources: createResourcesReducer('studentResource'),
    });
    store = getStore();
    store.dispatch(
      init(
        [
          {
            bigQuestions: '* One↵* two',
            description: 'laklkldkla"',
            displayName: 'Content',
            key: 'lesson group',
            lessons: [],
            position: 1,
            userFacing: true,
          },
        ],
        {}
      )
    );
    store.dispatch(initResources([]));

    defaultProps = {
      id: 1,
      initialAnnouncements: [],
      curriculumUmbrella: 'CSF',
      i18nData: {
        description:
          '# TEACHER Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
        studentDescription:
          '# STUDENT Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
      },
      isLevelbuilder: true,
      locales: [],
      name: 'test-unit',
      unitFamilies: [],
      versionYearOptions: [],
      initialFamilyName: '',
      initialVersionYear: '',
      initialProjectSharing: false,
      initialLocales: [],
      isMigrated: false,
      initialPublishedState: PublishedState.in_development,
      initialUnitPublishedState: null,
      initialInstructionType: InstructionType.teacher_led,
      initialInstructorAudience: InstructorAudience.teacher,
      initialParticipantAudience: ParticipantAudience.student,
      initialSupportedLocales: [],
      hasCourse: false,
      scriptPath: '/s/test-unit',
      initialProfessionalLearningCourse: '',
      isCSDCourseOffering: false,
      isMissingRequiredDeviceCompatibilities: false,
    };
  });

  afterEach(() => {
    restoreRedux();
    utils.navigateToHref.restore();
  });

  const createWrapper = overrideProps => {
    const combinedProps = {...defaultProps, ...overrideProps};
    return mount(
      <Provider store={store}>
        <UnitEditor {...combinedProps} />
      </Provider>
    );
  };

  function renderDefault(overrideProps = {}) {
    const combinedProps = {...defaultProps, ...overrideProps};
    render(
      <Provider store={store}>
        <UnitEditor {...combinedProps} />
      </Provider>
    );
  }

  describe('Script Editor', () => {
    it('does not show publishing editor if hasCourse is true', () => {
      renderDefault({hasCourse: true});
      expect(screen.queryByTestId('course-version-publishing-editor')).to.not
        .exist;
    });

    it('shows publishing editor if hasCourse is false', () => {
      renderDefault({hasCourse: false});
      screen.queryByTestId('course-version-publishing-editor');
    });
  });

  describe('Script Editor - Legacy (Enzyme)', () => {
    it('shows hide this unit in course if hasCourse and course is not in development', () => {
      const wrapper = createWrapper({
        hasCourse: true,
        initialPublishedState: 'pilot',
      });
      assert.equal(wrapper.find('.unit-test-hide-unit-in-course').length, 1);
    });

    it('does not show hide this unit in course if does not have course', () => {
      const wrapper = createWrapper({
        hasCourse: false,
        initialPublishedState: 'pilot',
      });
      assert.equal(wrapper.find('.unit-test-hide-unit-in-course').length, 0);
    });

    it('does not show hide this unit in course if course is in development', () => {
      const wrapper = createWrapper({
        hasCourse: true,
        initialPublishedState: 'in_development',
      });
      assert.equal(wrapper.find('.unit-test-hide-unit-in-course').length, 0);
    });

    it('clicking hide unit checkbox updates unit published state', () => {
      const wrapper = createWrapper({
        hasCourse: true,
        initialPublishedState: 'pilot',
        initialUnitPublishedState: 'in_development',
      });
      assert.equal(wrapper.find('.unit-test-hide-unit-in-course').length, 1);
      assert.equal(
        wrapper.find('.unit-test-hide-unit-in-course').props().checked,
        true
      );
      wrapper.find('.unit-test-hide-unit-in-course').simulate('change');
      assert.equal(
        wrapper.find('.unit-test-hide-unit-in-course').props().checked,
        false
      );
    });

    it('uses new unit editor for migrated unit', () => {
      const wrapper = createWrapper({
        isMigrated: true,
        initialCourseVersionId: 1,
      });

      expect(wrapper.find('input').length).to.equal(24);
      expect(wrapper.find('input[type="checkbox"]').length).to.equal(11);
      expect(wrapper.find('textarea').length).to.equal(4);
      expect(wrapper.find('select').length).to.equal(5);
      expect(wrapper.find('CollapsibleEditorSection').length).to.equal(11);
      expect(wrapper.find('SaveBar').length).to.equal(1);
      expect(wrapper.find('CourseTypeEditor').length).to.equal(1);

      expect(wrapper.find('UnitCard').length).to.equal(1);
    });

    it('locale selection is a multi select checkbox component with initial options selected', () => {
      const wrapper = createWrapper({
        initialLocales: [
          ['Hindi', 'hi-IN'],
          ['Tamil', 'ta-IN'],
          ['Kannada', 'ka-IN'],
          ['Bahasa', 'ms-MY'],
        ],
        initialSupportedLocales: ['hi-IN', 'ta-IN'],
      });

      expect(
        wrapper
          .find('li')
          .filterWhere(
            li =>
              li.find('input[type="checkbox"]').length === 1 &&
              li.find('strong').length === 1
          ).length
      ).to.equal(4);

      expect(
        wrapper
          .find('li')
          .filterWhere(
            li =>
              li.find('input[type="checkbox"]').length === 1 &&
              li.find('strong').filterWhere(st => st.text() === 'hi-IN')
                .length === 1
          ).length
      ).to.equal(1);

      expect(
        wrapper
          .find('li')
          .filterWhere(
            li =>
              li.find('input[type="checkbox"]').length === 1 &&
              li.find('strong').filterWhere(st => st.text() === 'ta-IN')
                .length === 1
          ).length
      ).to.equal(1);
    });

    it('disables changing student facing lesson plan checkbox when not allowed to make major curriculum changes', () => {
      const wrapper = createWrapper({
        initialPublishedState: 'stable',
        isMigrated: true,
        initialUseLegacyLessonPlans: false,
      });

      expect(
        wrapper.find('.student-facing-lesson-plan-checkbox').length
      ).to.equal(1);
      expect(
        wrapper.find('.student-facing-lesson-plan-checkbox').props().disabled
      ).to.equal(true);
    });

    it('allows changing student facing lesson plan checkbox when allowed to make major curriculum changes to hidden unit', () => {
      const wrapper = createWrapper({
        initialPublishedState: 'stable',
        initialUnitPublishedState: 'in_development',
        isMigrated: true,
        initialUseLegacyLessonPlans: false,
      });

      expect(
        wrapper.find('.student-facing-lesson-plan-checkbox').length
      ).to.equal(1);
      expect(
        wrapper.find('.student-facing-lesson-plan-checkbox').props().disabled
      ).to.equal(false);
    });

    describe('Teacher Resources', () => {
      it('uses new resource editor for migrated units', () => {
        const wrapper = createWrapper({
          isMigrated: true,
        });
        expect(wrapper.find('ResourcesEditor').first()).to.exist;
      });
    });

    it('has correct markdown for preview of unit description', () => {
      const wrapper = createWrapper({});
      expect(wrapper.find('TextareaWithMarkdownPreview').length).to.equal(2);
      expect(
        wrapper.find('TextareaWithMarkdownPreview').at(0).prop('markdown')
      ).to.equal(
        '# TEACHER Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
      );
      expect(
        wrapper.find('TextareaWithMarkdownPreview').at(1).prop('markdown')
      ).to.equal(
        '# STUDENT Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
      );
    });
  });
  it('disables peer review count when instructor review only selected', () => {
    const wrapper = createWrapper({
      initialOnlyInstructorReviewRequired: false,
      initialPeerReviewsRequired: 2,
    });

    let peerReviewCountInput = wrapper.find('#number_peer_reviews_input');

    expect(peerReviewCountInput.props().disabled).to.be.false;
    expect(peerReviewCountInput.props().value).to.equal(2);

    const instructorReviewOnlyCheckbox = wrapper.find(
      '#only_instructor_review_checkbox'
    );
    instructorReviewOnlyCheckbox.simulate('change', {
      target: {checked: true},
    });

    peerReviewCountInput = wrapper.find('#number_peer_reviews_input');

    expect(peerReviewCountInput.props().disabled).to.be.true;
    expect(peerReviewCountInput.props().value).to.equal(0);
  });

  describe('Saving Script Editor', () => {
    let clock;

    afterEach(() => {
      if (clock) {
        clock.restore();
        clock = undefined;
      }
    });

    it('can save and keep editing', () => {
      const wrapper = createWrapper({});
      const unitEditor = wrapper.find('UnitEditor');

      let returnData = {
        scriptPath: '/s/test-unit',
      };
      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/s/1`, [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(returnData),
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
      expect(unitEditor.state().isSaving).to.equal(true);

      clock = sinon.useFakeTimers(new Date('2020-12-01'));
      const expectedLastSaved = Date.now();
      server.respond();
      clock.tick(50);

      unitEditor.update();
      expect(utils.navigateToHref).to.not.have.been.called;
      expect(unitEditor.state().isSaving).to.equal(false);
      expect(unitEditor.state().lastSaved).to.equal(expectedLastSaved);
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      //check that last saved message is showing
      expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
      server.restore();
    });

    it('shows error when save and keep editing has error saving', () => {
      const wrapper = createWrapper({});
      const unitEditor = wrapper.find('UnitEditor');

      let returnData = 'There was an error';
      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/s/1`, [
        404,
        {'Content-Type': 'application/json'},
        returnData,
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
      expect(unitEditor.state().isSaving).to.equal(true);

      server.respond();
      unitEditor.update();
      expect(utils.navigateToHref).to.not.have.been.called;
      expect(unitEditor.state().isSaving).to.equal(false);
      expect(unitEditor.state().error).to.equal('There was an error');
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      expect(
        wrapper.find('.saveBar').contains('Error Saving: There was an error')
      ).to.be.true;

      server.restore();
    });

    it('Timeout error shows custom error message to refresh and check it saved', () => {
      const wrapper = createWrapper({});
      const unitEditor = wrapper.find('UnitEditor');

      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/s/1`, [
        504,
        {'Content-Type': 'application/json'},
        'Error: Gateway Timeout',
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
      expect(unitEditor.state().isSaving).to.equal(true);

      server.respond();
      unitEditor.update();
      expect(utils.navigateToHref).to.not.have.been.called;
      expect(unitEditor.state().isSaving).to.equal(false);
      expect(unitEditor.state().error).to.equal(
        'The save request timed out. Please refresh the page and verify your changes have been saved correctly.'
      );
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      expect(
        wrapper
          .find('.saveBar')
          .contains(
            'Error Saving: The save request timed out. Please refresh the page and verify your changes have been saved correctly.'
          )
      ).to.be.true;

      server.restore();
    });

    it('shows error when showCalendar is true and weeklyInstructionalMinutes not provided', () => {
      sinon.stub($, 'ajax');
      const wrapper = createWrapper({initialShowCalendar: true});
      const unitEditor = wrapper.find('UnitEditor');

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      expect($.ajax).to.not.have.been.called;

      expect(unitEditor.state().isSaving).to.equal(false);
      expect(unitEditor.state().error).to.equal(
        'Please provide instructional minutes per week in Unit Calendar Settings.'
      );

      expect(
        wrapper
          .find('.saveBar')
          .contains(
            'Error Saving: Please provide instructional minutes per week in Unit Calendar Settings.'
          )
      ).to.be.true;
      $.ajax.restore();
    });

    it('shows error when showCalendar is true and weeklyInstructionalMinutes is invalid', () => {
      sinon.stub($, 'ajax');
      const wrapper = createWrapper({
        initialShowCalendar: true,
        initialWeeklyInstructionalMinutes: -100,
      });
      const unitEditor = wrapper.find('UnitEditor');

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      expect($.ajax).to.not.have.been.called;

      expect(unitEditor.state().isSaving).to.equal(false);
      expect(unitEditor.state().error).to.equal(
        'Please provide a positive number of instructional minutes per week in Unit Calendar Settings.'
      );

      expect(
        wrapper
          .find('.saveBar')
          .contains(
            'Error Saving: Please provide a positive number of instructional minutes per week in Unit Calendar Settings.'
          )
      ).to.be.true;
      $.ajax.restore();
    });

    it('shows error when published state is pilot but no pilot experiment given', () => {
      sinon.stub($, 'ajax');
      const wrapper = createWrapper({});

      const unitEditor = wrapper.find('UnitEditor');
      unitEditor.setState({
        publishedState: PublishedState.pilot,
        pilotExperiment: '',
      });

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      expect($.ajax).to.not.have.been.called;

      expect(unitEditor.state().isSaving).to.equal(false);
      expect(unitEditor.state().error).to.equal(
        'Please provide a pilot experiment in order to save with published state as pilot.'
      );

      expect(
        wrapper
          .find('.saveBar')
          .contains(
            'Error Saving: Please provide a pilot experiment in order to save with published state as pilot.'
          )
      ).to.be.true;

      $.ajax.restore();
    });

    it('shows error when published state is preview or stable and device compatibility JSON is null', () => {
      sinon.stub($, 'ajax');
      const wrapper = createWrapper({
        isMissingRequiredDeviceCompatibilities: true,
        hasCourse: true,
      });

      const unitEditor = wrapper.find('UnitEditor');
      unitEditor.setState({
        publishedState: PublishedState.preview,
        courseOfferingDeviceCompatibilities: null,
      });

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      expect($.ajax).to.not.have.been.called;

      expect(unitEditor.state().isSaving).to.equal(false);
      expect(unitEditor.state().error).to.equal(
        'Please set all device compatibilities in order to save with published state as preview or stable.'
      );

      expect(
        wrapper
          .find('.saveBar')
          .contains(
            'Error Saving: Please set all device compatibilities in order to save with published state as preview or stable.'
          )
      ).to.be.true;

      $.ajax.restore();
    });

    it('shows error when published state is preview or stable and at least one device compatibility is not set', () => {
      sinon.stub($, 'ajax');
      const wrapper = createWrapper({
        isMissingRequiredDeviceCompatibilities: true,
        hasCourse: true,
      });

      const unitEditor = wrapper.find('UnitEditor');
      unitEditor.setState({
        publishedState: PublishedState.stable,
        courseOfferingDeviceCompatibilities:
          '{"computer":"","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
      });

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      expect($.ajax).to.not.have.been.called;

      expect(unitEditor.state().isSaving).to.equal(false);
      expect(unitEditor.state().error).to.equal(
        'Please set all device compatibilities in order to save with published state as preview or stable.'
      );

      expect(
        wrapper
          .find('.saveBar')
          .contains(
            'Error Saving: Please set all device compatibilities in order to save with published state as preview or stable.'
          )
      ).to.be.true;

      $.ajax.restore();
    });

    it('saves successfully if unit is not a course and only version year is set', () => {
      const wrapper = createWrapper({initialIsCourse: false});

      const unitEditor = wrapper.find('UnitEditor');
      unitEditor.setState({
        versionYear: '1991',
        familyName: '',
      });

      let returnData = {
        scriptPath: '/s/test-unit',
      };
      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/s/1`, [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(returnData),
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
      expect(unitEditor.state().isSaving).to.equal(true);

      clock = sinon.useFakeTimers(new Date('2020-12-01'));
      const expectedLastSaved = Date.now();
      server.respond();
      clock.tick(50);

      unitEditor.update();
      expect(utils.navigateToHref).to.not.have.been.called;
      expect(unitEditor.state().isSaving).to.equal(false);
      expect(unitEditor.state().lastSaved).to.equal(expectedLastSaved);
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      //check that last saved message is showing
      expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
      server.restore();
    });

    it('shows error when version year is set but family name is not', () => {
      sinon.stub($, 'ajax');
      const wrapper = createWrapper({initialIsCourse: true});

      const unitEditor = wrapper.find('UnitEditor');
      unitEditor.setState({
        versionYear: '1991',
        familyName: '',
      });

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      expect($.ajax).to.not.have.been.called;

      expect(unitEditor.state().isSaving).to.equal(false);
      expect(unitEditor.state().error).to.equal(
        'Please set both version year and family name.'
      );

      expect(
        wrapper
          .find('.saveBar')
          .contains(
            'Error Saving: Please set both version year and family name.'
          )
      ).to.be.true;

      $.ajax.restore();
    });

    it('shows error when moving standalone unit out of in development if not supplied all standalone unit information', () => {
      sinon.stub($, 'ajax');
      const wrapper = createWrapper({initialIsCourse: false, hasCourse: false});

      const unitEditor = wrapper.find('UnitEditor');
      unitEditor.setState({publishedState: 'beta'});

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      expect($.ajax).to.not.have.been.called;

      expect(unitEditor.state().isSaving).to.equal(false);
      expect(unitEditor.state().error).to.equal(
        'Standalone units that are not in development must be a standalone unit with family name and version year.'
      );

      expect(
        wrapper
          .find('.saveBar')
          .contains(
            'Error Saving: Standalone units that are not in development must be a standalone unit with family name and version year.'
          )
      ).to.be.true;

      $.ajax.restore();
    });

    it('saves successfully when moving standalone unit out of in development if professional learning course', () => {
      sinon.stub(window, 'confirm').callsFake(() => true);
      const wrapper = createWrapper({initialIsCourse: false, hasCourse: false});

      const unitEditor = wrapper.find('UnitEditor');
      unitEditor.setState({
        publishedState: 'beta',
        deeperLearningCourse: 'new-pl-course',
      });

      let returnData = {scriptPath: '/s/test-unit'};
      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/s/1`, [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(returnData),
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
      expect(unitEditor.state().isSaving).to.equal(true);

      clock = sinon.useFakeTimers(new Date('2020-12-01'));
      const expectedLastSaved = Date.now();
      server.respond();
      clock.tick(50);

      unitEditor.update();
      expect(utils.navigateToHref).to.not.have.been.called;
      expect(unitEditor.state().isSaving).to.equal(false);
      expect(unitEditor.state().lastSaved).to.equal(expectedLastSaved);
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      //check that last saved message is showing
      expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
      server.restore();
      window.confirm.restore();
    });

    it('shows error when family name is set but version year is not', () => {
      sinon.stub($, 'ajax');
      const wrapper = createWrapper({initialIsCourse: true});

      const unitEditor = wrapper.find('UnitEditor');
      unitEditor.setState({
        versionYear: '',
        familyName: 'new-family-name',
      });

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      expect($.ajax).to.not.have.been.called;

      expect(unitEditor.state().isSaving).to.equal(false);
      expect(unitEditor.state().error).to.equal(
        'Please set both version year and family name.'
      );

      expect(
        wrapper
          .find('.saveBar')
          .contains(
            'Error Saving: Please set both version year and family name.'
          )
      ).to.be.true;

      $.ajax.restore();
    });

    it('can save and close', () => {
      const wrapper = createWrapper({});
      const unitEditor = wrapper.find('UnitEditor');

      let returnData = {
        scriptPath: '/s/test-unit',
      };
      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/s/1`, [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(returnData),
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndCloseButton = saveBar.find('button').at(2);
      expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
      saveAndCloseButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
      expect(unitEditor.state().isSaving).to.equal(true);

      server.respond();
      unitEditor.update();
      expect(utils.navigateToHref).to.have.been.calledWith(
        `/s/test-unit${window.location.search}`
      );

      server.restore();
    });

    it('shows error when save and keep editing has error saving', () => {
      const wrapper = createWrapper({});
      const unitEditor = wrapper.find('UnitEditor');

      let returnData = 'There was an error';
      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/s/1`, [
        404,
        {'Content-Type': 'application/json'},
        returnData,
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndCloseButton = saveBar.find('button').at(2);
      expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
      saveAndCloseButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
      expect(unitEditor.state().isSaving).to.equal(true);

      server.respond();

      unitEditor.update();
      expect(utils.navigateToHref).to.not.have.been.called;

      expect(unitEditor.state().isSaving).to.equal(false);
      expect(unitEditor.state().error).to.equal('There was an error');
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      expect(
        wrapper.find('.saveBar').contains('Error Saving: There was an error')
      ).to.be.true;

      server.restore();
    });
  });
});
