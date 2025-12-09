import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import {
  AccountInformation,
  ACCOUNT_UPDATE_SUCCESS,
} from '@cdo/apps/accounts/AccountInformation';

const mockWindowLocation = {
  href: '',
  reload: jest.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockWindowLocation,
  writable: true,
});

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store = {};

  return {
    getItem: jest.fn().mockImplementation(key => {
      return store[key] || null;
    }),
    setItem: jest.fn().mockImplementation((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn(),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {value: mockSessionStorage});

jest.mock('@cdo/apps/util/AuthenticityTokenStore');

const defaultProps = {
  verifiedTeacher: false,
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
  userDisplayName: 'Mr. Doe',
  userUsername: 'johndoe',
  userGivenName: '',
  userFamilyName: '',
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
    mockSessionStorage.setItem.mockReset();
    mockSessionStorage.getItem.mockReset();
  });

  it('renders account information form', () => {
    render(<AccountInformation {...defaultProps} />);
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password confirmation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /update account information/i})
    ).toBeInTheDocument();
  });

  it('displays authorized teacher badge when verifiedTeacher is true', () => {
    render(<AccountInformation {...defaultProps} verifiedTeacher={true} />);
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

  it('only passes available student fields into update call for students', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    render(
      <AccountInformation
        {...defaultProps}
        userDisplayName="Student Name"
        userType="student"
        isStudent={true}
        userUsername="StudentUsername"
        showGenderInput={true}
      />
    );

    fireEvent.change(screen.getByLabelText(/age/i), {
      target: {value: '14'},
    });
    fireEvent.change(screen.getByLabelText(/state/i), {
      target: {value: 'CA'},
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
        name: 'Student Name',
        username: 'StudentUsername',
        password: '',
        password_confirmation: '',
        current_password: '',
        age: '14',
        gender_student_input: '',
        us_state: 'CA',
      },
    });
  });

  it('only passes available teacher fields into update call for teachers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    render(<AccountInformation {...defaultProps} />);

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
        name: 'Mr. Doe',
        username: 'johndoe',
        given_name: '',
        family_name: '',
        educator_role: undefined,
        password: '',
        password_confirmation: '',
        current_password: '',
        age: '21+',
      },
    });
  });

  it('only passes available facilitator fields into update call for facilitators', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    const userFacilitatorBio =
      'This is a facilitator bio with a long enough description.';
    render(
      <AccountInformation
        {...defaultProps}
        isFacilitator={true}
        userFacilitatorBio={userFacilitatorBio}
      />
    );

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
        name: 'Mr. Doe',
        username: 'johndoe',
        given_name: '',
        family_name: '',
        password: '',
        password_confirmation: '',
        current_password: '',
        age: '21+',
        facilitator_info_attributes: {bio: userFacilitatorBio},
      },
    });
  });

  it('submits form with updated information and displays success alert', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    render(<AccountInformation {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: {value: 'Ms. Doe'},
    });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: {value: 'janedoe'},
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: {value: 'Jane'},
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: {value: 'Doe'},
    });
    fireEvent.change(screen.getByLabelText(/what is your primary role/i), {
      target: {value: 'classroom_teacher'},
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
        name: 'Ms. Doe',
        username: 'janedoe',
        given_name: 'Jane',
        family_name: 'Doe',
        educator_role: 'classroom_teacher',
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

  it('does not render given and family name fields when isStudent is true', () => {
    render(
      <AccountInformation
        {...defaultProps}
        userType={'student'}
        isStudent={true}
      />
    );

    expect(screen.queryByText(/first name/i)).toBe(null);
    expect(screen.queryByText(/last name/i)).toBe(null);
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

  it('reloads the page and sets sessionStorage if student changes their age or state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    render(
      <AccountInformation
        {...defaultProps}
        isStudent={true}
        userType={'student'}
        studentInLockoutFlow={false}
      />
    );

    fireEvent.change(screen.getByLabelText(/age/i), {
      target: {value: '8'},
    });
    fireEvent.change(screen.getByLabelText(/state/i), {
      target: {value: 'CO'},
    });

    fireEvent.click(
      screen.getByRole('button', {name: /update account information/i})
    );

    await waitFor(() => {
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        ACCOUNT_UPDATE_SUCCESS,
        'true'
      );

      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  it('shows the success message when the component mounts if reloading', async () => {
    mockSessionStorage.getItem.mockReturnValueOnce('true');
    render(
      <AccountInformation
        {...defaultProps}
        isStudent={true}
        userType={'student'}
        studentInLockoutFlow={false}
      />
    );

    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
      ACCOUNT_UPDATE_SUCCESS
    );
    expect(
      screen.getByText(/account information successfully updated/i)
    ).toBeInTheDocument();
  });

  it('renders no facilitator info fields when user is not facilitator', () => {
    render(<AccountInformation {...defaultProps} isFacilitator={false} />);

    expect(
      screen.queryByRole('textbox', {name: /Facilitator biography/i})
    ).not.toBeInTheDocument();
  });

  it('renders facilitator info fields when user is facilitator', () => {
    const userFacilitatorBio = 'This is a facilitator bio';

    render(
      <AccountInformation
        {...defaultProps}
        isFacilitator={true}
        userFacilitatorBio={userFacilitatorBio}
      />
    );

    const facilitatorBioTextarea = screen.getByRole('textbox', {
      name: /Facilitator biography/i,
    });
    expect(facilitatorBioTextarea).toBeInTheDocument();
    expect(facilitatorBioTextarea.value).toBe(userFacilitatorBio);
  });

  it('does not block updates if user never had an educator_role', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    render(<AccountInformation {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: {value: 'coder1'},
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
        name: 'Mr. Doe',
        username: 'coder1',
        given_name: '',
        family_name: '',
        educator_role: undefined,
        password: '',
        password_confirmation: '',
        current_password: '',
        age: '21+',
        gender_student_input: undefined,
        us_state: undefined,
        country_code: undefined,
      },
    });
  });

  it('does not allow removing educator_role after it is set', () => {
    render(<AccountInformation {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/what is your primary role/i), {
      target: {value: 'classroom_teacher'},
    });

    const roleErrorText = 'Educator role cannot be removed.';

    expect(screen.queryByText(roleErrorText)).not.toBeInTheDocument();

    // attempt to clear educator_role value
    fireEvent.change(screen.getByLabelText(/what is your primary role/i), {
      target: {value: ''},
    });

    expect(screen.getByText(roleErrorText)).toBeInTheDocument();

    // educator_role cannot be cleared once it is set
    expect(screen.getByLabelText(/what is your primary role/i).value).toBe(
      'classroom_teacher'
    );
  });
});
