import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {mount, shallow} from 'enzyme';
import NewUnitForm from '@cdo/apps/lib/levelbuilder/unit-editor/NewUnitForm';

describe('NewUnitFormTest', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      families: ['family-1', 'family-2'],
      versionYearOptions: ['1991', '1992']
    };
  });

  it('can create a new standalone unit', () => {
    const wrapper = mount(<NewUnitForm {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(0);
    expect(wrapper.find('NewCourseFields').length).to.equal(0);
    expect(wrapper.find('.isCourseSelector').length).to.equal(1);

    wrapper
      .find('.isCourseSelector')
      .simulate('change', {target: {value: 'true'}});

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
    expect(wrapper.find('button').length).to.equal(0);

    fields
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'yes'}});

    // need to get updated fields
    fields = wrapper.find('NewCourseFields');
    expect(fields.find('.versionYearSelector').length).to.equal(1);
    expect(fields.find('.versionYearSelector').props().disabled).to.equal(
      false
    );
    expect(wrapper.find('button').length).to.equal(0);

    fields
      .find('.versionYearSelector')
      .simulate('change', {target: {value: '1991'}});

    // need to get updated fields
    fields = wrapper.find('NewCourseFields');
    expect(fields.find('.versionYearSelector').props().value).to.equal('1991');

    expect(wrapper.find('SavingDetailsAndButton').length).to.equal(1);
    expect(wrapper.find('[name="script[name]"]').length).to.equal(1);
  });

  it('can create a new unit for multi unit course', () => {
    const wrapper = shallow(<NewUnitForm {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(0);
    expect(wrapper.find('NewCourseFields').length).to.equal(0);
    expect(wrapper.find('.isCourseSelector').length).to.equal(1);

    wrapper
      .find('.isCourseSelector')
      .simulate('change', {target: {value: 'false'}});

    expect(wrapper.find('NewCourseFields').length).to.equal(0);
    expect(wrapper.find('SavingDetailsAndButton').length).to.equal(1);
    expect(wrapper.find('[name="script[name]"]').length).to.equal(1);
  });

  it('resetting isCourseSelector hides NewCourseFields', () => {
    const wrapper = shallow(<NewUnitForm {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(0);
    expect(wrapper.find('NewCourseFields').length).to.equal(0);
    expect(wrapper.find('.isCourseSelector').length).to.equal(1);

    wrapper
      .find('.isCourseSelector')
      .simulate('change', {target: {value: 'true'}});

    expect(wrapper.find('NewCourseFields').length).to.equal(1);
    expect(wrapper.find('SavingDetailsAndButton').length).to.equal(0);
    expect(wrapper.find('[name="script[name]"]').length).to.equal(0);

    wrapper.find('.isCourseSelector').simulate('change', {target: {value: ''}});

    expect(wrapper.find('NewCourseFields').length).to.equal(0);
    expect(wrapper.find('SavingDetailsAndButton').length).to.equal(0);
    expect(wrapper.find('[name="script[name]"]').length).to.equal(0);
  });

  it('resetting isCourseSelector hides save button', () => {
    const wrapper = shallow(<NewUnitForm {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(0);
    expect(wrapper.find('NewCourseFields').length).to.equal(0);
    expect(wrapper.find('.isCourseSelector').length).to.equal(1);

    wrapper
      .find('.isCourseSelector')
      .simulate('change', {target: {value: 'false'}});

    expect(wrapper.find('NewCourseFields').length).to.equal(0);
    expect(wrapper.find('SavingDetailsAndButton').length).to.equal(1);
    expect(wrapper.find('[name="script[name]"]').length).to.equal(1);

    wrapper.find('.isCourseSelector').simulate('change', {target: {value: ''}});

    expect(wrapper.find('NewCourseFields').length).to.equal(0);
    expect(wrapper.find('SavingDetailsAndButton').length).to.equal(0);
    expect(wrapper.find('[name="script[name]"]').length).to.equal(0);
  });
});
