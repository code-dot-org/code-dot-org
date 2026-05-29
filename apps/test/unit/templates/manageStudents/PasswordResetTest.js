import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import PasswordReset from '@cdo/apps/templates/manageStudents/PasswordReset';

describe('PasswordReset', () => {
  it('disables reset password button if resetDisabled prop is true', () => {
    let wrapper = mount(<PasswordReset />);
    expect(wrapper.find('button').first().prop('disabled')).toBeFalsy();

    wrapper = mount(<PasswordReset resetDisabled={true} />);
    expect(wrapper.find('button').first().prop('disabled')).toBe(true);
  });

  it('calls props.setPasswordLengthFailure with true if setting password fails with too short error', async () => {
    const setPasswordLengthFailureSpy = jest.fn();

    const wrapper = mount(
      <PasswordReset setPasswordLengthFailure={setPasswordLengthFailureSpy} />
    );
    wrapper.find('button').first().simulate('click');
    wrapper.find('input').simulate('change', {
      target: {value: 'short'},
    });
    const saveButton = wrapper.find('button').first();
    saveButton.simulate('click');
    expect(setPasswordLengthFailureSpy).toHaveBeenCalledWith(true);
  });
});
