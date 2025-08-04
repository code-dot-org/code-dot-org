import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AFEForm from '../AFEForm';

jest.mock('@statsig/react-bindings', () => ({
  useStatsigClient: () => ({
    logEvent: jest.fn(),
  }),
}));

jest.mock('../AFEContinueNotice', () => ({onClose}: {onClose: () => void}) => (
  <button data-testid="continue-notice" onClick={onClose}>
    Continue Notice
  </button>
));

jest.mock('../AFESuccessNotice', () => ({onClose}: {onClose: () => void}) => (
  <button data-testid="success-notice" onClick={onClose}>
    Success Notice
  </button>
));

describe('AFEForm', () => {
  const mockEmail = 'test@example.com';
  const mockSchoolId = '1234';
  const mockSchoolName = 'Test School';
  const mockOnEligibilityReset = jest.fn();

  const renderComponent = (props = {}) =>
    render(
      <AFEForm
        email={mockEmail}
        schoolId={mockSchoolId}
        schoolName={mockSchoolName}
        isSignedIn={false}
        onEligibilityReset={mockOnEligibilityReset}
        {...props}
      />,
    );

  const fillForm = ({
    firstName = 'Alice',
    lastName = 'Smith',
    professionalRole = 'Pre-Service Teacher',
    gradeBands = ['6-8', '9-12'],
    inspirationKit = true,
    consentCSTA = true,
    checkAFEConsent = true,
  } = {}) => {
    fireEvent.change(screen.getByLabelText('First name'), {
      target: {value: firstName},
    });
    fireEvent.change(screen.getByLabelText('Last name'), {
      target: {value: lastName},
    });
    fireEvent.change(screen.getByLabelText('What is your role?'), {
      target: {value: professionalRole},
    });
    gradeBands.forEach(label => {
      fireEvent.click(screen.getByLabelText(label));
    });
    if (inspirationKit)
      fireEvent.click(screen.getByLabelText(/Thank You Kit/i));
    if (consentCSTA)
      fireEvent.click(
        screen.getByLabelText(/I opt-in for a free CSTA\+ membership/i),
      );
    if (checkAFEConsent) {
      fireEvent.click(screen.getByLabelText(/I give Code\.org permission/i));
    }
  };

  const submitForm = async () =>
    userEvent.click(screen.getByRole('button', {name: 'Continue'}));

  beforeEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  it('auto-submits when isSignedIn changes to true and form is valid', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => '',
    } as Response);

    const {rerender} = render(
      <AFEForm
        email={mockEmail}
        schoolId={mockSchoolId}
        schoolName={mockSchoolName}
        isSignedIn={false}
        onEligibilityReset={mockOnEligibilityReset}
      />,
    );

    fillForm();
    rerender(
      <AFEForm
        email={mockEmail}
        schoolId={mockSchoolId}
        schoolName={mockSchoolName}
        isSignedIn={true}
        onEligibilityReset={mockOnEligibilityReset}
      />,
    );

    expect(await screen.findByTestId('success-notice')).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('updates email, schoolId, and schoolName when props change', () => {
    const {rerender} = renderComponent();
    rerender(
      <AFEForm
        email="new@example.com"
        schoolId="999"
        schoolName="New School"
        isSignedIn={false}
        onEligibilityReset={mockOnEligibilityReset}
      />,
    );

    expect(screen.getByLabelText('Email')).toHaveValue('new@example.com');
    expect(screen.getByLabelText('School')).toHaveValue('New School');
  });

  it('does not submit if required fields are missing', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    renderComponent();
    await submitForm();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('closes success notice and clears sessionStorage', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => '',
    } as Response);

    renderComponent({isSignedIn: true});
    fillForm();
    await submitForm();

    const successNotice = await screen.findByTestId('success-notice');
    await userEvent.click(successNotice);
    expect(sessionStorage.getItem('afeEligibilityFormData')).toBeNull();
    expect(mockOnEligibilityReset).toHaveBeenCalled();
  });

  it('closes continue notice', async () => {
    renderComponent();
    fillForm();
    await submitForm();

    const continueNotice = await screen.findByTestId('continue-notice');
    await userEvent.click(continueNotice);
    expect(screen.queryByTestId('continue-notice')).not.toBeInTheDocument();
  });

  it('renders form fields with default values', () => {
    renderComponent();

    expect(screen.getByLabelText('Email')).toHaveValue(mockEmail);
    expect(screen.getByLabelText('School')).toHaveValue(mockSchoolName);
    expect(screen.getByLabelText('First name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name')).toBeInTheDocument();
    expect(screen.getByLabelText('What is your role?')).toBeInTheDocument();
    expect(screen.getByLabelText('K-5')).toBeInTheDocument();
    expect(screen.getByLabelText('6-8')).toBeInTheDocument();
    expect(screen.getByLabelText('9-12')).toBeInTheDocument();
    expect(screen.getByLabelText(/Thank You Kit/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/I opt-in for a free CSTA\+ membership/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/I give Code\.org permission/i),
    ).toBeInTheDocument();
  });

  it('calls onEligibilityReset when "Go back" link is clicked', async () => {
    const onReset = jest.fn();
    renderComponent({onEligibilityReset: onReset});
    const goBackLink = screen.getByRole('link', {name: 'Go back'});
    await userEvent.click(goBackLink);
    expect(onReset).toHaveBeenCalled();
  });

  it('logs event and shows continue notice if not signed in', async () => {
    const firstName = 'John';
    const lastName = 'Smith';
    const fetchSpy = jest.spyOn(global, 'fetch');

    renderComponent();

    fillForm({firstName, lastName});
    await submitForm();

    const stored = JSON.parse(
      sessionStorage.getItem('afeEligibilityFormData') || '{}',
    );
    expect(stored.firstName).toBe(firstName);
    expect(stored.lastName).toBe(lastName);
    expect(stored.email).toBe(mockEmail);
    expect(stored.schoolId).toBe(mockSchoolId);
    expect(stored.schoolName).toBe(mockSchoolName);

    expect(await screen.findByTestId('continue-notice')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('submits form and shows success notice when signed in and server returns ok', async () => {
    const firstName = 'John';
    const lastName = 'Smith';
    const professionalRole = 'Pre-Service Teacher';
    const gradeBands = ['6-8', '9-12'];

    jest.spyOn(global, 'fetch').mockImplementation((url, options) => {
      if (
        !String(url).includes('/dashboardapi/v1/amazon_future_engineer_submit')
      ) {
        return Promise.reject(new Error(`Unexpected fetch call to: ${url}`));
      }

      expect(options?.method).toBe('POST');
      expect(options?.headers).toEqual(
        expect.objectContaining({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      );

      // Validate request body contents
      const body = options?.body;
      expect(body).toBeInstanceOf(URLSearchParams);
      const params = new URLSearchParams(body as string);
      expect(params.get('amazon_future_engineer[email]')).toBe(mockEmail);
      expect(params.get('amazon_future_engineer[firstName]')).toBe(firstName);
      expect(params.get('amazon_future_engineer[lastName]')).toBe(lastName);
      expect(params.get('amazon_future_engineer[schoolId]')).toBe(mockSchoolId);
      expect(
        params.get('amazon_future_engineer[primaryProfessionalRole]'),
      ).toBe(professionalRole);
      expect(params.get('amazon_future_engineer[gradesTeaching]')).toBe(
        gradeBands.join(', '),
      );
      expect(params.get('amazon_future_engineer[inspirationKit]')).toBe('true');
      expect(params.get('amazon_future_engineer[csta]')).toBe('true');
      expect(params.get('amazon_future_engineer[consentCSTA]')).toBe('true');
      expect(params.get('amazon_future_engineer[consentAFE]')).toBe('true');

      return Promise.resolve({
        ok: true,
        text: async () => '',
      } as Response);
    });

    renderComponent({isSignedIn: true});
    fillForm({
      firstName,
      lastName,
      professionalRole: professionalRole,
      gradeBands: gradeBands,
      inspirationKit: true,
      consentCSTA: true,
    });
    await submitForm();

    expect(await screen.findByTestId('success-notice')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Fetch failed'));

    renderComponent({isSignedIn: true});
    fillForm({firstName: 'Error', lastName: 'Case'});
    await submitForm();

    expect(
      await screen.findByText(/Something went wrong/i),
    ).toBeInTheDocument();
  });
});
