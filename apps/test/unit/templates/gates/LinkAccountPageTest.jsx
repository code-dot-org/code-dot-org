import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import LinkAccountPage from '@cdo/apps/templates/gates/LinkAccountPage';
import i18n from '@cdo/locale';

const NEW_ACCOUNT_URL = '/test/new-account-url';
const EXISTING_ACCOUNT_URL = '/test/existing-account-url';

const renderDefault = sourcePage => {
  render(
    <LinkAccountPage
      sourcePage={sourcePage}
      newAccountUrl={NEW_ACCOUNT_URL}
      existingAccountUrl={EXISTING_ACCOUNT_URL}
    />
  );
};

describe('LinkAccountPage', () => {
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
    ).toHaveAttribute('href', NEW_ACCOUNT_URL);
    expect(
      screen.getByRole('link', {
        name: i18n.ltiLinkAccountExistingAccountCardActionLabel(),
      })
    ).toHaveAttribute('href', EXISTING_ACCOUNT_URL);
  });
});
