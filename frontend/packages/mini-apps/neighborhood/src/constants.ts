import type {NeighborhoodExceptionType} from './types';

export const NeighborhoodSignalTypes = {
  // Move the painter
  MOVE: 'MOVE',
  // Initialize the painter
  INITIALIZE_PAINTER: 'INITIALIZE_PAINTER',
  // Add paint to the current location
  PAINT: 'PAINT',
  // Remove all paint from current location
  REMOVE_PAINT: 'REMOVE_PAINT',
  // Take paint from the bucket
  TAKE_PAINT: 'TAKE_PAINT',
  // Hide the painter on the screen
  HIDE_PAINTER: 'HIDE_PAINTER',
  // Show the painter on the screen
  SHOW_PAINTER: 'SHOW_PAINTER',
  // Turn the painter left
  TURN_LEFT: 'TURN_LEFT',
  // Hide all paint buckets
  HIDE_BUCKETS: 'HIDE_BUCKETS',
  // Show all paint buckets
  SHOW_BUCKETS: 'SHOW_BUCKETS',
  // We will not receive any more commands
  DONE: 'DONE',
} as const;

export const ConsoleSignalTypes = {
  CONSOLE_LOG: 'CONSOLE_LOG',
  PARTIAL_LOG: 'PARTIAL_LOG',
} as const;

export const NeighborhoodExceptionTypes = {
  INVALID_GRID: 'INVALID_GRID',
  INVALID_DIRECTION: 'INVALID_DIRECTION',
  GET_SQUARE_FAILED: 'GET_SQUARE_FAILED',
  INVALID_COLOR: 'INVALID_COLOR',
  INVALID_LOCATION: 'INVALID_LOCATION',
  INVALID_MOVE: 'INVALID_MOVE',
  INVALID_PAINT_LOCATION: 'INVALID_PAINT_LOCATION',
} as const;

export const commonI18n = {
  decreaseSpeed() {
    return '';
  },
  exceptionTag() {
    return '';
  },
  errorNeighborhoodUnknown() {
    return '';
  },
  errorNeighborhoodInvalidGrid() {
    return '';
  },
  errorNeighborhoodInvalidDirection() {
    return '';
  },
  errorNeighborhoodGetSquareFailed() {
    return '';
  },
  errorNeighborhoodInvalidColor() {
    return '';
  },
  errorNeighborhoodInvalidLocation() {
    return '';
  },
  errorNeighborhoodInvalidMove() {
    return '';
  },
  errorNeighborhoodInvalidPaintLocation() {
    return '';
  },
  increaseSpeed() {
    return '';
  },
};

export const NeighborhoodExceptionMessage: Record<
  NeighborhoodExceptionType,
  string
> = {
  [NeighborhoodExceptionTypes.INVALID_GRID]:
    commonI18n.errorNeighborhoodInvalidGrid(),
  [NeighborhoodExceptionTypes.INVALID_DIRECTION]:
    commonI18n.errorNeighborhoodInvalidDirection(),
  [NeighborhoodExceptionTypes.GET_SQUARE_FAILED]:
    commonI18n.errorNeighborhoodGetSquareFailed(),
  [NeighborhoodExceptionTypes.INVALID_COLOR]:
    commonI18n.errorNeighborhoodInvalidColor(),
  [NeighborhoodExceptionTypes.INVALID_LOCATION]:
    commonI18n.errorNeighborhoodInvalidLocation(),
  [NeighborhoodExceptionTypes.INVALID_MOVE]:
    commonI18n.errorNeighborhoodInvalidMove(),
  [NeighborhoodExceptionTypes.INVALID_PAINT_LOCATION]:
    commonI18n.errorNeighborhoodInvalidPaintLocation(),
};

export const SVG_ID = 'svgMaze';
export const LOOK_ID = 'look';

/**
 * Stdout envelope tag the Python `neighborhood` package emits. Must match
 * the value of `SignalMessageType.NEIGHBORHOOD` in
 * `python/pythonlab/neighborhood/.../signal_message_type.py`.
 */
export const NEIGHBORHOOD_SIGNAL_TAG = '[NEIGHBORHOOD]';

/** Identifier matching `labConfig.miniApp.name` in dashboard. */
export const NEIGHBORHOOD_NAME = 'neighborhood';
