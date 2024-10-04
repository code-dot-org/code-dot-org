import {render, screen, fireEvent, act, waitFor} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import FinishStudentAccount from '@cdo/apps/signUpFlow/FinishStudentAccount';
import locale from '@cdo/apps/signUpFlow/locale';

describe('FinishStudentAccount', () => {
  let fetchStub: sinon.SinonStub;
  const ageOptions = [
    {value: '', text: ''},
    {value: '4', text: '4'},
    {value: '5', text: '5'},
    {value: '6', text: '6'},
  ];

  const usStateOptions = [
    {value: '', text: ''},
    {value: 'AZ', text: 'Arizona'},
    {value: 'NY', text: 'New York'},
    {value: 'WA', text: 'Washington'},
  ];

  beforeEach(() => {
    fetchStub = sinon.stub(window, 'fetch').resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve({gdpr: false, force_in_eu: false}),
    } as Response);
  });

  afterEach(() => {
    sessionStorage.clear();
    fetchStub.restore();
  });

  function renderDefault(usIp: boolean = true) {
    render(
      <FinishStudentAccount
        ageOptions={ageOptions}
        usIp={usIp}
        usStateOptions={usStateOptions}
      />
    );
  }

  it('renders finish student account page fields', () => {
    renderDefault();

    // Renders page title
    screen.getByText(locale.finish_creating_student_account());

    // Renders student questions
    screen.getByText(locale.i_am_a_parent_or_guardian());
    screen.getByText(locale.display_name_eg());
    screen.getByText(locale.what_is_your_age());
    screen.getByText(locale.what_state_are_you_in());
    screen.getByText(locale.what_is_your_gender());

    // Renders button that finishes sign-up
    screen.getByText(locale.go_to_my_account());

    // Does not render parent questions if parent checkbox is unchecked
    expect(screen.queryByText(locale.parent_guardian_email())).toBe(null);
    expect(screen.queryByText(locale.keep_me_updated())).toBe(null);
  });

  it('renders finish student account page fields with parent fields when parent checkbox is checked', () => {
    renderDefault();

    // Click parent checkbox
    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    // Renders page title
    screen.getByText(locale.finish_creating_student_account());

    // Renders parent questions
    screen.getByText(locale.parent_guardian_email());
    screen.getByText(locale.keep_me_updated());

    // Renders student questions
    screen.getByText(locale.i_am_a_parent_or_guardian());
    screen.getByText(locale.display_name_eg());
    screen.getByText(locale.what_is_your_age());
    screen.getByText(locale.what_state_are_you_in());
    screen.getByText(locale.what_is_your_gender());

    // Renders button that finishes sign-up
    screen.getByText(locale.go_to_my_account());
  });

  it('does not render state question if user is not detected in the U.S.', () => {
    renderDefault(false);

    expect(screen.queryByText(locale.what_state_are_you_in())).toBe(null);
    expect(screen.queryByText(locale.state_error_message())).toBe(null);
  });

  it('finish student signup button starts disabled', () => {
    renderDefault();

    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');
  });

  it('leaving the displayName field empty shows error message and disabled submit button until display name is entered', async () => {
    renderDefault();
    await waitFor(() => {
      expect(fetchStub.calledOnce).toBe(true);
    });
    const displayNameInput = screen.getAllByDisplayValue('')[1];
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });

    // Set other required fields
    const ageInput = screen.getAllByRole('combobox')[0];
    const stateInput = screen.getAllByRole('combobox')[1];
    fireEvent.change(ageInput, {target: {value: '6'}});
    fireEvent.change(stateInput, {target: {value: 'WA'}});

    // Error message doesn't show and button is disabled by default
    expect(screen.queryByText(locale.display_name_error_message())).toBe(null);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');

    // Enter display name
    fireEvent.change(displayNameInput, {target: {value: 'FirstName'}});

    // Error does not show and button is enabled when display name is entered
    expect(screen.queryByText(locale.display_name_error_message())).toBe(null);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe(null);

    // Clear display name
    fireEvent.change(displayNameInput, {target: {value: ''}});

    // Error shows and button is disabled with empty display name
    screen.getByText(locale.display_name_error_message());
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');
  });

  it('leaving the age field empty shows error message and disabled submit button until age is entered', async () => {
    renderDefault();
    await waitFor(() => {
      expect(fetchStub.calledOnce).toBe(true);
    });
    const ageInput = screen.getAllByRole('combobox')[0];
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });

    // Set other required fields
    const displayNameInput = screen.getAllByDisplayValue('')[1];
    const stateInput = screen.getAllByRole('combobox')[1];
    fireEvent.change(displayNameInput, {target: {value: 'FirstName'}});
    fireEvent.change(stateInput, {target: {value: 'WA'}});

    // Error message doesn't show and button is disabled by default
    expect(screen.queryByText(locale.age_error_message())).toBe(null);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');

    // Enter age
    fireEvent.change(ageInput, {target: {value: '6'}});

    // Error does not show and button is enabled when age is entered
    expect(screen.queryByText(locale.age_error_message())).toBe(null);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe(null);

    // Clear age
    fireEvent.change(ageInput, {target: {value: ''}});

    // Error shows and button is disabled with empty age
    screen.getByText(locale.age_error_message());
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');
  });

  it('leaving the state field empty shows error message and disabled submit button until state is entered for US users', async () => {
    renderDefault();
    await waitFor(() => {
      expect(fetchStub.calledOnce).toBe(true);
    });
    const stateInput = screen.getAllByRole('combobox')[1];
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });

    // Set other required fields
    const displayNameInput = screen.getAllByDisplayValue('')[1];
    const ageInput = screen.getAllByRole('combobox')[0];
    fireEvent.change(displayNameInput, {target: {value: 'FirstName'}});
    fireEvent.change(ageInput, {target: {value: '6'}});

    // Error message doesn't show and button is disabled by default
    expect(screen.queryByText(locale.state_error_message())).toBe(null);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');

    // Enter state
    fireEvent.change(stateInput, {target: {value: 'WA'}});

    // Error does not show and button is enabled when state is entered
    expect(screen.queryByText(locale.state_error_message())).toBe(null);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe(null);

    // Clear state
    fireEvent.change(stateInput, {target: {value: ''}});

    // Error shows and button is disabled with empty state
    screen.getByText(locale.state_error_message());
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');
  });

  it('state field is not required if user is not detected in the U.S.', async () => {
    renderDefault(false);
    await waitFor(() => {
      expect(fetchStub.calledOnce).toBe(true);
    });
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });

    // Set all required fields (which excludes 'state' in this case)
    const displayNameInput = screen.getAllByDisplayValue('')[1];
    const ageInput = screen.getAllByRole('combobox')[0];
    fireEvent.change(displayNameInput, {target: {value: 'FirstName'}});
    fireEvent.change(ageInput, {target: {value: '6'}});

    // Button is enabled without having to enter anything for 'state'
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe(null);
  });

  it('parentEmail error shows if parent checkbox is selected and parentEmail is selected then cleared', async () => {
    renderDefault();
    await waitFor(() => {
      expect(fetchStub.calledOnce).toBe(true);
    });
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });

    // Set other required fields
    const displayNameInput = screen.getAllByDisplayValue('')[1];
    const stateInput = screen.getAllByRole('combobox')[1];
    const ageInput = screen.getAllByRole('combobox')[0];
    fireEvent.change(displayNameInput, {target: {value: 'FirstName'}});
    fireEvent.change(stateInput, {target: {value: 'WA'}});
    fireEvent.change(ageInput, {target: {value: '6'}});

    // Button is enabled after required fields are filled before parent checkbox is checked
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe(null);

    // Check parent checkbox
    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    // Error message doesn't show and button is disabled after parent checkbox is checked
    const parentEmailInput = screen.getAllByDisplayValue('')[1];
    expect(screen.queryByText(locale.email_error_message())).toBe(null);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');

    // Enter state
    fireEvent.change(parentEmailInput, {target: {value: 'parent@email.com'}});

    // Error does not show and button is enabled when email is entered
    expect(screen.queryByText(locale.email_error_message())).toBe(null);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe(null);

    // Clear state
    fireEvent.change(parentEmailInput, {target: {value: ''}});

    // Error shows and button is disabled with empty email
    screen.getByText(locale.email_error_message());
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');
  });

  it('GDPR has expected behavior if api call returns true', async () => {
    act(() => {
      fetchStub.callsFake(() => {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({gdpr: true, force_in_eu: false}),
        } as Response);
      });
    });
    renderDefault();

    // Check that GDPR message is displayed
    await screen.findByText(locale.data_transfer_notice());

    // Check that button is disabled until GDPR is checked (and other required fields are filled)
    const displayNameInput = screen.getAllByDisplayValue('')[1];
    const stateInput = screen.getAllByRole('combobox')[1];
    const ageInput = screen.getAllByRole('combobox')[0];
    fireEvent.change(displayNameInput, {target: {value: 'FirstName'}});
    fireEvent.change(stateInput, {target: {value: 'WA'}});
    fireEvent.change(ageInput, {target: {value: '6'}});
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe(null);
  });
});
