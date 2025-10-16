import {render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import AiDiffNotificationList from '@cdo/apps/aiDifferentiation/notifications/AiDiffNotificationList';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient');

const NOTIFICATION_1 = {
  id: 'notification-1',
  externalId: 'ext-notif-1',
  title: 'First Notification',
  description: 'This is the first notification',
  readAt: null,
  iconName: 'bell',
  publishedAt: '2023-01-01T12:00:00Z',
};
const NOTIFICATION_2 = {
  id: 'notification-2',
  externalId: 'ext-notif-2',
  title: 'Second Notification',
  description: 'This is the second notification',
  readAt: '2023-01-02T10:00:00Z',
  iconName: 'info',
  publishedAt: '2023-01-01T10:00:00Z',
};
const mockNotifications = [NOTIFICATION_1, NOTIFICATION_2];

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
    let markAsReadMock;
    beforeEach(() => {
      markAsReadMock = HttpClient.post.mockResolvedValue({});
    });

    it('handles notifications with null readAt dates', async () => {
      HttpClient.fetchJson.mockResolvedValue({value: [NOTIFICATION_1]});

      render(<AiDiffNotificationList />);

      await waitFor(() => {
        screen.getByText('First Notification:');
      });

      screen.getByLabelText('Unread');

      expect(markAsReadMock).toHaveBeenCalledWith(
        '/notifications/mark_as_read',
        '{"external_notification_ids":["ext-notif-1"]}',
        true,
        {
          'Content-Type': 'application/json; charset=UTF-8',
        }
      );
    });

    it('handles notifications with readAt dates', async () => {
      HttpClient.fetchJson.mockResolvedValue({value: [NOTIFICATION_2]});

      render(<AiDiffNotificationList />);

      await waitFor(() => {
        screen.getByText('Second Notification:');
      });

      screen.getByText('This is the second notification');
      expect(screen.queryByLabelText('Unread')).toBeNull();
      expect(markAsReadMock).toHaveBeenCalledTimes(0);
    });
  });

  it('displays empty state message when no notifications exist', async () => {
    HttpClient.fetchJson.mockResolvedValue({value: []});

    render(<AiDiffNotificationList />);

    await waitFor(() => {
      screen.getByText(/You don't have any new notifications/);
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
          'Error fetching notifications for list:',
          mockError
        );
      });
    });

    it('handles malformed response data gracefully', async () => {
      HttpClient.fetchJson.mockResolvedValue({value: 'invalid-data'});

      render(<AiDiffNotificationList />);

      await waitFor(() => {
        screen.getByText(/You don't have any new notifications/);
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
