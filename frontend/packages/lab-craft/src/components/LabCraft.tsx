import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
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
import type {Level} from '@code-dot-org/models/levels';

import craftBlocks from '../blocks';
import Craft from '../Craft';
import levels from '../levels';
import Skin from '../skin';
import Skins from '../skins';
import type {CraftData} from '../types';

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

const defaultSkins: Skins = {
  simple: {
    id: 'simple',
    smallStaticAvatar: '/craft/Sliced_Parts/Pop_Up_Character_Alex_Neutral.png',
  },
};

export interface LabCraftProps extends LabBlocklyProps {
  levelData: Level<CraftData>;
  skins?: {
    [key: string]: Skin;
  };
  api?: object;
  blocks?: BlockDefinition[];
  visualizationClassName?: string;
}

const LabCraft: React.FunctionComponent<LabCraftProps> = ({
  levelData,
  blocks,
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
  const environment = useRef<LabBlocklyEnvironment>({});

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
    () => (skins || defaultSkins)['simple'],
    [levelData],
  );

  // Determine all blocks
  const fullBlocks = useMemo(
    () => [...craftBlocks, ...(blocks || [])],
    [craftBlocks, blocks],
  );
  console.log(levelData);

  // Set up the driver
  useEffect(() => {
    if (container.current && environment.current.mainWorkspace) {
      // Update the avatar image
      setCurrentAvatar(skin?.smallStaticAvatar || '');

      // Create our Craft driver
      console.log('new craft', container.current);
      craft.current = new Craft({
        levelData: levelData?.subData || levels.adventurer01,
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
  }, [container, levelData]);

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
    <LabBlockly
      levelData={levelData}
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

export default LabCraft;
