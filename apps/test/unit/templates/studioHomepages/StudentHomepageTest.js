import React from 'react';
import { assert, expect } from 'chai';
import { shallow } from 'enzyme';
import StudentHomepage from '@cdo/apps/templates/studioHomepages/StudentHomepage';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';
import SectionsTable from '@cdo/apps/templates/studioHomepages/SectionsTable';
import { courses, topCourse, joinedSections } from './homepagesTestData';
import {combineReducers, createStore} from 'redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

describe('StudentHomepage', () => {
  it('shows a non-extended Header Banner that says My Dashboard', () => {
    const wrapper = shallow(
      <StudentHomepage
        courses={[]}
        topCourse={topCourse}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
        canLeave={false}
      />
    );
    const headerBanner = wrapper.find(HeaderBanner);
    assert.deepEqual(headerBanner.props(), {
      headingText: "My Dashboard",
      short: true
    });
  });

  it('references a ProtectedStatefulDiv for flashes', () => {
    const wrapper = shallow(
      <StudentHomepage
        courses={[]}
        topCourse={topCourse}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
        canLeave={false}
      />
    );
    expect(wrapper.find('ProtectedStatefulDiv').exists()).to.be.true;
  });

  it('shows RecentCourses component', () => {
    const wrapper = shallow(
      <StudentHomepage
        courses={courses}
        topCourse={topCourse}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
        canLeave={false}
      />
    );
    const recentCourses = wrapper.find('RecentCourses');
    assert.deepEqual(recentCourses.props(), {
      courses: courses,
      topCourse: topCourse,
      isTeacher: false,
      isRtl: false,
    });
  });

  it('shows ProjectWidgetWithData component', () => {
    const wrapper = shallow(
      <StudentHomepage
        courses={courses}
        topCourse={topCourse}
        sections={joinedSections}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
        canLeave={false}
      />
    );
    expect(wrapper.find('ProjectWidgetWithData').exists()).to.be.true;
  });

  it('shows a StudentSections component', () => {
    const wrapper = shallow(
      <StudentHomepage
        courses={courses}
        topCourse={topCourse}
        sections={joinedSections}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
        canLeave={false}
      />
    );
    const studentSections = wrapper.find('StudentSections');
    assert.deepEqual(studentSections.props(), {
      initialSections: joinedSections,
      isRtl: false,
      canLeave: false
    });
  });

  it('shows section codes correctly', () => {
    const store = createStore(combineReducers({isRtl}));
    const wrapper = shallow(
        <StudentHomepage
          courses={courses}
          topCourse={topCourse}
          sections={joinedSections}
          codeOrgUrlPrefix="http://localhost:3000/"
          isRtl={false}
          canLeave={false}
        />
    ).find('StudentSections').dive().find(SectionsTable).dive({context: {store}}).dive();
    expect(wrapper).to.containMatchingElement(
        <td>ClassOneCode</td>
    );
    expect(wrapper).to.containMatchingElement(
        <td>ClassTwoCode</td>
    );
    expect(wrapper).to.containMatchingElement(
      <td>Google Classroom</td>
    );
    expect(wrapper).to.not.containMatchingElement(
        <td>DoNotShowThis</td>
    );
    expect(wrapper).to.containMatchingElement(
        <td>Clever</td>
    );
    expect(wrapper).to.not.containMatchingElement(
        <td>OrThisEither</td>
    );
  });
});
