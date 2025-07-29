import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {getStudioUrl} from '@/config/studio';

import YourSchoolForm from '../YourSchoolForm';

global.fetch = jest.fn();

jest.mock('@/config/studio', () => ({
  getStudioUrl: jest.fn(),
}));

jest.mock('@public/images/yourschool.avif', () => ({
  src: 'mocked-image-src',
}));

describe('YourSchoolForm Component', () => {
  const defaultProps = {
    regionalPartnerURL: 'https://example.com/partner',
    privacyPolicyURL: 'https://example.com/privacy',
    shareOnTwitterURL: 'https://example.com/share-twitter',
    shareOnFacebookURL: 'https://example.com/share-facebook',
  };

  const renderComponent = (props = {}) =>
    render(<YourSchoolForm {...defaultProps} {...props} />);

  const submitForm = async (success = true) => {
    screen
      .getByRole('form', {name: 'Survey'})
      .setAttribute('noValidate', 'true');
    HTMLFormElement.prototype.checkValidity = jest.fn().mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValueOnce({ok: success});
    await userEvent.click(screen.getByRole('button', {name: /submit survey/i}));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getStudioUrl as jest.Mock).mockReturnValue('/mock-url');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  it('renders all form fieldsets', () => {
    renderComponent();

    expect(
      screen.getByRole('group', {name: /Let's gather a few details first/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', {name: /CS education at your school/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', {name: /Stay in touch?/i}),
    ).toBeInTheDocument();
  });

  it('initializes form with default values', () => {
    renderComponent();

    expect(
      screen.getByRole('button', {name: /submit survey/i}),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/we've received your submission/i),
    ).not.toBeInTheDocument();
  });

  it('shows success modal after form submission', async () => {
    renderComponent();

    await submitForm(true);

    expect(
      await screen.findByText(/We've received your submission!/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Thank you for telling us about your school!/i),
    ).toBeInTheDocument();

    const shareOnTwitterLink = await screen.findByRole('link', {
      name: /Share On Twitter/i,
    });
    expect(shareOnTwitterLink).toBeInTheDocument();
    expect(shareOnTwitterLink).toHaveAttribute(
      'href',
      defaultProps.shareOnTwitterURL,
    );

    const shareOnFacebookLink = await screen.findByRole('link', {
      name: /Share On Facebook/i,
    });
    expect(shareOnFacebookLink).toBeInTheDocument();
    expect(shareOnFacebookLink).toHaveAttribute(
      'href',
      defaultProps.shareOnFacebookURL,
    );
  });

  it('closes success modal when close button is clicked', async () => {
    renderComponent();

    await submitForm(true);

    await userEvent.click(
      screen.getByRole('button', {name: /Return to page/i}),
    );
    expect(
      await screen.queryByText(/Thank you for telling us about your school!/i),
    ).not.toBeInTheDocument();
  });

  it('shows network error when form submission has a network failure', async () => {
    renderComponent();

    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error'),
    );
    await submitForm();

    expect(
      await screen.findByText(/Something went wrong. Please try again later/i),
    ).toBeInTheDocument();
  });
});
