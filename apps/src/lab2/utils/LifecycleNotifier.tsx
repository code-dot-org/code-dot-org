import {Channel, LevelProperties, ProjectSources} from '../types';

export enum LifecycleEvent {
  BeforeLevelChange = 'BeforeLevelChange',
  LevelChangeStarted = 'LevelChangeStarted',
  LevelLoadStarted = 'LevelLoadStarted',
  LevelLoadCompleted = 'LevelLoadCompleted',
}

export type LifecycleRequestEvent = LifecycleEvent.BeforeLevelChange;
export type LifecycleNotifyEvent = Exclude<
  LifecycleEvent,
  LifecycleEvent.BeforeLevelChange
>;
type RequestResult = boolean | void | Promise<boolean | void>;

type CallbackArgs = {
  [LifecycleEvent.BeforeLevelChange]: [];
  [LifecycleEvent.LevelChangeStarted]: [
    previousLevelId: string | null,
    nextLevelId: string
  ];
  [LifecycleEvent.LevelLoadStarted]: [levelId: number];
  [LifecycleEvent.LevelLoadCompleted]: [
    levelProperties: LevelProperties,
    channel: Channel | undefined,
    initialSources: ProjectSources | undefined,
    abuseScore: number | undefined,
    isReadOnly: boolean | undefined,
    projectSharingDisabled: boolean | undefined,
    isTeacherOfProjectOwner: boolean | undefined
  ];
};

export type Callback<T extends LifecycleEvent> = (
  ...args: CallbackArgs[T]
) => T extends LifecycleEvent.BeforeLevelChange ? RequestResult : void;

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
    return this;
  }

  removeListener<T extends LifecycleEvent>(event: T, callback: Callback<T>) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index !== -1) {
        this.listeners[event].splice(index, 1);
      }
    }
    return this;
  }

  async request<T extends LifecycleRequestEvent>(
    event: T,
    ...args: CallbackArgs[T]
  ): Promise<boolean> {
    // Copy the listener list to avoid skipping listeners if the list is modified during iteration.
    const staticListenerList = [...(this.listeners[event] || [])];
    for (const callback of staticListenerList) {
      if ((await (callback as Callback<T>)(...args)) === false) {
        return false;
      }
    }
    return true;
  }

  notify<T extends LifecycleNotifyEvent>(
    event: T,
    ...args: CallbackArgs[T]
  ): void {
    // Copy the listener list to avoid skipping listeners if the list is modified during iteration.
    const staticListenerList = [...(this.listeners[event] || [])];
    staticListenerList.forEach(callback => (callback as Callback<T>)(...args));
  }
}

export default LifecycleNotifier;
