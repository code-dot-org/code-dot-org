import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {UnconnectedShareAllowedDialog as ShareAllowedDialog} from '@cdo/apps/code-studio/components/ShareAllowedDialog';
import shareDialogReducer from '@cdo/apps/code-studio/components/shareDialogRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';

const DEFAULT_PROPS = {
  shareUrl: 'https://studio.code.org/projects/spritelab/abc123',
  isAbusive: false,
  isOpen: false,
  channelId: 'abc123',
  appType: 'spritelab',
  onClickPopup: () => {},
  onClose: () => {},
  canShareSocial: false,
  inRestrictedShareMode: false,
};

function renderWithStore(props) {
  registerReducers({shareDialog: shareDialogReducer});
  const store = getStore();
  return render(
    <Provider store={store}>
      <ShareAllowedDialog {...DEFAULT_PROPS} {...props} />
    </Provider>
  );
}

// Renders the dialog closed then re-renders open, triggering componentDidUpdate
// which sets showSharingDisallowedDialog state on the isOpen false->true transition.
function renderAndOpen(props) {
  const {rerender} = renderWithStore({...props, isOpen: false});
  rerender(
    <Provider store={getStore()}>
      <ShareAllowedDialog {...DEFAULT_PROPS} {...props} isOpen={true} />
    </Provider>
  );
}

describe('ShareAllowedDialog', () => {
  describe('privacy/profanity violation dialog', () => {
    it('shows "Sharing is not allowed" title when hasPrivacyProfanityViolation is true', () => {
      renderAndOpen({hasPrivacyProfanityViolation: true});
      expect(screen.getByText('Sharing is not allowed')).toBeInTheDocument();
    });

    it('shows flagged content message when hasPrivacyProfanityViolation is true', () => {
      renderAndOpen({hasPrivacyProfanityViolation: true});
      expect(
        screen.getByText(
          /This project is unable to be shared because it contains content that is flagged/
        )
      ).toBeInTheDocument();
    });

    it('hides the main share panel when hasPrivacyProfanityViolation is true', () => {
      renderAndOpen({hasPrivacyProfanityViolation: true});
      expect(
        screen.queryByText(/Copy Link to Project/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('teacher-disabled sharing dialog', () => {
    it('does not show the profanity violation message when only userSharingDisabled', () => {
      renderAndOpen({appType: 'applab', userSharingDisabled: true});
      expect(
        screen.queryByText(
          /This project is unable to be shared because it contains content that is flagged/
        )
      ).not.toBeInTheDocument();
    });

    it('hides the main share panel when userSharingDisabled is true for an open-ended project type', () => {
      renderAndOpen({appType: 'applab', userSharingDisabled: true});
      expect(
        screen.queryByText(/Copy Link to Project/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('normal share dialog', () => {
    it('shows the main share panel when no violation and sharing not disabled', () => {
      renderAndOpen({
        hasPrivacyProfanityViolation: false,
        userSharingDisabled: false,
      });
      expect(screen.getByText(/Copy Link to Project/i)).toBeInTheDocument();
    });

    it('does not show the disallowed dialog when no violation', () => {
      renderAndOpen({
        hasPrivacyProfanityViolation: false,
        userSharingDisabled: false,
      });
      expect(
        screen.queryByText('Sharing is not allowed')
      ).not.toBeInTheDocument();
    });
  });
});
