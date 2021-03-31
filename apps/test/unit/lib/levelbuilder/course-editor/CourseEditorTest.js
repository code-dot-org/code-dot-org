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
import resourcesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import {Provider} from 'react-redux';
import ResourceType from '@cdo/apps/templates/courseOverview/resourceType';
import MigratedResourceEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ResourcesEditor';

const defaultProps = {
  name: 'csp',
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
    registerReducers({teacherSections, resources: resourcesEditor});
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
            {id: 1, name: 'Curriculum', url: '/foo'}
          ]}
        />
      );
      assert.equal(wrapper.find(MigratedResourceEditor).length, 1);
    });
  });

  it('renders full course editor page', () => {
    const wrapper = createWrapper({});
    assert.equal(wrapper.find('textarea').length, 3);
    assert.equal(wrapper.find('CourseScriptsEditor').length, 1);
    assert.equal(wrapper.find('ResourcesEditor').length, 1);
    assert.equal(wrapper.find('TeacherResourcesDropdown').length, 1);
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
