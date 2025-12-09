import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';

import {WorkshopStatusSection} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/overview/sections/WorkshopStatusSection';
import {WorkshopData} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/types';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

// Mock the authenticity token utility
jest.mock('@cdo/apps/util/AuthenticityTokenStore');
const mockGetAuthenticityToken = getAuthenticityToken as jest.MockedFunction<
  typeof getAuthenticityToken
>;

describe('WorkshopStatusSection', () => {
  const mockOnWorkshopUpdate = jest.fn();
  const user = userEvent.setup();
  const mockFetch = jest.fn();

  beforeEach(() => {
    mockFetch.mockClear();
    jest.spyOn(window, 'fetch').mockImplementation(mockFetch);
    mockOnWorkshopUpdate.mockClear();
    mockGetAuthenticityToken.mockResolvedValue('fake-csrf-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createTestWorkshop = (
    overrides: Partial<WorkshopData> = {}
  ): WorkshopData => ({
    id: 1,
    state: 'Not Started',
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

  const renderDefault = (
    workshop: WorkshopData,
    isWorkshopAdmin: boolean = false
  ) => {
    return render(
      <WorkshopStatusSection
        workshop={workshop}
        isWorkshopAdmin={isWorkshopAdmin}
        onWorkshopUpdate={mockOnWorkshopUpdate}
      />
    );
  };

  describe('rendering different workshop states', () => {
    it('renders Not Started state correctly', () => {
      renderDefault(createTestWorkshop({state: 'Not Started'}));

      expect(screen.getByText('Workshop Status')).toBeInTheDocument();
      expect(screen.getByText('Not Started')).toBeInTheDocument();
      expect(
        screen.getByText(
          'On the day of your workshop, click the "Start Workshop" button below.'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Start Workshop')).toBeInTheDocument();
    });

    it('renders In Progress state with account required for attendance', () => {
      renderDefault(
        createTestWorkshop({
          state: 'In Progress',
          accountRequiredForAttendance: true,
        })
      );

      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(
        screen.getByText(
          'On the day of the workshop, ask workshop attendees to follow the steps:'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText('Step 1: Sign into Code Studio')
      ).toBeInTheDocument();
      expect(screen.getByText('Step 2: Take attendance')).toBeInTheDocument();
      expect(screen.getByText('End workshop')).toBeInTheDocument();
    });

    it('renders In Progress state with account NOT required for attendance', () => {
      renderDefault(
        createTestWorkshop({
          state: 'In Progress',
          accountRequiredForAttendance: false,
        })
      );

      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(
        screen.getByText(
          "On the day of the workshop, ask workshop attendees to register if they haven't already:"
        )
      ).toBeInTheDocument();

      // Should NOT show the step-by-step instructions
      expect(
        screen.queryByText('Step 1: Sign into Code Studio')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Step 2: Take attendance')
      ).not.toBeInTheDocument();
    });

    it('renders Ended state correctly', () => {
      renderDefault(createTestWorkshop({state: 'Ended'}));

      expect(screen.getByText('Ended')).toBeInTheDocument();
      expect(
        screen.getByText('We hope you had a great workshop!')
      ).toBeInTheDocument();
      expect(screen.getByText('survey@code.org')).toBeInTheDocument();
      expect(screen.getByText('support@code.org')).toBeInTheDocument();
    });

    it('shows cannot end workshop message when readyToClose is false', () => {
      renderDefault(
        createTestWorkshop({
          state: 'In Progress',
          readyToClose: false,
        })
      );

      expect(
        screen.getByText(
          'Workshop should not end until all sessions are complete and attendance has been taken.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('admin functionality', () => {
    it('shows admin buttons for workshop admin users', () => {
      renderDefault(
        createTestWorkshop({state: 'In Progress'}),
        true // isWorkshopAdmin
      );

      expect(screen.getByText('Unstart (admin)')).toBeInTheDocument();
    });

    it('shows reopen button for ended workshops when user is admin', () => {
      renderDefault(
        createTestWorkshop({state: 'Ended'}),
        true // isWorkshopAdmin
      );

      expect(screen.getByText('Reopen (admin)')).toBeInTheDocument();
    });

    it('does not show admin buttons for non-admin users', () => {
      renderDefault(
        createTestWorkshop({state: 'In Progress'}),
        false // isWorkshopAdmin
      );

      expect(screen.queryByText('Unstart (admin)')).not.toBeInTheDocument();
    });
  });

  describe('start workshop functionality', () => {
    it('shows confirmation dialog when start workshop is clicked', async () => {
      renderDefault(createTestWorkshop({state: 'Not Started'}));

      const startButton = screen.getByText('Start Workshop');
      await user.click(startButton);

      expect(screen.getByText('Start Workshop?')).toBeInTheDocument();
      expect(
        screen.getByText('Are you sure you want to start this workshop?')
      ).toBeInTheDocument();
    });

    it('cancels start workshop when cancel is clicked', async () => {
      renderDefault(createTestWorkshop({state: 'Not Started'}));

      const startButton = screen.getByText('Start Workshop');
      await user.click(startButton);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(screen.queryByText('Start Workshop?')).not.toBeInTheDocument();
    });

    it('successfully starts workshop when confirmed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);

      renderDefault(createTestWorkshop({state: 'Not Started'}));

      // Click the initial start button
      const startButton = screen.getByText('Start Workshop');
      await user.click(startButton);

      // Wait for dialog to appear
      expect(screen.getByText('Start Workshop?')).toBeInTheDocument();

      // Get all buttons with "Start Workshop" text and click the second one (dialog button)
      const startButtons = screen.getAllByRole('button', {
        name: 'Start Workshop',
      });
      expect(startButtons).toHaveLength(2);

      await act(async () => {
        await user.click(startButtons[1]); // Click the dialog confirm button
      });

      await waitFor(() => {
        expect(mockOnWorkshopUpdate).toHaveBeenCalledTimes(1);
      });

      expect(screen.queryByText('Start Workshop?')).not.toBeInTheDocument();
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/pd/workshops/1/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'fake-csrf-token',
        },
      });
    });
  });

  describe('end workshop functionality', () => {
    it('shows confirmation dialog when end workshop is clicked', async () => {
      renderDefault(createTestWorkshop({state: 'In Progress'}));

      const endButton = screen.getByText('End workshop');
      await user.click(endButton);

      expect(screen.getByText('End Workshop?')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Ending this workshop will close the attendance. Are you sure you want to end this workshop now?'
        )
      ).toBeInTheDocument();
    });

    it('successfully ends workshop when confirmed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);

      renderDefault(createTestWorkshop({state: 'In Progress'}));

      const endButton = screen.getByText('End workshop');
      await user.click(endButton);

      // Wait for dialog to appear
      expect(screen.getByText('End Workshop?')).toBeInTheDocument();

      // Click the confirm button in the dialog
      const confirmButton = screen.getByRole('button', {name: 'End Workshop'});
      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockOnWorkshopUpdate).toHaveBeenCalledTimes(1);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/pd/workshops/1/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'fake-csrf-token',
        },
      });
    });
  });

  describe('admin actions', () => {
    it('shows unstart confirmation dialog when unstart is clicked', async () => {
      renderDefault(
        createTestWorkshop({state: 'In Progress'}),
        true // isWorkshopAdmin
      );

      const unstartButton = screen.getByText('Unstart (admin)');
      await user.click(unstartButton);

      expect(screen.getByText('Unstart Workshop?')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Are you sure you want to unstart this workshop and change it back to "Not Started?"'
        )
      ).toBeInTheDocument();
    });

    it('successfully unstarts workshop when confirmed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);

      renderDefault(
        createTestWorkshop({state: 'In Progress'}),
        true // isWorkshopAdmin
      );

      const unstartButton = screen.getByText('Unstart (admin)');
      await user.click(unstartButton);

      const confirmButton = screen.getByText('Unstart Workshop');
      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockOnWorkshopUpdate).toHaveBeenCalledTimes(1);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/pd/workshops/1/unstart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'fake-csrf-token',
        },
      });
    });

    it('shows reopen confirmation dialog when reopen is clicked', async () => {
      renderDefault(
        createTestWorkshop({state: 'Ended'}),
        true // isWorkshopAdmin
      );

      const reopenButton = screen.getByText('Reopen (admin)');
      await user.click(reopenButton);

      expect(screen.getByText('Reopen Workshop?')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Are you sure you want to reopen this workshop and change it back to "In Progress"/
        )
      ).toBeInTheDocument();
    });

    it('successfully reopens workshop when confirmed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);

      renderDefault(
        createTestWorkshop({state: 'Ended'}),
        true // isWorkshopAdmin
      );

      const reopenButton = screen.getByText('Reopen (admin)');
      await user.click(reopenButton);

      const confirmButton = screen.getByText('Reopen Workshop');

      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockOnWorkshopUpdate).toHaveBeenCalledTimes(1);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/pd/workshops/1/reopen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'fake-csrf-token',
        },
      });
    });
  });

  describe('error handling', () => {
    it('displays error alert when API request fails with 403', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response);

      renderDefault(createTestWorkshop({state: 'Not Started'}));

      const startButton = screen.getByText('Start Workshop');
      await user.click(startButton);

      const confirmButton = screen.getAllByRole('button', {
        name: 'Start Workshop',
      })[1];

      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText('You do not have permission to perform this action.')
        ).toBeInTheDocument();
      });

      expect(mockOnWorkshopUpdate).not.toHaveBeenCalled();
    });

    it('displays error alert when API request fails with 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response);

      renderDefault(createTestWorkshop({state: 'Not Started'}));

      const startButton = screen.getByText('Start Workshop');
      await user.click(startButton);

      const confirmButton = screen.getAllByRole('button', {
        name: 'Start Workshop',
      })[1];

      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Workshop not found.')).toBeInTheDocument();
      });
    });

    it('displays error alert when API request fails with 500', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response);

      renderDefault(createTestWorkshop({state: 'Not Started'}));

      const startButton = screen.getByText('Start Workshop');
      await user.click(startButton);

      const confirmButton = screen.getAllByRole('button', {
        name: 'Start Workshop',
      })[1];

      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText('Server error occurred. Please try again later.')
        ).toBeInTheDocument();
      });
    });

    it('displays custom error message from API response', async () => {
      const customErrorMessage = 'Custom error from server';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({error: customErrorMessage}),
      } as unknown as Response);

      renderDefault(createTestWorkshop({state: 'Not Started'}));

      const startButton = screen.getByText('Start Workshop');
      await user.click(startButton);

      const confirmButton = screen.getAllByRole('button', {
        name: 'Start Workshop',
      })[1];

      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(screen.getByText(customErrorMessage)).toBeInTheDocument();
      });
    });

    it('displays joined error messages from errors array in API response', async () => {
      const errorMessages = ['First error message', 'Second error message'];
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({errors: errorMessages}),
      } as unknown as Response);

      renderDefault(createTestWorkshop({state: 'Not Started'}));

      const startButton = screen.getByText('Start Workshop');
      await user.click(startButton);

      const confirmButton = screen.getAllByRole('button', {
        name: 'Start Workshop',
      })[1];

      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText('First error message, Second error message')
        ).toBeInTheDocument();
      });
    });

    it('displays unknown error when fetch throws', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderDefault(createTestWorkshop({state: 'Not Started'}));

      const startButton = screen.getByText('Start Workshop');
      await user.click(startButton);

      const confirmButton = screen.getAllByRole('button', {
        name: 'Start Workshop',
      })[1];

      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText('An unknown error occurred. Please try again.')
        ).toBeInTheDocument();
      });
    });

    it('allows user to dismiss error alert', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response);

      renderDefault(createTestWorkshop({state: 'Not Started'}));

      const startButton = screen.getByText('Start Workshop');
      await user.click(startButton);

      const confirmButton = screen.getAllByRole('button', {
        name: 'Start Workshop',
      })[1];

      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText('You do not have permission to perform this action.')
        ).toBeInTheDocument();
      });

      const dismissButton = screen.getByLabelText('Dismiss error');
      await user.click(dismissButton);

      expect(
        screen.queryByText('You do not have permission to perform this action.')
      ).not.toBeInTheDocument();
    });

    it('clears error when opening a new dialog', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response);

      renderDefault(createTestWorkshop({state: 'Not Started'}));

      // First, trigger an error
      const startButton = screen.getByText('Start Workshop');
      await user.click(startButton);

      const confirmButton = screen.getAllByRole('button', {
        name: 'Start Workshop',
      })[1];

      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText('You do not have permission to perform this action.')
        ).toBeInTheDocument();
      });

      // Now click the start button again to open a new dialog
      const startButtonAgain = screen.getByText('Start Workshop');
      await user.click(startButtonAgain);

      // Error should be cleared
      expect(
        screen.queryByText('You do not have permission to perform this action.')
      ).not.toBeInTheDocument();

      // Dialog should be open
      expect(screen.getByText('Start Workshop?')).toBeInTheDocument();
    });

    it('displays default error message when response parsing fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockRejectedValue(new Error('JSON parse error')),
      } as unknown as Response);

      renderDefault(createTestWorkshop({state: 'Not Started'}));

      const startButton = screen.getByText('Start Workshop');
      await user.click(startButton);

      const confirmButton = screen.getAllByRole('button', {
        name: 'Start Workshop',
      })[1];

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

  describe('URL generation', () => {
    it('generates correct URLs for different workshop IDs', () => {
      const workshopId = 12345;
      renderDefault(
        createTestWorkshop({
          id: workshopId,
          state: 'In Progress',
          accountRequiredForAttendance: true,
        })
      );

      expect(
        screen.getByText(
          `${window.origin}/professional-learning/workshops/${workshopId}`
        )
      ).toBeInTheDocument();
    });
  });
});
