import * as Blockly from 'blockly/core';

import {getAllGeneratedCode} from '@code-dot-org/blockly-workspace/utils';
import type {Environment} from '@code-dot-org/blockly-workspace';
import {SoundBoard, type PlaybackOptions} from '@code-dot-org/core/audio';
import {
  evalWith,
  ExecutionInfo,
  type Action,
} from '@code-dot-org/lab/interpreter';

import * as defaultAPI from './api';
import Bee from './Bee';
import Harvester from './Harvester';
import MazeController, {type MazeData} from './MazeController';
import Planter from './Planter';
import type {Skin} from './skin';
import TestResults, {MINIMUM_PASS_RESULT, type Status} from './TestResults';
import * as tiles from './tiles';
import type {API} from './types';
import Validator from './Validator';

/**
 * Controls the maze level.
 */
class Maze extends EventTarget {
  /* The instance of the maze driver */
  private controller: MazeController;
  /* The specific level data for the maze */
  private mazeData: MazeData;
  /* The audio manager device */
  private soundBoard: SoundBoard;
  /* The animation timers */
  private timers: number[] = [];
  /* Whether or not the level is currently in the stepping state */
  private stepping: boolean = false;
  /* Tracks runtime info */
  private executionInfo?: ExecutionInfo;
  /* Skin configuration */
  private skin: Skin;
  /* API to use for the runtime */
  private api: API;
  /* The SVG element we are drawing to */
  private svg: SVGSVGElement;
  /* The Blockly workspace */
  private workspace: Blockly.Workspace;
  /* The last test result */
  private testResults?: TestResults;
  /* The test status */
  private testStatus?: Status;
  /* The Blockly environment data */
  private environment: Environment;
  /* The validator to decide if the level goal has been met. */
  private validatorClass: new (maze: MazeController, skin: Skin) => Validator;
  /* The instantiated validator */
  private validator?: Validator;

  /**
   * Constructs a maze level controller.
   */
  constructor(
    workspace: Blockly.Workspace,
    mazeData: MazeData,
    environment: Environment,
    skin: Skin,
    api: API,
    svg: SVGSVGElement,
    validatorClass: new (maze: MazeController, skin: Skin) => Validator,
  ) {
    super();

    // Retain level data
    this.mazeData = mazeData;
    this.environment = environment;
    this.skin = skin;
    this.api = api;
    this.svg = svg;
    this.workspace = workspace;
    this.validatorClass = validatorClass;

    // Create a sound device
    this.soundBoard = new SoundBoard();

    // Load all the audio
    [
      'win',
      'start',
      'obstacle',
      'wall',
      'walk',
      'wall0',
      'wall1',
      'wall2',
      'wall3',
      'wall4',
      'winGoal',
      'failure',
      'fill',
      'dig',
    ].forEach(prefix => {
      if (`${prefix}Sound` in skin) {
        this.soundBoard.registerByFilenamesAndId?.(
          (skin as unknown as Record<string, string[]>)[`${prefix}Sound`],
          prefix,
        );
      }
    });

    // Initialize the MazeController
    this.controller = new MazeController(
      this.mazeData,
      this.skin,
      {
        skin: this.skin,
        skinId: this.mazeData.skinId,
      },
      {
        methods: {
          playAudio: (name: string, options?: PlaybackOptions) => {
            this.soundBoard.play(name, {
              volume: 0.5,
              ...(options || {}),
            });
          },
          playAudioOnFailure: () => {},
          loadAudio: (filenames: string[], name: string) =>
            this.soundBoard.registerByFilenamesAndId(filenames, name),
          getTestResults: (levelComplete: boolean) => {
            const code = getAllGeneratedCode({
              startBlock: 'when_run',
            });

            this.testResults = new TestResults(this.workspace, {
              levelComplete,
              usedBlockCount: this.environment?.usedBlockCount,
              idealBlockCount: this.environment?.idealBlockCount,
              code,
            });
            return this.testResults.status;
          },
        },
      },
    );

    this.validator = new this.validatorClass(this.controller, this.skin);

    this.controller.map?.resetDirt();
    this.controller.subtype.initStartFinish();
    this.controller.subtype.createDrawer(this.svg);
    this.controller.subtype.initWallMap();
    this.controller.initWithSvg(this.svg);
    this.controller.reset(false);
    this.svg.removeAttribute('width');
    this.svg.removeAttribute('height');
    this.svg.style.width = '100%';
  }

  /**
   * Will ensure that the controller can tear itself down gracefully.
   */
  uninitialize() {
    // We need to remount the old <svg> so that the controller can uninitialize
    const container = document.createElement('div');
    container.style.display = 'hidden';
    container.appendChild(this.svg);
    document.body.appendChild(container);
    if (this.controller) {
      this.controller.reset(false);
      this.controller.destroy?.();
    }
    this.soundBoard.stopAllAudio();
    container.remove();
  }

