import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {mount} from 'enzyme';
import NewCourseForm from '@cdo/apps/lib/levelbuilder/course-editor/NewCourseForm';

describe('NewCourseFormTest', () => {
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

  it('save button shows up once you have selected family name and version year', () => {
    const wrapper = mount(<NewCourseForm {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(0);
    let fields = wrapper.find('NewCourseFields');
    expect(fields.length).to.equal(1);

    expect(fields.find('.familyNameSelector').length).to.equal(1);

    expect(fields.find('isVersionedSelector').length).to.equal(0);
    fields
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});

    // need to get updated fields
    fields = wrapper.find('NewCourseFields');
    expect(fields.find('.isVersionedSelector').length).to.equal(1);

    fields
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'yes'}});

    // need to get updated fields
    fields = wrapper.find('NewCourseFields');
    expect(fields.find('.versionYearSelector').length).to.equal(1);
    expect(fields.find('.versionYearSelector').props().disabled).to.equal(
      false
    );
    expect(wrapper.find('button').length).to.equal(1);

    fields
      .find('.versionYearSelector')
      .simulate('change', {target: {value: '1991'}});

    // need to get updated fields
    fields = wrapper.find('NewCourseFields');
    expect(fields.find('.versionYearSelector').props().value).to.equal('1991');

    expect(wrapper.find('button').length).to.equal(2);
  });

  it('course type settings are updated when family name is selected', () => {
    const wrapper = mount(<NewCourseForm {...defaultProps} />);
    let fields = wrapper.find('NewCourseFields');
    expect(fields.length).to.equal(1);

    expect(fields.find('.familyNameSelector').length).to.equal(1);

    expect(fields.find('isVersionedSelector').length).to.equal(0);
    expect(fields.find('CourseTypeEditor').length).to.equal(0);
    fields
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});

    // need to get updated fields
    fields = wrapper.find('NewCourseFields');
    expect(fields.find('.isVersionedSelector').length).to.equal(1);
    expect(fields.find('CourseTypeEditor').length).to.equal(1);
    expect(fields.find('CourseTypeEditor').props().instructorAudience).to.equal(
      'teacher'
    );
    expect(
      fields.find('CourseTypeEditor').props().participantAudience
    ).to.equal('student');
    expect(fields.find('CourseTypeEditor').props().instructionType).to.equal(
      'teacher_led'
    );

    fields
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-2'}});

    // need to get updated fields
    fields = wrapper.find('NewCourseFields');
    expect(fields.find('.isVersionedSelector').length).to.equal(1);
    expect(fields.find('CourseTypeEditor').length).to.equal(1);
    expect(fields.find('CourseTypeEditor').props().instructorAudience).to.equal(
      'universal_instructor'
    );
    expect(
      fields.find('CourseTypeEditor').props().participantAudience
    ).to.equal('teacher');
    expect(fields.find('CourseTypeEditor').props().instructionType).to.equal(
      'self_paced'
    );
  });
});
