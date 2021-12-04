import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import NewCourseFields from '@cdo/apps/lib/levelbuilder/NewCourseFields';

describe('NewCourseFieldsTest', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      families: ['family-1', 'family-2'],
      versionYearOptions: ['1991', '1992']
    };
  });

  it('resetting familyNameSelector makes isVersionedSelector disappear', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).to.equal(1);

    expect(wrapper.find('isVersionedSelector').length).to.equal(0);
    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});
    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);

    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: ''}});

    expect(wrapper.find('.isVersionedSelector').length).to.equal(0);
  });

  it('resetting isVersionedSelector makes versionYearSelector disappear', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).to.equal(1);

    expect(wrapper.find('isVersionedSelector').length).to.equal(0);
    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});
    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);

    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: ''}});

    expect(wrapper.find('.isVersionedSelector').length).to.equal(0);

    wrapper
      .find('.familyNameInput')
      .simulate('change', {target: {value: 'new-family-name'}});

    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'no'}});

    expect(wrapper.find('.versionYearSelector').length).to.equal(1);
    expect(wrapper.find('.versionYearSelector').value).to.equal('unversioned');
    expect(wrapper.find('.versionYearSelector').disabled).to.equal(true);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'yes'}});

    expect(wrapper.find('.versionYearSelector').length).to.equal(1);
    expect(wrapper.find('.versionYearSelector').disabled).to.equal(false);

    wrapper
      .find('.versionYearSelector')
      .simulate('change', {target: {value: '1991'}});

    expect(wrapper.find('.versionYearSelector').value).to.equal('1991');
  });

  it('can select existing family name and unversioned course', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).to.equal(1);

    expect(wrapper.find('isVersionedSelector').length).to.equal(0);
    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});
    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);

    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: ''}});

    expect(wrapper.find('.isVersionedSelector').length).to.equal(0);

    wrapper
      .find('.familyNameInput')
      .simulate('change', {target: {value: 'new-family-name'}});

    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'no'}});

    expect(wrapper.find('.versionYearSelector').length).to.equal(1);
    expect(wrapper.find('.versionYearSelector').value).to.equal('unversioned');
    expect(wrapper.find('.versionYearSelector').disabled).to.equal(true);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'yes'}});

    expect(wrapper.find('.versionYearSelector').length).to.equal(1);
    expect(wrapper.find('.versionYearSelector').disabled).to.equal(false);

    wrapper
      .find('.versionYearSelector')
      .simulate('change', {target: {value: '1991'}});

    expect(wrapper.find('.versionYearSelector').value).to.equal('1991');
  });

  it('can create new family name and unversioned course', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).to.equal(1);

    expect(wrapper.find('isVersionedSelector').length).to.equal(0);
    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});
    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);

    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: ''}});

    expect(wrapper.find('.isVersionedSelector').length).to.equal(0);

    wrapper
      .find('.familyNameInput')
      .simulate('change', {target: {value: 'new-family-name'}});

    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'no'}});

    expect(wrapper.find('.versionYearSelector').length).to.equal(1);
    expect(wrapper.find('.versionYearSelector').value).to.equal('unversioned');
    expect(wrapper.find('.versionYearSelector').disabled).to.equal(true);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'yes'}});

    expect(wrapper.find('.versionYearSelector').length).to.equal(1);
    expect(wrapper.find('.versionYearSelector').disabled).to.equal(false);

    wrapper
      .find('.versionYearSelector')
      .simulate('change', {target: {value: '1991'}});

    expect(wrapper.find('.versionYearSelector').value).to.equal('1991');
  });

  it('can select existing family name and versioned course', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).to.equal(1);

    expect(wrapper.find('isVersionedSelector').length).to.equal(0);
    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});
    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);

    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: ''}});

    expect(wrapper.find('.isVersionedSelector').length).to.equal(0);

    wrapper
      .find('.familyNameInput')
      .simulate('change', {target: {value: 'new-family-name'}});

    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'no'}});

    expect(wrapper.find('.versionYearSelector').length).to.equal(1);
    expect(wrapper.find('.versionYearSelector').value).to.equal('unversioned');
    expect(wrapper.find('.versionYearSelector').disabled).to.equal(true);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'yes'}});

    expect(wrapper.find('.versionYearSelector').length).to.equal(1);
    expect(wrapper.find('.versionYearSelector').disabled).to.equal(false);

    wrapper
      .find('.versionYearSelector')
      .simulate('change', {target: {value: '1991'}});

    expect(wrapper.find('.versionYearSelector').value).to.equal('1991');
  });

  it('can create new family name and versioned course', () => {
    const wrapper = shallow(<NewCourseFields {...defaultProps} />);
    expect(wrapper.find('.familyNameSelector').length).to.equal(1);

    expect(wrapper.find('isVersionedSelector').length).to.equal(0);
    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: 'family-1'}});
    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);

    wrapper
      .find('.familyNameSelector')
      .simulate('change', {target: {value: ''}});

    expect(wrapper.find('.isVersionedSelector').length).to.equal(0);

    wrapper
      .find('.familyNameInput')
      .simulate('change', {target: {value: 'new-family-name'}});

    expect(wrapper.find('.isVersionedSelector').length).to.equal(1);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'no'}});

    expect(wrapper.find('.versionYearSelector').length).to.equal(1);
    expect(wrapper.find('.versionYearSelector').value).to.equal('unversioned');
    expect(wrapper.find('.versionYearSelector').disabled).to.equal(true);

    wrapper
      .find('.isVersionedSelector')
      .simulate('change', {target: {value: 'yes'}});

    expect(wrapper.find('.versionYearSelector').length).to.equal(1);
    expect(wrapper.find('.versionYearSelector').disabled).to.equal(false);

    wrapper
      .find('.versionYearSelector')
      .simulate('change', {target: {value: '1991'}});

    expect(wrapper.find('.versionYearSelector').value).to.equal('1991');
  });
});
