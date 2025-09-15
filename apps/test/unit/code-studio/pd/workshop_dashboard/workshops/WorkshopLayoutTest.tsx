import {SegmentedButtonsProps} from '@code-dot-org/component-library/segmentedButtons';
import {act, render, screen, within, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import {
  SurveyOption,
  TabConfig,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/types';
import {WorkshopLayout} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/WorkshopLayout';

// mock data fetching so we can control loading/error states.
jest.mock('@cdo/apps/util/useFetch');
const mockUseFetch = require('@cdo/apps/util/useFetch').useFetch as jest.Mock;

const tabs: TabConfig[] = [
  {label: 'Details', path: '.'},
  {label: 'Sessions', path: 'sessions'},
  {label: 'Enrollments', path: 'enrollments'},
  {label: 'Surveys', path: 'surveys'},
];

const surveyTypeOptions: SurveyOption[] = [
  {text: 'Pre', value: 'pre'},
  {text: 'Post', value: 'post'},
];

const categoryButtons: {
  preWorkshopSurvey: SegmentedButtonsProps['buttons'];
  postWorkshopSurvey: SegmentedButtonsProps['buttons'];
} = {
  preWorkshopSurvey: [
    {label: 'Overall', value: 'overall'},
    {label: 'Facilitators', value: 'facilitators'},
  ],
  postWorkshopSurvey: [
    {label: 'Overall', value: 'overall'},
    {label: 'Facilitators', value: 'facilitators'},
  ],
};

const baseWorkshop = {
  id: 42,
  state: 'Not Started',
  time_zone: 'America/Denver',
  name: 'Test Workshop',
  course: 'Build Your Own Workshop',
  subject: null,
  course_offering_names: 'CSF',
  sessions: [
    {
      id: 1,
      start: '2024-07-01T15:00:00.000Z',
      end: '2024-07-01T23:00:00.000Z',
      session_format: 'in_person',
      location_name: 'HQ',
      location_address: null,
      meeting_link: null,
      code: 'S1',
      'show_link?': false,
      attendance_count: 0,
    },
  ],
  facilitators: [
    {id: 1, name: 'Fac A', email: 'a@example.com'},
    {id: 2, name: 'Fac B', email: 'b@example.com'},
  ],
  regional_partner_name: 'Partner',
  'account_required_for_attendance?': true,
  'ready_to_close?': false,
  registration_link: null,
  created_at: '2024-01-01T00:00:00.000Z',
  enrolled_teacher_count: 2,
  hidden: false,
};

const baseEnrollments = [
  {
    id: 1001,
    user_info: {
      given_name: 'Jane',
      family_name: 'Doe',
      email: 'jane@example.com',
      school_name: 'School A',
      district_name: 'District A',
      role: 'teacher',
    },
    user_id: 11,
    attendances: 0,
    enrolled_date: '2024-06-01',
  },
  {
    id: 1002,
    user_info: {
      given_name: 'John',
      family_name: 'Smith',
      email: 'john@example.com',
      school_name: 'School B',
      district_name: 'District B',
      role: 'teacher',
    },
    user_id: 12,
    attendances: 1,
    enrolled_date: '2024-06-02',
  },
];

const surveysWithPost = {surveys: {post_workshop: true, pre_workshop: true}};
const surveysWithoutPost = {surveys: {post_workshop: false}};
const nonByoWorkshop = {
  ...baseWorkshop,
  course: 'CS Fundamentals',
  subject: 'Intro',
};

const createMockUseFetchResults = (
  data: unknown,
  loading = false,
  error: unknown = null
) => ({
  data,
  loading,
  error,
  refetch: jest.fn(),
});

function setupFetchData(overrides?: {
  workshop?: Partial<ReturnType<typeof createMockUseFetchResults>>;
  enrollments?: Partial<ReturnType<typeof createMockUseFetchResults>>;
  surveys?: Partial<ReturnType<typeof createMockUseFetchResults>>;
}) {
  mockUseFetch.mockImplementation((url: string) => {
    if (url.endsWith('/foorm/workshop_survey_summary')) {
      return {
        ...createMockUseFetchResults(surveysWithPost),
        ...(overrides?.surveys || {}),
      };
    }
    if (url.endsWith('/enrollments')) {
      return {
        ...createMockUseFetchResults(baseEnrollments),
        ...(overrides?.enrollments || {}),
      };
    }
    if (/\/api\/v1\/pd\/workshops\/\d+$/.test(url)) {
      return {
        ...createMockUseFetchResults(baseWorkshop),
        ...(overrides?.workshop || {}),
      };
    }
    return createMockUseFetchResults(null, false, null);
  });
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/workshops/:workshopId/*"
          element={
            <WorkshopLayout
              tabList={tabs}
              surveyTypeOptions={surveyTypeOptions}
              questionCategoryButtons={categoryButtons}
            />
          }
        >
          <Route path="*" element={<div>Outlet content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('WorkshopLayout (accessible, correctly typed props)', () => {
  userEvent.setup({advanceTimers: jest.advanceTimersByTime});

  // helper to advance timers
  const tick = async (ms = 0) => {
    act(() => {
      jest.advanceTimersByTime(ms);
    });
    await act(async () => {}); // flush pending updates
  };

  beforeEach(() => {
    jest.useFakeTimers();
    mockUseFetch.mockReset();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('stays in loading state during the initial 1s delay (no <main> yet)', async () => {
    setupFetchData();
    renderAt('/workshops/42');

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();

    await tick(1000);
  });

  it('renders navigation/tabs and outlet after loading completes', async () => {
    setupFetchData();
    renderAt('/workshops/42');

    await tick(1000);

    const main = await screen.findByRole('main');
    expect(main).toBeInTheDocument();
    expect(screen.getByText('Outlet content')).toBeInTheDocument();

    const nav = screen.getByRole('navigation', {name: 'Workshop sections'});
    for (const {label} of tabs) {
      expect(within(nav).getByText(label)).toBeInTheDocument();
    }
  });

  it('hides tabs on the /edit route (nav present, tab labels hidden)', async () => {
    setupFetchData();
    renderAt('/workshops/42/edit');

    await tick(1000);

    await screen.findByRole('main');

    const nav = screen.getByRole('navigation', {name: 'Workshop sections'});
    for (const {label} of tabs) {
      expect(within(nav).queryByText(label)).not.toBeInTheDocument();
    }
  });

  it('shows survey UI (export button + type options) on /surveys', async () => {
    setupFetchData();
    renderAt('/workshops/42/surveys');

    await tick(1000);

    await screen.findByRole('main');

    const exportBtn = screen.getByRole('button', {
      name: 'Export survey results',
    });
    expect(exportBtn).toBeInTheDocument();

    for (const {text} of surveyTypeOptions) {
      expect(
        screen.getByText(new RegExp(`^${text}$`, 'i'))
      ).toBeInTheDocument();
    }
  });

  it('shows category selection + export button on /surveys/post', async () => {
    setupFetchData();
    renderAt('/workshops/42/surveys/post');

    await tick(1000);

    await screen.findByRole('main');

    expect(
      screen.getByRole('button', {name: 'Export survey results'})
    ).toBeInTheDocument();
    expect(screen.getByText(/overall/i)).toBeInTheDocument();
    expect(screen.getByText(/facilitators/i)).toBeInTheDocument();
  });

  it('shows a "no survey responses" message on /surveys/post when post survey absent', async () => {
    setupFetchData({surveys: {data: surveysWithoutPost, loading: false}});
    renderAt('/workshops/42/surveys/post');

    await tick(1000);

    await screen.findByRole('main');

    expect(screen.getByText(/no.*survey.*responses/i)).toBeInTheDocument();
  });

  it('shows the legacy surveys link button when workshop course is not byo', async () => {
    setupFetchData({
      workshop: {data: nonByoWorkshop},
    });
    renderAt('/workshops/42/surveys');

    await tick(1000);

    await screen.findByRole('main');

    const linkButton = screen.getByRole('link', {name: 'Survey results'});

    expect(linkButton).toHaveAttribute(
      'href',
      '/pd/workshop_dashboard/workshop_daily_survey_results/42'
    );
  });

  it('keeps showing loading past 1s while any fetch is still loading (no <main>)', async () => {
    setupFetchData({surveys: {loading: true, data: null}});
    renderAt('/workshops/42');

    await tick(1000);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('renders an error alert if any fetch errors', async () => {
    setupFetchData({enrollments: {error: new Error('uh oh')}});
    renderAt('/workshops/42');

    await tick(1000);

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Something went wrong, please refresh the page.'
      )
    );
  });
});
