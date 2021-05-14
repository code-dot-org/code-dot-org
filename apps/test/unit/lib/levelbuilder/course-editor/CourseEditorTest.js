import {assert, expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {mount, shallow} from 'enzyme';
import {UnconnectedCourseEditor as CourseEditor} from '@cdo/apps/lib/levelbuilder/course-editor/CourseEditor';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers
} from '@cdo/apps/redux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import createResourcesReducer from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import {Provider} from 'react-redux';
import ResourceType from '@cdo/apps/templates/courseOverview/resourceType';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';

const defaultProps = {
  id: 1,
  name: 'test-course',
  title: 'Computer Science Principles 2017',
  familyName: 'CSP',
  versionYear: '2017',
  initialVisible: false,
  isStable: false,
  descriptionShort: 'Desc here',
  initialDescriptionStudent:
    '# Student description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* ',
  initialDescriptionTeacher:
    '# Teacher description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* ',
  scriptsInCourse: ['CSP Unit 1', 'CSP Unit 2'],
  scriptNames: ['CSP Unit 1', 'CSP Unit 2'],
  initialTeacherResources: [],
  hasVerifiedResources: false,
  hasNumberedUnits: false,
  courseFamilies: ['CSP', 'CSD', 'CSF'],
  versionYearOptions: ['2017', '2018', '2019'],
  initialAnnouncements: [],
  useMigratedResources: false
};

describe('CourseEditor', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers({
      teacherSections,
      resources: createResourcesReducer('teacherResource'),
      studentResources: createResourcesReducer('studentResource')
    });
  });

  afterEach(() => {
    restoreRedux();
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
    it('adds empty resources if passed none', () => {
      const wrapper = shallow(<CourseEditor {...defaultProps} />);
      assert.deepEqual(wrapper.state('teacherResources'), [
        {type: '', link: ''},
        {type: '', link: ''},
        {type: '', link: ''},
        {type: '', link: ''},
        {type: '', link: ''},
        {type: '', link: ''},
        {type: '', link: ''},
        {type: '', link: ''},
        {type: '', link: ''},
        {type: '', link: ''}
      ]);
    });

    it('adds empty resources if passed fewer than max', () => {
      const wrapper = shallow(
        <CourseEditor
          {...defaultProps}
          initialTeacherResources={[
            {type: ResourceType.curriculum, link: '/foo'}
          ]}
        />
      );
      assert.deepEqual(wrapper.state('teacherResources'), [
        {type: ResourceType.curriculum, link: '/foo'},
        {type: '', link: ''},
        {type: '', link: ''},
        {type: '', link: ''},
        {type: '', link: ''},
        {type: '', link: ''},
        {type: '', link: ''},
        {type: '', link: ''},
        {type: '', link: ''},
        {type: '', link: ''}
      ]);
    });

    it('uses the migrated resource component for migrated resources', () => {
      const wrapper = shallow(
        <CourseEditor
          {...defaultProps}
          useMigratedResources
          initialMigratedTeacherResources={[
            {id: 1, key: 'curriculum', name: 'Curriculum', url: '/foo'}
          ]}
        />
      );
      expect(
        wrapper
          .find('ResourcesEditor')
          .first()
          .props().useMigratedResources
      ).to.be.true;
    });
  });

  it('renders full course editor page', () => {
    const wrapper = createWrapper({});
    assert.equal(wrapper.find('textarea').length, 3);
    assert.equal(wrapper.find('CourseScriptsEditor').length, 1);
    assert.equal(wrapper.find('ResourcesEditor').length, 1);
    assert.equal(wrapper.find('ResourcesDropdown').length, 1);
    assert.equal(wrapper.find('CollapsibleEditorSection').length, 4);
    assert.equal(wrapper.find('AnnouncementsEditor').length, 1);
  });

  it('has correct markdown for preview of course teacher and student description', () => {
    const wrapper = createWrapper({});
    expect(wrapper.find('TextareaWithMarkdownPreview').length).to.equal(2);
    expect(
      wrapper
        .find('TextareaWithMarkdownPreview')
        .at(0)
        .prop('markdown')
    ).to.equal(
      '# Student description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* '
    );
    expect(
      wrapper
        .find('TextareaWithMarkdownPreview')
        .at(1)
        .prop('markdown')
    ).to.equal(
      '# Teacher description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* '
    );
  });

  describe('Saving Course Editor', () => {
    it('can save and keep editing', () => {
      const wrapper = createWrapper({});
      const courseEditor = wrapper.find('CourseEditor');

      let returnData = {
        updatedAt: '2020-11-06T21:33:32.000Z',
        scriptPath: '/courses/test-course'
      };
      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/courses/1`, [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(returnData)
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(0);
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
      expect(courseEditor.state().lastSaved).to.equal(
        '2020-11-06T21:33:32.000Z'
      );
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      //check that last saved message is showing
      expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
    });

    it('shows error when save and keep editing has error saving', () => {
      const wrapper = createWrapper({});
      const courseEditor = wrapper.find('CourseEditor');

      let returnData = 'There was an error';
      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/courses/1`, [
        404,
        {'Content-Type': 'application/json'},
        returnData
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(0);
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
        updatedAt: '2020-11-06T21:33:32.000Z',
        scriptPath: '/courses/test-course'
      };
      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/courses/1`, [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(returnData)
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndCloseButton = saveBar.find('button').at(1);
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
      let server = sinon.fakeServer.create();
      server.respondWith('PUT', `/courses/1`, [
        404,
        {'Content-Type': 'application/json'},
        returnData
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndCloseButton = saveBar.find('button').at(1);
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
  });

  describe('VisibleInTeacherDashboard', () => {
    it('is unchecked when visible is false', () => {
      const wrapper = createWrapper({});
      const checkbox = wrapper.find('input[name="visible"]');
      expect(checkbox.prop('checked')).to.be.false;
    });

    it('is checked when visible is true', () => {
      const wrapper = createWrapper({initialVisible: true});
      const checkbox = wrapper.find('input[name="visible"]');
      expect(checkbox.prop('checked')).to.be.true;
    });
  });
});
