import {assert} from '../../../util/reconfiguredChai';
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
  descriptionShort: 'Desc here',
  descriptionStudent: 'Desc here',
  descriptionTeacher: 'Desc here',
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

  it('renders full course editor page', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <CourseEditor {...defaultProps} />
      </Provider>
    );

    assert.equal(wrapper.find('textarea').length, 3);
    assert.equal(wrapper.find('CourseScriptsEditor').length, 1);
    assert.equal(wrapper.find('ResourcesEditor').length, 1);
    assert.equal(wrapper.find('CourseOverviewTopRow').length, 1);
  });
});
