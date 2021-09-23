import {makeEnum} from '@cdo/apps/utils';

export const CsaViewMode = {
  NEIGHBORHOOD: 'neighborhood',
  CONSOLE: 'console',
  THEATER: 'theater',
  PLAYGROUND: 'playground'
};

export const WebSocketMessageType = {
  NEIGHBORHOOD: 'NEIGHBORHOOD',
  THEATER: 'THEATER',
  PLAYGROUND: 'PLAYGROUND',
  SYSTEM_OUT: 'SYSTEM_OUT',
  EXCEPTION: 'EXCEPTION',
  DEBUG: 'DEBUG',
  STATUS: 'STATUS'
};

export const JavabuilderExceptionType = {
  CLASS_NOT_FOUND: 'CLASS_NOT_FOUND',
  COMPILER_ERROR: 'COMPILER_ERROR',
  ILLEGAL_METHOD_ACCESS: 'ILLEGAL_METHOD_ACCESS',
  INTERNAL_COMPILER_EXCEPTION: 'INTERNAL_COMPILER_EXCEPTION',
  INTERNAL_EXCEPTION: 'INTERNAL_EXCEPTION',
  INTERNAL_RUNTIME_EXCEPTION: 'INTERNAL_RUNTIME_EXCEPTION',
  JAVA_EXTENSION_MISSING: 'JAVA_EXTENSION_MISSING',
  NO_MAIN_METHOD: 'NO_MAIN_METHOD',
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  TWO_MAIN_METHODS: 'TWO_MAIN_METHODS',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

export const NeighborhoodSignalType = {
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
  DONE: 'DONE'
};

export const NeighborhoodExceptionType = makeEnum(
  'INVALID_GRID',
  'INVALID_DIRECTION',
  'GET_SQUARE_FAILED',
  'INVALID_COLOR',
  'INVALID_LOCATION',
  'INVALID_MOVE',
  'INVALID_PAINT_LOCATION'
);

export const TheaterSignalType = {
  AUDIO_URL: 'AUDIO_URL',
  VISUAL_URL: 'VISUAL_URL'
};

export const StatusMessageType = {
  COMPILING: 'COMPILING',
  COMPILATION_SUCCESSFUL: 'COMPILATION_SUCCESSFUL',
  RUNNING: 'RUNNING',
  GENERATING_RESULTS: 'GENERATING_RESULTS',
  EXITED: 'EXITED'
};

export const InputMessageType = {
  SYSTEM_IN: 'SYSTEM_IN',
  PLAYGROUND: 'PLAYGROUND'
};

export const SoundExceptionType = makeEnum(
  'INVALID_AUDIO_FILE_FORMAT',
  'MISSING_AUDIO_DATA'
);

export const MediaExceptionType = makeEnum('IMAGE_LOAD_ERROR');

export const TheaterExceptionType = makeEnum(
  'DUPLICATE_PLAY_COMMAND',
  'INVALID_SHAPE'
);

export const PlaygroundExceptionType = {
  PLAYGROUND_RUNNING: 'PLAYGROUND_RUNNING',
  PLAYGROUND_NOT_RUNNING: 'PLAYGROUND_NOT_RUNNING'
};

export const CompileStatus = makeEnum('NONE', 'LOADING', 'SUCCESS', 'ERROR');

export const STATUS_MESSAGE_PREFIX = '[JAVALAB]';

export const PlaygroundSignalType = {
  // Indicate that the Playground game has started
  RUN: 'RUN',
  // Indicate that the Playground game has ended
  EXIT: 'EXIT',
  // Add an image item to the Playground
  ADD_IMAGE_ITEM: 'ADD_IMAGE_ITEM',
  // Add a clickable item to the Playground
  ADD_CLICKABLE_ITEM: 'ADD_CLICKABLE_ITEM',
  // Add a text item to the Playground
  ADD_TEXT_ITEM: 'ADD_TEXT_ITEM',
  // Remove an item from the Playground
  REMOVE_ITEM: 'REMOVE_ITEM',
  // Change an item's properties
  CHANGE_ITEM: 'CHANGE_ITEM',
  // Play a sound
  PLAY_SOUND: 'PLAY_SOUND',
  // Set the background image of the Playground
  SET_BACKGROUND_IMAGE: 'SET_BACKGROUND_IMAGE'
};
