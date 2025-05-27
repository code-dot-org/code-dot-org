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
import FieldLocationPlugin from '@/components/blockly/plugins/fields/fieldLocation';
import RoundInputPlugin from '@/components/blockly/plugins/inputs/round';
import TriangleInputPlugin from '@/components/blockly/plugins/inputs/triangle';
import ToolboxTrashcanPlugin from '@/components/blockly/plugins/toolboxTrashcan';
import ThrasosRenderer from '@/components/blockly/renderers/thrasos';
import DefaultTheme from '@/components/blockly/themes/default';
import {
  getCodeFromBlockXmlSource,
  getCodeFromBlockJsonSource,
  getAllGeneratedCode,
} from '@/components/blockly/utils';
import BlocklyLevel, {BlocklyLevelProps} from '@/components/level/blocklyLevel';

import * as defaultAPI from './api';
import blocks from './blocks';
import SpriteLab from './SpriteLab';
import Visualization from './Visualization';

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
  // Animate a trashcan in the toolbox area
  ToolboxTrashcanPlugin,
  // Allow specifying block limits
  BlockLimitsPlugin,
  // Allow the 'field_colour' field for blocks
  FieldColourPlugin,
  // Provide the 'field_location' field for locations
  FieldLocationPlugin,
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

  const currentAvatar = avatar || '/skins/gamelab/small_static_avatar.png';

  const [running, setRunning] = useState<boolean>(false);
  const [stepping, setStepping] = useState<boolean>(false);

  const onReset = useCallback(() => {
    console.log('onstep resetting');
    controller.current?.reset();
    setRunning(false);
    setStepping(false);
  }, [controller]);

  const execute = useCallback(
    (step: boolean) => {
      setStepping(step);
      controller.current?.evaluate(
        getAllGeneratedCode({
          startBlock: 'when_run',
        }),
      );
      setRunning(true);
      if (!step) {
        controller.current?.run();
      }
    },
    [controller],
  );

  const onStep = useCallback(() => {
    console.log('onstep', stepping);
    if (!stepping) {
      execute(true);
    } else {
      setRunning(true);
    }
    (async () => {
      await controller.current?.step();
      setRunning(false);
    })();
  }, [controller, stepping]);

  const onRun = useCallback(() => {
    execute(false);
  }, [controller, stepping]);

  const onInject = useCallback(() => {
    if (container.current) {
      const solutionCode = levelData.blocklyData?.solutionBlocks
        ? typeof levelData.blocklyData?.solutionBlocks === 'string'
          ? getCodeFromBlockXmlSource(levelData.blocklyData.solutionBlocks)
          : getCodeFromBlockJsonSource(levelData.blocklyData.solutionBlocks)
        : undefined;

      console.log('LEVEL', levelData, solutionCode);
      controller.current = new SpriteLab({
        api: {...defaultAPI, ...(api || {})},
        level: levelData.artistData || {
          images: [],
        },
        instant: false,
        isK1: false,
        container: container.current,
        solutionCode,
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
      blocks: startBlocks.filter(block => block?.data?.uservisible !== false),
    },
  };

  // Filter out blocks that are marked invisible to the user and place them in
  // a hidden workspace.
  const hiddenBlocks = {
    blocks: {
      blocks: startBlocks.filter(block => block?.data?.uservisible === false),
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
      customBlocks={[...blocks, ...(customBlocks || [])]}
      options={{
        forceInsertTopBlock: 'when_run',
        grayOutUndeletableBlocks: false,
        ...(options || {}),
      }}
      onInject={onInject}
      plugins={plugins}
      {...rest}
    />
  );
};

export default SpriteLabLevel;
