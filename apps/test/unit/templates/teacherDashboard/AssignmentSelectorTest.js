import { assert } from '../../../util/configuredChai';
import { throwOnConsoleErrors, throwOnConsoleWarnings } from '../../../util/testUtils';
import React from 'react';
import { shallow } from 'enzyme';
import AssignmentSelector from '@cdo/apps/templates/teacherDashboard/AssignmentSelector';
import { assignmentId } from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import experiments from '@cdo/apps/util/experiments';

const defaultProps = {
  currentPrimaryId: assignmentId(null, null),
  assignments: {
    // course with scripts
    '29_null': {
      id: 29,
      name: "CS Discoveries",
      script_name: "csd",
      category: "Full Courses",
      position: 1,
      category_priority: -1,
      courseId: 29,
      scriptId: null,
      scriptAssignIds: ['null_168'],
      assignId: "29_null",
      path: '//localhost-studio.code.org:3000/courses/csd',
    },
    // script in course
    'null_168': {
      id: 168,
      name: "Unit 1: Problem Solving",
      script_name: "csd1",
      category: "CS Discoveries",
      position: 0,
      category_priority: 0,
      courseId: null,
      scriptId: 168,
      assignId: "null_168",
      path: "//localhost-studio.code.org:3000/s/csd1"
    },
    // script not in course
    'null_6': {
      id: 6,
      name: "Make a Flappy game",
      script_name: "flappy",
      category: "Hour of Code",
      position: 4,
      category_priority: 0,
      courseId: null,
      scriptId: 6,
      assignId: "null_6",
      path: "//localhost-studio.code.org:3000/s/flappy"
    }
  },
  primaryAssignmentIds: ['29_null', 'null_6'],
};

describe('AssignmentSelector', () => {
  throwOnConsoleErrors();
  throwOnConsoleWarnings();

  before(() => experiments.setEnabled('sectionFocus', true));
  after(() => experiments.setEnabled('sectionFocus', false));

  it('does not show script that is in course in primary dropdown', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
      />
    );
    assert.equal(wrapper.find('select').length, 1);
    assert.equal(wrapper.find('option').length, 3);
    assert.equal(wrapper.find('option').at(0).text(), '');
    assert.equal(wrapper.find('option').at(1).text(), 'CS Discoveries');
    assert.equal(wrapper.find('option').at(2).text(), 'Make a Flappy game');
  });

  it('shows second dropdown after selecting primary', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
      />
    );
    wrapper.setState({selectedPrimaryId: '29_null'});
    assert.equal(wrapper.find('select').length, 2);
    const secondary = wrapper.find('select').at(1);
    assert.equal(secondary.find('option').length, 2);
    assert.equal(secondary.find('option').at(0).text(), '');
    assert.equal(secondary.find('option').at(1).text(), 'Unit 1: Problem Solving');
  });

  it('includes uncoursed script if section is assigned that script currently', () => {
    // Eventually we don't expect this to be a plausible case, but until we do
    // our migration, it's possible for a section to be assigned to a script that
    // is in a course, and we want to make sure this still shows up in our
    // dropdown.
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
        currentPrimaryId="null_168"
      />
    );
    assert.equal(wrapper.find('select').length, 1);
    assert.equal(wrapper.find('option').length, 4);
    // ends up before flappy, because it's in an earlier category
    assert.equal(wrapper.find('option').at(2).text(), 'Unit 1: Problem Solving');
    assert.equal(wrapper.find('option').at(3).text(), 'Make a Flappy game');
  });
});
