import * as Blockly from 'blockly/core';
import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';

import type {LevelData} from '@/app/models/level';
import type {BlockDefinition} from '@/blockly';
import type {Plugin} from '@/blockly/plugins';
import BlockLimitsPlugin from '@/blockly/plugins/blockLimits';
import FieldColourPlugin from '@/blockly/plugins/fields/fieldColour';
import RectangleInputPlugin from '@/blockly/plugins/inputs/rectangle';
import RoundInputPlugin from '@/blockly/plugins/inputs/round';
import TriangleInputPlugin from '@/blockly/plugins/inputs/triangle';
import SharableProceduresPlugin from '@/blockly/plugins/sharableProcedures';
import ToolboxTrashcanPlugin from '@/blockly/plugins/toolboxTrashcan';
import ThrasosRenderer from '@/blockly/renderers/thrasos';
import DefaultTheme from '@/blockly/themes/default';
import {getAllGeneratedCode} from '@/blockly/utils';
import BlocklyLevel, {
  BlocklyLevelProps,
  BlocklyLevelEnvironment,
} from '@/levels/blockly/components/BlocklyLevel';

import * as defaultAPI from '../api';
import blocks from '../blocks';
import SpriteLab from '../SpriteLab';

import Visualization from './Visualization';

/**
 * Specific environmental information for the Spritelab environment.
 */
export interface SpriteLabLevelEnvironment extends BlocklyLevelEnvironment {
  useModalFunctionEditor: boolean;
  noFunctionBlockFrame: boolean;
}

export interface SpriteLabLevelProps extends BlocklyLevelProps {
  level: LevelData;
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
  SharableProceduresPlugin,
];

const SpriteLabLevel: React.FunctionComponent<SpriteLabLevelProps> = ({
  level,
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
    animations: [
      ...(level?.template?.spriteLabData?.startAnimations ||
        level?.spriteLabData?.startAnimations ||
        []),
    ]
      .filter(info => !(info.categories || []).includes('backgrounds'))
      .map(info => [
        {
          src: `/${info.local}`,
          width: 32,
          height: 32,
          alt: info.name,
        },
        info.name,
      ]),
  });

  const currentAvatar = avatar || '/skins/gamelab/small_static_avatar.png';

  const [running, setRunning] = useState<boolean>(false);

  const onReset = useCallback(() => {
    controller.current?.reset();
    setRunning(false);
  }, [controller]);

  const execute = useCallback(() => {
    const workspaces: (Blockly.Workspace | undefined)[] = [
      environment.current.hiddenWorkspace,
      environment.current.mainWorkspace,
    ];
    console.log(workspaces);
    controller.current?.evaluate(
      getAllGeneratedCode({
        startBlock: 'when_run',
        workspaces,
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
  }, [controller, level]);

  const startBlocks = useMemo(
    () =>
      level?.template?.blocklyData?.startBlocks?.blocks?.blocks ||
      level?.blocklyData?.startBlocks?.blocks?.blocks ||
      [],
    [level],
  );

  const filteredStartBlocks = useMemo(
    () => ({
      blocks: {
        blocks: startBlocks.filter(
          block => block?.extraState?.uservisible !== false,
        ),
      },
    }),
    [startBlocks],
  );

  //const procedures = startBlocks.filter(
  //  block => block?.type === 'behavior_definition',
  //);

  // Filter out blocks that are marked invisible to the user and place them in
  // a hidden workspace.
  const hiddenBlocks = useMemo(
    () => ({
      blocks: {
        blocks: startBlocks.filter(
          block => block?.extraState?.uservisible === false,
        ),
        procedures: [],
      },
    }),
    [startBlocks],
  );

  const fullBlocks = useMemo(
    () => [...blocks, ...(customBlocks || [])],
    [blocks, customBlocks],
  );

  return (
    <BlocklyLevel
      level={level}
      startBlocks={filteredStartBlocks}
      hiddenBlocks={hiddenBlocks}
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
      customBlocks={fullBlocks}
      options={{
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
