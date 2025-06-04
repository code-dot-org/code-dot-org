import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  ReactNode,
} from 'react';

import type {MazeController} from '@code-dot-org/maze';

import type {LevelData} from '@/app/models/level';
import {SoundBoard, PlaybackOptions} from '@/audio';
import type {BlockDefinition} from '@/components/blockly';
import BlockLimitsPlugin from '@/components/blockly/plugins/blockLimits';
import ToolboxTrashcanPlugin from '@/components/blockly/plugins/toolboxTrashcan';
import ThrasosRenderer from '@/components/blockly/renderers/thrasos';
import DefaultTheme from '@/components/blockly/themes/default';
import type {BlocklySerialization} from '@/components/blockly/types';
import {getAllGeneratedCode} from '@/components/blockly/utils';
import BlocklyLevel, {BlocklyLevelProps} from '@/components/level/blocklyLevel';
import {useTimeout} from '@/components/useTimeout';
import LevelContext from '@/contexts/LevelContext';

import * as defaultAPI from './api';
import blocks from './blocks';
import ExecutionInfo, {Action} from './ExecutionInfo';
import {evalWith} from './interpreter';
import defaultSkins, {skinFor} from './skins';
import type {SkinsData, API} from './types';
import Visualization from './Visualization';

/** By default, a blank level should at least show a 'When Run' block */
const DefaultStartBlocks: BlocklySerialization = {
  blocks: {
    blocks: [
      {
        type: 'when_run',
      },
    ],
  },
};

export interface MazeLevelProps extends BlocklyLevelProps {
  levelData: LevelData;
  skins?: SkinsData;
  api?: API;
  customBlocks?: BlockDefinition[];
  visualization?: ReactNode;
  visualizationClassName?: string;
}

