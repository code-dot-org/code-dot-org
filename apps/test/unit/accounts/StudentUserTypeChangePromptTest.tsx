import {render, screen, within} from '@testing-library/react';
import React from 'react';

import StudentUserTypeChangePrompt from '@cdo/apps/accounts/StudentUserTypeChangePrompt';
import i18n from '@cdo/locale';

describe('StudentUserTypeChangePrompt Tests', () => {
  function renderDefault(props = {}) {
    render(<StudentUserTypeChangePrompt {...props} />);
  }

  it('should render the header', () => {
    renderDefault();

    screen.getByText(i18n.accountNeedTeacherAccountWelcomeBannerHeaderLabel());
    screen.getByText(
      i18n.accountNeedTeacherAccountWelcomeBannerHeaderDescGeneric()
    );
  });

  it('should render a keep student account card', () => {
    renderDefault();

    // eslint-disable-next-line no-restricted-properties
    const keepStudentAccountCard = screen.getByTestId(
      'keep-student-account-card'
    );
    const withinKeepStudentAccountCard = within(keepStudentAccountCard);

    // Should render header
    withinKeepStudentAccountCard.getByText(
      i18n.accountKeepStudentAccountCardTitle()
    );
    // Should render card content
    withinKeepStudentAccountCard.getByText(
      i18n.accountKeepStudentAccountCardContentGeneric()
    );
    // Should have button that navigates to student homepage
    withinKeepStudentAccountCard.getByText(
      i18n.accountKeepStudentAccountCardButton()
    );
    expect(
      withinKeepStudentAccountCard.getByRole('link').getAttribute('href')
    ).toBe('/home');
  });

  it('should render a switch to teacher account card', () => {
    renderDefault();

    // eslint-disable-next-line no-restricted-properties
    const switchToTeacherAccountCard = screen.getByTestId(
      'switch-to-teacher-account-card'
    );
    const withinSwitchToTeacherAccountCard = within(switchToTeacherAccountCard);

    // Should render header
    withinSwitchToTeacherAccountCard.getByText(
      i18n.accountSwitchTeacherAccountCardTitle()
    );
    // Should render card content
    withinSwitchToTeacherAccountCard.getByText(
      i18n.accountSwitchTeacherAccountCardContentGeneric()
    );
    // Should have button that navigates to account edit page
    withinSwitchToTeacherAccountCard.getByText(
      i18n.accountSwitchTeacherAccountCardButton()
    );
    expect(
      withinSwitchToTeacherAccountCard.getByRole('link').getAttribute('href')
    ).toBe('/users/edit#change-user-type-modal-form');
  });

  it('should add a user_return_to param in the account change link', () => {
    const userReturnTo = '/fake/url';
    renderDefault({userReturnTo});

    // eslint-disable-next-line no-restricted-properties
    const switchToTeacherAccountCard = screen.getByTestId(
      'switch-to-teacher-account-card'
    );
    const withinSwitchToTeacherAccountCard = within(switchToTeacherAccountCard);

    expect(
      withinSwitchToTeacherAccountCard.getByRole('link').getAttribute('href')
    ).toBe(
      `/users/edit?user_return_to=${encodeURIComponent(
        userReturnTo
      )}#change-user-type-modal-form`
    );
  });
});
