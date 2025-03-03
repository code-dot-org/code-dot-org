import {renderHook} from '@testing-library/react-hooks';
import {act} from 'react-dom/test-utils';
import {useParams} from 'react-router-dom'; // Required for useParams to work

import {useWorkshop} from '@cdo/apps/code-studio/pd/workshop_dashboard/hooks/useWorkshop';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

describe('useWorkshop', () => {
  let mockFetch;
  let originalFetch;
  const mockWorkshop = {
    course: 'CS Foundations',
    capacity: 30,
    description: null,
    facilitators: [],
    fee: null,
    grades: null,
    hidden: null,
    name: '',
    notes: '',
    organizer: {
      id: 1,
      email: 'wsorganizer@mail.com',
      name: 'Workshop Organizer',
    },
    prereq: null,
    regional_partner_id: null,
    registration_link: 'https://example.com/register',
    subject: 'Intro',
    suppress_email: null,
    course_offerings: [],
    participant_group_type: '',
    time_zone: 'America/Denver',
    sessions: [
      {
        id: 1,
        start: '2025-02-12T16:00:00.000Z',
        end: '2025-02-12T17:00:00.000Z',
        code: 'ABCD',
        location_address: '123 Workshop St.',
        location_name: 'Room 101',
        meeting_link: null,
        session_format: 'in_person',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.fn();
    originalFetch = window.fetch;
    window.fetch = mockFetch;
    useParams.mockReturnValue({workshopId: undefined});
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  it('should return null when workshopId is not provided', async () => {
    useParams.mockReturnValue({});

    const {result} = renderHook(() => useWorkshop());

    expect(result.current).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should fetch workshop data when workshopId is provided', async () => {
    useParams.mockReturnValue({workshopId: '1'});

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWorkshop,
    });

    const {result, waitForNextUpdate} = renderHook(() => useWorkshop());

    expect(result.current).toBeNull();

    // wait for the fetch to complete
    await waitForNextUpdate();

    // verify fetch was called correctly
    expect(fetch).toHaveBeenCalledWith('/api/v1/pd/workshops/1');

    // verify state was updated with workshop data
    expect(result.current).toEqual(mockWorkshop);
  });

  it('should not update state when component unmounts before fetch completes', async () => {
    // mock useParams to return workshopId
    useParams.mockReturnValue({workshopId: '1'});

    // create a promise that won't resolve immediately
    let resolvePromise;
    const fetchPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(fetchPromise);

    const {result, unmount} = renderHook(() => useWorkshop());

    // unmount the component before the fetch completes
    unmount();

    // resolve the fetch promise
    await act(async () => {
      resolvePromise({
        ok: true,
        json: async () => mockWorkshop,
      });
    });

    // should still be null since the component was unmounted
    expect(result.current).toBeNull();
  });

  it('should refetch when workshopId changes', async () => {
    useParams.mockReturnValue({workshopId: '1'});

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWorkshop,
    });

    const {result, waitForNextUpdate, rerender} = renderHook(() =>
      useWorkshop()
    );

    await waitForNextUpdate();
    expect(result.current).toEqual(mockWorkshop);

    // Change the workshopId
    const secondWorkshop = {
      ...mockWorkshop,
      id: '2',
    };

    useParams.mockReturnValue({workshopId: '2'});

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => secondWorkshop,
    });

    // rerender the hook to trigger the effect with new workshopId
    rerender();

    // Wait for the second fetch to complete
    await waitForNextUpdate();

    expect(fetch).toHaveBeenCalledWith('/api/v1/pd/workshops/2');

    expect(result.current).toEqual(secondWorkshop);
  });
});
