import {Channel, LevelProperties, ProjectSources} from '../types';

export enum LifecycleEvent {
  LevelChangeRequested,
  LevelLoadStarted,
  LevelLoadCompleted,
}

type CallbackArgs = {
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

type Callback<T extends LifecycleEvent> = (...args: CallbackArgs[T]) => void;

/**
 * Notifies listeners of lifecycle events in the Lab2 system, which doesn't reload the page between levels.
 */
class LifecycleNotifier {
  private listeners: {[T in LifecycleEvent]?: Callback<T>[]};

  constructor() {
    this.listeners = {};
  }

  addListener<T extends LifecycleEvent>(event: T, callback: Callback<T>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(callback);
  }

  removeListener<T extends LifecycleEvent>(event: T, callback: Callback<T>) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index !== -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  notify<T extends LifecycleEvent>(event: T, ...args: CallbackArgs[T]) {
    this.listeners[event]?.forEach(callback => callback(...args));
  }
}

export default LifecycleNotifier;