  /**
   * Runs the current code.
   */
  run() {
    this.stopTimers();
    this.execute(false);
  }

  /**
   * Performs a step through the code.
   */
  step() {
    this.stopTimers();
    if (!this.stepping) {
      // Run the whole program in 'stepping' mode
      this.execute(true);
    } else {
      // We are already stepping. Perform the next step
      if (this.executionInfo) {
        const actions = this.executionInfo.getActions(true);
        this.dispatchEvent(new CustomEvent('running'));
        this.schedule(0, actions, true, 1100);
      }
    }
  }

  /**
   * Resets the runtime of the learner's code.
   */
  reset() {
    this.stopTimers();
    this.controller?.reset?.(false);
    this.stepping = false;
    this.dispatchEvent(new CustomEvent('stopped'));
  }

  /**
   * Runs the entire code and essentially queues every action and immediately
   * validates the result.
   *
   * @param step - Whether or not we intend to start by stepping.
   */
  async execute(step: boolean) {
    this.dispatchEvent(new CustomEvent('reset'));

    this.stepping = step;
    this.dispatchEvent(new CustomEvent('running'));
    if (step) {
      this.dispatchEvent(new CustomEvent('stepping'));
    }
    this.executionInfo = new ExecutionInfo({ticks: 1000});
    const code = getAllGeneratedCode({
      startBlock: 'when_run',
    });

    this.soundBoard.play('start', {
      volume: 0.5,
    });

    // Run the interpreter
    evalWith(code, {
      Maze: {
        executionInfo: this.executionInfo,
        tiles: tiles,
        controller: this.controller,
        validator: this.validator,
        ...defaultAPI,
        ...this.api,
        Maze: {},
      },
    });

    // We now have a transcript of all user actions... replay it and
    // animate the steps.
    this.controller.reset(false);
    this.controller.resetDirtImages(true);
    this.controller.animationsController?.stopIdling();

    // Also run any tests
    this.testResults = new TestResults(this.workspace, {
      levelComplete: true,
      usedBlockCount: this.environment.usedBlockCount,
      idealBlockCount: this.environment.idealBlockCount,
      code,
    });
    this.testStatus = this.testResults.status;

    // If we haven't terminated, make one last check for success
    if (!this.executionInfo.isTerminated()) {
      this.checkSuccess();
    }

    switch (this.executionInfo.terminationValue()) {
      case null:
        // didn't terminate
        this.executionInfo.queueAction('finish');
        this.testStatus = Math.min(99, this.testStatus || 0) as Status;
        //this.result = ResultType.FAILURE;
        //this.stepSpeed = 150;
        break;
      case Infinity:
        // Detected an infinite loop.  Animate what we have as quickly as
        // possible
        //this.result = ResultType.TIMEOUT;
        this.executionInfo.queueAction('finish');
        //this.stepSpeed = this.shouldSpeedUpInfiniteLoops ? 0 : 100;
        break;
      case true:
        //this.result = ResultType.SUCCESS;
        //this.stepSpeed = 100;
        break;
      case false:
        //this.result = ResultType.ERROR;
        //this.stepSpeed = 150;
        break;
      default:
        // App-specific failure.
        this.testStatus =
          this.validator?.getTestResults(
            this.executionInfo.terminationValue(),
          ) || 0;
        //this.result =
        //  this.testStatus >= MINIMUM_PASS_RESULT
        //    ? ResultType.SUCCESS
        //    : ResultType.ERROR;
        this.executionInfo.queueAction('finish');
        break;
    }

    const actions = this.executionInfo.getActions(step);
    this.schedule(0, actions, step, 1100);
  }

  /**
   * Draws a hint path.
   *
   * This is done by some 'hints' that the learner elects to use.
   *
   * @param path - The set of grid coordinates (x,y) that make up the hint path.
   */
  drawHintPath(path: [number, number][]) {
    this.controller?.drawHintPath?.(this.svg, path);
  }

  /**
   * Ensures the internal timers are stopped.
   */
  private stopTimers() {
    for (const id of this.timers) {
      window.clearTimeout(id);
    }
    this.timers = [];
  }

  /**
   * Schedules the animation of an action. This is usually some kind of animation
   * that represents a line of code.
   */
  schedule(
    index: number,
    actions: Action[],
    singleStep: boolean,
    timePerAction: number,
  ) {
    this.stopTimers();

    if (index >= actions.length) {
      this.finish();
      return;
    }

    // We need an active MazeController
    if (!this.controller) {
      return;
    }

    this.animate(actions[index], timePerAction);

    const command = actions[index]?.command;
    const timeModifier =
      (this.controller.skin.actionSpeedScale &&
        this.controller.skin.actionSpeedScale[command]) ||
      1;
    const timeForThisAction = Math.round(timePerAction * timeModifier);

    this.timers.push(
      window.setTimeout(
        () => this.schedule(index + 1, actions, singleStep, timePerAction),
        timeForThisAction,
      ),
    );
  }

