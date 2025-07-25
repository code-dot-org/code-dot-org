import {render, screen} from '@testing-library/react';

import {YOUR_SCHOOL_FORM_ID} from '../../constants';
import YourSchoolForm from '../YourSchoolForm';
import YourSchoolFormSection from '../YourSchoolFormSection';

jest.mock('../YourSchoolForm', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="mocked-your-school-form" />),
}));

describe('YourSchoolFormSection', () => {
  const defaultProps = {
    regionalPartnerURL: 'https://example.com/partner',
    privacyPolicyURL: 'https://example.com/privacy',
  };

  const renderComponent = (props = {}) =>
    render(<YourSchoolFormSection {...defaultProps} {...props} />);

  it('renders correctly with default props', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', {
        name: /tell us about cs education at your school/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/we want to bring computer science to every school/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mocked-your-school-form')).toBeInTheDocument();
    expect(document.getElementById(YOUR_SCHOOL_FORM_ID)).toBeInTheDocument();
  });

  it('passes props correctly to YourSchoolForm when school is null', () => {
    renderComponent();

    expect(YourSchoolForm).toHaveBeenCalledWith(
      expect.objectContaining({
        regionalPartnerURL: defaultProps.regionalPartnerURL,
        privacyPolicyURL: defaultProps.privacyPolicyURL,
        school: null,
      }),
      expect.anything(),
    );
  });

  it('passes school data to YourSchoolForm when provided', () => {
    const school = {
      nces_id: '123',
      name: 'Test School',
      city: 'Testville',
      state: 'TS',
      zip: '12345',
    };

    renderComponent({school});

    expect(YourSchoolForm).toHaveBeenCalledWith(
      expect.objectContaining({
        school,
        regionalPartnerURL: defaultProps.regionalPartnerURL,
        privacyPolicyURL: defaultProps.privacyPolicyURL,
      }),
      expect.anything(),
    );
  });
});
