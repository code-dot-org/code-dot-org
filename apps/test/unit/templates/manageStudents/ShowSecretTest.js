import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedShowSecret as ShowSecret} from '@cdo/apps/templates/manageStudents/ShowSecret';

import {expect} from '../../../util/reconfiguredChai';

const DEFAULT_PROPS = {
  initialIsShowing: false,
  id: 1,
  loginType: 'picture',
  sectionId: 2,
  setSecretImage: () => {},
  setSecretWords: () => {},
};

describe('ShowSecret', () => {
  it('disables show picture/word button if secretLoginDisabled prop is true', () => {
    let wrapper = mount(<ShowSecret {...DEFAULT_PROPS} />);
    let showSecretButton = wrapper.find('Button.uitest-show-picture-or-word');
    expect(showSecretButton.prop('disabled')).to.equal(undefined);

    wrapper = mount(
      <ShowSecret {...DEFAULT_PROPS} secretLoginDisabled={true} />
    );
    showSecretButton = wrapper.find('Button.uitest-show-picture-or-word');
    expect(showSecretButton.prop('disabled')).to.be.true;
  });

  it('disables reset password button if resetDisabled prop is true', () => {
    DEFAULT_PROPS.initialIsShowing = true;

    let wrapper = mount(<ShowSecret {...DEFAULT_PROPS} />);
    let resetPasswordButton = wrapper.find('Button.uitest-reset-password');
    expect(resetPasswordButton.prop('disabled')).to.equal(undefined);
  });
});
