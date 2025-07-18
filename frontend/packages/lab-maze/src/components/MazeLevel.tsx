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
import BlocklyLevel, {
  BlocklyLevelEnvironment,
  BlocklyLevelProps,
} from '@code-dot-org/lab-blockly';
import type {LevelData} from '@code-dot-org/lab-blockly';
import {LevelContext} from '@code-dot-org/lab-blockly/contexts';

import blocks from '@/blocks';
import Visualization from '@/components/Visualization';
import Maze from '@/Maze';
import type {MazeData} from '@/MazeController';
import defaultSkins, {skinFor} from '@/skins';
import type {SkinsData, API} from '@/types';
import Validator from '@/Validator';

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

export interface MazeLevelProps extends BlocklyLevelProps<MazeData> {
  level: LevelData<MazeData>;
  skins?: SkinsData;
  api?: API;
  customBlocks?: BlockDefinition[];
  visualization: ReactNode;
  visualizationClassName?: string;
}

const MazeLevel: React.FunctionComponent<MazeLevelProps> = ({
  level,
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
  const svg = useRef<SVGSVGElement | null>(null);
  const maze = useRef<Maze | null>(null);
  const environment = useRef<BlocklyLevelEnvironment>({});

  const {hintsShown} = useContext(LevelContext);

  // Respond to a hint showing a path
  useEffect(() => {
    if (hintsShown > 0) {
      const hint = (level.hints || [])[hintsShown - 1];
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
    () => skinFor(skins || defaultSkins, level?.subData?.skinId || 'birds'),
    [level],
  );

  // Determine all blocks
  const fullBlocks = useMemo(
    () => [...blocks(skin), ...(customBlocks || [])],
    [blocks, customBlocks],
  );

  // Set up the driver
  useEffect(() => {
    if (svg.current && environment.current.mainWorkspace) {
      // Update the avatar image
      setCurrentAvatar(skin.smallStaticAvatar);

      // Create our Maze driver
      maze.current = new Maze(
        environment.current.mainWorkspace,
        level?.subData || {
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
  }, [svg, level]);

  // When blockly is loaded and initialized
  const onInject = useCallback(() => {
    // Blockly is ready
    setBlocklyLoaded(true);
  }, [setBlocklyLoaded]);

  // Ensure a 'when_run' block exists... as some levels omit it for some reason
  const startBlocks = useMemo(() => {
    // Deep duplicate the block data
    const initial = level.blocklyData?.startBlocks || DefaultStartBlocks;
    const data = {...initial};
    data.blocks ||= {};
    data.blocks = {...data.blocks};
    data.blocks.blocks ||= [];
    data.blocks.blocks = [...data.blocks.blocks];
    if (!data.blocks.blocks.some(block => block.type === 'when_run')) {
      data.blocks.blocks.unshift({type: 'when_run'});
    }
    return data;
  }, [level]);

  return (
    <BlocklyLevel<MazeData>
      level={level}
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
      customBlocks={fullBlocks}
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

export default MazeLevel;
