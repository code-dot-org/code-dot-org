import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {assert, expect} from '../../../util/reconfiguredChai';
import AssignmentSelector, {
  getCourseOfferingsByCategory,
} from '@cdo/apps/templates/teacherDashboard/AssignmentSelector';
import {courseOfferings} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

const defaultProps = {
  courseOfferings: courseOfferings,
  section: {
    id: 11,
    name: 'foo',
    loginType: 'email',
    providerManaged: false,
    lessonExtras: false,
    ttsAutoplayEnabled: false,
    pairingAllowed: false,
    participantType: 'student',
    studentCount: 0,
    code: 'asdf',
    courseOfferingId: null,
    courseVersionId: null,
    unitId: null,
  },
};

const hiddenSectionProps = {
  courseOfferings: courseOfferings,
  section: {
    id: 11,
    name: 'foo',
    loginType: 'email',
    providerManaged: false,
    lessonExtras: false,
    ttsAutoplayEnabled: false,
    pairingAllowed: false,
    participantType: 'student',
    studentCount: 0,
    code: 'asdf',
    courseOfferingId: 2,
    courseVersionId: 4,
    unitId: 6,
  },
};

const newSectionProps = {
  courseOfferings: courseOfferings,
  section: {
    id: -1,
    name: '',
    lessonExtras: true,
    pairingAllowed: true,
    ttsAutoplayEnabled: false,
    loginType: 'word',
    code: 'ikfs',
    studentCount: 0,
    providerManaged: false,
    participantType: 'student',
    unitId: null,
    courseOfferingId: null,
    courseVersionId: null,
    courseId: null,
  },
};

