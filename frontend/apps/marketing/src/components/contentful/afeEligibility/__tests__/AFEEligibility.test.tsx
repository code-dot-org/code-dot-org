import {render, screen} from '@testing-library/react';

import AFEEligibility from '../AFEEligibility';

jest.mock('@statsig/react-bindings', () => ({
  useStatsigClient: () => ({logEvent: jest.fn()}),
}));
jest.mock('@/config/studio', () => ({
  getStudioUrl: (path: string) => `https://studio.code.org${path}`,
}));
jest.mock('@/components/contentful/afeEligibility/AFEForm', () => () => (
  <div>Mock AFEForm</div>
));
jest.mock('@/components/contentful/afeEligibility/AFESchoolCheck', () => () => (
  <div>Mock AFESchoolCheck</div>
));

describe('AFEEligibility', () => {
  const renderComponent = () => render(<AFEEligibility />);

  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('renders AFESchoolCheck by default', async () => {
    renderComponent();

    expect(await screen.findByText('Mock AFESchoolCheck')).toBeInTheDocument();
  });

  it('renders school eligibility requirements by default', () => {
    renderComponent();

    expect(
      screen.getByText('School Eligibility Requirements*'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Title 1 and/or > 40% Free/Reduced Lunch (FRL) student enrollment',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        '>30% Black/Latino/Native American (BLNA) student enrollment',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Rural school')).toBeInTheDocument();
  });

  it('renders message for students', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user_type: 'student',
          }),
      }),
    ) as jest.Mock;

    renderComponent();

    expect(fetch).toHaveBeenCalledWith(
      'https://studio.code.org/dashboardapi/v1/users/me/donor_teacher_banner_details',
      {credentials: 'include'},
    );

    expect(
      await screen.findByText('You need a Code.org teacher account'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "You're currently signed in to Code.org with a student account.",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('link', {name: 'Sign out'}),
    ).toBeInTheDocument();
  });

  it('renders AFEForm if eligibility data is complete and user is eligible', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          user_type: 'teacher',
          teacher_email: 'test@example.com',
          nces_school_id: '123456',
          school_name: 'Test School',
          afe_high_needs: true,
        }),
      }),
    ) as jest.Mock;

    renderComponent();

    expect(fetch).toHaveBeenCalled();
    expect(await screen.findByText('Mock AFEForm')).toBeInTheDocument();
  });

  it('renders AFESchoolCheck if eligibility data is incomplete or not eligible', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user_type: 'teacher',
          }),
      }),
    ) as jest.Mock;

    renderComponent();

    expect(fetch).toHaveBeenCalled();
    expect(await screen.findByText('Mock AFESchoolCheck')).toBeInTheDocument();
  });

  it('logs error on failed fetch', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Internal Error'),
      }),
    ) as jest.Mock;

    renderComponent();

    await screen.findByText('School Eligibility Requirements*');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('User info fetch failed'),
      }),
    );

    consoleSpy.mockRestore();
  });
});
