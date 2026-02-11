import type * as Blockly from 'blockly/core';

import type {ProcedureBlock} from '@code-dot-org/blockly-workspace';
import {BlockLimitMap} from '@code-dot-org/blockly-workspace/plugins/blockLimits';
import {
  getAllGeneratedCode,
  getAllUsedBlocks,
  getBlockFields,
} from '@code-dot-org/blockly-workspace/utils';

export type TestFunction = (block: Blockly.Block) => boolean;

export interface Test {
  test: string | TestFunction;
  type: string;
  message?: string;
  titles?: {
    [key: string]: string;
  };
}

export interface ExecutionError {
  err: string;
  lineNumber: number;
}

export interface DisplayBlocks {
  blocksToDisplay: Test[];
  message?: string;
}

export interface TestResultsOptions {
  levelComplete: boolean;
  executionError?: ExecutionError;
  allowTopBlocks?: boolean;
  /** Whether empty blocks should cause a test fail result. */
  shouldCheckForEmptyBlocks?: boolean;
  /** The set of all blocks in the level */
  allBlocks?: Blockly.Block[];
  /** The generated code, if known */
  code?: string;
  /** The required blocks tests */
  requiredBlocks?: Test[][];
  /** The recommended blocks tests */
  recommendedBlocks?: Test[][];
  /** The number of used blocks, versus ideal */
  usedBlockCount?: number;
  /** The number of ideal blocks */
  idealBlockCount?: number;
  /** The block limit map */
  blockLimitMap?: BlockLimitMap;
}

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
export const Statuses = {
  // Default value before any tests are run.
  NO_TESTS_RUN: -1,

  // The level was not solved.
  GENERIC_FAIL: 0, // Used by DSL defined levels.
  EMPTY_BLOCK_FAIL: 1, // An "if" or "repeat" block was empty.
  TOO_FEW_BLOCKS_FAIL: 2, // Fewer than the ideal number of blocks used.
  LEVEL_INCOMPLETE_FAIL: 3, // Default failure to complete a level.
  MISSING_BLOCK_UNFINISHED: 4, // A required block was not used.
  EXTRA_TOP_BLOCKS_FAIL: 5, // There was more than one top-level block.
  RUNTIME_ERROR_FAIL: 6, // There was a runtime error in the program.
  SYNTAX_ERROR_FAIL: 7, // There was a syntax error in the program.
  MISSING_BLOCK_FINISHED: 10, // The level was solved without required block.
  APP_SPECIFIC_FAIL: 11, // Application-specific failure.
  EMPTY_FUNCTION_BLOCK_FAIL: 12, // A "function" block was empty
  UNUSED_PARAM: 13, // Param declared but not used in function.
  UNUSED_FUNCTION: 14, // Function declared but not used in workspace.
  PARAM_INPUT_UNATTACHED: 15, // Function not called with enough params.
  INCOMPLETE_BLOCK_IN_FUNCTION: 16, // Incomplete block inside a function.
  QUESTION_MARKS_IN_NUMBER_FIELD: 17, // Block has ??? instead of a value.
  EMPTY_FUNCTIONAL_BLOCK: 18, // There's a functional block with an open input
  EXAMPLE_FAILED: 19, // One of our examples didn't match the definition

  // start using negative values, since we consider >= 20 to be "solved"
  NESTED_FOR_SAME_VARIABLE: -2, // We have nested for loops each using the same counter variable
  // NOTE: for smoe period of time, this was -1 and conflicted with NO_TESTS_RUN
  EMPTY_FUNCTION_NAME: -3, // We have a variable or function with the name ""
  MISSING_RECOMMENDED_BLOCK_UNFINISHED: -4, // The level was attempted but not solved without a recommended block
  EXTRA_FUNCTION_FAIL: -5, // The program contains a JavaScript function when it should not
  LOCAL_FUNCTION_FAIL: -6, // The program contains an unexpected JavaScript local function
  GENERIC_LINT_FAIL: -7, // The program contains a lint error
  LOG_CONDITION_FAIL: -8, // The program execution log did not pass a required condition
  BLOCK_LIMIT_FAIL: -9, // Puzzle was solved using more than the toolbox limit of a block
  FREE_PLAY_UNCHANGED_FAIL: -10, // The code was not changed when the finish button was clicked

  // Codes for unvalidated levels.
  UNSUBMITTED_ATTEMPT: -50, // Progress was saved without submitting for review, or was unsubmitted.

  SKIPPED: -100, // Skipped, e.g. they used the skip button on a challenge level
  // The teacher has triggered a reset of progress through leaving "Keep working" feedback.
  // TEACHER_FEEDBACK_KEEP_WORKING is only set by the back-end
  TEACHER_FEEDBACK_KEEP_WORKING: -110,
  LEVEL_STARTED: -150, // The user has triggered the reset action at least once (ex: by clicking the reset button)

  // The level was solved in a non-optimal way.  User may advance or retry.
  TOO_MANY_BLOCKS_FAIL: 20, // More than the ideal number of blocks were used.
  APP_SPECIFIC_ACCEPTABLE_FAIL: 21, // Application-specific acceptable failure.
  MISSING_RECOMMENDED_BLOCK_FINISHED: 22, // The level was solved without a recommended block

  // The level was solved in an optimal way.
  FREE_PLAY: 30, // The user is in free-play mode.
  PASS_WITH_EXTRA_TOP_BLOCKS: 31, // There was more than one top-level block.
  APP_SPECIFIC_IMPERFECT_PASS: 32, // The level was passed in some optimal but not necessarily perfect way
  EDIT_BLOCKS: 70, // The user is creating/editing a new level.
  MANUAL_PASS: 90, // The level was manually set as perfected internally.

  // The level was solved in the ideal manner.
  ALL_PASS: 100,

  // Contained level result. Not validated, but should be treated as a success
  CONTAINED_LEVEL_RESULT: 101,

  // The level was solved with fewer blocks than the recommended number of blocks.
  BETTER_THAN_IDEAL: 102,

  SUBMITTED_RESULT: 1000,

  REVIEW_REJECTED_RESULT: 1500,
  REVIEW_ACCEPTED_RESULT: 2000,
} as const;

