export const CsaViewMode = {
  NEIGHBORHOOD: 'neighborhood',
  CONSOLE: 'console',
  THEATER: 'theater'
};

export const WebSocketMessageType = {
  NEIGHBORHOOD: 'NEIGHBORHOOD',
  SYSTEM_OUT: 'SYSTEM_OUT',
  EXCEPTION: 'EXCEPTION',
  DEBUBG: 'DEBUG'
};

export const JavabuilderExceptionType = {
  COMPILER_ERROR: 'COMPILER_ERROR',
  ILLEGAL_METHOD_ACCESS: 'ILLEGAL_METHOD_ACCESS',
  INTERNAL_COMPILER_EXCEPTION: 'INTERNAL_COMPILER_EXCEPTION',
  INTERNAL_EXCEPTION: 'INTERNAL_EXCEPTION',
  INTERNAL_RUNTIME_EXCEPTION: 'INTERNAL_RUNTIME_EXCEPTION',
  JAVA_EXTENSION_MISSING: 'JAVA_EXTENSION_MISSING',
  NO_MAIN_METHOD: 'NO_MAIN_METHOD',
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  TWO_MAIN_METHODS: 'TWO_MAIN_METHODS'
};

export const NeighborhoodSignalType = {
  MOVE: 'MOVE',
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
  SHOW_BUCKETS: 'SHOW_BUCKETS'
};
