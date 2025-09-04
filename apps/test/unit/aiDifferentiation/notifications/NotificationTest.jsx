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

const mockNotificationWithLinks = {
  ...mockNotification,
  id: 'test-notification-3',
  hrefLinks: [
    {url: 'https://example.com', text: 'Example Link'},
    {url: 'https://test.com', text: 'Test Link'},
  ],
};

const mockNotificationWithAiPrompts = {
  ...mockNotification,
  id: 'test-notification-4',
  aiPrompts: [{text: 'Generate a story'}, {text: 'Create a lesson plan'}],
};

const mockNotificationWithBoth = {
  ...mockNotification,
  id: 'test-notification-5',
  hrefLinks: [{url: 'https://example.com', text: 'Example Link'}],
  aiPrompts: [{text: 'Generate a story'}],
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

  describe('href links', () => {
    it('renders href links when provided', () => {
      render(<Notification notification={mockNotificationWithLinks} />);

      const exampleLink = screen.getByRole('link', {name: 'Example Link'});
      expect(exampleLink).toHaveAttribute('href', 'https://example.com');
      expect(exampleLink).toHaveAttribute('target', '_blank');
      expect(exampleLink).toHaveAttribute('rel', 'noreferrer noopener');

      const testLink = screen.getByRole('link', {name: 'Test Link'});
      expect(testLink).toHaveAttribute('href', 'https://test.com');
    });

    it('does not render href links when not provided', () => {
      render(<Notification notification={mockNotification} />);

      expect(screen.queryByRole('link')).toBeNull();
    });
  });

  describe('ai prompts', () => {
    it('renders ai prompt buttons when provided', () => {
      render(<Notification notification={mockNotificationWithAiPrompts} />);

      screen.getByRole('button', {name: 'Generate a story'});
      screen.getByRole('button', {name: 'Create a lesson plan'});
    });

    it('does not render ai prompt buttons when not provided', () => {
      render(<Notification notification={mockNotification} />);

      expect(screen.queryByRole('button')).toBeNull();
    });
  });

  describe('links and prompts together', () => {
    it('renders both href links and ai prompts when both are provided', () => {
      render(<Notification notification={mockNotificationWithBoth} />);

      screen.getByRole('link', {name: 'Example Link'});
      screen.getByRole('button', {name: 'Generate a story'});
    });
  });
});
