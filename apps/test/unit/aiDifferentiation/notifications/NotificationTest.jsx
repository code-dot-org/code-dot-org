import {render, screen} from '@testing-library/react';
import React from 'react';

import Notification from '@cdo/apps/aiDifferentiation/notifications/Notification';

const mockNotification = {
  id: 'test-notification-1',
  title: 'Test Notification',
  description: 'This is a test notification description',
  readAt: null,
  iconName: 'bell',
  publishedAt: new Date('2023-01-01T12:00:00Z'),
};

const mockReadNotification = {
  ...mockNotification,
  id: 'test-notification-2',
  readAt: new Date('2023-01-02T12:00:00Z'),
};

describe('Notification', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-03T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('when notification is provided', () => {
    it('renders notification', () => {
      render(<Notification notification={mockNotification} />);

      screen.getByText('Test Notification:');
      screen.getByText('This is a test notification description');
      // eslint-disable-next-line no-restricted-properties
      screen.getByTestId('icon-bell');
      screen.getByText('2 DAYS AGO');
    });

    it('shows unread indicator when notification is unread', () => {
      render(<Notification notification={mockNotification} />);

      screen.getByLabelText('Unread');
    });

    it('hides unread indicator when notification is read', () => {
      render(<Notification notification={mockReadNotification} />);

      expect(screen.queryByLabelText('Unread')).toBeNull();
    });

    it('displays "TODAY" for notifications published today', () => {
      const todayNotification = {
        ...mockNotification,
        publishedAt: new Date('2023-01-03T10:00:00Z'),
      };

      render(<Notification notification={todayNotification} />);

      screen.getByText('TODAY');
    });

    it('displays "YESTERDAY" for notifications published yesterday', () => {
      const yesterdayNotification = {
        ...mockNotification,
        publishedAt: new Date('2023-01-02T10:00:00Z'),
      };

      render(<Notification notification={yesterdayNotification} />);

      screen.getByText('YESTERDAY');
    });
  });

  it('renders loading placeholder content', () => {
    render(<Notification notification={null} />);

    screen.getByText('Loading...:');
    screen.getByText('Lorem ipsum dolor sit amet, postea pericula');
    expect(screen.queryByLabelText('Unread')).toBeNull();

    const skeletonElements = document.querySelectorAll('.skeletonizeContent');
    expect(skeletonElements.length).toEqual(3);
  });

  describe('relative time formatting', () => {
    it('handles edge case of same day at different times', () => {
      const sameDayNotification = {
        ...mockNotification,
        publishedAt: new Date('2023-01-03T08:00:00Z'),
      };

      render(<Notification notification={sameDayNotification} />);

      screen.getByText('TODAY');
    });

    it('handles notifications from exactly one day ago', () => {
      const oneDayAgoNotification = {
        ...mockNotification,
        publishedAt: new Date('2023-01-02T15:00:00Z'),
      };

      render(<Notification notification={oneDayAgoNotification} />);

      screen.getByText('YESTERDAY');
    });

    it('handles notifications from multiple days ago', () => {
      const multipleDaysAgoNotification = {
        ...mockNotification,
        publishedAt: new Date('2022-12-30T12:00:00Z'),
      };

      render(<Notification notification={multipleDaysAgoNotification} />);

      screen.getByText('4 DAYS AGO');
    });
  });
});
