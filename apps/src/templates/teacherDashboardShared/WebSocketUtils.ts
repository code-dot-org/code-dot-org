import {createConsumer} from '@rails/actioncable';

import {AiDiffNotification} from '@cdo/apps/aiDifferentiation/notifications/types';

interface TeacherNotificationMessage {
  type: string;
  notification: AiDiffNotification;
}

export interface WebSocketOptions {
  onNewNotification?: () => void;
  timeoutMs?: number;
}

/**
 * Creates a WebSocket subscription to TeacherNotificationChannel for real-time notifications
 * @param options Configuration object with callback functions
 * @returns Cleanup function to unsubscribe from the WebSocket
 */
export function createTeacherNotificationSubscription(
  options: WebSocketOptions = {}
): (() => void) | null {
  try {
    // Default to 30 min timeout, so we don't clog resources with stale connections
    const {onNewNotification, timeoutMs = 30 * 60 * 1000} = options;

    const consumer = createConsumer();

    const subscription = consumer.subscriptions.create(
      'TeacherNotificationChannel',
      {
        connected() {
          setTimeout(() => {
            subscription.unsubscribe();
          }, timeoutMs);
        },

        received(data: TeacherNotificationMessage) {
          if (data.type === 'new_notification' && onNewNotification) {
            onNewNotification();
          }
        },
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  } catch (error) {
    console.error('Error creating WebSocket subscription:', error);
    return null;
  }
}
