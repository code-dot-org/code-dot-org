import {render, screen, fireEvent} from '@testing-library/react';

import YourSchoolFormFieldset3 from '../YourSchoolFormFieldset3';

describe('YourSchoolFormFieldset3', () => {
  const defaultProps = {
    regionalPartnerURL: 'https://example.com/partner',
    privacyPolicyURL: 'https://example.com/privacy',
    formData: {
      share_with_regional_partners: false,
      opt_in: false,
    },
    onFormDataChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) =>
    render(<YourSchoolFormFieldset3 {...defaultProps} {...props} />);

  it('renders the component with correct title and checkboxes', () => {
    renderComponent();

    expect(
      screen.getByRole('group', {name: /Stay in touch?/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Share my contact information with the Code.org/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Can we email you about updates to our courses/),
    ).toBeInTheDocument();
    expect(screen.getByText('regional partner')).toHaveAttribute(
      'href',
      defaultProps.regionalPartnerURL,
    );
    expect(screen.getByText('See our privacy policy')).toHaveAttribute(
      'href',
      defaultProps.privacyPolicyURL,
    );
  });

  it('calls onFormDataChange when regional partner checkbox is clicked', () => {
    renderComponent();

    fireEvent.click(
      screen.getByLabelText(/Share my contact information with the Code.org/),
    );

    expect(defaultProps.onFormDataChange).toHaveBeenCalledWith({
      share_with_regional_partners: true,
    });
  });

  it('calls onFormDataChange when opt-in checkbox is clicked', () => {
    renderComponent();

    fireEvent.click(
      screen.getByLabelText(/Can we email you about updates to our courses/),
    );

    expect(defaultProps.onFormDataChange).toHaveBeenCalledWith({opt_in: true});
  });

  it('renders checkboxes with correct initial state', () => {
    const initialCheckedProps = {
      ...defaultProps,
      formData: {
        share_with_regional_partners: true,
        opt_in: true,
      },
    };

    renderComponent(initialCheckedProps);

    expect(
      screen.getByLabelText(/Share my contact information with the Code.org/),
    ).toBeChecked();
    expect(
      screen.getByLabelText(/Can we email you about updates to our courses/),
    ).toBeChecked();
  });
});
