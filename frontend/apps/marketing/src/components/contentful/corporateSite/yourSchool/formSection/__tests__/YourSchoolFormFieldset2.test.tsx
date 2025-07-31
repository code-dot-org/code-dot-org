import {render, screen, fireEvent} from '@testing-library/react';

import YourSchoolFormFieldset2 from '../YourSchoolFormFieldset2';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      pathname: '',
    };
  },
}));

describe('YourSchoolFormFieldset2', () => {
  const mockFormData = {
    how_many_do_hoc: '',
    how_many_after_school: '',
    how_many_10_hours: '',
    how_many_20_hours: '',
    topic_other: false,
    topic_do_not_know: false,
    topic_other_description: '',
    class_frequency: '',
    tell_us_more: '',
    other_classes_under_20_hours: false,
  };

  const mockFormErrors = {
    how_many_do_hoc: undefined,
    how_many_after_school: undefined,
    how_many_10_hours: undefined,
    how_many_20_hours: undefined,
    topic_other_description: undefined,
    class_frequency: undefined,
    tell_us_more: undefined,
  };

  const mockOnFormDataChange = jest.fn();

  const renderComponent = (props = {}) =>
    render(
      <YourSchoolFormFieldset2
        showFollowUp={false}
        showOtherDesc={false}
        formData={mockFormData}
        formErrors={mockFormErrors}
        onFormDataChange={mockOnFormDataChange}
        {...props}
      />,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all required dropdown fields', () => {
    renderComponent();

    expect(
      screen.getByRole('group', {name: /CS education at your school/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/How many students do an Hour of Code\?/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        /How many students do computer programming in an after-school program\?/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        /How many students take at least 10 hours of computer programming/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        /How many students take a semester or year-long computer science course/,
      ),
    ).toBeInTheDocument();
  });

  it('calls onFormDataChange when Hour of Code dropdown value changes', () => {
    renderComponent();

    const hocStudentCount = 'NONE';
    fireEvent.change(
      screen.getByLabelText(/How many students do an Hour of Code\?/),
      {target: {value: hocStudentCount}},
    );

    expect(mockOnFormDataChange).toHaveBeenCalledWith({
      how_many_do_hoc: hocStudentCount,
    });
  });

  it('calls onFormDataChange when after-school program dropdown value changes', () => {
    renderComponent();

    const cpStudentCount = 'SOME';
    fireEvent.change(
      screen.getByLabelText(
        /How many students do computer programming in an after-school program\?/,
      ),
      {target: {value: cpStudentCount}},
    );

    expect(mockOnFormDataChange).toHaveBeenCalledWith({
      how_many_after_school: cpStudentCount,
    });
  });

  it('calls onFormDataChange when 10 hours dropdown value changes', () => {
    renderComponent();

    fireEvent.change(
      screen.getByLabelText(
        /How many students take at least 10 hours of computer programming/,
      ),
      {target: {value: 'MOST'}},
    );

    expect(mockOnFormDataChange).toHaveBeenCalled();
    expect(mockOnFormDataChange.mock.calls[0][0]).toHaveProperty(
      'how_many_10_hours',
    );
  });

  it('calls onFormDataChange when 20 hours dropdown value changes', () => {
    renderComponent();

    const csStudentCount = 'ALL';
    fireEvent.change(
      screen.getByLabelText(
        /How many students take a semester or year-long computer science course/,
      ),
      {target: {value: csStudentCount}},
    );

    expect(mockOnFormDataChange).toHaveBeenCalledWith({
      how_many_20_hours: csStudentCount,
    });
  });

  it('renders the follow-up section when showFollowUp is true', () => {
    renderComponent({showFollowUp: true});
    expect(
      screen.getByText(
        /Your school offers a semester or year long computer science class!/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/How often per week does this class meet\?/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Please tell us more about this course/),
    ).toBeInTheDocument();
  });

  it('calls onFormDataChange when class frequency changes in follow-up section', () => {
    renderComponent({showFollowUp: true});

    fireEvent.change(
      screen.getByLabelText(/How often per week does this class meet\?/),
      {target: {value: 'ONCE'}},
    );

    expect(mockOnFormDataChange).toHaveBeenCalled();
    expect(mockOnFormDataChange.mock.calls[0][0]).toHaveProperty(
      'class_frequency',
    );
  });

  it('hides other description field when showOtherDesc is false', () => {
    renderComponent({showFollowUp: true, showOtherDesc: false});
    expect(
      screen.queryByLabelText(/If other, please describe:/),
    ).not.toBeInTheDocument();
  });

  it('renders the "other description" field when showOtherDesc is true', () => {
    renderComponent({showFollowUp: true, showOtherDesc: true});
    expect(
      screen.getByLabelText(/If other, please describe:/),
    ).toBeInTheDocument();
  });

  it('calls onFormDataChange when "other description" field changes', () => {
    renderComponent({showFollowUp: true, showOtherDesc: true});

    fireEvent.change(screen.getByLabelText(/If other, please describe:/), {
      target: {value: 'Custom curriculum'},
    });

    expect(mockOnFormDataChange).toHaveBeenCalledWith({
      topic_other_description: 'Custom curriculum',
    });
  });

  it('calls onFormDataChange when "Other classes under 20 hours" checkbox is clicked', () => {
    renderComponent();

    fireEvent.click(
      screen.getByLabelText(
        /This school teaches other computing classes that do not include at least 20 hours/,
      ),
    );

    expect(mockOnFormDataChange).toHaveBeenCalledWith({
      other_classes_under_20_hours: true,
    });
  });

  it('displays error messages for all form fields when provided', () => {
    const formErrors = {
      ...mockFormErrors,
      how_many_do_hoc: 'This field is required',
      how_many_after_school: 'Please select an option',
      how_many_10_hours: 'Please select a value',
      how_many_20_hours: 'Required field',
      topic_other_description: 'Please describe the other topic',
      class_frequency: 'Please select a frequency',
      tell_us_more: 'Please provide additional details',
    };

    renderComponent({
      showFollowUp: true,
      showOtherDesc: true,
      formErrors,
    });

    // Test error messages for dropdown fields
    expect(screen.getByText(formErrors.how_many_do_hoc)).toBeInTheDocument();
    expect(
      screen.getByText(formErrors.how_many_after_school),
    ).toBeInTheDocument();
    expect(screen.getByText(formErrors.how_many_10_hours)).toBeInTheDocument();
    expect(screen.getByText(formErrors.how_many_20_hours)).toBeInTheDocument();

    // Test error messages for follow-up section fields
    expect(screen.getByText(formErrors.class_frequency)).toBeInTheDocument();
    expect(screen.getByText(formErrors.tell_us_more)).toBeInTheDocument();

    // Test error message for "other description" field
    expect(
      screen.getByText(formErrors.topic_other_description),
    ).toBeInTheDocument();
  });
});
