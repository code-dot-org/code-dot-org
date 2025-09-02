import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {WorkshopAttendance} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/attendance/WorkshopAttendance';
import {
  WorkshopContextValue,
  WorkshopData,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/types';

// Mock useWorkshopContext
const mockUseWorkshopContext = jest.fn();
jest.mock(
  '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/WorkshopLayout',
  () => ({
    ...jest.requireActual(
      '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/WorkshopLayout'
    ),
    useWorkshopContext: () => mockUseWorkshopContext(),
  })
);

describe('WorkshopAttendance', () => {
  const createTestWorkshop = (
    overrides: Partial<WorkshopData> = {}
  ): WorkshopData => ({
    id: 123,
    state: 'In Progress',
    timeZone: 'America/Denver',
    name: 'Test Workshop',
    course: 'Build Your Own Workshop',
    subject: null,
    courseOfferingNames: 'AI something or other',
    sessions: [
      {
        id: 1,
        start: '2024-07-01T15:00:00.000Z',
        end: '2024-07-01T23:00:00.000Z',
        sessionFormat: 'in_person',
        locationName: 'Test Location',
        code: 'ABCD123',
        showLink: true,
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
        code: 'EFGH456',
        showLink: false,
        attendanceCount: 0,
        locationAddress: null,
        meetingLink: null,
      },
    ],
    facilitators: [
      {
        id: 1,
        name: 'Test Facilitator',
        email: 'facilitator@test.com',
      },
    ],
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
  ): WorkshopContextValue =>
    ({
      workshop: createTestWorkshop(),
      ...overrides,
    } as WorkshopContextValue);

  const renderWithContext = (
    contextOverrides: Partial<WorkshopContextValue> = {}
  ) => {
    const mockContext = createMockContext(contextOverrides);
    mockUseWorkshopContext.mockReturnValue(mockContext);

    return render(<WorkshopAttendance />);
  };
  describe('rendering', () => {
    it('renders the section title correctly', () => {
      const workshop = createTestWorkshop();

      renderWithContext({workshop});

      expect(screen.getByText('Take Attendance')).toBeInTheDocument();
    });

    it('renders the instructional text', () => {
      const workshop = createTestWorkshop();

      renderWithContext({workshop});

      expect(
        screen.getByText(
          "There is a unique attendance URL for each day of your workshop. On each day of your workshop, your participants must visit that day's attendance URL to receive professional development credit. The attendance URL(s) will be shown below, 2 days in advance, for your convenience."
        )
      ).toBeInTheDocument();
    });

    it('renders table headers correctly', () => {
      const workshop = createTestWorkshop();

      renderWithContext({workshop});

      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Attendance URL')).toBeInTheDocument();
      expect(screen.getByText('View Daily Roster')).toBeInTheDocument();
    });
  });

  describe('session data rendering', () => {
    it('renders all sessions in the table', () => {
      const workshop = createTestWorkshop();

      renderWithContext({workshop});

      const table = screen.getByRole('table');
      const bodyRows = table.querySelectorAll('tbody tr');
      expect(bodyRows).toHaveLength(2); // Two sessions
    });

    it('renders session dates', () => {
      const workshop = createTestWorkshop();

      renderWithContext({workshop});

      const table = screen.getByRole('table');
      const bodyRows = table.querySelectorAll('tbody tr');

      bodyRows.forEach(row => {
        const dateCell = row.querySelector('td:first-child');
        expect(dateCell).toHaveTextContent(/\d/); // date should have at least one numeric character
      });
    });
  });

  describe('attendance URLs', () => {
    it('renders attendance URL when showLink is true', () => {
      const workshop = createTestWorkshop();

      renderWithContext({workshop});

      const attendanceUrl = '/pd/attend/ABCD123';
      const attendanceUrlFull = `${window.origin}${attendanceUrl}`;
      expect(screen.getByText(attendanceUrlFull)).toBeInTheDocument();

      const attendanceLink = screen.getByRole('link', {
        name: /Open attendance URL for .* in new tab/,
      });
      expect(attendanceLink).toHaveAttribute('href', attendanceUrl);
      expect(attendanceLink).toHaveAttribute('target', '_blank');
    });

    it('does not render attendance URL when showLink is false', () => {
      const workshop = createTestWorkshop();

      renderWithContext({workshop});

      const attendanceUrl = `${window.origin}/pd/attend/EFGH456`;
      expect(screen.queryByText(attendanceUrl)).not.toBeInTheDocument();
    });

    it('generates correct attendance URLs for different session codes', () => {
      const workshop = createTestWorkshop({
        sessions: [
          {
            id: 1,
            start: '2024-07-01T15:00:00.000Z',
            end: '2024-07-01T23:00:00.000Z',
            sessionFormat: 'in_person',
            locationName: 'Test Location',
            code: 'UNIQUE123',
            showLink: true,
            attendanceCount: 0,
            locationAddress: null,
            meetingLink: null,
          },
        ],
      });

      renderWithContext({workshop});

      expect(
        screen.getByText(`${window.origin}/pd/attend/UNIQUE123`)
      ).toBeInTheDocument();
    });
  });

  describe('daily roster links', () => {
    it('renders daily roster buttons for all sessions', () => {
      const workshop = createTestWorkshop();

      renderWithContext({workshop});

      const rosterButtons = screen.getAllByText(/Attendance for .*/);
      expect(rosterButtons).toHaveLength(2); // Two sessions
    });

    it('generates correct roster URLs', () => {
      const workshop = createTestWorkshop();

      renderWithContext({workshop});

      const rosterButtons = screen.getAllByRole('link', {
        name: /View daily roster for .* in new tab/,
      });

      expect(rosterButtons[0]).toHaveAttribute(
        'href',
        '/pd/workshop_dashboard/workshops/123/attendance/1'
      );
      expect(rosterButtons[0]).toHaveAttribute('target', '_blank');

      expect(rosterButtons[1]).toHaveAttribute(
        'href',
        '/pd/workshop_dashboard/workshops/123/attendance/2'
      );
    });
  });

  describe('accessibility', () => {
    it('has proper aria-label for the table', () => {
      const workshop = createTestWorkshop();

      renderWithContext({workshop});

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute(
        'aria-label',
        'Workshop attendance information'
      );
    });

    it('has proper aria-labels for attendance links', () => {
      const workshop = createTestWorkshop();

      renderWithContext({workshop});

      const attendanceLink = screen.getByLabelText(
        /Open attendance URL for .* in new tab/
      );
      expect(attendanceLink).toBeInTheDocument();
    });

    it('has proper aria-labels for roster buttons', () => {
      const workshop = createTestWorkshop();

      renderWithContext({workshop});

      const rosterButtons = screen.getAllByLabelText(
        /View daily roster for .* in new tab/
      );
      expect(rosterButtons).toHaveLength(2); // Two sessions
    });
  });

  describe('edge cases', () => {
    it('handles workshop with no sessions', () => {
      const workshop = createTestWorkshop({sessions: []});

      renderWithContext({workshop});

      expect(screen.getByText('Take Attendance')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Attendance URL')).toBeInTheDocument();
      expect(screen.getByText('View Daily Roster')).toBeInTheDocument();

      // Should not have any session rows
      const table = screen.getByRole('table');
      const rows = table.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(0);
    });

    it('handles workshop with single session', () => {
      const workshop = createTestWorkshop({
        sessions: [
          {
            id: 1,
            start: '2024-07-01T15:00:00.000Z',
            end: '2024-07-01T23:00:00.000Z',
            sessionFormat: 'in_person',
            locationName: 'Test Location',
            code: 'SINGLE123',
            showLink: true,
            attendanceCount: 0,
            locationAddress: null,
            meetingLink: null,
          },
        ],
      });

      renderWithContext({workshop});

      const table = screen.getByRole('table');
      const rows = table.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(1);
    });

    it('handles different workshop IDs correctly', () => {
      const workshop = createTestWorkshop({
        id: 999,
        sessions: [
          {
            id: 5,
            start: '2024-07-01T15:00:00.000Z',
            end: '2024-07-01T23:00:00.000Z',
            sessionFormat: 'in_person',
            locationName: 'Test Location',
            code: 'TEST999',
            showLink: true,
            attendanceCount: 0,
            locationAddress: null,
            meetingLink: null,
          },
        ],
      });

      renderWithContext({workshop});

      const rosterButton = screen.getByRole('link', {
        name: /View daily roster for .* in new tab/,
      });
      expect(rosterButton).toHaveAttribute(
        'href',
        '/pd/workshop_dashboard/workshops/999/attendance/5'
      );
    });
  });

  describe('URL generation', () => {
    it('uses window.origin for attendance URLs', () => {
      // Change window.origin to test different origins
      Object.defineProperty(window, 'origin', {
        writable: true,
        value: 'https://test.code.org',
      });

      const workshop = createTestWorkshop({
        sessions: [
          {
            id: 1,
            start: '2024-07-01T15:00:00.000Z',
            end: '2024-07-01T23:00:00.000Z',
            sessionFormat: 'in_person',
            locationName: 'Test Location',
            code: 'TESTCODE',
            showLink: true,
            attendanceCount: 0,
            locationAddress: null,
            meetingLink: null,
          },
        ],
      });

      renderWithContext({workshop});

      expect(
        screen.getByText('https://test.code.org/pd/attend/TESTCODE')
      ).toBeInTheDocument();
    });
  });

  describe('table structure', () => {
    it('renders correct number of table rows for sessions', () => {
      const workshop = createTestWorkshop();

      renderWithContext({workshop});

      const table = screen.getByRole('table');
      const headerRows = table.querySelectorAll('thead tr');
      const bodyRows = table.querySelectorAll('tbody tr');

      expect(headerRows).toHaveLength(1);
      expect(bodyRows).toHaveLength(2); // Two sessions
    });

    it('renders correct table cells for each session', () => {
      const workshop = createTestWorkshop({
        sessions: [
          {
            id: 1,
            start: '2024-07-01T15:00:00.000Z',
            end: '2024-07-01T23:00:00.000Z',
            sessionFormat: 'in_person',
            locationName: 'Test Location',
            code: 'TESTCODE',
            showLink: true,
            attendanceCount: 0,
            locationAddress: null,
            meetingLink: null,
          },
        ],
      });

      renderWithContext({workshop});

      const table = screen.getByRole('table');
      const bodyRow = table.querySelector('tbody tr');
      const cells = bodyRow?.querySelectorAll('td');

      expect(cells).toHaveLength(3); // Date, Attendance URL, View Daily Roster
    });
  });

  describe('timezone handling', () => {
    it('handles workshop without timezone (uses local time)', () => {
      const workshop = createTestWorkshop({timeZone: null});

      renderWithContext({workshop});

      // Should still render the component without errors
      expect(screen.getByText('Take Attendance')).toBeInTheDocument();

      // Should have session rows
      const table = screen.getByRole('table');
      const bodyRows = table.querySelectorAll('tbody tr');
      expect(bodyRows.length).toBeGreaterThan(0);
    });

    it('handles workshop with timezone (uses timezone conversion)', () => {
      const workshop = createTestWorkshop({timeZone: 'America/Denver'});

      renderWithContext({workshop});

      // Should still render the component without errors
      expect(screen.getByText('Take Attendance')).toBeInTheDocument();

      // Should have session rows
      const table = screen.getByRole('table');
      const bodyRows = table.querySelectorAll('tbody tr');
      expect(bodyRows.length).toBeGreaterThan(0);
    });
  });

  describe('session properties', () => {
    it('handles sessions with different showLink values', () => {
      const workshop = createTestWorkshop({
        sessions: [
          {
            id: 1,
            start: '2024-07-01T15:00:00.000Z',
            end: '2024-07-01T23:00:00.000Z',
            sessionFormat: 'in_person',
            locationName: 'Test Location',
            code: 'SHOW123',
            showLink: true,
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
            code: 'HIDE456',
            showLink: false,
            attendanceCount: 0,
            locationAddress: null,
            meetingLink: null,
          },
        ],
      });

      renderWithContext({workshop});

      // First session should show attendance URL
      expect(
        screen.getByText(`${window.origin}/pd/attend/SHOW123`)
      ).toBeInTheDocument();

      // Second session should not show attendance URL
      expect(
        screen.queryByText(`${window.origin}/pd/attend/HIDE456`)
      ).not.toBeInTheDocument();

      // Both should show roster buttons
      const rosterButtons = screen.getAllByText(/Attendance for .*/);
      expect(rosterButtons).toHaveLength(2);
    });
  });

  describe('component integration', () => {
    it('renders without crashing with minimal data', () => {
      const workshop = createTestWorkshop({
        sessions: [
          {
            id: 1,
            start: '2024-01-01T12:00:00.000Z',
            end: '2024-01-01T13:00:00.000Z',
            sessionFormat: 'in_person',
            locationName: 'Test Location',
            code: 'TEST123',
            showLink: true,
            attendanceCount: 0,
            locationAddress: null,
            meetingLink: null,
          },
        ],
      });

      expect(() => renderWithContext({workshop})).not.toThrow();
    });

    it('handles various session formats', () => {
      const workshop = createTestWorkshop({
        sessions: [
          {
            id: 1,
            start: '2024-01-01T12:00:00.000Z',
            end: '2024-01-01T13:00:00.000Z',
            sessionFormat: 'virtual',
            locationName: 'Online',
            code: 'VIRTUAL123',
            showLink: true,
            attendanceCount: 5,
            locationAddress: null,
            meetingLink: 'https://zoom.us/meeting',
          },
        ],
      });

      renderWithContext({workshop});

      expect(screen.getByText('Take Attendance')).toBeInTheDocument();
      expect(
        screen.getByText(`${window.origin}/pd/attend/VIRTUAL123`)
      ).toBeInTheDocument();
    });
  });
});
