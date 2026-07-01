import type {
  Channel,
  LevelProperties,
  ProjectSources,
} from '@code-dot-org/core/api';

export const LifecycleEvent = {
  LevelChangeRequested: 0,
  LevelLoadStarted: 1,
  LevelLoadCompleted: 2,
} as const;

export type LifecycleEventType =
  (typeof LifecycleEvent)[keyof typeof LifecycleEvent];

type CallbackArgs = {
  [LifecycleEvent.LevelChangeRequested]: [
    previousLevelId: string | null,
    nextLevelId: string,
  ];
  [LifecycleEvent.LevelLoadStarted]: [levelId: number];
  [LifecycleEvent.LevelLoadCompleted]: [
    levelProperties: LevelProperties,
    channel: Channel | undefined,
    initialSources: ProjectSources | undefined,
    abuseScore: number | undefined,
    isReadOnly: boolean | undefined,
    projectSharingDisabled: boolean | undefined,
    isTeacherOfProjectOwner: boolean | undefined,
  ];
};

export type Callback<T extends LifecycleEventType> = (
  ...args: CallbackArgs[T]
) => void;

/**
 * Notifies listeners of lifecycle events in the Lab2 system, which doesn't reload the page between levels.
 */
class LifecycleNotifier {
  private listeners: {[T in LifecycleEventType]?: Callback<T>[]};

  constructor() {
    this.listeners = {};
  }

  addListener<T extends LifecycleEventType>(event: T, callback: Callback<T>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(callback);
    return this;
  }

  removeListener<T extends LifecycleEventType>(
    event: T,
    callback: Callback<T>,
  ) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index !== -1) {
        this.listeners[event].splice(index, 1);
      }
    }
    return this;
  }

  notify<T extends LifecycleEventType>(event: T, ...args: CallbackArgs[T]) {
    this.listeners[event]?.forEach(callback => callback(...args));
  }
}

export default LifecycleNotifier;
