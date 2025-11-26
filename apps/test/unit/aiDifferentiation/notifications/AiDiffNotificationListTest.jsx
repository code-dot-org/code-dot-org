import {render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import AiDiffNotificationList from '@cdo/apps/aiDifferentiation/notifications/AiDiffNotificationList';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient');

const EXTERNAL_NOTIFICATION_1 = {
  id: 'notification-1',
  externalId: 'ext-notif-1',
  title: 'First External Notification',
  description: 'This is the first external notification',
  readAt: null,
  iconName: 'bell',
  publishedAt: '2023-01-01T12:00:00Z',
};
const EXTERNAL_NOTIFICATION_2 = {
  id: 'notification-2',
  externalId: 'ext-notif-2',
  title: 'Second External Notification',
  description: 'This is the second external notification',
  readAt: '2023-01-04T10:00:00Z',
  iconName: 'info',
  publishedAt: '2023-01-03T10:00:00Z',
};
const NOTIFICATION_1 = {
  id: 'notification-1',
  externalId: null,
  title: 'First Notification',
  description: 'This is the second external notification',
  readAt: null,
  iconName: 'info',
  publishedAt: '2023-01-02T10:00:00Z',
};
const mockNotifications = [
  EXTERNAL_NOTIFICATION_1,
  EXTERNAL_NOTIFICATION_2,
  NOTIFICATION_1,
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
    let markAsReadMock;
    beforeEach(() => {
      markAsReadMock = HttpClient.post.mockResolvedValue({});
    });

    it('handles notifications with null readAt dates', async () => {
      HttpClient.fetchJson.mockResolvedValue({
        value: [
          EXTERNAL_NOTIFICATION_1,
          EXTERNAL_NOTIFICATION_2,
          NOTIFICATION_1,
        ],
      });

      render(<AiDiffNotificationList />);

      await waitFor(() => {
        screen.getByText('First External Notification:');
        screen.getByText('First Notification:');
      });

      // Ignores already read notification
      expect(screen.getAllByLabelText('Unread')).toHaveLength(2);

      expect(markAsReadMock).toHaveBeenCalledWith(
        '/notifications/mark_as_read',
        '{"external_notification_ids":["ext-notif-1"],"teacher_notification_ids":["notification-1"]}',
        true,
        {
          'Content-Type': 'application/json; charset=UTF-8',
        }
      );
    });

    it('handles notifications with readAt dates', async () => {
      HttpClient.fetchJson.mockResolvedValue({
        value: [EXTERNAL_NOTIFICATION_2],
      });

      render(<AiDiffNotificationList />);

      await waitFor(() => {
        screen.getByText('Second External Notification:');
      });

      screen.getByText('This is the second external notification');
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

  it('sorts notifications by most recent publishedAt date', async () => {
    HttpClient.fetchJson.mockResolvedValue({value: mockNotifications});

    render(<AiDiffNotificationList />);

    await waitFor(() => {
      screen.getByText('First Notification:');
      screen.getByText('First External Notification:');
      screen.getByText('Second External Notification:');
    });

    const notifications = screen.getAllByText(/:$/).map(el => el.textContent);
    expect(notifications).toEqual([
      'Second External Notification: ',
      'First Notification: ',
      'First External Notification: ',
    ]);
  });
});
