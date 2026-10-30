import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {
  setWindowLocation,
  resetWindowLocation,
} from '@cdo/apps/code-studio/utils';
import LinkAccountPage from '@cdo/apps/templates/gates/LinkAccountPage';
import i18n from '@cdo/locale';

const TEST_RETURN_TO_HREF = '/test/returnto/href';

describe('LinkAccountPage', () => {
  afterEach(() => {
    resetWindowLocation();
  });

  const renderDefault = sourcePage => {
    setWindowLocation({
      search: `?return_to=${encodeURIComponent(
        TEST_RETURN_TO_HREF
      )}&source_page=${encodeURIComponent(sourcePage)}`,
    });
    render(<LinkAccountPage />);
  };

  it('invalid sourcePage shows default text', () => {
    renderDefault('invalid source page');

    screen.getByText(i18n.accountWelcomeBannerDefaultDescription());
    screen.getByText(i18n.accountNewAccountCardDefaultDescription());
    screen.getByText(i18n.accountExistingAccountCardDefaultDescription());
  });

  it('workshop enroll sourcePage shows enrollment text', () => {
    renderDefault('workshop enroll');

    screen.getByText(i18n.accountWelcomeBannerContentWorkshopEnroll());
    screen.getByText(i18n.accountNewAccountCardContentWorkshopEnroll());
    screen.getByText(i18n.accountExistingAccountCardContentWorkshopEnroll());
  });

  it('join section sourcePage shows section text', () => {
    renderDefault('join section');

    screen.getByText(i18n.accountNeededJoinSectionWithoutCodeBannerLabel());
    screen.getByText(i18n.accountNeededJoinSectionCreateAccountCardContent());
    screen.getByText(i18n.accountNeededJoinSectionSignInCardContent());
  });

  it('buttons send user to provided urls', () => {
    renderDefault('join section');

    expect(
      screen.getByRole('link', {name: i18n.createAccount()})
    ).toHaveAttribute(
      'href',
      `/users/sign_up/account_type?user_return_to=${encodeURIComponent(
        TEST_RETURN_TO_HREF
      )}`
    );
    expect(
      screen.getByRole('link', {
        name: i18n.ltiLinkAccountExistingAccountCardActionLabel(),
      })
    ).toHaveAttribute(
      'href',
      `/users/sign_in?user_return_to=${encodeURIComponent(TEST_RETURN_TO_HREF)}`
    );
  });
});
