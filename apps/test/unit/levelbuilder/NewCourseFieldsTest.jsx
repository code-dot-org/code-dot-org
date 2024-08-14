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
      families: ['family-1', 'family-2'],
      versionYearOptions: ['1991', '1992', 'unversioned'],
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
    expect(setVersionYear).toHaveBeenCalledWith('1991');
    wrapper.setProps({versionYear: '1991'});

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
    expect(setVersionYear).toHaveBeenCalledWith('1991');
    wrapper.setProps({versionYear: '1991'});

    expect(wrapper.find('.versionYearSelector').props().value).toBe('1991');
    expect(wrapper.find('.versionYearSelector').props().disabled).toBe(false);
  });
});
