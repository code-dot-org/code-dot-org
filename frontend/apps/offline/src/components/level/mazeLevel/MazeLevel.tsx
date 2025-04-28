import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react';

import Maze, {tiles} from '@code-dot-org/maze';

import type {LevelData} from '@/app/models/level';
import type {BlockDefinition} from '@/components/blockly';
import ThrasosRenderer from '@/components/blockly/renderers/thrasos';
import DefaultTheme from '@/components/blockly/themes/default';
import {getAllGeneratedCode} from '@/components/blockly/utils';
import BlocklyLevel, {BlocklyLevelProps} from '@/components/level/blocklyLevel';
import {useTimeout} from '@/components/useTimeout';
import LevelContext from '@/contexts/LevelContext';

import * as api from './api';
import blocks from './blocks';
import ExecutionInfo from './ExecutionInfo';
import {evalWith} from './interpreter';
import {skinFor} from './skins';
import Visualization from './Visualization';

export interface MazeLevelProps extends BlocklyLevelProps {
  levelData: LevelData;
  customBlocks?: BlockDefinition[];
}

const MazeLevel: React.FunctionComponent<MazeLevelProps> = ({
  levelData,
  customBlocks,
}) => {
  const controller = useRef(null);
  const svg = useRef(null);
  const executionInfo = useRef(null);

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

  const [avatar, setAvatar] = useState<string>('');
  const [running, setRunning] = useState<boolean>(false);
  const [stepping, setStepping] = useState<boolean>(false);

  const onReset = useCallback(() => {
    console.log('onstep resetting');
    timeout.cancel();
    controller.current.reset();
    setRunning(false);
    setStepping(false);
  }, [controller]);

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
          controller: controller.current,
          ...api,
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

  const animateAction = useCallback(
    (action, timePerStep) => {
      if (action.blockId) {
        // Tell blockly to highlight (keep ref to blockly or use provider)
        //studioApp().highlight(String(action.blockId));
      }

      switch (action.command) {
        case 'north':
          controller.current.animatedMove(tiles.Direction.NORTH, timePerStep);
          break;
        case 'east':
          controller.current.animatedMove(tiles.Direction.EAST, timePerStep);
          break;
        case 'south':
          controller.current.animatedMove(tiles.Direction.SOUTH, timePerStep);
          break;
        case 'west':
          controller.current.animatedMove(tiles.Direction.WEST, timePerStep);
          break;
        case 'look_north':
          controller.current.animatedLook(tiles.Direction.NORTH);
          break;
        case 'look_east':
          controller.current.animatedLook(tiles.Direction.EAST);
          break;
        case 'look_south':
          controller.current.animatedLook(tiles.Direction.SOUTH);
          break;
        case 'look_west':
          controller.current.animatedLook(tiles.Direction.WEST);
          break;
        case 'fail_forward':
          controller.current.animatedFail(true);
          break;
        case 'fail_backward':
          controller.current.animatedFail(false);
          break;
        case 'left':
          controller.current.animatedTurn(tiles.TurnDirection.LEFT);
          break;
        case 'right':
          controller.current.animatedTurn(tiles.TurnDirection.RIGHT);
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
    [controller],
  );

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

  const onRun = useCallback(() => {
    timeout.cancel();
    execute(false);
  }, [controller, stepping]);

  const onInject = useCallback(() => {
    if (controller.current) {
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
    } else {
      console.log('too early');
    }
    console.log('done');
  }, [controller, svg]);

  const skinConfig = skinFor(levelData?.mazeData?.skin);

  useEffect(() => {
    // Parse out maze data
    setAvatar(skinConfig.smallStaticAvatar);
    controller.current = new Maze.MazeController(
      {
        map: levelData.mazeData.maze,
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

    return () => {
      console.log('UNINIT THE MAZE LEVEL');
    };
  }, [controller, levelData]);

  return (
    <BlocklyLevel
      levelData={levelData}
      data={{skin: skinConfig}}
      theme={DefaultTheme}
      renderer={ThrasosRenderer}
      avatar={avatar}
      visualization={
        <Visualization
          ref={svg}
          running={running}
          stepping={stepping}
          onRun={onRun}
          onReset={onReset}
          onStep={onStep}
        />
      }
      customBlocks={[...blocks, ...(customBlocks || [])]}
      options={{
        forceInsertTopBlock: 'when_run',
        grayOutUndeletableBlocks: true,
      }}
      onInject={onInject}
    />
  );
};

export default MazeLevel;
