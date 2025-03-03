import {render, screen} from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import {studio} from '@cdo/apps/lib/util/urlHelpers';
import JoinSectionLinkAccountPage from '@cdo/apps/templates/sectionsRefresh/JoinSectionLinkAccountPage';
import i18n from '@cdo/locale';

describe('JoinSectionLinkAccountPage', () => {
  const signUpUrlBase =
    '/users/new_sign_up/login_type?user_type=student&user_return_to=/join';
  const logInUrlBase = '/users/sign_in?user_return_to=/join';

  it('renders page with links returning user to /join when no section code provided', () => {
    render(<JoinSectionLinkAccountPage sectionCode={''} />);

    screen.getByText(i18n.accountNeededJoinSectionWithoutCodeBannerLabel());

    // Create account button sends user to sign up flow with return url of /join.
    const createAccountButton = screen.getByRole('link', {
      name: i18n.createAccount(),
    });
    expect(createAccountButton).toHaveAttribute('href', studio(signUpUrlBase));

    // Log in with existing account button sends user to log in flow with return url of /join.
    const existingAccountButton = screen.getByRole('link', {
      name: i18n.ltiLinkAccountExistingAccountCardActionLabel(),
    });
    expect(existingAccountButton).toHaveAttribute('href', studio(logInUrlBase));
  });

  it('renders page with links returning user to /join/[section_code] when section code provided', () => {
    const testSectionCode = 'AAAAAA';

    render(<JoinSectionLinkAccountPage sectionCode={testSectionCode} />);

    screen.getByText(
      i18n.accountNeededJoinSectionWithCodeBannerLabel({
        sectionCode: testSectionCode,
      })
    );

    // Create account button sends user to sign up flow with return url of /join.
    const createAccountButton = screen.getByRole('link', {
      name: i18n.createAccount(),
    });
    expect(createAccountButton).toHaveAttribute(
      'href',
      studio(signUpUrlBase + `/${testSectionCode}`)
    );

    // Log in with existing account button sends user to log in flow with return url of /join.
    const existingAccountButton = screen.getByRole('link', {
      name: i18n.ltiLinkAccountExistingAccountCardActionLabel(),
    });
    expect(existingAccountButton).toHaveAttribute(
      'href',
      studio(logInUrlBase + `/${testSectionCode}`)
    );
  });
});
