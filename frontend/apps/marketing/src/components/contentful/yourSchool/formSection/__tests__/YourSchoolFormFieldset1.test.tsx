import {render, screen, fireEvent} from '@testing-library/react';

import {
  YOUR_SCHOOL_DEFAULT_FORM_DATA,
  YOUR_SCHOOL_ROLES,
} from '../../constants';
import {School, YourSchoolFormData} from '../../types';
import YourSchoolFormFieldset1 from '../YourSchoolFormFieldset1';

const school: School = {
  nces_id: 'school123',
  name: 'Test School',
  city: 'Test City',
  state: 'CA',
};
jest.mock('@/components/contentful/schoolSearchFieldset', () => ({
  __esModule: true,
  default: ({
    onSelect,
    school,
    errorMessage,
  }: {
    onSelect: (school: School | null) => void;
    school: School | null;
    errorMessage?: string;
  }) => (
    <div data-testid="school-search-fieldset">
      <button data-testid="mock-school-select" onClick={() => onSelect(school)}>
        Select School
      </button>
      {school && <div data-testid="selected-school">{school.name}</div>}
      {errorMessage && <div data-testid="school-error">{errorMessage}</div>}
    </div>
  ),
}));

describe('YourSchoolFormFieldset1', () => {
  const mockFormData: YourSchoolFormData = {
    ...YOUR_SCHOOL_DEFAULT_FORM_DATA,
    submitter_email_address: 'test@example.com',
    submitter_name: 'Test User',
    submitter_role: YOUR_SCHOOL_ROLES.Teacher,
  };

  const mockFormErrors = {
    submitter_email_address: undefined,
    submitter_name: undefined,
    submitter_role: undefined,
    nces_school_s: undefined,
  };

  const mockOnFormDataChange = jest.fn();

  const renderComponent = (props = {}) =>
    render(
      <YourSchoolFormFieldset1
        formData={mockFormData}
        formErrors={mockFormErrors}
        onFormDataChange={mockOnFormDataChange}
        {...props}
      />,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays form data correctly', () => {
    renderComponent({school});

    expect(
      screen.getByRole('group', {name: /Let's gather a few details first/i}),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('What is your email address?')).toHaveValue(
      mockFormData.submitter_email_address,
    );
    expect(screen.getByLabelText('Full Name')).toHaveValue(
      mockFormData.submitter_name,
    );
    expect(
      screen.getByLabelText('What is your connection to this school?'),
    ).toHaveValue(YOUR_SCHOOL_ROLES.Teacher);
  });

  it('calls onFormDataChange when email is changed', () => {
    renderComponent();

    const email = 'new@example.com';
    const emailInput = screen.getByLabelText('What is your email address?');
    fireEvent.change(emailInput, {target: {value: email}});

    expect(mockOnFormDataChange).toHaveBeenCalledWith({
      submitter_email_address: email,
    });
  });

  it('calls onFormDataChange when name is changed', () => {
    renderComponent();

    const name = 'New Name';
    const nameInput = screen.getByLabelText('Full Name');
    fireEvent.change(nameInput, {target: {value: name}});

    expect(mockOnFormDataChange).toHaveBeenCalledWith({submitter_name: name});
  });

  it('calls onFormDataChange when role is changed', () => {
    renderComponent();

    const roleDropdown = screen.getByLabelText(
      'What is your connection to this school?',
    );
    fireEvent.change(roleDropdown, {
      target: {value: YOUR_SCHOOL_ROLES.Administrator},
    });

    expect(mockOnFormDataChange).toHaveBeenCalledWith({
      submitter_role: YOUR_SCHOOL_ROLES.Administrator,
    });
  });

  it('displays error messages when provided', () => {
    const formErrors = {
      ...mockFormErrors,
      submitter_email_address: 'Please enter a valid email',
      nces_school_s: 'Please select a school',
    };

    renderComponent({formErrors});

    expect(
      screen.getByText(formErrors.submitter_email_address),
    ).toBeInTheDocument();
    expect(screen.getByTestId('school-error')).toHaveTextContent(
      formErrors.nces_school_s,
    );
  });
});
