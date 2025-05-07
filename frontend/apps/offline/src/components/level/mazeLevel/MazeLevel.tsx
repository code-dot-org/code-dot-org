import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react';

import type {LevelData} from '@/app/models/level';
import type {BlockDefinition} from '@/components/blockly';
import ThrasosRenderer from '@/components/blockly/renderers/thrasos';
import DefaultTheme from '@/components/blockly/themes/default';
import {getAllGeneratedCode} from '@/components/blockly/utils';
import BlocklyLevel, {BlocklyLevelProps} from '@/components/level/blocklyLevel';
import {useTimeout} from '@/components/useTimeout';
import LevelContext from '@/contexts/LevelContext';

import * as defaultAPI from './api';
import blocks from './blocks';
import ExecutionInfo from './ExecutionInfo';
import {evalWith} from './interpreter';
import defaultSkins, {skinFor} from './skins';
import type {SkinsData, API} from './types';
import Visualization from './Visualization';

export interface MazeLevelProps extends BlocklyLevelProps {
  levelData: LevelData;
  skins?: SkinsData;
  api?: API;
  customBlocks?: BlockDefinition[];
  visualization?: React.Node;
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
  const controller = useRef(null);
  const svg = useRef(null);
  const executionInfo = useRef(null);

  const Maze = useRef(null);

  const {hintsShown} = useContext(LevelContext);

  // Respond to a hint showing a path
  useEffect(() => {
    if (hintsShown > 0) {
      const hint = levelData.hints[hintsShown - 1];
      if (hint.path) {
        controller.current.drawHintPath(svg.current, hint.path);
      }
    }
  }, [hintsShown]);

  const [currentAvatar, setCurrentAvatar] = useState<string>(avatar || '');
  const [running, setRunning] = useState<boolean>(false);
  const [stepping, setStepping] = useState<boolean>(false);
  const [mazeLoaded, setMazeLoaded] = useState<boolean>(false);
  const [blocklyLoaded, setBlocklyLoaded] = useState<boolean>(false);

  // When the reset button is pressed
  const onReset = useCallback(() => {
    timeout.cancel();
    controller.current.reset();
    setRunning(false);
    setStepping(false);
  }, [controller]);

  // Will run (or step) the program
  const execute = useCallback(
    (step: boolean) => {
      console.log('execute', step);
      onReset();
      setRunning(true);
      setStepping(step);
      executionInfo.current = new ExecutionInfo({ticks: 1000});
      const code = getAllGeneratedCode({
        startBlock: 'when_run',
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
      controller.current.reset();
      controller.current.resetDirtImages(true);
      controller.current.animationsController.stopIdling();

      const actions = executionInfo.current.getActions(step);
      scheduleAction(0, actions, step, 1100);
    },
    [controller],
  );

  // Schedules an animation
  const animateAction = useCallback(
    (action, timePerStep) => {
      if (action.blockId) {
        // Tell blockly to highlight (keep ref to blockly or use provider)
        //studioApp().highlight(String(action.blockId));
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
          this.finish_(timePerStep);
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
          controller.current.subtype.animateGetNectar();
          break;
        case 'honey':
          controller.current.subtype.animateMakeHoney();
          break;
        case 'get_corn':
          controller.current.subtype.animateGetCorn();
          break;
        case 'get_pumpkin':
          controller.current.subtype.animateGetPumpkin();
          break;
        case 'get_lettuce':
          controller.current.subtype.animateGetLettuce();
          break;
        case 'plant':
          controller.current.subtype.animatePlant();
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
    (index, actions, singleStep, timePerAction) => {
      timeout.cancel();
      if (index >= actions.length) {
        console.log('DONE');
        finishAnimations();
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
  const timeout = useTimeout((index, actions, singleStep, timePerAction) => {
    console.log('TIMEOUT CALLBACK', index, actions, singleStep, timePerAction);
    scheduleAction(index, actions, singleStep, timePerAction);
  }, 1000);

  // When the 'step' button is pressed
  const onStep = useCallback(() => {
    timeout.cancel();
    console.log('onstep', stepping);
    if (!stepping) {
      execute(true);
    } else {
      const actions = executionInfo.current.getActions(true);
      setRunning(true);
      scheduleAction(0, actions, true, 1100);
    }
  }, [controller, stepping]);

  // When the 'run' button is pressed
  const onRun = useCallback(() => {
    timeout.cancel();
    execute(false);
  }, [controller, stepping]);

  // When blockly is loaded and initialized
  const onInject = useCallback(() => {
    // Blockly is ready
    setBlocklyLoaded(true);
  }, [controller, Maze, svg]);

  // Pull out the skin asset paths
  const skinConfig = skinFor(skins || defaultSkins, levelData?.mazeData?.skin);

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
    if (svgElement && blocklyLoaded && mazeLoaded) {
      setCurrentAvatar(skinConfig.smallStaticAvatar);

      controller.current = new Maze.current.default.MazeController(
        {
          map: levelData.mazeData.maze,
          serializedMaze: levelData.mazeData.serializedMaze,
          skinId: levelData.mazeData.skin,
          ...levelData.mazeData,
        },
        skinConfig,
        {
          skin: skinConfig,
          skinId: levelData.mazeData.skin,
        },
        {
          methods: {
            playAudio: (sound, options) => {
              console.log('PLAY AUDIO', sound, options);
            },
            playAudioOnFailure: () => {},
            loadAudio: () => {},
            getTestResults: () => {},
          },
        },
      );

      console.log('ON INJECT', controller.current.map, svg.current);
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
        if (controller.current) {
          console.log('UNINIT RESET??', controller.current.reset, svgElement);
          // We need to remount the old <svg> so that the controller can uninitialize
          const container = document.createElement('div');
          container.style.hidden = true;
          container.appendChild(svgElement);
          document.body.appendChild(container);
          controller.current.reset(null);
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
            onRun={onRun}
            onReset={onReset}
            onStep={onStep}
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
      {...rest}
    />
  );
};

export default MazeLevel;