const MazeLevel: React.FunctionComponent<MazeLevelProps> = ({
  levelData,
  customBlocks,
  skins,
  theme,
  renderer,
  avatar,
  visualization,
  visualizationClassName,
  api,
  options,
  ...rest
}) => {
  const controller = useRef<MazeController | null>(null);
  const svg = useRef<SVGSVGElement | null>(null);
  const executionInfo = useRef<ExecutionInfo | null>(null);
  const soundBoard = useRef<SoundBoard | null>(null);

  const Maze = useRef<typeof import('@code-dot-org/maze') | null>(null);

  const {hintsShown} = useContext(LevelContext);

  // Respond to a hint showing a path
  useEffect(() => {
    if (hintsShown > 0) {
      const hint = (levelData.hints || [])[hintsShown - 1];
      if (hint.path && controller.current && svg.current) {
        controller.current.drawHintPath(svg.current, hint.path);
      }
    }
  }, [hintsShown, svg, controller]);

  const [currentAvatar, setCurrentAvatar] = useState<string>(avatar || '');
  const [running, setRunning] = useState<boolean>(false);
  const [stepping, setStepping] = useState<boolean>(false);
  const [mazeLoaded, setMazeLoaded] = useState<boolean>(false);
  const [blocklyLoaded, setBlocklyLoaded] = useState<boolean>(false);

  // When the reset button is pressed
  const onReset = useCallback(() => {
    timeout.cancel();
    if (controller.current) {
      controller.current.reset(false);
      setRunning(false);
      setStepping(false);
    }
  }, [controller]);

  // Will run (or step) the program
  const execute = useCallback(
    (step: boolean) => {
      // We must have loaded the Maze module
      if (!Maze.current) {
        return;
      }

      // Also need a valid MazeController
      if (!controller.current) {
        return;
      }

      console.log('execute', step);
      onReset();
      setRunning(true);
      setStepping(step);
      executionInfo.current = new ExecutionInfo({ticks: 1000});
      const code = getAllGeneratedCode({
        startBlock: 'when_run',
      });

      soundBoard.current?.play('start', {
        volume: 0.5,
      });

      // Run the interpreter
      evalWith(code, {
        Maze: {
          executionInfo: executionInfo.current,
          tiles: Maze.current.tiles,
          controller: controller.current,
          ...defaultAPI,
          ...(api || {}),
          Maze: {},
        },
      });

      // We now have a transcript of all user actions... replay it and
      // animate the steps.
      controller.current.reset(false);
      controller.current.resetDirtImages(true);
      controller.current.animationsController?.stopIdling();

      const actions = executionInfo.current.getActions(step);
      scheduleAction(0, actions, step, 1100);
    },
    [controller, Maze],
  );

  const finish = useCallback((_timePerStep: number) => {
    // Only schedule victory animation for certain conditions:
    /*if (this.testResults >= TestResults.MINIMUM_PASS_RESULT) {
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
    }*/
  }, []);

  // Schedules an animation
  const animateAction = useCallback(
    (action: Action, timePerStep: number) => {
      if (action.blockId) {
        // Tell blockly to highlight (keep ref to blockly or use provider)
        //studioApp().highlight(String(action.blockId));
      }

      // Only handle an active MazeController
      if (!Maze.current || !controller.current) {
        return;
      }

      switch (action.command) {
        case 'north':
          controller.current.animatedMove(
            Maze.current.tiles.Direction.NORTH,
            timePerStep,
          );
          break;
        case 'east':
          controller.current.animatedMove(
            Maze.current.tiles.Direction.EAST,
            timePerStep,
          );
          break;
        case 'south':
          controller.current.animatedMove(
            Maze.current.tiles.Direction.SOUTH,
            timePerStep,
          );
          break;
        case 'west':
          controller.current.animatedMove(
            Maze.current.tiles.Direction.WEST,
            timePerStep,
          );
          break;
        case 'look_north':
          controller.current.animatedLook(Maze.current.tiles.Direction.NORTH);
          break;
        case 'look_east':
          controller.current.animatedLook(Maze.current.tiles.Direction.EAST);
          break;
        case 'look_south':
          controller.current.animatedLook(Maze.current.tiles.Direction.SOUTH);
          break;
        case 'look_west':
          controller.current.animatedLook(Maze.current.tiles.Direction.WEST);
          break;
        case 'fail_forward':
          controller.current.animatedFail(true);
          break;
        case 'fail_backward':
          controller.current.animatedFail(false);
          break;
        case 'left':
          controller.current.animatedTurn(
            Maze.current.tiles.TurnDirection.LEFT,
          );
          break;
        case 'right':
          controller.current.animatedTurn(
            Maze.current.tiles.TurnDirection.RIGHT,
          );
          break;
        case 'finish':
          finish(timePerStep);
          break;
        case 'putdown':
          controller.current.scheduleFill();
          break;
        case 'pickup':
          controller.current.scheduleDig();
          break;
        case 'fail_pickup':
          controller.current.animatedFail(false);
          break;
        case 'nectar':
          if (controller.current.subtype instanceof Maze.current.subtypes.Bee) {
            controller.current.subtype.animateGetNectar();
          }
          break;
        case 'honey':
          if (controller.current.subtype instanceof Maze.current.subtypes.Bee) {
            controller.current.subtype.animateMakeHoney();
          }
          break;
        case 'get_corn':
          if (
            controller.current.subtype instanceof
            Maze.current.subtypes.Harvester
          ) {
            controller.current.subtype.animateGetCorn();
          }
          break;
        case 'get_pumpkin':
          if (
            controller.current.subtype instanceof
            Maze.current.subtypes.Harvester
          ) {
            controller.current.subtype.animateGetPumpkin();
          }
          break;
        case 'get_lettuce':
          if (
            controller.current.subtype instanceof
            Maze.current.subtypes.Harvester
          ) {
            controller.current.subtype.animateGetLettuce();
          }
          break;
        case 'plant':
          if (
            controller.current.subtype instanceof Maze.current.subtypes.Planter
          ) {
            controller.current.subtype.animatePlant();
          }
          break;
        default:
          // action[0] is null if generated by studioApp().checkTimeout().
          break;
      }
    },
    [controller, Maze],
  );

  // Called when an animation finishes
  const finishAnimations = useCallback(() => {
    timeout.cancel();
    setRunning(false);

    // We need a valid runtime context
    if (!executionInfo.current) {
      return;
    }

    const stepsRemaining = executionInfo.current.stepsRemaining();
    console.log('STEPS REMAINING', stepsRemaining);
    // Check for success
    if (!stepsRemaining) {
      console.log('done!');
      setRunning(true);
    }
  }, [controller]);

  // Schedules an action (the program is run and it generates a set of actions)
  const scheduleAction = useCallback(
    (
      index: number,
      actions: Action[],
      singleStep: boolean,
      timePerAction: number,
    ) => {
      timeout.cancel();
      if (index >= actions.length) {
        console.log('DONE');
        finishAnimations();
        return;
      }

      // We need an active MazeController
      if (!controller.current) {
        return;
      }

      console.log('animate', actions[index]);
      animateAction(actions[index], timePerAction);

      const command = actions[index]?.command;
      const timeModifier =
        (controller.current.skin.actionSpeedScale &&
          controller.current.skin.actionSpeedScale[command]) ||
        1;
      const timeForThisAction = Math.round(timePerAction * timeModifier);

      timeout.call(timeForThisAction, [
        index + 1,
        actions,
        singleStep,
        timePerAction,
      ]);
    },
    [controller],
  );

  // Schedule the next animation
  const timeout = useTimeout(
    (
      index: number,
      actions: Action[],
      singleStep: boolean,
      timePerAction: number,
    ) => {
      console.log(
        'TIMEOUT CALLBACK',
        index,
        actions,
        singleStep,
        timePerAction,
      );
      scheduleAction(index, actions, singleStep, timePerAction);
    },
    1000,
  );

  // When the 'step' button is pressed
  const onStep = useCallback(() => {
    timeout.cancel();
    console.log('onstep', stepping);
    if (!stepping) {
      execute(true);
    } else {
      if (executionInfo.current) {
        const actions = executionInfo.current.getActions(true);
        setRunning(true);
        scheduleAction(0, actions, true, 1100);
      }
    }
  }, [controller, executionInfo, stepping]);

  // When the 'run' button is pressed
  const onRun = useCallback(() => {
    timeout.cancel();
    execute(false);
  }, []);

  // When blockly is loaded and initialized
  const onInject = useCallback(() => {
    // Blockly is ready
    setBlocklyLoaded(true);
  }, [setBlocklyLoaded]);

  // Pull out the skin asset paths
  const skinConfig = skinFor(
    skins || defaultSkins,
    levelData?.mazeData?.skinId || 'birds',
  );

  useEffect(() => {
    (async () => {
      // Dynamically import the maze code since it is only for client rendering
      Maze.current = await import('@code-dot-org/maze');

      // Maze is ready
      setMazeLoaded(true);
    })();
  }, [Maze, setMazeLoaded]);

  // This will initialize the maze controller when everything is loaded
  useEffect(() => {
    const svgElement = svg.current;

    // Parse out maze data when the svg is ready
    if (
      svg.current &&
      blocklyLoaded &&
      mazeLoaded &&
      Maze.current &&
      levelData.mazeData
    ) {
      setCurrentAvatar(skinConfig.smallStaticAvatar);

      // Create an audio device
      soundBoard.current = new SoundBoard();

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
        if (`${prefix}Sound` in skinConfig) {
          soundBoard.current?.registerByFilenamesAndId?.(
            (skinConfig as unknown as Record<string, string[]>)[
              `${prefix}Sound`
            ],
            prefix,
          );
        }
      });

      console.log('LEVEL DATA', levelData);
      controller.current = new Maze.current.default.MazeController(
        levelData.mazeData,
        skinConfig,
        {
          skin: skinConfig,
          skinId: levelData.mazeData.skinId,
        },
        {
          methods: {
            playAudio: (name: string, options?: PlaybackOptions) => {
              soundBoard.current?.play(name, {
                volume: 0.5,
                ...(options || {}),
              });
            },
            playAudioOnFailure: () => {},
            loadAudio: (filenames: string[], name: string) =>
              soundBoard.current?.registerByFilenamesAndId(filenames, name),
            getTestResults: () => {},
          },
        },
      );

      controller.current.map.resetDirt();
      controller.current.subtype.initStartFinish();
      controller.current.subtype.createDrawer(svg.current);
      controller.current.subtype.initWallMap();
      controller.current.initWithSvg(svg.current);
      controller.current.reset(false);
      svg.current.removeAttribute('width');
      svg.current.removeAttribute('height');
      svg.current.style.width = '100%';

      return () => {
        console.log('UNINIT THE MAZE LEVEL');
        if (controller.current && svgElement) {
          console.log('UNINIT RESET??', controller.current.reset, svgElement);
          // We need to remount the old <svg> so that the controller can uninitialize
          const container = document.createElement('div');
          container.style.display = 'hidden';
          container.appendChild(svgElement);
          document.body.appendChild(container);
          controller.current.reset(false);
          controller.current.destroy?.();
          controller.current = null;
          container.remove();
        }
      };
    }
  }, [controller, mazeLoaded, blocklyLoaded, svg, levelData]);

  return (
    <BlocklyLevel
      levelData={levelData}
      startBlocks={levelData.blocklyData?.startBlocks || DefaultStartBlocks}
      data={{skin: skinConfig}}
      theme={theme || DefaultTheme}
      renderer={renderer || ThrasosRenderer}
      avatar={currentAvatar}
      visualization={
        visualization || (
          <Visualization
            ref={svg}
            running={running}
            stepping={stepping}
            finishButton={false}
            stepButton
            onRun={onRun}
            onReset={onReset}
            onStep={onStep}
            onFinish={() => {}}
            className={visualizationClassName}
          />
        )
      }
      customBlocks={[...blocks, ...(customBlocks || [])]}
      options={{
        forceInsertTopBlock: 'when_run',
        grayOutUndeletableBlocks: true,
        ...(options || {}),
      }}
      onInject={onInject}
      plugins={[ToolboxTrashcanPlugin, BlockLimitsPlugin]}
      {...rest}
    />
  );
};

export default MazeLevel;
