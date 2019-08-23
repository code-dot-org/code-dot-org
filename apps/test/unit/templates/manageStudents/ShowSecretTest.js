import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedShowSecret as ShowSecret} from '@cdo/apps/templates/manageStudents/ShowSecret';

const DEFAULT_PROPS = {
  initialIsShowing: true,
  id: 1,
  loginType: 'picture',
  sectionId: 2,
  userType: 'student',
  setSecretImage: () => {},
  setSecretWords: () => {}
};

describe('ShowSecret', () => {
  it('disables reset password button if userType is teacher', () => {
    let wrapper = mount(<ShowSecret {...DEFAULT_PROPS} />);
    let resetPasswordButton = wrapper.find('Button.uitest-reset-password');
    expect(resetPasswordButton.prop('disabled')).to.be.false;

    wrapper = mount(<ShowSecret {...DEFAULT_PROPS} userType="teacher" />);
    resetPasswordButton = wrapper.find('Button.uitest-reset-password');
    expect(resetPasswordButton.prop('disabled')).to.be.true;
  });
});
