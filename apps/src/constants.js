/**
 * @fileoverview Constants used in production code and tests.
 */

/**
 * Enumeration of user program execution outcomes.
 * These are determined by each app.
 */
exports.ResultType = {
  UNSET: 0,       // The result has not yet been computed.
  SUCCESS: 1,     // The program completed successfully, achieving the goal.
  FAILURE: -1,    // The program ran without error but did not achieve goal.
  TIMEOUT: 2,     // The program did not complete (likely infinite loop).
  ERROR: -2       // The program generated an error.
};

/**
 * Enumeration of test results.
 * EMPTY_BLOCK_FAIL and EMPTY_FUNCTION_BLOCK_FAIL can only occur if
 * StudioApp.checkForEmptyBlocks_ is true.
 * NOTE: We store the results for user attempts in our db, so changing these
 * values would necessitate a migration
 */
exports.TestResults = {
  // Default value before any tests are run.
  NO_TESTS_RUN: -1,

  // The level was not solved.
  EMPTY_BLOCK_FAIL: 1,           // An "if" or "repeat" block was empty.
  TOO_FEW_BLOCKS_FAIL: 2,        // Fewer than the ideal number of blocks used.
  LEVEL_INCOMPLETE_FAIL: 3,      // Default failure to complete a level.
  MISSING_BLOCK_UNFINISHED: 4,   // A required block was not used.
  EXTRA_TOP_BLOCKS_FAIL: 5,      // There was more than one top-level block.
  MISSING_BLOCK_FINISHED: 10,    // The level was solved without required block.
  APP_SPECIFIC_FAIL: 11,         // Application-specific failure.
  EMPTY_FUNCTION_BLOCK_FAIL: 12, // A "function" block was empty
  UNUSED_PARAM: 13,              // Param declared but not used in function.
  UNUSED_FUNCTION: 14,           // Function declared but not used in workspace.
  PARAM_INPUT_UNATTACHED: 15,    // Function not called with enough params.
  INCOMPLETE_BLOCK_IN_FUNCTION: 16, // Incomplete block inside a function.
  QUESTION_MARKS_IN_NUMBER_FIELD: 17, // Block has ??? instead of a value.
  EMPTY_FUNCTIONAL_BLOCK: 18,    // There's a functional block with an open input
  EXAMPLE_FAILED: 19,            // One of our examples didn't match the definition

  // start using negative values, since we consider >= 20 to be "solved"
  EMPTY_FUNCTION_NAME: -1,       // We have a variable or function with the name ""

  // The level was solved in a non-optimal way.  User may advance or retry.
  TOO_MANY_BLOCKS_FAIL: 20,   // More than the ideal number of blocks were used.
  APP_SPECIFIC_ACCEPTABLE_FAIL: 21,  // Application-specific acceptable failure.

  // Other.
  FREE_PLAY: 30,              // The user is in free-play mode.
  EDIT_BLOCKS: 70,            // The user is creating/editing a new level.

  // The level was solved in the ideal manner.
  ALL_PASS: 100
};

exports.BeeTerminationValue = {
  FAILURE: false,
  SUCCESS: true,
  INFINITE_LOOP: Infinity,
  NOT_AT_FLOWER: 1,     // Tried to get nectar when not at flower.
  FLOWER_EMPTY: 2,      // Tried to get nectar when flower empty.
  NOT_AT_HONEYCOMB: 3,  // Tried to make honey when not at honeycomb.
  HONEYCOMB_FULL: 4,    // Tried to make honey, but no room at honeycomb.
  UNCHECKED_CLOUD: 5,    // Finished puzzle, but didn't check every clouded item
  UNCHECKED_PURPLE: 6,   // Finished puzzle, but didn't check every purple flower
  INSUFFICIENT_NECTAR: 7,// Didn't collect all nectar by finish
  INSUFFICIENT_HONEY: 8  // Didn't make all honey by finish
};

exports.KeyCodes = {
  BACKSPACE: 8,
  ENTER: 13,
  SPACE: 32,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 127
};
