import '@testing-library/jest-dom';
import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import FinishTeacherAccount from '@cdo/apps/signUpFlow/FinishTeacherAccount';
import locale from '@cdo/apps/signUpFlow/locale';
import {
  DISPLAY_NAME_SESSION_KEY,
  EMAIL_OPT_IN_SESSION_KEY,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';

// mocking SchoolDataInputs as it has its own tests
jest.mock('@cdo/apps/templates/SchoolDataInputs', () => () => (
  <div>Mocked SchoolDataInputs</div>
));

describe('FinishTeacherAccount', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('renders the finish teacher account page', () => {
    render(<FinishTeacherAccount usIp={true} />);

    expect(
      screen.getByText(locale.finish_creating_teacher_account())
    ).toBeInTheDocument();
    expect(
      screen.getByText(locale.what_do_you_want_to_be_called())
    ).toBeInTheDocument();
    expect(screen.getByText(locale.keep_me_updated())).toBeInTheDocument();
    expect(screen.getByText('Mocked SchoolDataInputs')).toBeInTheDocument();
    expect(screen.getByText(locale.go_to_my_account())).toBeInTheDocument();
  });

  it('displays name error message if the name is left empty', () => {
    render(<FinishTeacherAccount usIp={true} />);
    const nameInput = screen.getByLabelText(
      locale.what_do_you_want_to_be_called()
    );

    fireEvent.change(nameInput, {target: {value: 'Bill'}});
    fireEvent.change(nameInput, {target: {value: ''}});

    expect(
      screen.getByText(locale.display_name_error_message())
    ).toBeInTheDocument();
  });

  it('does not display name error message if a valid name is entered', () => {
    render(<FinishTeacherAccount usIp={true} />);
    const nameInput = screen.getByLabelText(
      locale.what_do_you_want_to_be_called()
    );

    fireEvent.change(nameInput, {target: {value: 'John Doe'}});

    expect(
      screen.queryByText(locale.display_name_error_message())
    ).not.toBeInTheDocument();
  });

  it('enables the finish sign-up button when a name is entered', () => {
    render(<FinishTeacherAccount usIp={true} />);
    const nameInput = screen.getByLabelText(
      locale.what_do_you_want_to_be_called()
    );
    const finishButton = screen.getByRole('button', locale.go_to_my_account());

    expect(finishButton).toBeDisabled();

    fireEvent.change(nameInput, {target: {value: 'John Doe'}});

    expect(finishButton).toBeEnabled();
  });

  it('stores the name in sessionStorage when it is entered', () => {
    render(<FinishTeacherAccount usIp={true} />);
    const nameInput = screen.getByLabelText(
      locale.what_do_you_want_to_be_called()
    );

    fireEvent.change(nameInput, {target: {value: 'John Doe'}});

    expect(sessionStorage.getItem(DISPLAY_NAME_SESSION_KEY)).toBe('John Doe');
  });

  it('toggles the email opt-in checkbox and stores the value in sessionStorage', () => {
    render(<FinishTeacherAccount usIp={true} />);
    const emailOptInCheckbox = screen.getByLabelText(
      locale.get_informational_emails()
    );

    expect(emailOptInCheckbox).not.toBeChecked();

    fireEvent.click(emailOptInCheckbox);

    expect(emailOptInCheckbox).toBeChecked();
    expect(sessionStorage.getItem(EMAIL_OPT_IN_SESSION_KEY)).toBe('true');

    fireEvent.click(emailOptInCheckbox);

    expect(emailOptInCheckbox).not.toBeChecked();
    expect(sessionStorage.getItem(EMAIL_OPT_IN_SESSION_KEY)).toBe('false');
  });
});
