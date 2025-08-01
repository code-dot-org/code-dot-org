import BaseCommand from './BaseCommand';
import CommandState from './CommandState';
import type {LevelRunnerScene} from './GameController';

class CommandQueue {
  protected scene: LevelRunnerScene;
  protected repeatCommands: [() => void, number][];
  protected highPriorityCommands: BaseCommand[];
  protected setUnshiftState: boolean;
  protected whileCommandQueue?: CommandQueue;
  protected state: CommandState = CommandState.NOT_STARTED;
  currentCommand?: BaseCommand;
  commandList: BaseCommand[] = [];

  constructor(scene: LevelRunnerScene) {
    this.scene = scene;
    this.reset();
    this.repeatCommands = [];
    this.highPriorityCommands = [];
    this.setUnshiftState = false;
  }

  addCommand(command: BaseCommand, repeat: boolean = false) {
    command.repeat = repeat;

    // if we're handling a while command, add to the while command's queue instead of this queue
    if (this.whileCommandQueue) {
      this.whileCommandQueue.addCommand(command);
    } else {
      if (this.setUnshiftState) {
        this.highPriorityCommands.push(command);
      } else {
        this.commandList.push(command);
      }
    }
  }

  setWhileCommandInsertState(queue?: CommandQueue) {
    this.whileCommandQueue = queue;
  }

  begin() {
    this.state = CommandState.WORKING;
  }

  reset() {
    this.state = CommandState.NOT_STARTED;
    this.currentCommand = undefined;
    this.commandList = [];
    this.highPriorityCommands = [];
    this.repeatCommands = [];
    this.whileCommandQueue?.reset();
    this.whileCommandQueue = undefined;
  }

  startPushHighPriorityCommands() {
    this.setUnshiftState = true;
    // clear existing highPriorityCommands
    this.highPriorityCommands = [];
  }

  endPushHighPriorityCommands() {
    // unshift highPriorityCommands to the command list
    for (let i = this.highPriorityCommands.length - 1; i >= 0; i--) {
      this.commandList.unshift(this.highPriorityCommands[i]);
    }
    this.setUnshiftState = false;
  }

  tick() {
    if (this.state === CommandState.WORKING) {
      // if there is no command
      if (!this.currentCommand) {
        // if command list is empty
        if (this.commandList.length === 0) {
          // mark this queue as a success if there is no repeat command
          if (this.repeatCommands.length === 0) {
            this.state = CommandState.SUCCESS;
          }

          // if there are repeat command for this queue, add them
          this.scene.startPushRepeatCommand();
          for (let i = 0; i < this.repeatCommands.length; i++) {
            if (this.repeatCommands[i][1] > 0) {
              this.repeatCommands[i][0]();
              this.repeatCommands[i][1]--;
            } else if (this.repeatCommands[i][1] === -1) {
              this.repeatCommands[i][0]();
            } else {
              this.repeatCommands.splice(i, 1);
            }
          }
          this.scene.endPushRepeatCommand();
          return;
        }

        // get new command from the command list
        this.currentCommand = this.commandList.shift();
      }

      if (!this.currentCommand?.isStarted()) {
        this.currentCommand?.begin();
      } else {
        this.currentCommand?.tick();
      }

      // check if command is done
      if (this.currentCommand?.isSucceeded()) {
        this.currentCommand?.finish();
        this.currentCommand = undefined;
      } else if (this.currentCommand?.isFailed()) {
        this.state = CommandState.FAILURE;
      }
    }
  }

  getLength(): number {
    return this.commandList.length;
  }

  /**
   * Whether the command has started working.
   */
  isStarted(): boolean {
    return this.state !== CommandState.NOT_STARTED;
  }

  /**
   * Whether the command has succeeded or failed, and is
   * finished with its work.
   */
  isFinished(): boolean {
    return this.isSucceeded() || this.isFailed();
  }

  /**
   * Whether the command has finished with its work and reported success.
   */
  isSucceeded(): boolean {
    return this.state === CommandState.SUCCESS;
  }

  /**
   * Whether the command has finished with its work and reported failure.
   */
  isFailed(): boolean {
    return this.state === CommandState.FAILURE;
  }

  addRepeatCommands(codeBlock: () => void, iteration: number) {
    // forever loop cancel existing forever loops
    if (iteration === -1) {
      for (let i = 0; i < this.repeatCommands.length; i++) {
        if (this.repeatCommands[i][1] === -1) {
          this.repeatCommands.splice(i, 1);
          break;
        }
      }
    }
    this.repeatCommands.push([codeBlock, iteration]);
    this.begin();
  }
}

export default CommandQueue;
