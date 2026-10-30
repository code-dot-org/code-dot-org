import {createConsumer} from '@rails/actioncable';

import {createTeacherNotificationSubscription} from '@cdo/apps/templates/teacherDashboardShared/WebSocketUtils';

jest.mock('@rails/actioncable');

const mockCreateConsumer = createConsumer as jest.MockedFunction<
  typeof createConsumer
>;

describe('WebSocketUtils', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockConsumer: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSubscription: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockSubscription = {
      unsubscribe: jest.fn(),
    };

    mockConsumer = {
      subscriptions: {
        create: jest.fn().mockReturnValue(mockSubscription),
      },
    };

    mockCreateConsumer.mockReturnValue(mockConsumer);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createTeacherNotificationSubscription', () => {
    it('should create a subscription to TeacherNotificationChannel', () => {
      createTeacherNotificationSubscription();

      expect(mockCreateConsumer).toHaveBeenCalled();
      expect(mockConsumer.subscriptions.create).toHaveBeenCalledWith(
        'TeacherNotificationChannel',
        expect.objectContaining({
          connected: expect.any(Function),
          received: expect.any(Function),
        })
      );
    });

    it('should call unsubscribe when cleanup function is called', () => {
      const cleanup = createTeacherNotificationSubscription();

      cleanup!();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should set up automatic timeout unsubscribe with default timeout', () => {
      createTeacherNotificationSubscription();

      const subscriptionConfig =
        mockConsumer.subscriptions.create.mock.calls[0][1];

      subscriptionConfig.connected();

      jest.advanceTimersByTime(30 * 60 * 1000);

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should set up automatic timeout unsubscribe with custom timeout', () => {
      const customTimeout = 5 * 60 * 1000;
      createTeacherNotificationSubscription({timeoutMs: customTimeout});

      const subscriptionConfig =
        mockConsumer.subscriptions.create.mock.calls[0][1];

      subscriptionConfig.connected();

      jest.advanceTimersByTime(4 * 60 * 1000);
      expect(mockSubscription.unsubscribe).not.toHaveBeenCalled();

      jest.advanceTimersByTime(2 * 60 * 1000);
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should call onNewNotification when receiving new_notification message', () => {
      const mockOnNewNotification = jest.fn();
      createTeacherNotificationSubscription({
        onNewNotification: mockOnNewNotification,
      });

      const subscriptionConfig =
        mockConsumer.subscriptions.create.mock.calls[0][1];

      const mockMessage = {
        type: 'new_notification',
        notification: {id: 1, message: 'Test notification'},
      };

      subscriptionConfig.received(mockMessage);

      expect(mockOnNewNotification).toHaveBeenCalled();
    });
  });
});
