import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

import type {LevelData} from '@/app/models/level';
import type {BlockDefinition} from '@/components/blockly';
import type {Plugin} from '@/components/blockly/plugins';
import BlockLimitsPlugin from '@/components/blockly/plugins/blockLimits';
import FieldColourPlugin from '@/components/blockly/plugins/fields/fieldColour';
import RectangleInputPlugin from '@/components/blockly/plugins/inputs/rectangle';
import RoundInputPlugin from '@/components/blockly/plugins/inputs/round';
import TriangleInputPlugin from '@/components/blockly/plugins/inputs/triangle';
import SharableProceduresPlugin from '@/components/blockly/plugins/sharableProcedures';
import ToolboxTrashcanPlugin from '@/components/blockly/plugins/toolboxTrashcan';
import ThrasosRenderer from '@/components/blockly/renderers/thrasos';
import DefaultTheme from '@/components/blockly/themes/default';
import {getAllGeneratedCode} from '@/components/blockly/utils';
import BlocklyLevel, {
  BlocklyLevelProps,
  BlocklyLevelEnvironment,
} from '@/components/level/blocklyLevel';

import * as defaultAPI from './api';
import blocks from './blocks';
import FieldLocationPlugin from './fields/fieldLocation';
import FieldSpriteDropdownPlugin from './fields/fieldSpriteDropdown';
import SpriteLab from './SpriteLab';
import Visualization from './Visualization';

/**
 * Specific environmental information for the Spritelab environment.
 */
export interface SpriteLabLevelEnvironment extends BlocklyLevelEnvironment {
  useModalFunctionEditor: boolean;
  noFunctionBlockFrame: boolean;
}

export interface SpriteLabLevelProps extends BlocklyLevelProps {
  levelData: LevelData;
  api?: object;
  customBlocks?: BlockDefinition[];
  visualization?: ReactNode;
  visualizationClassName?: string;
}

// Our base Blockly plugins for this level type
const plugins: Plugin[] = [
  // Use triangular notches for Sprite types
  TriangleInputPlugin('Sprite'),
  // Use round notches for Behavior types
  RoundInputPlugin('Behavior'),
  // Use rectangular notches for Location types
  RectangleInputPlugin('Location'),
  // Animate a trashcan in the toolbox area
  ToolboxTrashcanPlugin,
  // Allow specifying block limits
  BlockLimitsPlugin,
  // Allow the 'field_colour' field for blocks
  FieldColourPlugin,
  // Provide the 'field_location' field for locations
  FieldLocationPlugin,
  FieldSpriteDropdownPlugin,
  SharableProceduresPlugin,
];

const SpriteLabLevel: React.FunctionComponent<SpriteLabLevelProps> = ({
  levelData,
  customBlocks,
  theme,
  renderer,
  avatar,
  visualization,
  visualizationClassName,
  api,
  options,
  ...rest
}) => {
  const controller = useRef<SpriteLab | null>(null);
  const container = useRef<HTMLDivElement | null>(null);

  // Create the environment. All blocks with extensions can see this data.
  // This means we can reference the hidden workspace and some options.
  const environment = useRef<SpriteLabLevelEnvironment>({
    useModalFunctionEditor: true,
    noFunctionBlockFrame: true,
  });

  const currentAvatar = avatar || '/skins/gamelab/small_static_avatar.png';

  const [running, setRunning] = useState<boolean>(false);

  const onReset = useCallback(() => {
    controller.current?.reset();
    setRunning(false);
  }, [controller]);

  const execute = useCallback(() => {
    controller.current?.evaluate(
      getAllGeneratedCode({
        startBlock: 'when_run',
      }),
    );
    setRunning(true);
    controller.current?.run();
  }, [controller]);

  const onRun = useCallback(() => {
    execute();
  }, [controller]);

  const onInject = useCallback(() => {
    if (container.current) {
      controller.current = new SpriteLab({
        api: {...defaultAPI, ...(api || {})},
        container: container.current,
      });
    }
  }, [controller, container]);

  useEffect(() => {
    return () => {
      console.log('UNINIT THE SPRITE LEVEL');
    };
  }, [controller, levelData]);

  const startBlocks =
    levelData?.template?.blocklyData?.startBlocks?.blocks?.blocks ||
    levelData?.blocklyData?.startBlocks?.blocks?.blocks ||
    [];
  const filteredStartBlocks = {
    blocks: {
      blocks: startBlocks.filter(
        block => block?.extraState?.uservisible !== false,
      ),
    },
  };

  const procedures = startBlocks.filter(
    block => block?.type === 'behavior_definition',
  );
  console.log('procedures', startBlocks, procedures);

  // Filter out blocks that are marked invisible to the user and place them in
  // a hidden workspace.
  const hiddenBlocks = {
    blocks: {
      blocks: startBlocks.filter(
        block => block?.extraState?.uservisible === false,
      ),
      procedures: [],
    },
  };

  return (
    <BlocklyLevel
      levelData={levelData}
      startBlocks={filteredStartBlocks}
      hiddenBlocks={hiddenBlocks}
      data={{}}
      theme={theme || DefaultTheme}
      renderer={renderer || ThrasosRenderer}
      avatar={currentAvatar}
      visualization={
        visualization || (
          <Visualization
            stepping={false}
            ref={container}
            running={running}
            finishButton={false}
            pauseButton
            onRun={onRun}
            onReset={onReset}
            onFinish={() => {}}
            className={visualizationClassName}
          />
        )
      }
      customBlocks={[...blocks, ...(customBlocks || [])]}
      options={{
        forceInsertTopBlock: 'when_run',
        grayOutUndeletableBlocks: false,
        ...(options || {}),
      }}
      onInject={onInject}
      plugins={plugins}
      environment={environment.current}
      {...rest}
    />
  );
};

export default SpriteLabLevel;
