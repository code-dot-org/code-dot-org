/**
 * Possible events that can occur within the game state.
 */
export enum EventType {
  WhenTouched = 'when-touched',
  WhenUsed = 'when-used',
  WhenSpawned = 'when-spawned',
  WhenAttacked = 'when-attached',
  WhenNight = 'when-night',
  WhenDay = 'when-day',
  WhenNightGlobal = 'when-night-global',
  WhenDayGlobal = 'when-day-global',
  WhenRun = 'when-run',
}

/**
 * Event context that is sent as data to the event. An event is some action
 * that happens to some interactive actor within the game world.
 */
export interface EventInfo {
  /** The entity or block type for the target of the event. */
  targetType: string;
  /** The identifier of the entity that is performing the action that sent the event. */
  eventSenderIdentifier: number | string;
  /** The identifier of the entity that is the object of the action. */
  targetIdentifier: number | string;
}
