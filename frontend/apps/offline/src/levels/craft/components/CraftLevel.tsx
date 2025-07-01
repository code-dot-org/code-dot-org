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
import Craft from '../Craft';
import {Skin} from '../skin';

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

const defaultSkins = {
  simple: {
    smallStaticAvatar: '/craft/Sliced_Parts/Pop_Up_Character_Alex_Neutral.png',
  },
};

export interface CraftLevelProps extends BlocklyLevelProps {
  level: LevelData;
  skins?: {
    [key: string]: Skin;
  };
  api?: object;
  customBlocks?: BlockDefinition[];
  visualization?: ReactNode;
  visualizationClassName?: string;
}

const CraftLevel: React.FunctionComponent<CraftLevelProps> = ({
  level,
  customBlocks,
  skins,
  theme,
  renderer,
  avatar,
  visualization,
  visualizationClassName,
  options,
  ...rest
}) => {
  const container = useRef<HTMLDivElement | null>(null);
  const craft = useRef<Craft | null>(null);
  const environment = useRef<BlocklyLevelEnvironment>({});

  const [currentAvatar, setCurrentAvatar] = useState<string>(avatar || '');
  const [running, setRunning] = useState<boolean>(false);
  const [stepping, setStepping] = useState<boolean>(false);
  const [blocklyLoaded, setBlocklyLoaded] = useState<boolean>(false);

  // When the reset button is pressed
  const onReset = useCallback(() => {
    craft.current?.reset?.();
  }, [craft]);

  // When the 'step' button is pressed
  const onStep = useCallback(() => {
    craft.current?.step?.();
  }, [craft]);

  // When the 'run' button is pressed
  const onRun = useCallback(() => {
    craft.current?.run?.();
  }, [craft]);

  // Pull out the skin asset paths
  const skin = useMemo(
    () => (skins || defaultSkins)[level?.mazeData?.skinId || 'simple'],
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
    if (container.current && environment.current.mainWorkspace) {
      // Update the avatar image
      setCurrentAvatar(skin?.smallStaticAvatar || '');

      // Create our Craft driver
      console.log('new craft', container.current);
      craft.current = new Craft({
        levelData: level?.studioData || {
          map: [],
          skinId: skin.id,
        },
        skin,
        environment: environment.current,
        container: container.current,
      });

      // Hook it up to the component state via events
      craft.current.addEventListener('reset', onReset);
      craft.current.addEventListener('stepping', () => {
        setStepping(true);
        setRunning(true);
      });
      craft.current.addEventListener('running', () => setRunning(true));
      craft.current.addEventListener('stopped', () => {
        setRunning(false);
        setStepping(false);
      });
      craft.current.addEventListener('stepped', () => setRunning(false));
      craft.current.addEventListener('done', () => setRunning(false));
    }

    return () => {
      console.log('UNINIT THE MAZE LEVEL');
      craft.current?.uninitialize();
    };
  }, [container, level]);

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
            ref={container}
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

export default CraftLevel;