describe('AssignmentSelector', () => {
  it('getCourseOfferingsByCategory gets the right course offerings for student', () => {
    let courseOfferingsByCategory = getCourseOfferingsByCategory(
      defaultProps.courseOfferings,
      'student'
    );

    assert.deepEqual(Object.keys(courseOfferingsByCategory), [
      'hoc',
      'full_course',
      'csf',
    ]);
    assert.deepEqual(
      courseOfferingsByCategory['full_course'].map(s => s.display_name),
      ['Computer Science A', 'Computer Science Discoveries']
    );
    // Hello World and Poem Art at featured so they show up before non-featured
    assert.deepEqual(
      courseOfferingsByCategory['hoc'].map(s => s.display_name),
      ['Hello World', 'Poem Art', 'Artist', 'Flappy']
    );
    assert.deepEqual(
      courseOfferingsByCategory['csf'].map(s => s.display_name),
      ['Course A']
    );
  });

  it('getCourseOfferingsByCategory gets the right course offerings for teacher', () => {
    let courseOfferingsByCategory = getCourseOfferingsByCategory(
      defaultProps.courseOfferings,
      'teacher'
    );

    assert.deepEqual(Object.keys(courseOfferingsByCategory), [
      'hoc',
      'full_course',
      'csf',
      'self_paced_pl',
      'virtual_pl',
    ]);
    assert.deepEqual(
      courseOfferingsByCategory['full_course'].map(s => s.display_name),
      ['Computer Science A', 'Computer Science Discoveries']
    );
    // Hello World and Poem Art at featured so they show up before non-featured
    assert.deepEqual(
      courseOfferingsByCategory['hoc'].map(s => s.display_name),
      ['Hello World', 'Poem Art', 'Artist', 'Flappy']
    );
    assert.deepEqual(
      courseOfferingsByCategory['csf'].map(s => s.display_name),
      ['Course A']
    );
    assert.deepEqual(
      courseOfferingsByCategory['self_paced_pl'].map(s => s.display_name),
      ['Self Paced PL CSP']
    );
    assert.deepEqual(
      courseOfferingsByCategory['virtual_pl'].map(s => s.display_name),
      ['Virtual PL CSP']
    );
  });

  it('filters out unused course offering categories', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps} />);
    assert.equal(wrapper.find('optgroup').length, 3);
    assert.deepEqual(
      wrapper.find('optgroup').map(s => s.props().label),
      ['Full Courses', 'CS Fundamentals', 'Hour of Code']
    );
  });

  it('defaults to just course offering dropdown with no selection when no section is provided', () => {
    const wrapper = shallow(<AssignmentSelector {...newSectionProps} />);
    assert.equal(wrapper.find('select').length, 1);
    assert.equal(wrapper.find('select').value, undefined);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: null,
      courseVersionId: null,
      unitId: null,
    });
  });

  it('unit dropdown defaults to first unit when picking new course offering and course version', () => {
    const wrapper = shallow(<AssignmentSelector {...newSectionProps} />);
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: 2}});
    assert.equal(wrapper.find('select').length, 2);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: 2,
      courseVersionId: 4,
      unitId: 5,
    });
  });

  it('unit dropdown defaults to current unit assignment when section is provided', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
        section={{
          ...defaultProps.section,
          courseOfferingId: 2,
          courseVersionId: 4,
          unitId: 6,
        }}
      />
    );
    assert.equal(wrapper.find('select').length, 2);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: 2,
      courseVersionId: 4,
      unitId: 6,
    });
  });

  it('shows all course offerings in first dropdown with blank option', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps} />);
    assert.equal(wrapper.find('select').length, 1);
    assert.equal(wrapper.find('option').length, 9);

    assert.deepEqual(
      wrapper.find('option').map(option => option.text()),
      [
        '',
        'Decide later',
        'Computer Science A',
        'Computer Science Discoveries',
        'Course A',
        'Hello World',
        'Poem Art',
        'Artist',
        'Flappy',
      ]
    );
  });

  it('shows unit dropdown after selecting course offering', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps} />);
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: 2}});
    assert.equal(wrapper.find('select').length, 2);
    const secondary = wrapper.find('select').at(1);
    assert.equal(secondary.find('option').length, 3);
    assert.deepEqual(
      secondary.find('option').map(option => option.text()),
      ['Unit 1', 'Unit 2', '']
    );
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: 2,
      courseVersionId: 4,
      unitId: 5,
    });
  });

  it('can select unit in unit dropdown after selecting course offering', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps} />);
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: 2}});
    wrapper
      .find('select')
      .at(1)
      .simulate('change', {target: {value: 3}});
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: 2,
      courseVersionId: 4,
      unitId: 3,
    });
  });

  it('hides unit dropdown after selecting blank course offering', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps} />);
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: 2}});
    assert.equal(wrapper.find('select').length, 2);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: 2,
      courseVersionId: 4,
      unitId: 5,
    });

    assert.equal(
      wrapper.find('select').at(0).find('option').at(0).props().value,
      '__noAssignment__'
    );
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: '__noAssignment__'}});
    assert.equal(wrapper.find('select').length, 1);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: null,
      courseVersionId: null,
      unitId: null,
    });
  });

  it('shows two dropdowns if section has course offering, course version and unit', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
        section={{
          ...defaultProps.section,
          courseOfferingId: 2,
          courseVersionId: 3,
          unitId: 3,
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
          courseOfferingId: null,
          courseVersionId: null,
          unitId: null,
        }}
      />
    );
    assert.equal(wrapper.find('select').length, 1);
    assert.equal(wrapper.find('select').value, undefined);
  });

  describe('the "Decide later" option', () => {
    it('shows up after the blank option and before the others', () => {
      let wrapper = shallow(<AssignmentSelector {...defaultProps} />);
      assert.equal(wrapper.find('select').length, 1);
      assert.equal(wrapper.find('option').length, 9);
      assert.deepEqual(
        wrapper.find('option').map(option => option.text()),
        [
          '',
          'Decide later',
          'Computer Science A',
          'Computer Science Discoveries',
          'Course A',
          'Hello World',
          'Poem Art',
          'Artist',
          'Flappy',
        ]
      );
    });

    it('means selecting nothing', () => {
      let wrapper = shallow(<AssignmentSelector {...defaultProps} />);
      wrapper
        .find('select')
        .at(0)
        .simulate('change', {target: {value: '__decideLater__'}});
      assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
        courseOfferingId: null,
        courseVersionId: null,
        unitId: null,
      });
    });
  });

  describe('the onChange prop', () => {
    let wrapper, onChange;

    beforeEach(() => {
      onChange = sinon.spy();
      wrapper = shallow(
        <AssignmentSelector {...defaultProps} onChange={onChange} />
      );
    });

    it(`doesn't get called during construction`, () => {
      expect(onChange).not.to.have.been.called;
    });

    it('gets called when course offering dropdown changes', () => {
      wrapper
        .find('select')
        .at(0)
        .simulate('change', {target: {value: 2}});
      expect(onChange).to.have.been.calledOnce.and.to.have.been.calledWith({
        courseOfferingId: 2,
        courseVersionId: 4,
        unitId: 5,
      });
    });

    it('gets called when unit dropdown changes', () => {
      wrapper
        .find('select')
        .at(0)
        .simulate('change', {target: {value: 2}});
      onChange.resetHistory();
      wrapper
        .find('select')
        .at(1)
        .simulate('change', {target: {value: 3}});
      expect(onChange).to.have.been.calledOnce.and.to.have.been.calledWith({
        courseOfferingId: 2,
        courseVersionId: 4,
        unitId: 3,
      });
    });
  });

  describe('the disabled prop', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(<AssignmentSelector {...defaultProps} disabled />);
    });

    it('disables the course offering dropdown', () => {
      const firstDropdown = wrapper.find('select').at(0);
      expect(firstDropdown.props().disabled).to.equal(true);
    });

    it('disables the unit dropdown', () => {
      wrapper
        .find('select')
        .at(0)
        .simulate('change', {target: {value: 2}});
      const secondDropdown = wrapper.find('select').at(1);
      expect(secondDropdown.props().disabled).to.equal(true);
    });
  });
});