export type Status = (typeof Statuses)[keyof typeof Statuses];

// Numbers below 20 are generally considered some form of failure.
// Numbers >= 20 generally indicate some form of success (although again there
// are values like REVIEW_REJECTED_RESULT that don't seem to quite meet that restriction.
export const MINIMUM_PASS_RESULT: number = 20;

// Numbers >= 30, are considered to be "perfectly" solved, i.e. those in the range
// of 20-30 have correct but not optimal solutions
export const MINIMUM_OPTIMAL_RESULT: number = 30;

/**
 * Represents the result of running code tests.
 */
class TestResults {
  private status_: Status;
  private workspace: Blockly.Workspace;
  private blocks: Blockly.Block[];
  private code?: string;

  /**
   * Runs level tests as suggested by the given options.
   */
  constructor(workspace: Blockly.Workspace, options: TestResultsOptions) {
    this.workspace = workspace;
    this.status_ = Statuses.NO_TESTS_RUN;
    this.blocks = options.allBlocks || this.workspace.getAllBlocks();
    this.code = options.code;
    this.status_ = this.runTests(options);
  }

  runTests(options: TestResultsOptions): Status {
    const {levelComplete} = options;

    if (options.shouldCheckForEmptyBlocks) {
      const emptyBlockFailure = this.checkForEmptyContainerBlockFailure();
      if (emptyBlockFailure !== Statuses.ALL_PASS) {
        return emptyBlockFailure;
      }
    }

    if (!options.allowTopBlocks && this.hasExtraTopBlocks()) {
      return Statuses.EXTRA_TOP_BLOCKS_FAIL;
    }

    if (this.hasUnusedParam()) {
      return Statuses.UNUSED_PARAM;
    }

    if (this.hasUnusedFunction()) {
      return Statuses.UNUSED_FUNCTION;
    }

    if (this.hasParamInputUnattached()) {
      return Statuses.PARAM_INPUT_UNATTACHED;
    }

    if (this.hasIncompleteBlockInFunction()) {
      return Statuses.INCOMPLETE_BLOCK_IN_FUNCTION;
    }

    if (this.hasQuestionMarksInNumberField()) {
      return Statuses.QUESTION_MARKS_IN_NUMBER_FIELD;
    }

    // Run block tests
    if (!this.hasAllBlocks(options.requiredBlocks || [])) {
      return levelComplete
        ? Statuses.MISSING_BLOCK_FINISHED
        : Statuses.MISSING_BLOCK_UNFINISHED;
    }

    if (!this.hasAllBlocks(options.recommendedBlocks || [])) {
      return levelComplete
        ? Statuses.MISSING_RECOMMENDED_BLOCK_FINISHED
        : Statuses.MISSING_RECOMMENDED_BLOCK_UNFINISHED;
    }

    // Test for the number of blocks versus the given ideal
    if (!levelComplete) {
      if (
        options.usedBlockCount !== undefined &&
        options.idealBlockCount !== undefined &&
        options.usedBlockCount < options.idealBlockCount
      ) {
        return Statuses.TOO_FEW_BLOCKS_FAIL;
      }

      // Also just fail if the level isn't complete
      return Statuses.LEVEL_INCOMPLETE_FAIL;
    }

    // Check for exceeded block limits
    if (options.blockLimitMap?.anyOver()) {
      return Statuses.BLOCK_LIMIT_FAIL;
    }

    // Check for too many blocks
    if (
      options.usedBlockCount !== undefined &&
      options.idealBlockCount !== undefined &&
      options.usedBlockCount > options.idealBlockCount
    ) {
      return Statuses.TOO_MANY_BLOCKS_FAIL;
      //} else if (this.hasExtraTopBlocks() && Blockly.showUnusedBlocks) {
      //  return Statuses.PASS_WITH_EXTRA_TOP_BLOCKS;
      //}
    } else if (
      options.usedBlockCount !== undefined &&
      options.idealBlockCount !== undefined &&
      isFinite(options.idealBlockCount) &&
      options.usedBlockCount < options.idealBlockCount
    ) {
      return Statuses.BETTER_THAN_IDEAL;
    }

    return Statuses.ALL_PASS;
  }

