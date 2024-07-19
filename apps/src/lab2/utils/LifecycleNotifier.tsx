import {Channel, LevelProperties, ProjectSources} from '../types';

export enum LifecycleEvent {
  LevelChangeRequested,
  LevelLoadStarted,
  LevelLoadCompleted,
}

type callbackArgs = {
  [LifecycleEvent.LevelChangeRequested]: [
    previousLevelId: string | null,
    nextLevelId: string
  ];
  [LifecycleEvent.LevelLoadStarted]: [levelId: number];
  [LifecycleEvent.LevelLoadCompleted]: [
    levelProperties: LevelProperties,
    channel: Channel | undefined,
    initialSources: ProjectSources | undefined
  ];
};

/**
 * Notifies listeners of lifecycle events in the Lab2 system, which doesn't reload the page between levels.
 */
class LifecycleNotifier {
  private listeners: {
    [event in LifecycleEvent]?: ((...args: callbackArgs[event]) => void)[];
  };

  constructor() {
    this.listeners = {};
  }

  addListener<T extends LifecycleEvent>(
    event: T,
    callback: (...args: callbackArgs[T]) => void
  ) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(callback);
  }

  notify<T extends LifecycleEvent>(event: T, ...args: callbackArgs[T]) {
    this.listeners[event]?.forEach(callback => callback(...args));
  }
}

export default LifecycleNotifier;
