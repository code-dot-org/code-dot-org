import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';
import {MemoryRouter} from 'react-router-dom';

import {EnrollmentData} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/types';
import {WorkshopEnrollments} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/enrollments/WorkshopEnrollments';
import {
  WorkshopContextValue,
  WorkshopData,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/types';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

// Mock the authenticity token utility
jest.mock('@cdo/apps/util/AuthenticityTokenStore');
const mockGetAuthenticityToken = getAuthenticityToken as jest.MockedFunction<
  typeof getAuthenticityToken
>;

// Mock React Router's useOutletContext
const mockUseOutletContext = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: () => mockUseOutletContext(),
}));

describe('WorkshopEnrollments', () => {
  const user = userEvent.setup();
  const mockFetch = jest.fn();
  const mockRefetchEnrollments = jest.fn();

  beforeEach(() => {
    mockFetch.mockClear();
    jest.spyOn(window, 'fetch').mockImplementation(mockFetch);
    mockRefetchEnrollments.mockClear();
    mockGetAuthenticityToken.mockResolvedValue('fake-csrf-token');

    // Mock window.open
    Object.defineProperty(window, 'open', {
      writable: true,
      value: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createTestEnrollment = (
    overrides: Partial<EnrollmentData> = {}
  ): EnrollmentData => ({
    id: 1,
    givenName: 'John',
    familyName: 'Doe',
    email: 'john.doe@example.com',
    schoolName: 'Test School',
    districtName: 'Test District',
    role: 'teacher',
    userId: 123,
    attendances: 0,
    enrolledDate: '2024-01-01',
    ...overrides,
  });

  const createTestWorkshop = (
    overrides: Partial<WorkshopData> = {}
  ): WorkshopData => ({
    id: 1,
    state: 'Not Started',
    timeZone: 'America/Denver',
    name: 'Test Workshop',
    course: 'CS Fundamentals',
    subject: 'Intro',
    courseOfferingNames: 'CS Fundamentals',
    sessions: [
      {
        id: 1,
        start: '2024-07-01T15:00:00.000Z',
        end: '2024-07-01T23:00:00.000Z',
        sessionFormat: 'in_person',
        locationName: 'Test Location',
        code: 'TEST',
        showLink: false,
        attendanceCount: 0,
        locationAddress: null,
        meetingLink: null,
      },
    ],
    facilitators: [],
    regionalPartnerName: 'Test Regional Partner',
    accountRequiredForAttendance: true,
    readyToClose: false,
    registrationLink: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    enrolledTeacherCount: 1,
    hidden: false,
    ...overrides,
  });

  const createMockContext = (
    overrides: Partial<WorkshopContextValue> = {}
  ): WorkshopContextValue => ({
    enrollments: [createTestEnrollment()],
    workshop: createTestWorkshop(),
    refetchEnrollments: mockRefetchEnrollments,
    enrollmentsLoading: false,
    enrollmentsError: null,
    workshopLoading: false,
    workshopError: null,
    refetchWorkshop: jest.fn(),
    ...overrides,
  });

  const renderWithContext = (
    contextOverrides: Partial<WorkshopContextValue> = {}
  ) => {
    const mockContext = createMockContext(contextOverrides);
    mockUseOutletContext.mockReturnValue(mockContext);

    return render(
      <MemoryRouter>
        <WorkshopEnrollments />
      </MemoryRouter>
    );
  };

  describe('loading and error states', () => {
    it('shows spinner when enrollments are loading', () => {
      renderWithContext({
        enrollments: [],
        enrollmentsLoading: true,
      });

      // Check that only the spinner is rendered, not the table or the empty state text
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(
        screen.queryByText('No enrollments found for this workshop')
      ).not.toBeInTheDocument();
    });

    it('shows error alert when there is an enrollments error', () => {
      renderWithContext({
        enrollments: [],
        enrollmentsError: new Error('Failed to load'),
      });

      expect(
        screen.getByText(
          'There was an error fetching enrollments. Please try again.'
        )
      ).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('shows warning alert when there are no enrollments', () => {
      renderWithContext({
        enrollments: [],
      });

      expect(
        screen.getByText('No enrollments found for this workshop')
      ).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('enrollment table rendering', () => {
    it('renders enrollment table with data', () => {
      const enrollments = [
        createTestEnrollment({
          id: 1,
          givenName: 'John',
          familyName: 'Doe',
          email: 'john@example.com',
          attendances: 1,
        }),
        createTestEnrollment({
          id: 2,
          givenName: 'Jane',
          familyName: 'Smith',
          email: 'jane@example.com',
          attendances: 0,
        }),
      ];

      renderWithContext({enrollments});

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
      expect(screen.getByText('Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('renders attendance count correctly', () => {
      const workshop = createTestWorkshop({
        sessions: [
          {
            id: 1,
            start: '2024-07-01T15:00:00.000Z',
            end: '2024-07-01T23:00:00.000Z',
            sessionFormat: 'in_person',
            locationName: 'Test Location',
            code: 'TEST',
            showLink: false,
            attendanceCount: 0,
            locationAddress: null,
            meetingLink: null,
          },
          {
            id: 2,
            start: '2024-07-02T15:00:00.000Z',
            end: '2024-07-02T23:00:00.000Z',
            sessionFormat: 'in_person',
            locationName: 'Test Location',
            code: 'TEST2',
            showLink: false,
            attendanceCount: 0,
            locationAddress: null,
            meetingLink: null,
          },
        ],
      });

      const enrollments = [
        createTestEnrollment({
          attendances: 1,
        }),
      ];

      renderWithContext({enrollments, workshop});

      expect(screen.getByText('1/2')).toBeInTheDocument();
    });

    it('renders table headers correctly', () => {
      renderWithContext();

      expect(screen.getByText('First name')).toBeInTheDocument();
      expect(screen.getByText('Last name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('District')).toBeInTheDocument();
      expect(screen.getByText('School')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Total attendance')).toBeInTheDocument();
      expect(screen.getByText('Enrolled date')).toBeInTheDocument();
    });
  });

  describe('selection functionality', () => {
    it('allows selecting individual enrollments', async () => {
      const enrollments = [
        createTestEnrollment({id: 1, givenName: 'John'}),
        createTestEnrollment({id: 2, givenName: 'Jane'}),
      ];

      renderWithContext({enrollments});

      const checkboxes = screen.getAllByRole('checkbox');
      const firstRowCheckbox = checkboxes[1]; // Skip the select-all checkbox

      await user.click(firstRowCheckbox);

      expect(firstRowCheckbox).toBeChecked();
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });

    it('allows selecting all enrollments', async () => {
      const enrollments = [
        createTestEnrollment({id: 1, givenName: 'John'}),
        createTestEnrollment({id: 2, givenName: 'Jane'}),
      ];

      renderWithContext({enrollments});

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(selectAllCheckbox);

      expect(selectAllCheckbox).toBeChecked();
      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });

    it('shows indeterminate state when some enrollments are selected', async () => {
      const enrollments = [
        createTestEnrollment({id: 1, givenName: 'John'}),
        createTestEnrollment({id: 2, givenName: 'Jane'}),
      ];

      renderWithContext({enrollments});

      const checkboxes = screen.getAllByRole('checkbox');
      const selectAllCheckbox = checkboxes[0];
      const firstRowCheckbox = checkboxes[1];

      await user.click(firstRowCheckbox);

      expect(selectAllCheckbox).toHaveProperty('indeterminate', true);
    });

    it('deselects all when select all is clicked while all are selected', async () => {
      const enrollments = [
        createTestEnrollment({id: 1, givenName: 'John'}),
        createTestEnrollment({id: 2, givenName: 'Jane'}),
      ];

      renderWithContext({enrollments});

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];

      // Select all
      await user.click(selectAllCheckbox);
      expect(screen.getByText('2 selected')).toBeInTheDocument();

      // Deselect all
      await user.click(selectAllCheckbox);
      expect(screen.queryByText('selected')).not.toBeInTheDocument();
    });
  });

  describe('bulk actions', () => {
    it('shows bulk action buttons when enrollments are selected', async () => {
      const enrollments = [createTestEnrollment({id: 1, givenName: 'John'})];
      renderWithContext({enrollments});

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      expect(screen.getByText('Move selected enrollment')).toBeInTheDocument();
      expect(
        screen.getByText('Remove selected enrollment')
      ).toBeInTheDocument();
    });

    it('uses plural form when multiple enrollments are selected', async () => {
      const enrollments = [
        createTestEnrollment({id: 1, givenName: 'John'}),
        createTestEnrollment({id: 2, givenName: 'Jane'}),
      ];

      renderWithContext({enrollments});

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(selectAllCheckbox);

      expect(screen.getByText('Move selected enrollments')).toBeInTheDocument();
      expect(
        screen.getByText('Remove selected enrollments')
      ).toBeInTheDocument();
    });
  });

  describe('refresh functionality', () => {
    it('calls refetchEnrollments when refresh button is clicked', async () => {
      renderWithContext();

      const refreshButton = screen.getByLabelText(
        'Refresh enrollment table data'
      );
      await user.click(refreshButton);

      expect(mockRefetchEnrollments).toHaveBeenCalledTimes(1);
    });
  });

  describe('export functionality', () => {
    it('opens CSV export URL when export button is clicked', async () => {
      const workshop = createTestWorkshop({id: 123});
      renderWithContext({workshop});

      const exportButton = screen.getByText('Export all');
      await user.click(exportButton);

      expect(window.open).toHaveBeenCalledWith(
        '/api/v1/pd/workshops/123/enrollments.csv'
      );
    });

    it('does not export when workshop ID is missing', async () => {
      renderWithContext({workshop: null});

      const exportButton = screen.getByText('Export all');
      await user.click(exportButton);

      expect(window.open).not.toHaveBeenCalled();
    });
  });

  describe('remove enrollments functionality', () => {
    it('opens remove dialog when remove button is clicked', async () => {
      const enrollments = [
        createTestEnrollment({id: 1, givenName: 'John', attendances: 0}),
      ];
      renderWithContext({enrollments});

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      const removeButton = screen.getByText('Remove selected enrollment');
      await user.click(removeButton);

      expect(screen.getByText('Remove Enrollment?')).toBeInTheDocument();
      expect(
        screen.getByText('Are you sure you want to remove the enrollment for:')
      ).toBeInTheDocument();
      expect(
        screen.getByText('John Doe (john.doe@example.com)')
      ).toBeInTheDocument();
    });

    it('shows warning for enrollments with attendance', async () => {
      const enrollments = [
        createTestEnrollment({id: 1, givenName: 'John', attendances: 1}),
        createTestEnrollment({id: 2, givenName: 'Jane', attendances: 0}),
      ];
      renderWithContext({enrollments});

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(selectAllCheckbox);

      const removeButton = screen.getByText('Remove selected enrollments');
      await user.click(removeButton);

      expect(
        screen.getByText(
          'The following users have already attended a session and cannot be removed.'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText('John Doe (john.doe@example.com)')
      ).toBeInTheDocument();
    });

    it('successfully removes enrollments', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);

      const enrollments = [
        createTestEnrollment({id: 1, givenName: 'John', attendances: 0}),
      ];
      const workshop = createTestWorkshop({id: 123});
      renderWithContext({enrollments, workshop});

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      const removeButton = screen.getByText('Remove selected enrollment');
      await user.click(removeButton);

      const confirmButton = screen.getByRole('button', {
        name: 'Remove enrollment',
      });

      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockRefetchEnrollments).toHaveBeenCalledTimes(1);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/pd/workshops/123/enrollments/1',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'fake-csrf-token',
          },
        }
      );
    });

    it('shows error when remove fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const enrollments = [
        createTestEnrollment({id: 1, givenName: 'John', attendances: 0}),
      ];
      const workshop = createTestWorkshop({id: 123});
      renderWithContext({enrollments, workshop});

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      const removeButton = screen.getByText('Remove selected enrollment');
      await user.click(removeButton);

      const confirmButton = screen.getByRole('button', {
        name: 'Remove enrollment',
      });

      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            'There was an error while removing enrollments. Please try again.'
          )
        ).toBeInTheDocument();
      });
    });

    it('cancels remove dialog', async () => {
      const enrollments = [
        createTestEnrollment({id: 1, givenName: 'John', attendances: 0}),
      ];
      renderWithContext({enrollments});

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      const removeButton = screen.getByText('Remove selected enrollment');
      await user.click(removeButton);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(screen.queryByText('Remove Enrollment?')).not.toBeInTheDocument();
    });
  });

  describe('move enrollments functionality', () => {
    it('opens move dialog when move button is clicked', async () => {
      const enrollments = [createTestEnrollment({id: 1, givenName: 'John'})];
      renderWithContext({enrollments});

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      const moveButton = screen.getByText('Move selected enrollment');
      await user.click(moveButton);

      expect(screen.getByText('Move Enrollment?')).toBeInTheDocument();
      expect(
        screen.getByText('You are moving the following enrollment for:')
      ).toBeInTheDocument();
      expect(
        screen.getByText('John Doe (john.doe@example.com)')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Warning: moving this enrollment will delete any associated attendance data!'
        )
      ).toBeInTheDocument();
    });

    it('allows entering workshop ID for move destination', async () => {
      const enrollments = [createTestEnrollment({id: 1, givenName: 'John'})];
      renderWithContext({enrollments});

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      const moveButton = screen.getByText('Move selected enrollment');
      await user.click(moveButton);

      // Wait for dialog to appear and find input by placeholder or role
      await waitFor(() => {
        expect(screen.getByText('Move Enrollment?')).toBeInTheDocument();
      });

      const workshopIdInput = screen.getByRole('textbox');
      await user.type(workshopIdInput, '456');

      expect(workshopIdInput).toHaveValue('456');
    });

    it('only allows numeric input for workshop ID', async () => {
      const enrollments = [createTestEnrollment({id: 1, givenName: 'John'})];
      renderWithContext({enrollments});

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      const moveButton = screen.getByText('Move selected enrollment');
      await user.click(moveButton);

      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByText('Move Enrollment?')).toBeInTheDocument();
      });

      const workshopIdInput = screen.getByRole('textbox');
      await user.type(workshopIdInput, 'abc123def');

      expect(workshopIdInput).toHaveValue('123');
    });

    it('disables move button when no workshop ID is entered', async () => {
      const enrollments = [createTestEnrollment({id: 1, givenName: 'John'})];
      renderWithContext({enrollments});

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      const moveButton = screen.getByText('Move selected enrollment');
      await user.click(moveButton);

      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByText('Move Enrollment?')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Move enrollment',
      });
      expect(confirmButton).toBeDisabled();
    });

    it('successfully moves enrollments', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);

      const enrollments = [createTestEnrollment({id: 1, givenName: 'John'})];
      renderWithContext({enrollments});

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      const moveButton = screen.getByText('Move selected enrollment');
      await user.click(moveButton);

      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByText('Move Enrollment?')).toBeInTheDocument();
      });

      const workshopIdInput = screen.getByRole('textbox');
      await user.type(workshopIdInput, '456');

      const confirmButton = screen.getByRole('button', {
        name: 'Move enrollment',
      });

      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockRefetchEnrollments).toHaveBeenCalledTimes(1);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/pd/enrollments/move?destination_workshop_id=456&enrollment_ids[]=1',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'fake-csrf-token',
          },
        }
      );
    });

    it('shows error when move fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const enrollments = [createTestEnrollment({id: 1, givenName: 'John'})];
      renderWithContext({enrollments});

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      const moveButton = screen.getByText('Move selected enrollment');
      await user.click(moveButton);

      await waitFor(() => {
        expect(screen.getByText('Move Enrollment?')).toBeInTheDocument();
      });

      const workshopIdInput = screen.getByRole('textbox');
      await user.type(workshopIdInput, '456');

      const confirmButton = screen.getByRole('button', {
        name: 'Move enrollment',
      });

      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            'There was an error while moving enrollments. Please try again.'
          )
        ).toBeInTheDocument();
      });
    });

    it('cancels move dialog', async () => {
      const enrollments = [createTestEnrollment({id: 1, givenName: 'John'})];
      renderWithContext({enrollments});

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      const moveButton = screen.getByText('Move selected enrollment');
      await user.click(moveButton);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(screen.queryByText('Move Enrollment?')).not.toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    it('shows pagination controls', () => {
      const enrollments = Array.from({length: 15}, (_, i) =>
        createTestEnrollment({
          id: i + 1,
          givenName: `User${i + 1}`,
        })
      );

      renderWithContext({enrollments});

      expect(screen.getByText('Rows per page:')).toBeInTheDocument();
      expect(screen.getByText('1–10 of 15')).toBeInTheDocument();
    });

    it('changes rows per page', async () => {
      const enrollments = Array.from({length: 15}, (_, i) =>
        createTestEnrollment({
          id: i + 1,
          givenName: `User${i + 1}`,
        })
      );

      renderWithContext({enrollments});

      // Click on the rows per page select to open the dropdown
      const rowsPerPageSelect = screen.getByRole('combobox');
      await act(async () => {
        await user.click(rowsPerPageSelect);
      });

      // Find and click the "5" option
      const option5 = await screen.findByRole('option', {name: '5'});
      await act(async () => {
        await user.click(option5);
      });

      expect(screen.getByText('1–5 of 15')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('handles network errors in remove operation', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const enrollments = [
        createTestEnrollment({id: 1, givenName: 'John', attendances: 0}),
      ];
      const workshop = createTestWorkshop({id: 123});
      renderWithContext({enrollments, workshop});

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      const removeButton = screen.getByText('Remove selected enrollment');
      await user.click(removeButton);

      const confirmButton = screen.getByRole('button', {
        name: 'Remove enrollment',
      });

      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText('An unknown error occurred. Please try again.')
        ).toBeInTheDocument();
      });
    });

    it('handles network errors in move operation', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const enrollments = [createTestEnrollment({id: 1, givenName: 'John'})];
      renderWithContext({enrollments});

      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      const moveButton = screen.getByText('Move selected enrollment');
      await user.click(moveButton);

      await waitFor(() => {
        expect(screen.getByText('Move Enrollment?')).toBeInTheDocument();
      });

      const workshopIdInput = screen.getByRole('textbox');
      await user.type(workshopIdInput, '456');

      const confirmButton = screen.getByRole('button', {
        name: 'Move enrollment',
      });

      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText('An unknown error occurred. Please try again.')
        ).toBeInTheDocument();
      });
    });
  });
});
