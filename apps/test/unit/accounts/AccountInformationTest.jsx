import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import {AccountInformation} from '@cdo/apps/accounts/AccountInformation';

const mockWindowLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockWindowLocation,
  writable: true,
});

jest.mock('@cdo/apps/util/AuthenticityTokenStore');

const defaultProps = {
  authorizedTeacher: false,
  secretPictureAccountOnly: false,
  teacherManagedAccount: false,
  parentManagedAccount: false,
  shouldSeeEditEmailLink: true,
  isPasswordRequired: true,
  isStudent: false,
  migrated: false,
  encryptedPasswordPresent: true,
  canEditPassword: true,
  sponsored: false,
  studentInLockoutFlow: false,
  showGenderInput: false,
  isUSA: true,
  ageDropdownOptions: ['13', '14', '15', '16', '17', '18+'],
  usStateDropdownOptions: [
    ['California', 'CA'],
    ['New York', 'NY'],
  ],
  userDisplayName: 'John Doe',
  userUsername: 'johndoe',
  userEmail: 'john@example.com',
  userType: 'teacher',
  userProperties: {},
};

describe('AccountInformation', () => {
  let mockFetch;
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.fn();
    window.fetch = mockFetch;
    mockWindowLocation.href = '';
  });

  it('renders account information form', () => {
    render(<AccountInformation {...defaultProps} />);
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password confirmation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /update account information/i})
    ).toBeInTheDocument();
  });

  it('displays authorized teacher badge when authorizedTeacher is true', () => {
    render(<AccountInformation {...defaultProps} authorizedTeacher={true} />);
    expect(screen.getByText(/✔ verified teacher/i)).toBeInTheDocument();
  });

  it('displays edit email link when shouldSeeEditEmailLink is true', () => {
    render(<AccountInformation {...defaultProps} />);
    expect(
      screen.getByRole('button', {name: /update email/i})
    ).toBeInTheDocument();
  });

  it('hides edit email link when shouldSeeEditEmailLink is false', () => {
    render(
      <AccountInformation {...defaultProps} shouldSeeEditEmailLink={false} />
    );
    expect(screen.queryByRole('button', {name: /update email/i})).toBeNull();
  });

  it('opens change email modal when edit email link is clicked', () => {
    render(<AccountInformation {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', {name: /update email/i}));
    expect(
      screen.getByRole('heading', {name: /update email address/i})
    ).toBeInTheDocument();
  });

  it('submits form with updated information and displays success alert', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    render(<AccountInformation {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: {value: 'Jane Doe'},
    });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: {value: 'janedoe'},
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: {value: 'newpassword'},
    });
    fireEvent.change(screen.getByLabelText(/password confirmation/i), {
      target: {value: 'newpassword'},
    });
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: {value: 'currentpassword'},
    });

    fireEvent.click(
      screen.getByRole('button', {name: /update account information/i})
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/users', expect.any(Object));
      expect(
        screen.getByText(/account information successfully updated/i)
      ).toBeInTheDocument();
    });

    const fetchArgs = mockFetch.mock.calls[0][1];
    expect(JSON.parse(fetchArgs.body)).toEqual({
      user: {
        name: 'Jane Doe',
        username: 'janedoe',
        password: 'newpassword',
        password_confirmation: 'newpassword',
        current_password: 'currentpassword',
        age: '21+',
        gender_student_input: undefined,
        us_state: undefined,
        country_code: undefined,
      },
    });
  });

  it('displays error messages when form submission fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          name: ['Name is too short'],
          username: ['Username is already taken'],
        }),
    });

    render(<AccountInformation {...defaultProps} />);

    fireEvent.click(
      screen.getByRole('button', {name: /update account information/i})
    );

    await waitFor(() => {
      expect(screen.getByText('Name is too short')).toBeInTheDocument();
      expect(screen.getByText('Username is already taken')).toBeInTheDocument();
      expect(
        screen.getByText('Review errors above and try again.')
      ).toBeInTheDocument();
    });
  });

  it('renders student-specific fields when isStudent is true', () => {
    render(
      <AccountInformation
        {...defaultProps}
        userType={'student'}
        isStudent={true}
        showGenderInput={true}
      />
    );
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
  });

  it('disables student-specific fields when studentInLockoutFlow is true', () => {
    render(
      <AccountInformation
        {...defaultProps}
        isStudent={true}
        userType={'student'}
        studentInLockoutFlow={true}
      />
    );
    expect(screen.getByLabelText(/age/i)).toBeDisabled();
    expect(screen.getByLabelText(/state/i)).toBeDisabled();
  });
});
