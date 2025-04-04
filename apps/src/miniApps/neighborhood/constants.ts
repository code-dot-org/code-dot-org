import commonI18n from '@cdo/locale';

export enum NeighborhoodSignalType {
  // Move the painter
  MOVE = 'MOVE',
  // Initialize the painter
  INITIALIZE_PAINTER = 'INITIALIZE_PAINTER',
  // Add paint to the current location
  PAINT = 'PAINT',
  // Remove all paint from current location
  REMOVE_PAINT = 'REMOVE_PAINT',
  // Take paint from the bucket
  TAKE_PAINT = 'TAKE_PAINT',
  // Hide the painter on the screen
  HIDE_PAINTER = 'HIDE_PAINTER',
  // Show the painter on the screen
  SHOW_PAINTER = 'SHOW_PAINTER',
  // Turn the painter left
  TURN_LEFT = 'TURN_LEFT',
  // Hide all paint buckets
  HIDE_BUCKETS = 'HIDE_BUCKETS',
  // Show all paint buckets
  SHOW_BUCKETS = 'SHOW_BUCKETS',
  // We will not receive any more commands
  DONE = 'DONE',
}

export enum NeighborhoodExceptionType {
  INVALID_GRID = 'INVALID_GRID',
  INVALID_DIRECTION = 'INVALID_DIRECTION',
  GET_SQUARE_FAILED = 'GET_SQUARE_FAILED',
  INVALID_COLOR = 'INVALID_COLOR',
  INVALID_LOCATION = 'INVALID_LOCATION',
  INVALID_MOVE = 'INVALID_MOVE',
  INVALID_PAINT_LOCATION = 'INVALID_PAINT_LOCATION',
}

export const NeighborhoodExceptionMessage: Record<
  NeighborhoodExceptionType,
  string
> = {
  [NeighborhoodExceptionType.INVALID_GRID]:
    commonI18n.errorNeighborhoodInvalidGrid(),
  [NeighborhoodExceptionType.INVALID_DIRECTION]:
    commonI18n.errorNeighborhoodInvalidDirection(),
  [NeighborhoodExceptionType.GET_SQUARE_FAILED]:
    commonI18n.errorNeighborhoodGetSquareFailed(),
  [NeighborhoodExceptionType.INVALID_COLOR]:
    commonI18n.errorNeighborhoodInvalidColor(),
  [NeighborhoodExceptionType.INVALID_LOCATION]:
    commonI18n.errorNeighborhoodInvalidLocation(),
  [NeighborhoodExceptionType.INVALID_MOVE]:
    commonI18n.errorNeighborhoodInvalidMove(),
  [NeighborhoodExceptionType.INVALID_PAINT_LOCATION]:
    commonI18n.errorNeighborhoodInvalidPaintLocation(),
};
