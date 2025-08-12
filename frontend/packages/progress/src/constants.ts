export const PUZZLE_PAGE_NONE = -1;

// Generic validation to indicate all tests passed.
// Used in labs that use levelbuilder-written unit tests for validation.
export const PASSED_ALL_TESTS_VALIDATION = {
  conditions: [
    {
      name: 'PASSED_ALL_TESTS',
      value: 'true',
    },
  ],
  message: '',
  next: true,
  key: 'passed_all_tests',
};

/**
 * Enumeration of test results.
 * EMPTY_BLOCK_FAIL and EMPTY_FUNCTION_BLOCK_FAIL can only occur if
 * checkForEmptyBlocks option is true.
 * A number of these results are enumerated on the dashboard side in
 * activity_constants.rb, and it's important that these two files are kept in
 * sync.
 * NOTE: We store the results for user attempts in our db, so changing these
 * values would necessitate a migration
 */
export enum TestResults {
  // Default value before any tests are run.
  NO_TESTS_RUN = -1,

  // The level was not solved.
  GENERIC_FAIL = 0, // Used by DSL defined levels.
  EMPTY_BLOCK_FAIL = 1, // An "if" or "repeat" block was empty.
  TOO_FEW_BLOCKS_FAIL = 2, // Fewer than the ideal number of blocks used.
  LEVEL_INCOMPLETE_FAIL = 3, // Default failure to complete a level.
  MISSING_BLOCK_UNFINISHED = 4, // A required block was not used.
  EXTRA_TOP_BLOCKS_FAIL = 5, // There was more than one top-level block.
  RUNTIME_ERROR_FAIL = 6, // There was a runtime error in the program.
  SYNTAX_ERROR_FAIL = 7, // There was a syntax error in the program.
  MISSING_BLOCK_FINISHED = 10, // The level was solved without required block.
  APP_SPECIFIC_FAIL = 11, // Application-specific failure.
  EMPTY_FUNCTION_BLOCK_FAIL = 12, // A "function" block was empty
  UNUSED_PARAM = 13, // Param declared but not used in function.
  UNUSED_FUNCTION = 14, // Function declared but not used in workspace.
  PARAM_INPUT_UNATTACHED = 15, // Function not called with enough params.
  INCOMPLETE_BLOCK_IN_FUNCTION = 16, // Incomplete block inside a function.
  QUESTION_MARKS_IN_NUMBER_FIELD = 17, // Block has ??? instead of a value.
  EMPTY_FUNCTIONAL_BLOCK = 18, // There's a functional block with an open input
  EXAMPLE_FAILED = 19, // One of our examples didn't match the definition

  // start using negative values, since we consider >= 20 to be "solved"
  NESTED_FOR_SAME_VARIABLE = -2, // We have nested for loops each using the same counter variable
  // NOTE = for smoe period of time, this was -1 and conflicted with NO_TESTS_RUN
  EMPTY_FUNCTION_NAME = -3, // We have a variable or function with the name ""
  MISSING_RECOMMENDED_BLOCK_UNFINISHED = -4, // The level was attempted but not solved without a recommended block
  EXTRA_FUNCTION_FAIL = -5, // The program contains a JavaScript function when it should not
  LOCAL_FUNCTION_FAIL = -6, // The program contains an unexpected JavaScript local function
  GENERIC_LINT_FAIL = -7, // The program contains a lint error
  LOG_CONDITION_FAIL = -8, // The program execution log did not pass a required condition
  BLOCK_LIMIT_FAIL = -9, // Puzzle was solved using more than the toolbox limit of a block
  FREE_PLAY_UNCHANGED_FAIL = -10, // The code was not changed when the finish button was clicked

  // Codes for unvalidated levels.
  UNSUBMITTED_ATTEMPT = -50, // Progress was saved without submitting for review, or was unsubmitted.

  SKIPPED = -100, // Skipped, e.g. they used the skip button on a challenge level
  // The teacher has triggered a reset of progress through leaving "Keep working" feedback.
  // TEACHER_FEEDBACK_KEEP_WORKING is only set by the back-end
  TEACHER_FEEDBACK_KEEP_WORKING = -110,
  LEVEL_STARTED = -150, // The user has triggered the reset action at least once (ex = by clicking the reset button)

  // The level was solved in a non-optimal way.  User may advance or retry.
  TOO_MANY_BLOCKS_FAIL = 20, // More than the ideal number of blocks were used.
  APP_SPECIFIC_ACCEPTABLE_FAIL = 21, // Application-specific acceptable failure.
  MISSING_RECOMMENDED_BLOCK_FINISHED = 22, // The level was solved without a recommended block

  // The level was solved in an optimal way.
  FREE_PLAY = 30, // The user is in free-play mode.
  PASS_WITH_EXTRA_TOP_BLOCKS = 31, // There was more than one top-level block.
  APP_SPECIFIC_IMPERFECT_PASS = 32, // The level was passed in some optimal but not necessarily perfect way
  EDIT_BLOCKS = 70, // The user is creating/editing a new level.
  MANUAL_PASS = 90, // The level was manually set as perfected internally.

  // The level was solved in the ideal manner.
  ALL_PASS = 100,

  // Contained level result. Not validated, but should be treated as a success
  CONTAINED_LEVEL_RESULT = 101,

  // The level was solved with fewer blocks than the recommended number of blocks.
  BETTER_THAN_IDEAL = 102,

  SUBMITTED_RESULT = 1000,

  REVIEW_REJECTED_RESULT = 1500,
  REVIEW_ACCEPTED_RESULT = 2000,
}

// Numbers below 20 are generally considered some form of failure.
// Numbers >= 20 generally indicate some form of success (although again there
// are values like REVIEW_REJECTED_RESULT that don't seem to quite meet that restriction.
export const MINIMUM_PASS_RESULT: number = 20;

// Numbers >= 30, are considered to be "perfectly" solved, i.e. those in the range
// of 20-30 have correct but not optimal solutions
export const MINIMUM_OPTIMAL_RESULT: number = 30;

/**
 * Different possibilities for level.status, used to communicate how user has
 * performed on a given level.
 */
export enum LevelStatus {
  not_tried = "not_tried",
  submitted = "submitted",
  perfect = "perfect",
  passed = "passed",
  attempted = "attempted",
  review_accepted = "review_accepted",
  review_rejected = "review_rejected",
  dots_disabled = "dots_disabled",
  free_play_complete = "free_play_complete",
  completed_assessment = 'completed_assessment',
};
