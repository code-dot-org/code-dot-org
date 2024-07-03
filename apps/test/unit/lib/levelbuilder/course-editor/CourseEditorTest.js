import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {
  PublishedState,
  InstructionType,
  InstructorAudience,
  ParticipantAudience,
} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import {UnconnectedCourseEditor as CourseEditor} from '@cdo/apps/lib/levelbuilder/course-editor/CourseEditor';
import createResourcesReducer from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers,
} from '@cdo/apps/redux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import * as utils from '@cdo/apps/utils';

import {assert, expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports
import {allowConsoleWarnings} from '../../../../util/throwOnConsole';

const defaultProps = {
  name: 'test-course',
  initialTitle: 'Computer Science Principles 2017',
  initialFamilyName: 'CSP',
  initialVersionYear: '2017',
  initialPublishedState: 'beta',
  initialDescriptionShort: 'Desc here',
  initialDescriptionStudent:
    '# Student description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* ',
  initialDescriptionTeacher:
    '# Teacher description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* ',
  initialUnitsInCourse: ['CSP Unit 1', 'CSP Unit 2'],
  unitNames: ['CSP Unit 1', 'CSP Unit 2'],
  initialHasVerifiedResources: false,
  initialHasNumberedUnits: false,
  courseFamilies: ['CSP', 'CSD', 'CSF'],
  versionYearOptions: ['2017', '2018', '2019'],
  initialAnnouncements: [],
  coursePath: '/courses/test-course',
  initialInstructionType: InstructionType.teacher_led,
  initialInstructorAudience: InstructorAudience.teacher,
  initialParticipantAudience: ParticipantAudience.student,
  teacherResources: [],
  studentResources: [],
};

describe('CourseEditor', () => {
  // Warnings allowed due to usage of deprecated componentWillReceiveProps
  // lifecycle method.
  allowConsoleWarnings();

  beforeEach(() => {
    sinon.stub(utils, 'navigateToHref');
    stubRedux();
    registerReducers({
      teacherSections,
      resources: createResourcesReducer('teacherResource'),
      studentResources: createResourcesReducer('studentResource'),
    });
  });

  afterEach(() => {
    restoreRedux();
    utils.navigateToHref.restore();
  });

  const createWrapper = overrideProps => {
    const combinedProps = {...defaultProps, ...overrideProps};
    return mount(
      <Provider store={getStore()}>
        <CourseEditor {...combinedProps} />
      </Provider>
    );
  };

  describe('Teacher Resources', () => {
    it('uses the resource component for resources', () => {
      const wrapper = shallow(
        <CourseEditor
          {...defaultProps}
          teacherResources={[
            {id: 1, key: 'curriculum', name: 'Curriculum', url: '/foo'},
          ]}
        />
      );
      expect(wrapper.find('ResourcesEditor').first()).to.exist;
    });
  });

  it('renders full course editor page', () => {
    const wrapper = createWrapper({});
    assert.equal(wrapper.find('textarea').length, 3);
    assert.equal(wrapper.find('CourseUnitsEditor').length, 1);
    assert.equal(wrapper.find('ResourcesEditor').length, 2);
    assert.equal(wrapper.find('ResourcesDropdown').length, 0);
    assert.equal(wrapper.find('CollapsibleEditorSection').length, 6);
    assert.equal(wrapper.find('AnnouncementsEditor').length, 1);
    assert.equal(wrapper.find('CourseVersionPublishingEditor').length, 1);
    assert.equal(wrapper.find('CourseTypeEditor').length, 1);
  });

  it('has correct markdown for preview of course teacher and student description', () => {
    const wrapper = createWrapper({});
    expect(wrapper.find('TextareaWithMarkdownPreview').length).to.equal(2);
    expect(
      wrapper.find('TextareaWithMarkdownPreview').at(0).prop('markdown')
    ).to.equal(
      '# Student description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* '
    );
    expect(
      wrapper.find('TextareaWithMarkdownPreview').at(1).prop('markdown')
    ).to.equal(
      '# Teacher description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* '
    );
  });

  describe('Saving Course Editor', () => {
    let clock, server;

    beforeEach(() => {
      server = sinon.fakeServer.create();
    });

    afterEach(() => {
      if (clock) {
        clock.restore();
        clock = undefined;
      }
      server.restore();
    });

    it('can save and keep editing', () => {
      const wrapper = createWrapper({});
      const courseEditor = wrapper.find('CourseEditor');

      let returnData = {
        coursePath: '/courses/test-course',
      };
      server.respondWith('PUT', `/courses/test-course`, [
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
      expect(courseEditor.state().isSaving).to.equal(true);

      clock = sinon.useFakeTimers(new Date('2020-12-01'));
      const expectedLastSaved = Date.now();
      server.respond();
      clock.tick(50);

      courseEditor.update();
      expect(utils.navigateToHref).to.not.have.been.called;
      expect(courseEditor.state().isSaving).to.equal(false);
      expect(courseEditor.state().lastSaved).to.equal(expectedLastSaved);
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      //check that last saved message is showing
      expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
    });

    it('shows error when save and keep editing has error saving', () => {
      const wrapper = createWrapper({});
      const courseEditor = wrapper.find('CourseEditor');

      let returnData = 'There was an error';
      server.respondWith('PUT', `/courses/test-course`, [
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
      expect(courseEditor.state().isSaving).to.equal(true);

      server.respond();
      courseEditor.update();
      expect(utils.navigateToHref).to.not.have.been.called;
      expect(courseEditor.state().isSaving).to.equal(false);
      expect(courseEditor.state().error).to.equal('There was an error');
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      expect(
        wrapper.find('.saveBar').contains('Error Saving: There was an error')
      ).to.be.true;

      server.restore();
    });

    it('can save and close', () => {
      const wrapper = createWrapper({});
      const courseEditor = wrapper.find('CourseEditor');

      let returnData = {
        coursePath: '/courses/test-course',
      };
      server.respondWith('PUT', `/courses/test-course`, [
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
      expect(courseEditor.state().isSaving).to.equal(true);

      server.respond();
      courseEditor.update();
      expect(utils.navigateToHref).to.have.been.calledWith(
        `/courses/test-course${window.location.search}`
      );

      server.restore();
    });

    it('shows error when save and keep editing has error saving', () => {
      const wrapper = createWrapper({});
      const courseEditor = wrapper.find('CourseEditor');

      let returnData = 'There was an error';
      server.respondWith('PUT', `/courses/test-course`, [
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
      expect(courseEditor.state().isSaving).to.equal(true);

      server.respond();

      courseEditor.update();
      expect(utils.navigateToHref).to.not.have.been.called;

      expect(courseEditor.state().isSaving).to.equal(false);
      expect(courseEditor.state().error).to.equal('There was an error');
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      expect(
        wrapper.find('.saveBar').contains('Error Saving: There was an error')
      ).to.be.true;

      server.restore();
    });

    it('shows error when published state is pilot but no pilot experiment given', () => {
      sinon.stub($, 'ajax');
      const wrapper = createWrapper({});

      const courseEditor = wrapper.find('CourseEditor');
      courseEditor.setState({
        publishedState: PublishedState.pilot,
        pilotExperiment: '',
      });

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      expect($.ajax).to.not.have.been.called;

      expect(courseEditor.state().isSaving).to.equal(false);
      expect(courseEditor.state().error).to.equal(
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
  });

  it('shows error when version year is set but family name is not', () => {
    sinon.stub($, 'ajax');
    const wrapper = createWrapper({});

    const courseEditor = wrapper.find('CourseEditor');
    courseEditor.setState({
      versionYear: '1991',
      familyName: '',
    });

    const saveBar = wrapper.find('SaveBar');

    const saveAndKeepEditingButton = saveBar.find('button').at(1);
    expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
      .true;
    saveAndKeepEditingButton.simulate('click');

    expect($.ajax).to.not.have.been.called;

    expect(courseEditor.state().isSaving).to.equal(false);
    expect(courseEditor.state().error).to.equal(
      'Please set both version year and family name.'
    );

    expect(
      wrapper
        .find('.saveBar')
        .contains('Error Saving: Please set both version year and family name.')
    ).to.be.true;

    $.ajax.restore();
  });

  it('shows error when family name is set but version year is not', () => {
    sinon.stub($, 'ajax');
    const wrapper = createWrapper({});

    const courseEditor = wrapper.find('CourseEditor');
    courseEditor.setState({
      versionYear: '',
      familyName: 'new-family-name',
    });

    const saveBar = wrapper.find('SaveBar');

    const saveAndKeepEditingButton = saveBar.find('button').at(1);
    expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
      .true;
    saveAndKeepEditingButton.simulate('click');

    expect($.ajax).to.not.have.been.called;

    expect(courseEditor.state().isSaving).to.equal(false);
    expect(courseEditor.state().error).to.equal(
      'Please set both version year and family name.'
    );

    expect(
      wrapper
        .find('.saveBar')
        .contains('Error Saving: Please set both version year and family name.')
    ).to.be.true;

    $.ajax.restore();
  });

  it('shows error when published state is preview or stable and device compatibility JSON is null', () => {
    sinon.stub($, 'ajax');
    const wrapper = createWrapper({
      isMissingRequiredDeviceCompatibilities: true,
    });

    const courseEditor = wrapper.find('CourseEditor');
    courseEditor.setState({
      publishedState: PublishedState.preview,
      courseOfferingDeviceCompatibilities: null,
    });

    const saveBar = wrapper.find('SaveBar');

    const saveAndKeepEditingButton = saveBar.find('button').at(1);
    expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
      .true;
    saveAndKeepEditingButton.simulate('click');

    expect($.ajax).to.not.have.been.called;

    expect(courseEditor.state().isSaving).to.equal(false);
    expect(courseEditor.state().error).to.equal(
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
    });

    const courseEditor = wrapper.find('CourseEditor');
    courseEditor.setState({
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

    expect(courseEditor.state().isSaving).to.equal(false);
    expect(courseEditor.state().error).to.equal(
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
});
