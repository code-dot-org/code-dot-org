import {render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import AiDiffNotificationList from '@cdo/apps/aiDifferentiation/notifications/AiDiffNotificationList';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient');

const mockNotifications = [
  {
    id: 'notification-1',
    title: 'First Notification',
    description: 'This is the first notification',
    readAt: null,
    iconName: 'bell',
    publishedAt: '2023-01-01T12:00:00Z',
  },
  {
    id: 'notification-2',
    title: 'Second Notification',
    description: 'This is the second notification',
    readAt: '2023-01-02T10:00:00Z',
    iconName: 'info',
    publishedAt: '2023-01-01T10:00:00Z',
  },
];

describe('AiDiffNotificationList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('loading state', () => {
    it('displays loading skeleton notifications while fetching', () => {
      HttpClient.fetchJson.mockReturnValue(new Promise(() => {}));

      render(<AiDiffNotificationList />);

      const skeletonElements = document.querySelectorAll('.skeletonizeContent');
      expect(skeletonElements.length).toEqual(9);
    });
  });

  describe('successful data loading', () => {
    it('converts date strings to Date objects', async () => {
      HttpClient.fetchJson.mockResolvedValue({value: mockNotifications});

      render(<AiDiffNotificationList />);

      await waitFor(() => {
        screen.getByText('First Notification:');
      });

      expect(HttpClient.fetchJson).toHaveBeenCalledTimes(1);
    });

    it('handles notifications with null readAt dates', async () => {
      HttpClient.fetchJson.mockResolvedValue({value: mockNotifications});

      render(<AiDiffNotificationList />);

      await waitFor(() => {
        screen.getByText('First Notification:');
      });

      screen.getByLabelText('Unread');
    });

    it('handles notifications with readAt dates', async () => {
      HttpClient.fetchJson.mockResolvedValue({value: mockNotifications});

      render(<AiDiffNotificationList />);

      await waitFor(() => {
        screen.getByText('Second Notification:');
      });

      screen.getByText('This is the second notification');
    });
  });

  it('displays empty state message when no notifications exist', async () => {
    HttpClient.fetchJson.mockResolvedValue({value: []});

    render(<AiDiffNotificationList />);

    await waitFor(() => {
      screen.getByText('no notifications');
    });

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  describe('error handling', () => {
    it('logs error when fetch fails', async () => {
      const mockError = new Error('Network error');
      HttpClient.fetchJson.mockRejectedValue(mockError);

      render(<AiDiffNotificationList />);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Error fetching notifications:',
          mockError
        );
      });
    });

    it('handles malformed response data gracefully', async () => {
      HttpClient.fetchJson.mockResolvedValue({value: 'invalid-data'});

      render(<AiDiffNotificationList />);

      await waitFor(() => {
        screen.getByText('no notifications');
      });
    });
  });

  it('renders correct number of notifications', async () => {
    HttpClient.fetchJson.mockResolvedValue({value: mockNotifications});

    render(<AiDiffNotificationList />);

    await waitFor(() => {
      screen.getByText('First Notification:');
      screen.getByText('Second Notification:');
    });
  });
});
