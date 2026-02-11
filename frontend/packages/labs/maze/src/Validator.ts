import type MazeController from './MazeController';
import type {Skin} from './skin';
import TestResults, {type Status} from './TestResults';

/**
 * Validates the success of the running program.
 */
class Validator {
  private controller: MazeController;
  private skin: Skin;

  /**
   * Creates the validator for the given level controller and skin.
   */
  constructor(maze: MazeController, skin: Skin) {
    this.controller = maze;
    this.skin = skin;
  }

  getSkin(): Skin {
    return this.skin;
  }

  succeeded(): boolean {
    if (this.controller.subtype.finish) {
      return (
        this.controller.getPegmanX() === this.controller.subtype.finish.x &&
        this.controller.getPegmanY() === this.controller.subtype.finish.y
      );
    }

    return false;
  }

  shouldCheckSuccessOnMove() {
    return true;
  }

  hasMessage(_testResults: TestResults): boolean {
    return false;
  }

  /**
   * Get any app-specific message, based on the termination value, or return
   * null if none applies.
   * @param terminationValue - from Maze.executionInfo
   */
  getMessage(_terminatonValue: number): string | null {
    return null;
  }

  /**
   * Get the test results based on the termination value.  If there is no
   * app-specific failure, this returns StudioApp.getTestResults().
   * @param ecutionInfo
   * @returns The test status code.
   */
  getTestResults(_terminationValue: number | boolean | null): Status {
    return this.controller.getTestResults(false) as Status;
  }
}

export default Validator;
