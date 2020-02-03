import React from 'react';
import {mount} from 'enzyme';
import {assert} from '../../../../../util/deprecatedChai';
import EligibilityConfirmDialog from '@cdo/apps/lib/kits/maker/ui/EligibilityConfirmDialog';

describe('EligibilityConfirmDialog', () => {
  const defaultProps = {
    onCancel: () => {},
    onSuccess: () => {}
  };

  it('has a disabled submit button initially', () => {
    const wrapper = mount(<EligibilityConfirmDialog {...defaultProps} />);
    assert.equal(
      wrapper
        .find('Button')
        .last()
        .props().disabled,
      true
    );
  });

  it('remains disabled if we check inputs but dont fill signature', () => {
    const wrapper = mount(<EligibilityConfirmDialog {...defaultProps} />);
    // we need to manually set checked rather than use simulate, since simulate
    // doesn't actually modify the DOM
    wrapper.instance().check1.checked = true;
    wrapper.instance().check2.checked = true;
    wrapper.instance().check3.checked = true;
    assert.equal(
      wrapper
        .find('Button')
        .last()
        .props().disabled,
      true
    );
  });

  it('remains disabled if fill signature but dont check inputs', () => {
    const wrapper = mount(<EligibilityConfirmDialog {...defaultProps} />);
    wrapper
      .find('input')
      .last()
      .simulate('change', {target: {value: 'Teacher McTeacherson'}});
    assert.equal(wrapper.state('signature'), 'Teacher McTeacherson');
    assert.equal(
      wrapper
        .find('Button')
        .last()
        .props().disabled,
      true
    );
  });

  it('becomes enabled after filling entire form', () => {
    const wrapper = mount(<EligibilityConfirmDialog {...defaultProps} />);
    wrapper.instance().check1.checked = true;
    wrapper.instance().check2.checked = true;
    wrapper.instance().check3.checked = true;
    wrapper
      .find('input')
      .last()
      .simulate('change', {target: {value: 'Teacher McTeacherson'}});
    assert.equal(
      wrapper
        .find('Button')
        .last()
        .props().disabled,
      false
    );
  });

  it('becomes disabled while submitting', () => {
    const wrapper = mount(<EligibilityConfirmDialog {...defaultProps} />);
    wrapper.instance().check1.checked = true;
    wrapper.instance().check2.checked = true;
    wrapper.instance().check3.checked = true;
    wrapper
      .find('input')
      .last()
      .simulate('change', {target: {value: 'Teacher McTeacherson'}});
    assert.equal(
      wrapper
        .find('Button')
        .last()
        .props().disabled,
      false
    );

    wrapper.setState({submitting: true});
    assert.equal(
      wrapper
        .find('Button')
        .last()
        .props().disabled,
      true
    );
  });
});
