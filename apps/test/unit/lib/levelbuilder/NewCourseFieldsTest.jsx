import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import NewCourseFields from '@cdo/apps/lib/levelbuilder/NewCourseFields';
import sinon from 'sinon';

describe('NewCourseFieldsTest', () => {
  let defaultProps, setFamilyName, setVersionYear, setFamilyAndCourseType;
  beforeEach(() => {
    setFamilyName = sinon.spy();
    setVersionYear = sinon.spy();
    setFamilyAndCourseType = sinon.spy();
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
    expect(wrapper.find('.familyNameSelector').length).to.equal(1);

    expect(wrapper.find('isVersionedSelector').length).to.equal(0);
    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});
    expect(setFamilyAndCourseType).to.have.been.calledWith('family-1');
    wrapper.setProps({
      familyName: 'family-1',
      instructorAudience: 'teacher',
      participantAudience: 'student',
      instructionType: 'teacher_led',
    });
    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);

    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: ''}});
    expect(setFamilyAndCourseType).to.have.been.calledWith('');
    wrapper.setProps({
      familyName: '',
      instructorAudience: '',
      participantAudience: '',
      instructionType: '',
    });

    expect(wrapper.find('.isVersionedSelector').length).to.equal(0);
  });

  it('resetting isVersionedSelector makes versionYearSelector disappear', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).to.equal(1);

    expect(wrapper.find('isVersionedSelector').length).to.equal(0);
    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});
    expect(setFamilyAndCourseType).to.have.been.calledWith('family-1');
    wrapper.setProps({
      familyName: 'family-1',
      instructorAudience: 'teacher',
      participantAudience: 'student',
      instructionType: 'teacher_led',
    });
    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'no'}});

    expect(wrapper.find('.versionYearSelector').length).to.equal(1);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: ''}});

    expect(wrapper.find('.versionYearSelector').length).to.equal(0);
  });

  it('resetting familyNameInput makes isVersionedSelector disappear', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).to.equal(1);

    expect(wrapper.find('isVersionedSelector').length).to.equal(0);
    wrapper
      .find('.familyNameInput')
      .simulate('change', {target: {value: 'new-family-name'}});
    expect(setFamilyName).to.have.been.calledWith('new-family-name');
    wrapper.setProps({familyName: 'new-family-name'});

    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);

    wrapper.find('.familyNameInput').simulate('change', {target: {value: ''}});
    expect(setFamilyName).to.have.been.calledWith('');
    wrapper.setProps({familyName: ''});

    expect(wrapper.find('.isVersionedSelector').length).to.equal(0);
  });

  it('can select existing family name and unversioned course', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).to.equal(1);

    expect(wrapper.find('isVersionedSelector').length).to.equal(0);
    expect(wrapper.find('CourseTypeEditor').length).to.equal(0);
    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});
    expect(setFamilyAndCourseType).to.have.been.calledWith('family-1');
    wrapper.setProps({
      familyName: 'family-1',
      instructorAudience: 'teacher',
      participantAudience: 'student',
      instructionType: 'teacher_led',
    });
    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);
    expect(wrapper.find('CourseTypeEditor').length).to.equal(1);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'no'}});
    expect(setVersionYear).to.have.been.calledWith('unversioned');
    wrapper.setProps({versionYear: 'unversioned'});

    expect(wrapper.find('.versionYearSelector').length).to.equal(1);
    expect(wrapper.find('.versionYearSelector').props().value).to.equal(
      'unversioned'
    );
    expect(wrapper.find('.versionYearSelector').props().disabled).to.equal(
      true
    );
  });

  it('can create new family name and unversioned course', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).to.equal(1);

    expect(wrapper.find('isVersionedSelector').length).to.equal(0);
    wrapper
      .find('.familyNameInput')
      .simulate('change', {target: {value: 'new-family-name'}});
    expect(setFamilyName).to.have.been.calledWith('new-family-name');
    wrapper.setProps({familyName: 'new-family-name'});

    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);
    expect(wrapper.find('CourseTypeEditor').length).to.equal(0);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'no'}});
    expect(setVersionYear).to.have.been.calledWith('unversioned');
    wrapper.setProps({versionYear: 'unversioned'});

    expect(wrapper.find('.versionYearSelector').length).to.equal(1);
    expect(wrapper.find('.versionYearSelector').props().value).to.equal(
      'unversioned'
    );
    expect(wrapper.find('.versionYearSelector').props().disabled).to.equal(
      true
    );
  });

  it('can select existing family name and versioned course', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).to.equal(1);

    expect(wrapper.find('isVersionedSelector').length).to.equal(0);
    expect(wrapper.find('CourseTypeEditor').length).to.equal(0);
    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});
    expect(setFamilyAndCourseType).to.have.been.calledWith('family-1');
    wrapper.setProps({
      familyName: 'family-1',
      instructorAudience: 'teacher',
      participantAudience: 'student',
      instructionType: 'teacher_led',
    });
    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);
    expect(wrapper.find('CourseTypeEditor').length).to.equal(1);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'yes'}});

    expect(wrapper.find('.versionYearSelector').length).to.equal(1);

    wrapper
      .find('.versionYearSelector')
      .simulate('change', {target: {value: '1991'}});
    expect(setVersionYear).to.have.been.calledWith('1991');
    wrapper.setProps({versionYear: '1991'});

    expect(wrapper.find('.versionYearSelector').props().value).to.equal('1991');
    expect(wrapper.find('.versionYearSelector').props().disabled).to.equal(
      false
    );
  });

  it('can create new family name and versioned course', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).to.equal(1);

    expect(wrapper.find('isVersionedSelector').length).to.equal(0);
    wrapper
      .find('.familyNameInput')
      .simulate('change', {target: {value: 'new-family-name'}});
    expect(setFamilyName).to.have.been.calledWith('new-family-name');
    wrapper.setProps({familyName: 'new-family-name'});

    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);
    expect(wrapper.find('CourseTypeEditor').length).to.equal(0);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'yes'}});

    expect(wrapper.find('.versionYearSelector').length).to.equal(1);

    wrapper
      .find('.versionYearSelector')
      .simulate('change', {target: {value: '1991'}});
    expect(setVersionYear).to.have.been.calledWith('1991');
    wrapper.setProps({versionYear: '1991'});

    expect(wrapper.find('.versionYearSelector').props().value).to.equal('1991');
    expect(wrapper.find('.versionYearSelector').props().disabled).to.equal(
      false
    );
  });
});
