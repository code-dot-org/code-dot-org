import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {assert, expect} from '../../../util/deprecatedChai';
import AssignmentSelector from '@cdo/apps/templates/teacherDashboard/AssignmentSelector';

const defaultProps = {
  localeCode: 'en-US',
  section: {
    id: 11,
    name: 'foo',
    loginType: 'email',
    providerManaged: false,
    lessonExtras: false,
    ttsAutoplayEnabled: false,
    pairingAllowed: false,
    studentCount: 0,
    code: 'asdf',
    courseId: null,
    scriptId: null
  },
  assignments: {
    // course with scripts
    '29_null': {
      id: 29,
      name: 'CS Discoveries 2017',
      script_name: 'csd-2017',
      category: 'Full Courses',
      position: 1,
      category_priority: 0,
      courseId: 29,
      scriptId: null,
      scriptAssignIds: ['null_168'],
      assignId: '29_null',
      path: '//localhost-studio.code.org:3000/courses/csd',
      assignment_family_name: 'csd',
      assignment_family_title: 'CS Discoveries',
      version_year: '2017',
      version_title: "'17-'18",
      is_stable: true
    },
    // script in course
    null_168: {
      id: 168,
      name: 'Unit 1: Problem Solving',
      script_name: 'csd1',
      category: 'CS Discoveries',
      position: 0,
      category_priority: 7,
      courseId: null,
      scriptId: 168,
      assignId: 'null_168',
      path: '//localhost-studio.code.org:3000/s/csd1-2019',
      assignment_family_name: 'csd1',
      assignment_family_title: 'Unit 1: Problem Solving',
      version_year: '2017',
      version_title: '2017',
      is_stable: true
    },
    // script not in course
    null_6: {
      id: 6,
      name: 'Make a Flappy game',
      script_name: 'flappy',
      category: 'Hour of Code',
      position: 4,
      category_priority: 2,
      courseId: null,
      scriptId: 6,
      assignId: 'null_6',
      path: '//localhost-studio.code.org:3000/s/flappy',
      assignment_family_name: 'flappy',
      assignment_family_title: 'Make a Flappy game',
      version_year: '2017',
      version_title: '2017',
      is_stable: true,
      supported_locale_codes: ['es-MX']
    },
    // script not in course
    null_7: {
      id: 7,
      name: 'Make a Flappy game',
      script_name: 'flappy-2018',
      category: 'Hour of Code',
      position: 4,
      category_priority: 2,
      courseId: null,
      scriptId: 7,
      assignId: 'null_7',
      path: '//localhost-studio.code.org:3000/s/flappy',
      assignment_family_name: 'flappy',
      assignment_family_title: 'Make a Flappy game',
      version_year: '2018',
      version_title: '2018',
      is_stable: true
    }
  },
  assignmentFamilies: [
    {
      assignment_family_title: 'CS Discoveries',
      category: 'Full Courses',
      position: 1,
      category_priority: 0,
      assignment_family_name: 'csd'
    },
    {
      assignment_family_title: 'Make a Flappy game',
      category: 'Hour of Code',
      position: 4,
      category_priority: 2,
      assignment_family_name: 'flappy'
    }
  ]
};

const hiddenSectionProps = {
  section: {
    id: 11,
    name: 'foo',
    loginType: 'email',
    providerManaged: false,
    lessonExtras: false,
    ttsAutoplayEnabled: false,
    pairingAllowed: false,
    studentCount: 0,
    code: 'asdf',
    courseId: null,
    scriptId: 36
  },
  assignments: defaultProps.assignments,
  assignmentFamilies: defaultProps.assignmentFamilies
};

