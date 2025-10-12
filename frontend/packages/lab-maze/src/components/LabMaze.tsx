'use client';

import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useContext,
  ReactNode,
} from 'react';

import type {BlockDefinition, BlocklySerialization} from '@code-dot-org/blockly-workspace';
import BlockLimitsPlugin from '@code-dot-org/blockly-workspace/plugins/blockLimits';
import ToolboxTrashcanPlugin from '@code-dot-org/blockly-workspace/plugins/toolboxTrashcan';
import ThrasosRenderer from '@code-dot-org/blockly-workspace/renderers/thrasos';
import DefaultTheme from '@code-dot-org/blockly-workspace/themes/default';
import LabBlockly, {
  LabBlocklyEnvironment,
  LabBlocklyProps,
} from '@code-dot-org/lab-blockly';
import {LevelContext} from '@code-dot-org/lab-blockly/contexts';
import type {Level} from '@code-dot-org/models/levels';

import mazeBlocks from '@lab-maze/blocks';
import Visualization from '@lab-maze/components/Visualization';
import Maze from '@lab-maze/Maze';
import type {MazeData} from '@lab-maze/MazeController';
import defaultSkins, {skinFor} from '@lab-maze/skins';
import type {SkinsData, API} from '@lab-maze/types';
import Validator from '@lab-maze/Validator';

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

export interface LabMazeProps extends LabBlocklyProps<MazeData> {
  levelData: Level<MazeData>;
  skins?: SkinsData;
  api?: API;
  blocks?: BlockDefinition[];
  visualization?: ReactNode;
  visualizationClassName?: string;
}

const LabMaze: React.FunctionComponent<LabMazeProps> = ({
  levelData,
  blocks,
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
  const svg = useRef<SVGSVGElement | null>(null);
  const maze = useRef<Maze | null>(null);
  const environment = useRef<LabBlocklyEnvironment>({});

  const {hintsShown} = useContext(LevelContext);

  // Respond to a hint showing a path
  useEffect(() => {
    if (hintsShown > 0) {
      const hint = (levelData.hints || [])[hintsShown - 1];
      if (hint.path && maze.current) {
        maze.current.drawHintPath(hint.path);
      }
    }
  }, [hintsShown, maze]);

  const [currentAvatar, setCurrentAvatar] = useState<string>(avatar || '');
  const [running, setRunning] = useState<boolean>(false);
  const [stepping, setStepping] = useState<boolean>(false);
  const [blocklyLoaded, setBlocklyLoaded] = useState<boolean>(false);

  // When the reset button is pressed
  const onReset = useCallback(() => {
    maze.current?.reset?.();
  }, [maze]);

  // When the 'step' button is pressed
  const onStep = useCallback(() => {
    maze.current?.step?.();
  }, [maze]);

  // When the 'run' button is pressed
  const onRun = useCallback(() => {
    maze.current?.run?.();
  }, [maze]);

  // Pull out the skin asset paths
  const skin = useMemo(
    () => skinFor(skins || defaultSkins, levelData?.subData?.skinId || 'birds'),
    [levelData],
  );

  // Determine all blocks
  const fullBlocks = useMemo(
    () => [...mazeBlocks(skin), ...(blocks || [])],
    [mazeBlocks, blocks],
  );

  // Set up the driver
  useEffect(() => {
    if (svg.current && environment.current.mainWorkspace) {
      // Update the avatar image
      setCurrentAvatar(skin.smallStaticAvatar);

      console.log('creating maze', skin);

      // Create our Maze driver
      maze.current = new Maze(
        environment.current.mainWorkspace,
        levelData?.subData || {
          skinId: skin.id,
        },
        environment.current,
        skin,
        {
          ...(api || {}),
        },
        svg.current,
        Validator,
      );

      // Hook it up to the component state via events
      maze.current.addEventListener('reset', onReset);
      maze.current.addEventListener('stepping', () => {
        setStepping(true);
        setRunning(true);
      });
      maze.current.addEventListener('running', () => setRunning(true));
      maze.current.addEventListener('stopped', () => {
        setRunning(false);
        setStepping(false);
      });
      maze.current.addEventListener('stepped', () => setRunning(false));
      maze.current.addEventListener('done', () => setRunning(false));
    }

    return () => {
      console.log('UNINIT THE MAZE LEVEL');
      maze.current?.uninitialize();
    };
  }, [svg, levelData]);

  // When blockly is loaded and initialized
  const onInject = useCallback(() => {
    // Blockly is ready
    setBlocklyLoaded(true);
  }, [setBlocklyLoaded]);

  // Ensure a 'when_run' block exists... as some levels omit it for some reason
  const startBlocks = useMemo(() => {
    // Deep duplicate the block data
    const initial = levelData.subData?.startBlocks || DefaultStartBlocks;
    const data = {...initial};
    data.blocks ||= {};
    data.blocks = {...data.blocks};
    data.blocks.blocks ||= [];
    data.blocks.blocks = [...data.blocks.blocks];
    if (!data.blocks.blocks.some(block => block.type === 'when_run')) {
      data.blocks.blocks.unshift({type: 'when_run'});
    }
    return data;
  }, [levelData]);

  return (
    <LabBlockly<MazeData>
      levelData={levelData}
      startBlocks={startBlocks}
      theme={theme || DefaultTheme}
      renderer={renderer || ThrasosRenderer}
      avatar={currentAvatar}
      visualization={
        visualization || (
          <Visualization
            disabled={!blocklyLoaded}
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
      blocks={fullBlocks}
      options={{
        grayOutUndeletableBlocks: true,
        ...(options || {}),
      }}
      onInject={onInject}
      plugins={useMemo(() => [ToolboxTrashcanPlugin, BlockLimitsPlugin], [])}
      environment={environment.current}
      {...rest}
    />
  );
};

export default LabMaze;
