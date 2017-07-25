import { assert } from '../../../util/configuredChai';
import { throwOnConsoleErrors, throwOnConsoleWarnings } from '../../../util/testUtils';
import React from 'react';
import { shallow } from 'enzyme';
import AssignmentSelector from '@cdo/apps/templates/teacherDashboard/AssignmentSelector';

const defaultProps = {
  section: {
    id: 11,
    name: 'foo',
    loginType: 'email',
    providerManaged: false,
    stageExtras: false,
    pairingAllowed: false,
    studentCount: 0,
    code: 'asdf',
    courseId: null,
    scriptId: null,
  },
  assignments: {
    // course with scripts
    '29_null': {
      id: 29,
      name: "CS Discoveries",
      script_name: "csd",
      category: "Full Courses",
      position: 1,
      category_priority: 0,
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
      category_priority: 7,
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
      category_priority: 2,
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

  it('defaults to one dropdown, no selection when no section is provided', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
        section={null}
      />
    );
    assert.equal(wrapper.find('select').length, 1);
    assert.equal(wrapper.find('select').value, undefined);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: null,
      scriptId: null,
    });
  });

  it('second dropdown defaults to no selection when no section is provided', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
        section={null}
      />
    );
    wrapper.find('select').at(0).simulate('change', {target: {value: '29_null'}});
    assert.equal(wrapper.find('select').length, 2);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: 29,
      scriptId: null,
    });
  });

  it('second dropdown defaults to current value when section is provided', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
        section={{
          ...defaultProps.section,
          courseId: 29, // CS Discoveries
          scriptId: 168 // Unit 1: Problem Solving
        }}
      />
    );
    assert.equal(wrapper.find('select').length, 2);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: 29,
      scriptId: 168,
    });

    // Change primary so secondary is deselected
    wrapper.find('select').at(0).simulate('change', {target: {value: 'null_null'}});
    assert.equal(wrapper.find('select').length, 1);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: null,
      scriptId: null,
    });

    // Change primary so secondary is selected again
    wrapper.find('select').at(0).simulate('change', {target: {value: '29_null'}});
    assert.equal(wrapper.find('select').length, 2);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: 29,
      scriptId: 168,
    });
  });

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
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: null,
      scriptId: null,
    });
  });

  it('shows second dropdown after selecting primary', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
      />
    );
    wrapper.find('select').at(0).simulate('change', {target: {value: '29_null'}});
    assert.equal(wrapper.find('select').length, 2);
    const secondary = wrapper.find('select').at(1);
    assert.equal(secondary.find('option').length, 2);
    assert.equal(secondary.find('option').at(0).text(), '');
    assert.equal(secondary.find('option').at(1).text(), 'Unit 1: Problem Solving');
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: 29,
      scriptId: null,
    });
  });

  it('can select script in second dropdown after selecting primary', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps}/>);
    wrapper.find('select').at(0).simulate('change', {target: {value: '29_null'}});
    wrapper.find('select').at(1).simulate('change', {target: {value: 'null_168'}});
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: 29,
      scriptId: 168,
    });
  });

  it('hides second dropdown after selecting "" primary', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps}/>);
    wrapper.find('select').at(0).simulate('change', {target: {value: '29_null'}});
    assert.equal(wrapper.find('select').length, 2);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: 29,
      scriptId: null,
    });

    // Select "" in the first dropdown
    wrapper.find('select').at(0).simulate('change', {target: {value: 'null_null'}});
    assert.equal(wrapper.find('select').length, 1);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: null,
      scriptId: null,
    });
  });

  it('includes uncoursed script if section is assigned that script currently', () => {
    // Eventually we don't expect this to be a plausible case, but until we do
    // our migration, it's possible for a section to be assigned to a script that
    // is in a course, and we want to make sure this still shows up in our
    // dropdown.
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
        section={{
          ...defaultProps.section,
          courseId: null,
          scriptId: 168
        }}
      />
    );
    assert.equal(wrapper.find('select').length, 1);
    assert.equal(wrapper.find('option').length, 4);
    // ends up after flappy, because it's in a later category
    assert.equal(wrapper.find('option').at(2).text(), 'Make a Flappy game');
    assert.equal(wrapper.find('option').at(3).text(), 'Unit 1: Problem Solving');
  });

  it('shows two dropdowns if section has a course selected', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
        section={{
          ...defaultProps.section,
          courseId: 29,
        }}
      />
    );
    assert.equal(wrapper.find('select').length, 2);
  });

  it('shows two dropdowns if section has course and current unit selected', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
        section={{
          ...defaultProps.section,
          courseId: 29,
          scriptId: 168,
        }}
      />
    );
    assert.equal(wrapper.find('select').length, 2);
  });

  describe('the "Decide later" option', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(
        <AssignmentSelector
          {...defaultProps}
          chooseLaterOption
        />
      );
    });

    it('shows up after the blank option and before the others', () => {
      assert.equal(wrapper.find('select').length, 1);
      assert.equal(wrapper.find('option').length, 4);
      assert.equal(wrapper.find('option').at(0).text(), '');
      assert.equal(wrapper.find('option').at(1).text(), 'Decide later');
      assert.equal(wrapper.find('option').at(2).text(), 'CS Discoveries');
      assert.equal(wrapper.find('option').at(3).text(), 'Make a Flappy game');
    });

    it('means selecting nothing', () => {
      wrapper.find('select').at(0).simulate('change', {target: {value: '__decideLater__'}});
      assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
        courseId: null,
        scriptId: null,
      });
    });
  });

});