  /**
   * Perform the actual animation of an action.
   */
  async animate(action: Action, timePerStep: number) {
    if (action.blockId) {
      // Tell blockly to highlight a block
      this.dispatchEvent(
        new CustomEvent('highlight', {detail: action.blockId}),
      );
    }

    switch (action.command) {
      case 'north':
        this.controller.animatedMove(tiles.Direction.NORTH, timePerStep);
        break;
      case 'east':
        this.controller.animatedMove(tiles.Direction.EAST, timePerStep);
        break;
      case 'south':
        this.controller.animatedMove(tiles.Direction.SOUTH, timePerStep);
        break;
      case 'west':
        this.controller.animatedMove(tiles.Direction.WEST, timePerStep);
        break;
      case 'look_north':
        this.controller.animatedLook(tiles.Direction.NORTH);
        break;
      case 'look_east':
        this.controller.animatedLook(tiles.Direction.EAST);
        break;
      case 'look_south':
        this.controller.animatedLook(tiles.Direction.SOUTH);
        break;
      case 'look_west':
        this.controller.animatedLook(tiles.Direction.WEST);
        break;
      case 'fail_forward':
        this.controller.animatedFail(true);
        break;
      case 'fail_backward':
        this.controller.animatedFail(false);
        break;
      case 'left':
        this.controller.animatedTurn(tiles.TurnDirection.LEFT);
        break;
      case 'right':
        this.controller.animatedTurn(tiles.TurnDirection.RIGHT);
        break;
      case 'finish':
        // Only schedule victory animation for certain conditions:
        if (
          this.checkSuccess() &&
          (this.testStatus || 0) >= MINIMUM_PASS_RESULT
        ) {
          this.soundBoard.play('winGoal', {volume: 0.5});
          this.controller.animatedFinish(timePerStep);
        } else {
          // Failure
          this.timers.push(
            window.setTimeout(() => {
              this.soundBoard.play('failure', {volume: 0.5});
            }, 100),
          );
        }
        break;
      case 'putdown':
        this.controller.scheduleFill();
        break;
      case 'pickup':
        this.controller.scheduleDig();
        break;
      case 'fail_pickup':
        this.controller.animatedFail(false);
        break;
      case 'nectar':
        if (this.controller.subtype instanceof Bee) {
          this.controller.subtype.animateGetNectar();
        }
        break;
      case 'honey':
        if (this.controller.subtype instanceof Bee) {
          this.controller.subtype.animateMakeHoney();
        }
        break;
      case 'get_corn':
        if (this.controller.subtype instanceof Harvester) {
          this.controller.subtype.animateGetCorn();
        }
        break;
      case 'get_pumpkin':
        if (this.controller.subtype instanceof Harvester) {
          this.controller.subtype.animateGetPumpkin();
        }
        break;
      case 'get_lettuce':
        if (this.controller.subtype instanceof Harvester) {
          this.controller.subtype.animateGetLettuce();
        }
        break;
      case 'plant':
        if (this.controller.subtype instanceof Planter) {
          this.controller.subtype.animatePlant();
        }
        break;
      default:
        // action[0] is null if generated by studioApp().checkTimeout().
        break;
    }
  }

  /**
   * Called when an animation finishes
   */
  async finish() {
    this.stopTimers();
    if (this.stepping) {
      this.dispatchEvent(new CustomEvent('stepped'));
    }

    // We need a valid runtime context
    if (!this.executionInfo) {
      return;
    }

    const stepsRemaining = this.executionInfo.stepsRemaining();
    const waitTime = stepsRemaining ? 0 : 1000;

    // Check for success
    if (!stepsRemaining) {
      // Wait a little bit and then display feedback
      this.timers.push(
        window.setTimeout(() => {
          if (!this.stepping) {
            this.dispatchEvent(
              new CustomEvent('highlight', {detail: undefined}),
            );
          }
          this.displayFeedback();
        }, waitTime),
      );
    }
  }

  /**
   * Emit an event for the particular result.
   */
  displayFeedback() {
    this.dispatchEvent(new CustomEvent('done'));
  }

  /**
   * Whether or not each movement step should check for goal conditions.
   */
  shouldCheckSuccessOnMove(): boolean {
    return !!this.validator?.shouldCheckSuccessOnMove();
  }

  /**
   * Checks whether or not all goals have been accomplished.
   */
  checkSuccess(): boolean {
    const succeeded = !!this.validator?.succeeded();
    if (succeeded && this.executionInfo) {
      // Finished.  Terminate the user's program.
      this.executionInfo.queueAction('finish');
      this.executionInfo.terminateWithValue(true);
    }

    return succeeded;
  }
}

export default Maze;