describe('AssignmentSelector', () => {
  it('defaults to one dropdown, no selection when no section is provided', () => {
    const wrapper = shallow(
      <AssignmentSelector {...defaultProps} section={null} />
    );
    assert.equal(wrapper.find('select').length, 1);
    assert.equal(wrapper.find('select').value, undefined);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: null,
      scriptId: null
    });
  });

  it('second dropdown defaults to no selection when no section is provided', () => {
    const wrapper = shallow(
      <AssignmentSelector {...defaultProps} section={null} />
    );
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: 'csd'}});
    assert.equal(wrapper.find('select').length, 2);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: 29,
      scriptId: null
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
      scriptId: 168
    });
  });

  it('does not show script that is in course in primary dropdown', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps} />);
    assert.equal(wrapper.find('select').length, 1);
    assert.equal(wrapper.find('option').length, 3);
    assert.equal(
      wrapper
        .find('option')
        .at(0)
        .text(),
      ''
    );
    assert.equal(
      wrapper
        .find('option')
        .at(1)
        .text(),
      'CS Discoveries'
    );
    assert.equal(
      wrapper
        .find('option')
        .at(2)
        .text(),
      'Make a Flappy game'
    );
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: null,
      scriptId: null
    });
  });

  it('shows second dropdown after selecting primary', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps} />);
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: 'csd'}});
    assert.equal(wrapper.find('select').length, 2);
    const secondary = wrapper.find('select').at(1);
    assert.equal(secondary.find('option').length, 2);
    assert.equal(
      secondary
        .find('option')
        .at(0)
        .text(),
      'Unit 1: Problem Solving'
    );
    assert.equal(
      secondary
        .find('option')
        .at(1)
        .text(),
      ''
    );
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: 29,
      scriptId: null
    });
  });

  it('can select script in second dropdown after selecting primary', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps} />);
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: 'csd'}});
    wrapper
      .find('select')
      .at(1)
      .simulate('change', {target: {value: 'null_168'}});
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: 29,
      scriptId: 168
    });
  });

  it('hides second dropdown after selecting "" primary', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps} />);
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: 'csd'}});
    assert.equal(wrapper.find('select').length, 2);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: 29,
      scriptId: null
    });

    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: ''}});
    assert.equal(wrapper.find('select').length, 1);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseId: null,
      scriptId: null
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
    assert.equal(
      wrapper
        .find('option')
        .at(2)
        .text(),
      'Make a Flappy game'
    );
    assert.equal(
      wrapper
        .find('option')
        .at(3)
        .text(),
      'Unit 1: Problem Solving'
    );
  });

  // Make sure we are passing the proper recommended version to our child component, <AssignmentVersionSelector/>
  describe('version recommendation', () => {
    it('recommends the latest stable version supported in user locale', () => {
      // Choose the 'Make a flappy game' script, which has both 2017 and 2018 versions.
      // Make sure we are recommended 2017 version, which supports Spanish.
      const wrapper = shallow(
        <AssignmentSelector
          {...defaultProps}
          localeCode="es-MX"
          section={{
            ...defaultProps.section,
            courseId: null,
            scriptId: 7
          }}
        />
      );

      const versionSelectorProps = wrapper
        .find('AssignmentVersionSelector')
        .props();

      assert.equal(versionSelectorProps.versions.length, 2);
      const recommendedVersion = versionSelectorProps.versions.find(
        v => v.isRecommended
      );
      assert.equal(recommendedVersion.title, '2017');
    });

    it('recommends the latest stable version if no versions are supported in user locale', () => {
      // Choose the 'Make a flappy game' script, which has both 2017 and 2018 versions.
      // Make sure we are recommended 2018 version, since no versions support Slovak.
      const wrapper = shallow(
        <AssignmentSelector
          {...defaultProps}
          localeCode="sk-SK"
          section={{
            ...defaultProps.section,
            courseId: null,
            scriptId: 6
          }}
        />
      );

      const versionSelectorProps = wrapper
        .find('AssignmentVersionSelector')
        .props();

      assert.equal(versionSelectorProps.versions.length, 2);
      const recommendedVersion = versionSelectorProps.versions.find(
        v => v.isRecommended
      );
      assert.equal(recommendedVersion.title, '2018');
    });
  });

  it('shows two dropdowns if section has a course selected', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
        section={{
          ...defaultProps.section,
          courseId: 29
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
          scriptId: 168
        }}
      />
    );
    assert.equal(wrapper.find('select').length, 2);
  });

  it('shows one dropdown, no selection when hidden script is selected', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...hiddenSectionProps}
        section={{
          ...hiddenSectionProps.section,
          scriptId: 36
        }}
      />
    );
    assert.equal(wrapper.find('select').length, 1);
    assert.equal(wrapper.find('select').value, undefined);
  });

  describe('the "Decide later" option', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(
        <AssignmentSelector {...defaultProps} chooseLaterOption />
      );
    });

    it('shows up after the blank option and before the others', () => {
      assert.equal(wrapper.find('select').length, 1);
      assert.equal(wrapper.find('option').length, 4);
      assert.equal(
        wrapper
          .find('option')
          .at(0)
          .text(),
        ''
      );
      assert.equal(
        wrapper
          .find('option')
          .at(1)
          .text(),
        'Decide later'
      );
      assert.equal(
        wrapper
          .find('option')
          .at(2)
          .text(),
        'CS Discoveries'
      );
      assert.equal(
        wrapper
          .find('option')
          .at(3)
          .text(),
        'Make a Flappy game'
      );
    });

    it('means selecting nothing', () => {
      wrapper
        .find('select')
        .at(0)
        .simulate('change', {target: {value: '__decideLater__'}});
      assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
        courseId: null,
        scriptId: null
      });
    });
  });

  describe('the onChange prop', () => {
    let wrapper, spy;

    beforeEach(() => {
      spy = sinon.spy();
      wrapper = shallow(
        <AssignmentSelector {...defaultProps} onChange={spy} />
      );
    });

    it(`doesn't get called during construction`, () => {
      expect(spy).not.to.have.been.called;
    });

    it('gets called when primary dropdown changes', () => {
      wrapper
        .find('select')
        .at(0)
        .simulate('change', {target: {value: 'csd'}});
      expect(spy).to.have.been.calledOnce.and.to.have.been.calledWith({
        courseId: 29,
        scriptId: null
      });
    });

    it('gets called when secondary dropdown changes', () => {
      wrapper
        .find('select')
        .at(0)
        .simulate('change', {target: {value: 'csd'}});
      spy.resetHistory();
      wrapper
        .find('select')
        .at(1)
        .simulate('change', {target: {value: 'null_168'}});
      expect(spy).to.have.been.calledOnce.and.to.have.been.calledWith({
        courseId: 29,
        scriptId: 168
      });
    });
  });

  describe('the disabled prop', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(<AssignmentSelector {...defaultProps} disabled />);
    });

    it('disables the primary dropdown', () => {
      const firstDropdown = wrapper.find('select').at(0);
      expect(firstDropdown).to.have.prop('disabled', true);
    });

    it('disables the secondary dropdown', () => {
      wrapper
        .find('select')
        .at(0)
        .simulate('change', {target: {value: 'csd'}});
      const secondDropdown = wrapper.find('select').at(1);
      expect(secondDropdown).to.have.prop('disabled', true);
    });
  });
});