  checkForEmptyContainerBlockFailure(): Status {
    return Statuses.ALL_PASS;
  }

  /**
   * Check whether the user code has all the given blocks
   * @param blocks
   * @returns true if all blocks are present, false otherwise.
   */
  hasAllBlocks(tests: Test[][]) {
    // It's okay (maybe faster) to pass 1 for maxBlocksToFlag, since in the end
    // we want to check that there are zero blocks missing.
    const maxBlocksToFlag = 1;
    return (
      this.getMissingBlocks(tests, maxBlocksToFlag).blocksToDisplay.length === 0
    );
  }

  /**
   * Check to see if the user's code contains the given blocks for a level.
   * @param blocks
   * @param maxBlocksToFlag The maximum number of blocks to
   *   return. We most often only care about a single block at a time
   * @returns 'blocksToDisplay' is an
   *   array of array of strings where each array of strings is a set of blocks
   *   that at least one of them should be used. Each block is represented as the
   *   prefix of an id in the corresponding template.
   */
  getMissingBlocks(tests: Test[][], maxBlocksToFlag: number): DisplayBlocks {
    let missingBlocks: Test[] = [];
    let customMessage: string | undefined = undefined;
    let code: string | undefined = this.code; // JavaScript code, which is initialized lazily.

    const userBlocks = this.getUserBlocks();
    // For each list of blocks
    // Keep track of the number of the missing block lists. It should not be
    // bigger than the maxBlocksToFlag param.
    let missingBlockNum = 0;
    for (const testSet of tests) {
      if (missingBlockNum >= maxBlocksToFlag) {
        break;
      }

      // For each of the test
      // If at least one of the tests succeeded, we consider the block
      // is used
      let usedBlock = false;
      for (const test of testSet) {
        if (typeof test.test === 'string') {
          const search = test.test as string;
          code ||= getAllGeneratedCode();
          if (code.indexOf(search) !== -1) {
            // Succeeded, moving to the next list of tests
            usedBlock = true;
            break;
          }
        } else if (typeof test.test === 'function') {
          const tester = test.test as TestFunction;
          if (userBlocks.some(tester)) {
            // Succeeded, moving to the next list of tests
            usedBlock = true;
            break;
          } else {
            customMessage = test.message || customMessage;
          }
        } else {
          throw new Error('Bad test: ' + test);
        }
      }

      if (!usedBlock) {
        missingBlockNum++;
        missingBlocks = missingBlocks.concat(testSet[0]);
      }
    }

    return {
      blocksToDisplay: missingBlocks,
      message: customMessage,
    };
  }

