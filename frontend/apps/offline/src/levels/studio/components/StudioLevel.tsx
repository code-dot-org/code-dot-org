import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

import type {LevelData} from '@/app/models/level';
import type {BlockDefinition} from '@/blockly';
import BlockLimitsPlugin from '@/blockly/plugins/blockLimits';
import ToolboxTrashcanPlugin from '@/blockly/plugins/toolboxTrashcan';
import ThrasosRenderer from '@/blockly/renderers/thrasos';
import DefaultTheme from '@/blockly/themes/default';
import type {BlocklySerialization} from '@/blockly/types';
import BlocklyLevel, {
  BlocklyLevelEnvironment,
  BlocklyLevelProps,
} from '@/levels/blockly/components/BlocklyLevel';

import blocks from '../blocks';
import Studio from '../Studio';
import type {SkinsData, API} from '../types';
//import Validator from '../Validator';

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

export interface StudioLevelProps extends BlocklyLevelProps {
  level: LevelData;
  skins?: SkinsData;
  api?: API;
  customBlocks?: BlockDefinition[];
  visualization?: ReactNode;
  visualizationClassName?: string;
}

const StudioLevel: React.FunctionComponent<StudioLevelProps> = ({
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
  const studio = useRef<Studio | null>(null);
  const environment = useRef<BlocklyLevelEnvironment>({});

  const [currentAvatar, setCurrentAvatar] = useState<string>(avatar || '');
  const [running, setRunning] = useState<boolean>(false);
  const [stepping, setStepping] = useState<boolean>(false);
  const [blocklyLoaded, setBlocklyLoaded] = useState<boolean>(false);

  // When the reset button is pressed
  const onReset = useCallback(() => {
    studio.current?.reset?.();
  }, [studio]);

  // When the 'step' button is pressed
  const onStep = useCallback(() => {
    studio.current?.step?.();
  }, [studio]);

  // When the 'run' button is pressed
  const onRun = useCallback(() => {
    studio.current?.run?.();
  }, [studio]);

  // Pull out the skin asset paths
  const skin = useMemo(
    () => (skins || {})[level?.mazeData?.skinId || 'hoc2015x'],
    [level],
  );

  // Determine all blocks
  const fullBlocks = useMemo(
    () => [...blocks, ...(customBlocks || [])],
    [blocks, customBlocks],
  );
  console.log(level);

  // Set up the driver
  useEffect(() => {
    if (svg.current && environment.current.mainWorkspace) {
      // Update the avatar image
      setCurrentAvatar(skin.smallStaticAvatar);

      // Create our Studio driver
      studio.current = new Studio(
        level?.studioData || {
          map: [],
          skinId: skin.id,
        },
        skin,
        environment.current,
        {
          ...(api || {}),
        },
        svg.current,
      );

      // Hook it up to the component state via events
      studio.current.addEventListener('reset', onReset);
      studio.current.addEventListener('stepping', () => {
        setStepping(true);
        setRunning(true);
      });
      studio.current.addEventListener('running', () => setRunning(true));
      studio.current.addEventListener('stopped', () => {
        setRunning(false);
        setStepping(false);
      });
      studio.current.addEventListener('stepped', () => setRunning(false));
      studio.current.addEventListener('done', () => setRunning(false));
    }

    return () => {
      console.log('UNINIT THE MAZE LEVEL');
      studio.current?.uninitialize();
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
    <BlocklyLevel
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

export default StudioLevel;
