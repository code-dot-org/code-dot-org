import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import TeacherAccountRequiredPage from '@cdo/apps/templates/gates/TeacherAccountRequiredPage';
import i18n from '@cdo/locale';

const EDIT_ACCOUNT_URL = '/test/edit-account-url';

describe('TeacherAccountRequiredPage', () => {
  it('renders page with links to the homepage and the provided edit account link', () => {
    render(
      <TeacherAccountRequiredPage
        sourcePage={'test-source-page'}
        editAccountLink={EDIT_ACCOUNT_URL}
      />
    );

    screen.getByText(i18n.accountNeedTeacherAccountWelcomeBannerHeaderLabel());
    expect(
      screen.getByRole('link', {
        name: i18n.accountKeepStudentAccountCardButton(),
      })
    ).toHaveAttribute('href', '/home');
    expect(
      screen.getByRole('link', {
        name: i18n.accountSwitchTeacherAccountCardButton(),
      })
    ).toHaveAttribute('href', EDIT_ACCOUNT_URL);
  });
});
