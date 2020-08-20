import {assert, expect} from '../../../util/deprecatedChai';
import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedCourseOverview as CourseOverview} from '@cdo/apps/templates/courseOverview/CourseOverview';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import * as utils from '@cdo/apps/utils';
import sinon from 'sinon';

const defaultProps = {
  name: 'csp',
  title: 'Computer Science Principles 2017',
  assignmentFamilyTitle: 'Computer Science Principles',
  id: 30,
  descriptionStudent:
    '# Student description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* ',
  descriptionTeacher:
    '# Teacher description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* ',
  sectionsInfo: [],
  teacherResources: [],
  isTeacher: true,
  viewAs: ViewType.Teacher,
  scripts: [
    {
      course_id: 30,
      id: 112,
      title: 'CSP Unit 1',
      name: 'csp1',
      description: 'desc'
    },
    {
      course_id: 30,
      id: 113,
      title: 'CSP Unit 2',
      name: 'csp2',
      description: 'desc'
    }
  ],
  isVerifiedTeacher: true,
  hasVerifiedResources: false,
  versions: [],
  sectionsForDropdown: []
};

describe('CourseOverview', () => {
  it('has correct course description for teacher', () => {
    const wrapper = shallow(<CourseOverview {...defaultProps} />);
    expect(wrapper.find('SafeMarkdown').prop('markdown')).to.equal(
      '# Teacher description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* '
    );
  });

  it('has correct course description for student', () => {
    const wrapper = shallow(
      <CourseOverview
        {...defaultProps}
        isTeacher={false}
        viewAs={ViewType.Student}
      />
    );
    expect(wrapper.find('SafeMarkdown').prop('markdown')).to.equal(
      '# Student description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* '
    );
  });

  it('renders a top row for teachers', () => {
    const wrapper = shallow(
      <CourseOverview {...defaultProps} isTeacher={true} />
    );
    assert.equal(wrapper.find('CourseOverviewTopRow').length, 1);
  });

  it('renders no top row for students', () => {
    const wrapper = shallow(
      <CourseOverview {...defaultProps} isTeacher={false} />
    );
    assert.equal(wrapper.find('CourseOverviewTopRow').length, 0);
  });

  it('renders a CourseScript for each script', () => {
    const wrapper = shallow(<CourseOverview {...defaultProps} />);
    assert.equal(wrapper.find('Connect(CourseScript)').length, 2);
  });

  describe('VerifiedResourcesNotification', () => {
    const propsToShow = {
      ...defaultProps,
      isVerifiedTeacher: false,
      hasVerifiedResources: true
    };

    it('is shown to unverified teachers if course has verified resources', () => {
      const wrapper = shallow(<CourseOverview {...propsToShow} />);
      assert.equal(wrapper.find('VerifiedResourcesNotification').length, 1);
    });

    it('is not shown if teacher is verified', () => {
      const wrapper = shallow(
        <CourseOverview {...propsToShow} isVerifiedTeacher={true} />
      );
      assert.equal(wrapper.find('VerifiedResourcesNotification').length, 0);
    });

    it('is not shown if course does not have verified resources', () => {
      const wrapper = shallow(
        <CourseOverview {...propsToShow} hasVerifiedResources={false} />
      );
      assert.equal(wrapper.find('VerifiedResourcesNotification').length, 0);
    });

    it('is not shown while viewing as student', () => {
      const wrapper = shallow(
        <CourseOverview {...propsToShow} viewAs={ViewType.Student} />
      );
      assert.equal(wrapper.find('VerifiedResourcesNotification').length, 0);
    });
  });

  describe('versions dropdown', () => {
    beforeEach(() => {
      sinon.stub(utils, 'navigateToHref');
    });

    afterEach(() => {
      utils.navigateToHref.restore();
    });

    it('appears when two versions are present and viewable', () => {
      const versions = [
        {
          name: 'csp-2017',
          year: '2017',
          title: '2017',
          canViewVersion: true,
          isStable: true,
          locales: []
        },
        {
          name: 'csp-2018',
          year: '2018',
          title: '2018',
          canViewVersion: true,
          isStable: true,
          locales: []
        }
      ];
      const wrapper = shallow(
        <CourseOverview
          {...defaultProps}
          versions={versions}
          isTeacher={true}
        />
      );

      const versionSelector = wrapper.find('AssignmentVersionSelector');
      expect(versionSelector.length).to.equal(1);
      const renderedVersions = versionSelector.props().versions;
      assert.equal(2, renderedVersions.length);
      const csp2018 = renderedVersions.find(v => v.name === 'csp-2018');
      assert.equal(true, csp2018.isRecommended);
      assert.equal(true, csp2018.isSelected);
    });

    it('does not appear when only one version is viewable', () => {
      const versions = [
        {
          name: 'csp-2017',
          year: '2017',
          title: '2017',
          canViewVersion: false,
          isStable: true,
          locales: []
        },
        {
          name: 'csp-2018',
          year: '2018',
          title: '2018',
          canViewVersion: true,
          isStable: true,
          locales: []
        }
      ];
      const wrapper = shallow(
        <CourseOverview
          {...defaultProps}
          versions={versions}
          isTeacher={true}
        />
      );
      expect(wrapper.find('AssignmentVersionSelector').length).to.equal(0);
    });

    it('does not appear when no versions are present', () => {
      const wrapper = shallow(
        <CourseOverview {...defaultProps} isTeacher={true} />
      );
      expect(wrapper.find('AssignmentVersionSelector').length).to.equal(0);
    });
  });
});
