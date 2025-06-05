import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useContext,
  ReactNode,
} from 'react';

import type {LevelData} from '@/app/models/level';
import type {BlockDefinition} from '@/blockly';
import BlockLimitsPlugin from '@/blockly/plugins/blockLimits';
import ToolboxTrashcanPlugin from '@/blockly/plugins/toolboxTrashcan';
import ThrasosRenderer from '@/blockly/renderers/thrasos';
import DefaultTheme from '@/blockly/themes/default';
import type {BlocklySerialization} from '@/blockly/types';
import BlocklyLevel, {BlocklyLevelProps} from '@/components/level/blocklyLevel';
import LevelContext from '@/contexts/LevelContext';

import blocks from './blocks';
import Maze from './Maze';
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
  const svg = useRef<SVGSVGElement | null>(null);
  const maze = useRef<Maze | null>(null);

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
    () =>
      skinFor(skins || defaultSkins, levelData?.mazeData?.skinId || 'birds'),
    [levelData],
  );

  // Set up the driver
  useEffect(() => {
    if (svg.current) {
      // Update the avatar image
      setCurrentAvatar(skin.smallStaticAvatar);

      // Create our Maze driver
      maze.current = new Maze(
        levelData?.mazeData || {
          skinId: skin.id,
        },
        skin,
        {
          ...(api || {}),
        },
        svg.current,
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

  return (
    <BlocklyLevel
      levelData={levelData}
      startBlocks={levelData.blocklyData?.startBlocks || DefaultStartBlocks}
      data={{skin: skin}}
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