  /**
   * Get blocks that the user intends in the program. These are the blocks
   * that are used when checking for required and recommended blocks and
   * when determining lines of code written.
   * @returns The blocks.
   */
  getUserBlocks(): Blockly.Block[] {
    return this.blocks.filter(block => {
      const blockValid = block.isEnabled() && block.type !== 'when_run';
      // If Blockly is in readOnly mode, then all blocks are uneditable
      // so this filter would be useless. Ignore uneditable blocks only if
      // Blockly is in edit mode.
      return blockValid && block.isEditable();
    });
  }

  /**
   * Ensure that all procedure definitions actually use the parameters they define
   * inside the procedure.
   */
  hasUnusedParam(): boolean {
    return getAllUsedBlocks(this.workspace).some(userBlock => {
      // Only search procedure definitions
      if ('getProcedureModel' in userBlock) {
        const procedureBlock = userBlock as ProcedureBlock;
        const model: Blockly.procedures.IProcedureModel | undefined =
          procedureBlock.getProcedureModel();
        if (model) {
          const params = model.getParameters();
          const paramNames = params.map(p => p.getName());

          return !!paramNames?.some?.(paramName => {
            // Unused param if there's no parameters_get descendant with the same name
            return !this.hasMatchingDescendant(userBlock, block => {
              return (
                (block.type === 'parameters_get' ||
                  block.type === 'variables_get') &&
                block.getFieldValue('VAR') === paramName
              );
            });
          });
        }
      } else {
        return false;
      }
    });
  }

  hasUnusedFunction(): boolean {
    const userDefs: string[] = [];
    const callBlocks: {
      [key: string]: boolean;
    } = {};

    getAllUsedBlocks(this.workspace).forEach(block => {
      const name = block.getFieldValue('NAME');
      const userCreated =
        'userCreated' in block
          ? (
              block as {
                userCreated: boolean;
              }
            ).userCreated
          : false;
      if (/^procedures_def/.test(block.type) && userCreated) {
        userDefs.push(name);
      } else if (/^procedures_call/.test(block.type)) {
        callBlocks[name] = true;
      }
    });

    // Unused function if some user def doesn't have a matching call
    return userDefs.some(name => {
      return !callBlocks[name];
    });
  }

  /**
   * Ensure that all procedure calls have each parameter input connected.
   */
  hasParamInputUnattached() {
    return getAllUsedBlocks(this.workspace).some(userBlock => {
      // Only check procedure_call* blocks
      if (!/^procedures_call/.test(userBlock.type)) {
        return false;
      }
      return userBlock.inputList
        .filter(input => {
          return /^ARG/.test(input.name);
        })
        .some(argInput => {
          // Unattached param input if any ARG* connection target is null
          return !argInput.connection?.targetConnection;
        });
    });
  }

  /**
   * Ensure there are no incomplete blocks inside any function definitions.
   */
  hasIncompleteBlockInFunction() {
    return getAllUsedBlocks(this.workspace).some(userBlock => {
      // Only search procedure definitions
      if (!('getProcedureModel' in userBlock)) {
        return false;
      }
      return this.hasMatchingDescendant(userBlock, block => {
        // Incomplete block if any input connection target is null
        return block.inputList.some(input => {
          return (
            input.type === /*Blockly.inputs.inputTypes.VALUE*/ 1 &&
            !input.connection?.targetConnection
          );
        });
      });
    });
  }

  /**
   * Do we have any floating blocks not attached to an event block or function block?
   */
  hasExtraTopBlocks(): boolean {
    const topBlocks = this.workspace.getTopBlocks(false);

    for (const block of topBlocks) {
      // Ignore disabled top blocks. Some levels depend on them.
      if (!block.isEnabled()) {
        continue;
      }

      // None of our top level blocks should have a previous or output connection
      // (they should only have a next)
      if (block.previousConnection || block.outputConnection) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check for '???' instead of a value in block fields.
   */
  hasQuestionMarksInNumberField() {
    return getAllUsedBlocks(this.workspace).some(block => {
      return getBlockFields(block).some(field => {
        return field.getValue() === '???' || field.getText() === '???';
      });
    });
  }

  /**
   * Returns true if any descendant (inclusive) of the given node matches the
   * given filter.
   */
  hasMatchingDescendant(
    node: Blockly.Block,
    filter: (block: Blockly.Block) => boolean,
  ): boolean {
    if (filter(node)) {
      return true;
    }

    return node
      .getChildren(false)
      .some(child => this.hasMatchingDescendant(child, filter));
  }

  get status(): Status {
    return this.status_;
  }
}

export default TestResults;
