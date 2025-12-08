declare module '@rails/actioncable' {
  export interface Subscription {
    perform(action: string, data?: Record<string, unknown>): void;
    unsubscribe(): void;
  }

  export interface Subscriptions {
    create(
      params: Record<string, unknown>,
      callbacks: Partial<{
        connected(this: Subscription): void;
        disconnected(this: Subscription): void;
        received(this: Subscription, data: unknown): void;
      }>
    ): Subscription;
    remove(subscription: Subscription): void;
  }

  export interface Consumer {
    subscriptions: Subscriptions;
  }

  export function createConsumer(url?: string): Consumer;
}
