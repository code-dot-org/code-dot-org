import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import NewCourseFields from '@cdo/apps/levelbuilder/NewCourseFields';

describe('NewCourseFieldsTest', () => {
  let defaultProps, setFamilyName, setVersionYear, setFamilyAndCourseType;
  beforeEach(() => {
    setFamilyName = jest.fn();
    setVersionYear = jest.fn();
    setFamilyAndCourseType = jest.fn();
    defaultProps = {
      families: ['family-1', 'family-2', 'family-3'],
      versionYearOptions: ['1991', '1992', 'unversioned'],
      familiesCourseTypes: {
        'family-1': {
          instructor_audience: 'teacher',
          participant_audience: 'student',
          instruction_type: 'teacher_led',
          existing_version_keys: [],
        },
        'family-2': {
          instructor_audience: 'universal_instructor',
          participant_audience: 'teacher',
          instruction_type: 'self_paced',
          existing_version_keys: ['1991-01'],
        },
        'family-3': {
          instructor_audience: 'teacher',
          participant_audience: 'student',
          instruction_type: 'teacher_led',
          existing_version_keys: ['1991'], // plain-year (legacy) version exists
        },
      },
      familyName: '',
      setFamilyName,
      setFamilyAndCourseType,
      versionYear: '',
      setVersionYear,
      instructorAudience: '',
      participantAudience: '',
      instructionType: '',
    };
  });

  it('resetting familyNameSelector makes isVersionedSelector disappear', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).toBe(1);

    expect(wrapper.find('isVersionedSelector').length).toBe(0);
    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});
    expect(setFamilyAndCourseType).toHaveBeenCalledWith('family-1');
    wrapper.setProps({
      familyName: 'family-1',
      instructorAudience: 'teacher',
      participantAudience: 'student',
      instructionType: 'teacher_led',
    });
    expect(wrapper.find('.isVersionedSelector').length).toBe(1);

    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: ''}});
    expect(setFamilyAndCourseType).toHaveBeenCalledWith('');
    wrapper.setProps({
      familyName: '',
      instructorAudience: '',
      participantAudience: '',
      instructionType: '',
    });

    expect(wrapper.find('.isVersionedSelector').length).toBe(0);
  });

  it('resetting isVersionedSelector makes versionYearSelector disappear', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).toBe(1);

    expect(wrapper.find('isVersionedSelector').length).toBe(0);
    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});
    expect(setFamilyAndCourseType).toHaveBeenCalledWith('family-1');
    wrapper.setProps({
      familyName: 'family-1',
      instructorAudience: 'teacher',
      participantAudience: 'student',
      instructionType: 'teacher_led',
    });
    expect(wrapper.find('.isVersionedSelector').length).toBe(1);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'no'}});

    expect(wrapper.find('.versionYearSelector').length).toBe(1);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: ''}});

    expect(wrapper.find('.versionYearSelector').length).toBe(0);
  });

  it('resetting familyNameInput makes isVersionedSelector disappear', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).toBe(1);

    expect(wrapper.find('isVersionedSelector').length).toBe(0);
    wrapper
      .find('.familyNameInput')
      .simulate('change', {target: {value: 'new-family-name'}});
    expect(setFamilyName).toHaveBeenCalledWith('new-family-name');
    wrapper.setProps({familyName: 'new-family-name'});

    expect(wrapper.find('.isVersionedSelector').length).toBe(1);

    wrapper.find('.familyNameInput').simulate('change', {target: {value: ''}});
    expect(setFamilyName).toHaveBeenCalledWith('');
    wrapper.setProps({familyName: ''});

    expect(wrapper.find('.isVersionedSelector').length).toBe(0);
  });

  it('can select existing family name and unversioned course', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).toBe(1);

    expect(wrapper.find('isVersionedSelector').length).toBe(0);
    expect(wrapper.find('CourseTypeEditor').length).toBe(0);
    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});
    expect(setFamilyAndCourseType).toHaveBeenCalledWith('family-1');
    wrapper.setProps({
      familyName: 'family-1',
      instructorAudience: 'teacher',
      participantAudience: 'student',
      instructionType: 'teacher_led',
    });
    expect(wrapper.find('.isVersionedSelector').length).toBe(1);
    expect(wrapper.find('CourseTypeEditor').length).toBe(1);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'no'}});
    expect(setVersionYear).toHaveBeenCalledWith('unversioned');
    wrapper.setProps({versionYear: 'unversioned'});

    expect(wrapper.find('.versionYearSelector').length).toBe(1);
    expect(wrapper.find('.versionYearSelector').props().value).toBe(
      'unversioned'
    );
    expect(wrapper.find('.versionYearSelector').props().disabled).toBe(true);
  });

  it('can create new family name and unversioned course', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).toBe(1);

    expect(wrapper.find('isVersionedSelector').length).toBe(0);
    wrapper
      .find('.familyNameInput')
      .simulate('change', {target: {value: 'new-family-name'}});
    expect(setFamilyName).toHaveBeenCalledWith('new-family-name');
    wrapper.setProps({familyName: 'new-family-name'});

    expect(wrapper.find('.isVersionedSelector').length).toBe(1);
    expect(wrapper.find('CourseTypeEditor').length).toBe(0);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'no'}});
    expect(setVersionYear).toHaveBeenCalledWith('unversioned');
    wrapper.setProps({versionYear: 'unversioned'});

    expect(wrapper.find('.versionYearSelector').length).toBe(1);
    expect(wrapper.find('.versionYearSelector').props().value).toBe(
      'unversioned'
    );
    expect(wrapper.find('.versionYearSelector').props().disabled).toBe(true);
  });

  it('can select existing family name and versioned course', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).toBe(1);

    expect(wrapper.find('isVersionedSelector').length).toBe(0);
    expect(wrapper.find('CourseTypeEditor').length).toBe(0);
    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});
    expect(setFamilyAndCourseType).toHaveBeenCalledWith('family-1');
    wrapper.setProps({
      familyName: 'family-1',
      instructorAudience: 'teacher',
      participantAudience: 'student',
      instructionType: 'teacher_led',
    });
    expect(wrapper.find('.isVersionedSelector').length).toBe(1);
    expect(wrapper.find('CourseTypeEditor').length).toBe(1);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'yes'}});

    expect(wrapper.find('.versionYearSelector').length).toBe(1);

    wrapper
      .find('.versionYearSelector')
      .simulate('change', {target: {value: '1991'}});
    // family-1 has no existing versions, so first CalVer key for 1991 is 1991-01
    expect(setVersionYear).toHaveBeenCalledWith('1991-01');
    wrapper.setProps({versionYear: '1991-01'});

    // The dropdown tracks selectedYear (the YYYY part), not the full CalVer key
    expect(wrapper.find('.versionYearSelector').props().value).toBe('1991');
    expect(wrapper.find('.versionYearSelector').props().disabled).toBe(false);
  });

  it('can create new family name and versioned course', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).toBe(1);

    expect(wrapper.find('isVersionedSelector').length).toBe(0);
    wrapper
      .find('.familyNameInput')
      .simulate('change', {target: {value: 'new-family-name'}});
    expect(setFamilyName).toHaveBeenCalledWith('new-family-name');
    wrapper.setProps({familyName: 'new-family-name'});

    expect(wrapper.find('.isVersionedSelector').length).toBe(1);
    expect(wrapper.find('CourseTypeEditor').length).toBe(0);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'yes'}});

    expect(wrapper.find('.versionYearSelector').length).toBe(1);

    wrapper
      .find('.versionYearSelector')
      .simulate('change', {target: {value: '1991'}});
    // New family has no existing versions, so first CalVer key is 1991-01
    expect(setVersionYear).toHaveBeenCalledWith('1991-01');
    wrapper.setProps({versionYear: '1991-01'});

    expect(wrapper.find('.versionYearSelector').props().value).toBe('1991');
    expect(wrapper.find('.versionYearSelector').props().disabled).toBe(false);
  });

  it('increments CalVer NN for a family with existing CalVer versions in the same year', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-2'}});
    wrapper.setProps({
      familyName: 'family-2',
      instructorAudience: 'universal_instructor',
      participantAudience: 'teacher',
      instructionType: 'self_paced',
    });

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'yes'}});

    wrapper
      .find('.versionYearSelector')
      .simulate('change', {target: {value: '1991'}});
    // family-2 already has 1991-01, so next is 1991-02
    expect(setVersionYear).toHaveBeenCalledWith('1991-02');
  });

  it('starts at .02 when only a plain-year (legacy) version exists for that year', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-3'}});
    wrapper.setProps({
      familyName: 'family-3',
      instructorAudience: 'teacher',
      participantAudience: 'student',
      instructionType: 'teacher_led',
    });

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'yes'}});

    wrapper
      .find('.versionYearSelector')
      .simulate('change', {target: {value: '1991'}});
    // family-3 has legacy "1991" (counts as slot 1), so next CalVer is 1991-02
    expect(setVersionYear).toHaveBeenCalledWith('1991-02');
  });
});
