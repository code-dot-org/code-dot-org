import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import PasswordReset from '@cdo/apps/templates/manageStudents/PasswordReset';

describe('PasswordReset', () => {
  it('disables reset password button if resetDisabled prop is true', () => {
    let wrapper = mount(<PasswordReset />);
    expect(wrapper.find('Button').prop('disabled')).to.equal(undefined);

    wrapper = mount(<PasswordReset resetDisabled={true} />);
    expect(wrapper.find('Button').prop('disabled')).to.be.true;
  });
});
