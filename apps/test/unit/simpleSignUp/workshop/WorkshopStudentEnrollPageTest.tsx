import {render, screen, within} from '@testing-library/react';
import React from 'react';

import WorkshopStudentEnrollPage from '@cdo/apps/simpleSignUp/workshop/WorkshopStudentEnrollPage';
import i18n from '@cdo/locale';

describe('Workshop Link Account Page Tests', () => {
  function renderDefault() {
    render(<WorkshopStudentEnrollPage />);
  }

  describe('Workshop Student Enroll shows Keep Student Account Card Tests', () => {
    it('should render a keep student account card', () => {
      renderDefault();

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
        i18n.accountKeepStudentAccountCardContent()
      );
      // Should have button that navigates to student homepage
      withinKeepStudentAccountCard.getByText(
        i18n.accountKeepStudentAccountCardButton()
      );
      expect(
        withinKeepStudentAccountCard.getByRole('link').getAttribute('href')
      ).toBe('/home');
    });
  });

  describe('Workshop Student Enroll shows Switch to Teacher Account Card Tests', () => {
    it('should render a switch to teacher account card', async () => {
      renderDefault();

      const switchToTeacherAccountCard = screen.getByTestId(
        'switch-to-teacher-account-card'
      );
      const withinSwitchToTeacherAccountCard = within(
        switchToTeacherAccountCard
      );

      // Should render header
      withinSwitchToTeacherAccountCard.getByText(
        i18n.accountSwitchTeacherAccountCardTitle()
      );
      // Should render card content
      withinSwitchToTeacherAccountCard.getByText(
        i18n.accountSwitchTeacherAccountCardContent()
      );
      // Should have button that navigates to account edit page
      withinSwitchToTeacherAccountCard.getByText(
        i18n.accountSwitchTeacherAccountCardButton()
      );
      expect(
        withinSwitchToTeacherAccountCard.getByRole('link').getAttribute('href')
      ).toBe('/users/edit');
    });
  });
});
