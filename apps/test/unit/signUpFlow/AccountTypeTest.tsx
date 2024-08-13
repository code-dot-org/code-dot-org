import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import AccountType from '@cdo/apps/signUpFlow/AccountType';
import locale from '@cdo/apps/signUpFlow/locale';

describe('SelectAccountType', () => {
  function renderDefault() {
    render(<AccountType />);
  }

  it('renders student and teacher account type card options', () => {
    renderDefault();

    // Renders page title
    screen.getByText(locale.create_your_free_account());

    // Renders student card title, one item from the list, and button
    screen.getByText(locale.im_a_student());
    screen.getByText(locale.save_projects_and_progress());
    screen.getByText(locale.sign_up_as_a_student());

    // Renders teacher card title, one item from the list, and button
    screen.getByText(locale.im_a_teacher());
    screen.getByText(locale.create_classroom_sections());
    screen.getByText(locale.sign_up_as_a_teacher());
  });

  it('renders free curriculum popup dialog', () => {
    renderDefault();

    // Renders free curriculum button (styled as a text link)
    const freeCurriculumButton = screen.getByText(
      locale.read_our_commitment_free()
    );

    // Shows the free curriculum dialog when the button is clicked
    fireEvent.click(freeCurriculumButton);

    // Render the popup dialog
    screen.getByText(locale.our_commitment_to_free_curriculum());

    // Renders the return to sign up button
    const returnToSignUpButton = screen.getByText(locale.return_to_signup());

    // Closes the dialog when the return to sign up button is clicked
    fireEvent.click(returnToSignUpButton);
    expect(
      screen.queryByText(locale.our_commitment_to_free_curriculum())
    ).toBeNull();
  });
});
