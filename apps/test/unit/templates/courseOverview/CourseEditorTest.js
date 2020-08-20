import {assert, expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {mount} from 'enzyme';
import CourseEditor from '@cdo/apps/templates/courseOverview/CourseEditor';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers
} from '@cdo/apps/redux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Provider} from 'react-redux';

const defaultProps = {
  name: 'csp',
  title: 'Computer Science Principles 2017',
  familyName: 'CSP',
  versionYear: '2017',
  visible: false,
  isStable: false,
  descriptionShort: 'Desc here',
  descriptionStudent:
    '# Student description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* ',
  descriptionTeacher:
    '# Teacher description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* ',
  scriptsInCourse: ['CSP Unit 1', 'CSP Unit 2'],
  scriptNames: ['CSP Unit 1', 'CSP Unit 2'],
  teacherResources: [],
  hasVerifiedResources: false,
  courseFamilies: ['CSP', 'CSD', 'CSF'],
  versionYearOptions: ['2017', '2018', '2019']
};

describe('CourseEditor', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers({teacherSections});
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

  it('renders full course editor page', () => {
    const wrapper = createWrapper({});
    assert.equal(wrapper.find('textarea').length, 3);
    assert.equal(wrapper.find('CourseScriptsEditor').length, 1);
    assert.equal(wrapper.find('ResourcesEditor').length, 1);
    assert.equal(wrapper.find('CourseOverviewTopRow').length, 1);
  });

  it('has correct markdown for preview of course teacher and student description', () => {
    const wrapper = createWrapper({});
    expect(wrapper.find('MarkdownPreview').length).to.equal(2);
    expect(
      wrapper
        .find('MarkdownPreview')
        .at(0)
        .prop('markdown')
    ).to.equal(
      '# Student description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* '
    );
    expect(
      wrapper
        .find('MarkdownPreview')
        .at(1)
        .prop('markdown')
    ).to.equal(
      '# Teacher description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* '
    );

    wrapper
      .find('textarea[name="description_student"]')
      .simulate('change', {target: {value: '## Title 1'}});
    expect(
      wrapper
        .find('MarkdownPreview')
        .at(0)
        .prop('markdown')
    ).to.equal('## Title 1');
    wrapper
      .find('textarea[name="description_teacher"]')
      .simulate('change', {target: {value: '## Title 2'}});
    expect(
      wrapper
        .find('MarkdownPreview')
        .at(1)
        .prop('markdown')
    ).to.equal('## Title 2');
  });

  describe('VisibleInTeacherDashboard', () => {
    it('is unchecked when visible is false', () => {
      const wrapper = createWrapper({});
      const checkbox = wrapper.find('input[name="visible"]');
      expect(checkbox.prop('checked')).to.be.false;
    });

    it('is checked when visible is true', () => {
      const wrapper = createWrapper({visible: true});
      const checkbox = wrapper.find('input[name="visible"]');
      expect(checkbox.prop('checked')).to.be.true;
    });
  });
});
