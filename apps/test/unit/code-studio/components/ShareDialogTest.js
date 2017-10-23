import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import { UnconnectedShareDialog as ShareDialog } from '@cdo/apps/code-studio/components/ShareDialog';
import { SignInState } from '@cdo/apps/code-studio/progressRedux';

describe('ShareDialog', () => {
  it('renders our signed in version when signed in', () => {
    const wrapper = shallow(
      <ShareDialog
        signInState={SignInState.SignedIn}
        appType={'applab'}
      />
    );
    const dialog = wrapper.find('Connect(ShareDialogSignedIn)');
    assert.equal(dialog.length, 1);
    // Make sure props get passed through
    assert.equal(wrapper.props().appType, 'applab');
  });

  it('renders our signed out version when signed out', () => {
    const wrapper = shallow(
      <ShareDialog
        signInState={SignInState.SignedOut}
        appType={'applab'}
      />
    );
    const dialog = wrapper.find('Connect(ShareDialogSignedOut)');
    assert.equal(dialog.length, 1);
  });
});
