import {createConsumer} from '@rails/actioncable';

import {AiDiffNotification} from '@cdo/apps/aiDifferentiation/notifications/types';

// ActionCable types for WebSocket notifications
interface TeacherNotificationMessage {
  type: string;
  notification: AiDiffNotification;
}

export interface WebSocketOptions {
  onNewNotification?: () => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
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
    const {
      onNewNotification,
      onConnected = () =>
        console.log('Connected to TeacherNotificationChannel'),
      onDisconnected = () =>
        console.log('Disconnected from TeacherNotificationChannel'),
    } = options;

    const consumer = createConsumer();

    const subscription = consumer.subscriptions.create(
      'TeacherNotificationChannel',
      {
        connected() {
          onConnected();
        },

        disconnected() {
          onDisconnected();
        },

        received(data: TeacherNotificationMessage) {
          console.log(
            'Received teacher notification from TeacherNotificationChannel:',
            data
          );

          if (data.type === 'new_notification' && onNewNotification) {
            console.log('New notification received via WebSocket');
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
