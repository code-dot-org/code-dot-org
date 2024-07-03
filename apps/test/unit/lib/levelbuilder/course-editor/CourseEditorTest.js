import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';

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

import {assert} from '../../../../util/reconfiguredChai';
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
    jest.spyOn(utils, 'navigateToHref').mockClear().mockImplementation();
    stubRedux();
    registerReducers({
      teacherSections,
      resources: createResourcesReducer('teacherResource'),
      studentResources: createResourcesReducer('studentResource'),
    });
  });

  afterEach(() => {
    restoreRedux();
    utils.navigateToHref.mockRestore();
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
      expect(wrapper.find('ResourcesEditor').first()).toBeDefined();
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
    expect(wrapper.find('TextareaWithMarkdownPreview').length).toBe(2);
    expect(
      wrapper.find('TextareaWithMarkdownPreview').at(0).prop('markdown')
    ).toBe(
      '# Student description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* '
    );
    expect(
      wrapper.find('TextareaWithMarkdownPreview').at(1).prop('markdown')
    ).toBe(
      '# Teacher description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* '
    );
  });

  describe('Saving Course Editor', () => {
    beforeEach(() => {
      server = sinon.fakeServer.create();
    });

    afterEach(() => {
      if (clock) {
        jest.useRealTimers();
        clock = undefined;
      }
      server.mockRestore();
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
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).toBe(true);
      saveAndKeepEditingButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).toBe(1);
      expect(courseEditor.state().isSaving).toBe(true);

      jest.useFakeTimers().setSystemTime(new Date('2020-12-01'));
      const expectedLastSaved = Date.now();
      server.respond();
      jest.advanceTimersByTime(50);

      courseEditor.update();
      expect(utils.navigateToHref).not.toHaveBeenCalled();
      expect(courseEditor.state().isSaving).toBe(false);
      expect(courseEditor.state().lastSaved).toBe(expectedLastSaved);
      expect(wrapper.find('.saveBar').find('FontAwesome').length).toBe(0);
      //check that last saved message is showing
      expect(wrapper.find('.lastSavedMessage').length).toBe(1);
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
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).toBe(true);
      saveAndKeepEditingButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).toBe(1);
      expect(courseEditor.state().isSaving).toBe(true);

      server.respond();
      courseEditor.update();
      expect(utils.navigateToHref).not.toHaveBeenCalled();
      expect(courseEditor.state().isSaving).toBe(false);
      expect(courseEditor.state().error).toBe('There was an error');
      expect(wrapper.find('.saveBar').find('FontAwesome').length).toBe(0);
      expect(
        wrapper.find('.saveBar').contains('Error Saving: There was an error')
      ).toBe(true);

      server.mockRestore();
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
      expect(saveAndCloseButton.contains('Save and Close')).toBe(true);
      saveAndCloseButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).toBe(1);
      expect(courseEditor.state().isSaving).toBe(true);

      server.respond();
      courseEditor.update();
      expect(utils.navigateToHref).toHaveBeenCalledWith(`/courses/test-course${window.location.search}`);

      server.mockRestore();
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
      expect(saveAndCloseButton.contains('Save and Close')).toBe(true);
      saveAndCloseButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).toBe(1);
      expect(courseEditor.state().isSaving).toBe(true);

      server.respond();

      courseEditor.update();
      expect(utils.navigateToHref).not.toHaveBeenCalled();

      expect(courseEditor.state().isSaving).toBe(false);
      expect(courseEditor.state().error).toBe('There was an error');
      expect(wrapper.find('.saveBar').find('FontAwesome').length).toBe(0);
      expect(
        wrapper.find('.saveBar').contains('Error Saving: There was an error')
      ).toBe(true);

      server.mockRestore();
    });

    it('shows error when published state is pilot but no pilot experiment given', () => {
      jest.spyOn($, 'ajax').mockClear().mockImplementation();
      const wrapper = createWrapper({});

      const courseEditor = wrapper.find('CourseEditor');
      courseEditor.setState({
        publishedState: PublishedState.pilot,
        pilotExperiment: '',
      });

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(1);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).toBe(true);
      saveAndKeepEditingButton.simulate('click');

      expect($.ajax).not.toHaveBeenCalled();

      expect(courseEditor.state().isSaving).toBe(false);
      expect(courseEditor.state().error).toBe(
        'Please provide a pilot experiment in order to save with published state as pilot.'
      );

      expect(
        wrapper
          .find('.saveBar')
          .contains(
            'Error Saving: Please provide a pilot experiment in order to save with published state as pilot.'
          )
      ).toBe(true);

      $.ajax.mockRestore();
    });
  });

  it('shows error when version year is set but family name is not', () => {
    jest.spyOn($, 'ajax').mockClear().mockImplementation();
    const wrapper = createWrapper({});

    const courseEditor = wrapper.find('CourseEditor');
    courseEditor.setState({
      versionYear: '1991',
      familyName: '',
    });

    const saveBar = wrapper.find('SaveBar');

    const saveAndKeepEditingButton = saveBar.find('button').at(1);
    expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).toBe(true);
    saveAndKeepEditingButton.simulate('click');

    expect($.ajax).not.toHaveBeenCalled();

    expect(courseEditor.state().isSaving).toBe(false);
    expect(courseEditor.state().error).toBe('Please set both version year and family name.');

    expect(
      wrapper
        .find('.saveBar')
        .contains('Error Saving: Please set both version year and family name.')
    ).toBe(true);

    $.ajax.mockRestore();
  });

  it('shows error when family name is set but version year is not', () => {
    jest.spyOn($, 'ajax').mockClear().mockImplementation();
    const wrapper = createWrapper({});

    const courseEditor = wrapper.find('CourseEditor');
    courseEditor.setState({
      versionYear: '',
      familyName: 'new-family-name',
    });

    const saveBar = wrapper.find('SaveBar');

    const saveAndKeepEditingButton = saveBar.find('button').at(1);
    expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).toBe(true);
    saveAndKeepEditingButton.simulate('click');

    expect($.ajax).not.toHaveBeenCalled();

    expect(courseEditor.state().isSaving).toBe(false);
    expect(courseEditor.state().error).toBe('Please set both version year and family name.');

    expect(
      wrapper
        .find('.saveBar')
        .contains('Error Saving: Please set both version year and family name.')
    ).toBe(true);

    $.ajax.mockRestore();
  });

  it('shows error when published state is preview or stable and device compatibility JSON is null', () => {
    jest.spyOn($, 'ajax').mockClear().mockImplementation();
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
    expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).toBe(true);
    saveAndKeepEditingButton.simulate('click');

    expect($.ajax).not.toHaveBeenCalled();

    expect(courseEditor.state().isSaving).toBe(false);
    expect(courseEditor.state().error).toBe(
      'Please set all device compatibilities in order to save with published state as preview or stable.'
    );

    expect(
      wrapper
        .find('.saveBar')
        .contains(
          'Error Saving: Please set all device compatibilities in order to save with published state as preview or stable.'
        )
    ).toBe(true);

    $.ajax.mockRestore();
  });

  it('shows error when published state is preview or stable and at least one device compatibility is not set', () => {
    jest.spyOn($, 'ajax').mockClear().mockImplementation();
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
    expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).toBe(true);
    saveAndKeepEditingButton.simulate('click');

    expect($.ajax).not.toHaveBeenCalled();

    expect(courseEditor.state().isSaving).toBe(false);
    expect(courseEditor.state().error).toBe(
      'Please set all device compatibilities in order to save with published state as preview or stable.'
    );

    expect(
      wrapper
        .find('.saveBar')
        .contains(
          'Error Saving: Please set all device compatibilities in order to save with published state as preview or stable.'
        )
    ).toBe(true);

    $.ajax.mockRestore();
  });
});
