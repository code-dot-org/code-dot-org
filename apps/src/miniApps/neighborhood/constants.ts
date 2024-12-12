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
