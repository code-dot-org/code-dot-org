import * as Blockly from 'blockly/core';

import type {MazeController, MazeData, Skin} from '@code-dot-org/maze';

import {SoundBoard, PlaybackOptions} from '@/audio';
import {getAllGeneratedCode} from '@/blockly/utils';

import * as defaultAPI from './api';
import ExecutionInfo, {Action} from './ExecutionInfo';
import {evalWith} from './interpreter';
import TestResults from './TestResults';
import type {API} from './types';

/**
 * Controls the maze level.
 */
class Maze extends EventTarget {
  /* Tracks the asynchronous loading of the maze library */
  private mazeLoader: Promise<typeof import('@code-dot-org/maze')>;
  /* Whether or not the 'maze' import loaded */
  private mazeLoaded: boolean = false;
  /* The instance of the maze driver */
  private controller?: MazeController;
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

  constructor(
    workspace: Blockly.Workspace,
    mazeData: MazeData,
    skin: Skin,
    api: API,
    svg: SVGSVGElement,
  ) {
    super();

    // Retain level data
    this.mazeData = mazeData;
    this.skin = skin;
    this.api = api;
    this.svg = svg;
    this.workspace = workspace;

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

    // Load the maze library, since it uses `window`.
    // If the maze library is built without requiring window for import, this
    // can just be a normal import.
    this.mazeLoader = import('@code-dot-org/maze');

    // Initialize the MazeController
    this.initialize();
  }

  private async initialize() {
    const MazeModule = await this.mazeLoader;

    // The library has loaded
    this.mazeLoaded = true;

    // Create a MazeController
    this.controller = new MazeModule.default.MazeController(
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
          getTestResults: () => {},
        },
      },
    );

    this.controller.map.resetDirt();
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
    console.log('UNINIT RESET??', this.svg);
    // We need to remount the old <svg> so that the controller can uninitialize
    const container = document.createElement('div');
    container.style.display = 'hidden';
    container.appendChild(this.svg);
    document.body.appendChild(container);
    if (this.controller) {
      this.controller.reset(false);
      this.controller.destroy?.();
    }
    this.controller = undefined;
    container.remove();
  }

  /**
   * Whether or not the maze library has loaded.
   */
  get loaded(): boolean {
    return this.mazeLoaded;
  }

  run() {
    this.stopTimers();
    this.execute(false);
  }

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

  reset() {
    this.stopTimers();
    this.controller?.reset?.(false);
    this.stepping = false;
    this.dispatchEvent(new CustomEvent('stopped'));
  }

  async execute(step: boolean) {
    // We must have loaded the Maze module
    const MazeModule = await this.mazeLoader;

    // Also need a valid MazeController
    if (!this.controller) {
      return;
    }

    console.log('execute', step);
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
        tiles: MazeModule.tiles,
        controller: this.controller,
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
      code,
    });
    console.log('TEST RESULT', this.testResults, this.testResults.status);

    const actions = this.executionInfo.getActions(step);
    this.schedule(0, actions, step, 1100);
  }

  /**
   * Draws a hint path.
   */
  drawHintPath(path: [number, number][]) {
    this.controller?.drawHintPath?.(this.svg, path);
  }

  private stopTimers() {
    for (const id of this.timers) {
      window.clearTimeout(id);
    }
    this.timers = [];
  }

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

  async animate(action: Action, timePerStep: number) {
    const MazeModule = await this.mazeLoader;

    if (action.blockId) {
      // Tell blockly to highlight a block
      this.dispatchEvent(
        new CustomEvent('highlight', {detail: action.blockId}),
      );
    }

    // Only handle an active MazeController
    if (!this.controller) {
      return;
    }

    switch (action.command) {
      case 'north':
        this.controller.animatedMove(
          MazeModule.tiles.Direction.NORTH,
          timePerStep,
        );
        break;
      case 'east':
        this.controller.animatedMove(
          MazeModule.tiles.Direction.EAST,
          timePerStep,
        );
        break;
      case 'south':
        this.controller.animatedMove(
          MazeModule.tiles.Direction.SOUTH,
          timePerStep,
        );
        break;
      case 'west':
        this.controller.animatedMove(
          MazeModule.tiles.Direction.WEST,
          timePerStep,
        );
        break;
      case 'look_north':
        this.controller.animatedLook(MazeModule.tiles.Direction.NORTH);
        break;
      case 'look_east':
        this.controller.animatedLook(MazeModule.tiles.Direction.EAST);
        break;
      case 'look_south':
        this.controller.animatedLook(MazeModule.tiles.Direction.SOUTH);
        break;
      case 'look_west':
        this.controller.animatedLook(MazeModule.tiles.Direction.WEST);
        break;
      case 'fail_forward':
        this.controller.animatedFail(true);
        break;
      case 'fail_backward':
        this.controller.animatedFail(false);
        break;
      case 'left':
        this.controller.animatedTurn(MazeModule.tiles.TurnDirection.LEFT);
        break;
      case 'right':
        this.controller.animatedTurn(MazeModule.tiles.TurnDirection.RIGHT);
        break;
      case 'finish':
        //this.finish(timePerStep);
        // Only schedule victory animation for certain conditions:
        /*
        if (this.testResults >= TestResults.MINIMUM_PASS_RESULT) {
          var finishButton = document.getElementById('finishButton');
          if (finishButton) {
            finishButton.removeAttribute('disabled');
          }
          var finishIcon = document.getElementById('finish');
          if (finishIcon) {
            studioApp().playAudio('winGoal');
          }
          studioApp().playAudioOnWin();
          this.controller.animatedFinish(timePerStep);
        } else {
          timeoutList.setTimeout(function () {
            studioApp().playAudioOnFailure();
          }, this.stepSpeed);
        }
        */
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
        if (this.controller.subtype instanceof MazeModule.subtypes.Bee) {
          this.controller.subtype.animateGetNectar();
        }
        break;
      case 'honey':
        if (this.controller.subtype instanceof MazeModule.subtypes.Bee) {
          this.controller.subtype.animateMakeHoney();
        }
        break;
      case 'get_corn':
        if (this.controller.subtype instanceof MazeModule.subtypes.Harvester) {
          this.controller.subtype.animateGetCorn();
        }
        break;
      case 'get_pumpkin':
        if (this.controller.subtype instanceof MazeModule.subtypes.Harvester) {
          this.controller.subtype.animateGetPumpkin();
        }
        break;
      case 'get_lettuce':
        if (this.controller.subtype instanceof MazeModule.subtypes.Harvester) {
          this.controller.subtype.animateGetLettuce();
        }
        break;
      case 'plant':
        if (this.controller.subtype instanceof MazeModule.subtypes.Planter) {
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
      console.log('stepped');
      this.dispatchEvent(new CustomEvent('stepped'));
    }

    // We need a valid runtime context
    if (!this.executionInfo) {
      return;
    }

    const stepsRemaining = this.executionInfo.stepsRemaining();
    const waitTime = stepsRemaining ? 0 : 1000;

    // Check for success
    console.log('STEPS REMAINING', stepsRemaining, this.stepping);
    if (!stepsRemaining) {
      console.log('done!');
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

  displayFeedback() {
    this.dispatchEvent(new CustomEvent('done'));
  }
}

export default Maze;
