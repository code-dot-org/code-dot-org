import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import NewUnitForm from '@cdo/apps/levelbuilder/unit-editor/NewUnitForm';

describe('NewUnitFormTest', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      families: ['family-1', 'family-2'],
      versionYearOptions: ['1991', '1992'],
      familiesCourseTypes: {
        'family-1': {
          instructor_audience: 'teacher',
          participant_audience: 'student',
          instruction_type: 'teacher_led',
        },
        'family-2': {
          instructor_audience: 'universal_instructor',
          participant_audience: 'teacher',
          instruction_type: 'self_paced',
        },
      },
    };
  });

  it('can create a new standalone unit', () => {
    const wrapper = mount(<NewUnitForm {...defaultProps} />);
    expect(wrapper.find('button').length).toBe(0);
    expect(wrapper.find('NewCourseFields').length).toBe(0);
    expect(wrapper.find('.isCourseSelector').length).toBe(1);

    wrapper
      .find('.isCourseSelector')
      .simulate('change', {target: {value: 'true'}});

    let fields = wrapper.find('NewCourseFields');
    expect(fields.length).toBe(1);

    expect(fields.find('.familyNameSelector').length).toBe(1);

    expect(fields.find('isVersionedSelector').length).toBe(0);
    fields
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});

    // need to get updated fields
    fields = wrapper.find('NewCourseFields');
    expect(fields.find('.isVersionedSelector').length).toBe(1);
    expect(wrapper.find('button').length).toBe(1);

    fields
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'yes'}});

    // need to get updated fields
    fields = wrapper.find('NewCourseFields');
    expect(fields.find('.versionYearSelector').length).toBe(1);
    expect(fields.find('.versionYearSelector').props().disabled).toBe(false);
    expect(wrapper.find('button').length).toBe(1);

    fields
      .find('.versionYearSelector')
      .simulate('change', {target: {value: '1991'}});

    // need to get updated fields
    fields = wrapper.find('NewCourseFields');
    expect(fields.find('.versionYearSelector').props().value).toBe('1991');

    expect(wrapper.find('div.savingDetailsAndButton').length).toBe(1);
    expect(wrapper.find('[name="script[name]"]').length).toBe(1);
  });

  it('course type settings are updated when family name is selected', () => {
    const wrapper = mount(<NewUnitForm {...defaultProps} />);
    expect(wrapper.find('button').length).toBe(0);
    expect(wrapper.find('NewCourseFields').length).toBe(0);
    expect(wrapper.find('.isCourseSelector').length).toBe(1);

    wrapper
      .find('.isCourseSelector')
      .simulate('change', {target: {value: 'true'}});

    let fields = wrapper.find('NewCourseFields');
    expect(fields.length).toBe(1);

    expect(fields.find('.familyNameSelector').length).toBe(1);

    expect(fields.find('isVersionedSelector').length).toBe(0);
    fields
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});

    // need to get updated fields
    fields = wrapper.find('NewCourseFields');
    expect(fields.find('.isVersionedSelector').length).toBe(1);
    expect(fields.find('CourseTypeEditor').length).toBe(1);
    expect(fields.find('CourseTypeEditor').props().instructorAudience).toBe(
      'teacher'
    );
    expect(fields.find('CourseTypeEditor').props().participantAudience).toBe(
      'student'
    );
    expect(fields.find('CourseTypeEditor').props().instructionType).toBe(
      'teacher_led'
    );

    fields
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-2'}});

    // need to get updated fields
    fields = wrapper.find('NewCourseFields');
    expect(fields.find('.isVersionedSelector').length).toBe(1);
    expect(fields.find('CourseTypeEditor').length).toBe(1);
    expect(fields.find('CourseTypeEditor').props().instructorAudience).toBe(
      'universal_instructor'
    );
    expect(fields.find('CourseTypeEditor').props().participantAudience).toBe(
      'teacher'
    );
    expect(fields.find('CourseTypeEditor').props().instructionType).toBe(
      'self_paced'
    );
  });

  it('can create a new unit for multi unit course', () => {
    const wrapper = shallow(<NewUnitForm {...defaultProps} />);
    expect(wrapper.find('div.savingDetailsAndButton').length).toBe(0);
    expect(wrapper.find('NewCourseFields').length).toBe(0);
    expect(wrapper.find('.isCourseSelector').length).toBe(1);

    wrapper
      .find('.isCourseSelector')
      .simulate('change', {target: {value: 'false'}});

    expect(wrapper.find('NewCourseFields').length).toBe(0);
    expect(wrapper.find('div.savingDetailsAndButton').length).toBe(1);
    expect(wrapper.find('[name="script[name]"]').length).toBe(1);
  });

  it('resetting isCourseSelector hides NewCourseFields', () => {
    const wrapper = shallow(<NewUnitForm {...defaultProps} />);
    expect(wrapper.find('div.savingDetailsAndButton').length).toBe(0);
    expect(wrapper.find('NewCourseFields').length).toBe(0);
    expect(wrapper.find('.isCourseSelector').length).toBe(1);

    wrapper
      .find('.isCourseSelector')
      .simulate('change', {target: {value: 'true'}});

    expect(wrapper.find('NewCourseFields').length).toBe(1);
    expect(wrapper.find('div.savingDetailsAndButton').length).toBe(0);
    expect(wrapper.find('[name="script[name]"]').length).toBe(0);

    wrapper.find('.isCourseSelector').simulate('change', {target: {value: ''}});

    expect(wrapper.find('NewCourseFields').length).toBe(0);
    expect(wrapper.find('div.savingDetailsAndButton').length).toBe(0);
    expect(wrapper.find('[name="script[name]"]').length).toBe(0);
  });

  it('resetting isCourseSelector hides save button', () => {
    const wrapper = shallow(<NewUnitForm {...defaultProps} />);
    expect(wrapper.find('div.savingDetailsAndButton').length).toBe(0);
    expect(wrapper.find('NewCourseFields').length).toBe(0);
    expect(wrapper.find('.isCourseSelector').length).toBe(1);

    wrapper
      .find('.isCourseSelector')
      .simulate('change', {target: {value: 'false'}});

    expect(wrapper.find('NewCourseFields').length).toBe(0);
    expect(wrapper.find('div.savingDetailsAndButton').length).toBe(1);
    expect(wrapper.find('[name="script[name]"]').length).toBe(1);

    wrapper.find('.isCourseSelector').simulate('change', {target: {value: ''}});

    expect(wrapper.find('NewCourseFields').length).toBe(0);
    expect(wrapper.find('div.savingDetailsAndButton').length).toBe(0);
    expect(wrapper.find('[name="script[name]"]').length).toBe(0);
  });

  it('hitting save opens submit confirmation dialog', () => {
    const wrapper = shallow(<NewUnitForm {...defaultProps} />);
    expect(wrapper.find('div.savingDetailsAndButton').length).toBe(0);
    expect(wrapper.find('NewCourseFields').length).toBe(0);
    expect(wrapper.find('.isCourseSelector').length).toBe(1);

    wrapper
      .find('.isCourseSelector')
      .simulate('change', {target: {value: 'false'}});

    expect(wrapper.find('BaseDialog').props().isOpen).toBe(false);

    expect(wrapper.find('NewCourseFields').length).toBe(0);
    expect(wrapper.find('div.savingDetailsAndButton').length).toBe(1);
    expect(wrapper.find('[name="script[name]"]').length).toBe(1);

    wrapper.find('div.savingDetailsAndButton').find('button').simulate('click');

    expect(wrapper.find('BaseDialog').props().isOpen).toBe(true);
  });
});
