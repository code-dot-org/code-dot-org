import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';

import type {LevelData} from '@/app/models/level';
import type {BlockDefinition} from '@/blockly';
import BlockLimitsPlugin from '@/blockly/plugins/blockLimits';
import FieldColour from '@/blockly/plugins/fields/fieldColour';
import ToolboxTrashcanPlugin from '@/blockly/plugins/toolboxTrashcan';
import ThrasosRenderer from '@/blockly/renderers/thrasos';
import DefaultTheme from '@/blockly/themes/default';
import type {BlocklySerialization} from '@/blockly/types';
import {getCodeFromBlockJsonSource, getAllGeneratedCode} from '@/blockly/utils';
import BlocklyLevel, {BlocklyLevelProps} from '@/levels/blockly';

import * as defaultAPI from '../api';
import Artist from '../Artist';
import blocks from '../blocks';
import {skinFor} from '../skins';

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

export interface ArtistLevelProps extends BlocklyLevelProps {
  level: LevelData;
  api?: object;
  customBlocks?: BlockDefinition[];
  visualization?: ReactNode;
  visualizationClassName?: string;
}

/**
 * Wraps a Blockly-based Artist level.
 */
const ArtistLevel: React.FunctionComponent<ArtistLevelProps> = ({
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
  const controller = useRef<Artist | null>(null);
  const container = useRef<HTMLDivElement | null>(null);

  const currentAvatar = avatar || '/skins/artist/small_static_avatar.png';

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

  const skin = skinFor(level.artistData?.skinId || 'artist');

  const onInject = useCallback(() => {
    if (container.current) {
      const predrawCode = level.artistData?.predrawBlocks
        ? getCodeFromBlockJsonSource(level.artistData.predrawBlocks)
        : undefined;

      const solutionCode = level.blocklyData?.solutionBlocks
        ? getCodeFromBlockJsonSource(level.blocklyData.solutionBlocks)
        : undefined;

      console.log(
        'LEVEL',
        level,
        level.artistData?.predrawBlocks,
        predrawCode,
        solutionCode,
      );
      controller.current = new Artist({
        api: {...defaultAPI, ...(api || {})},
        level: level.artistData || {
          images: [],
        },
        instant: false,
        isK1: false,
        skin,
        container: container.current,
        predrawCode,
        solutionCode,
      });
    }
  }, [controller, container]);

  useEffect(() => {
    return () => {
      console.log('UNINIT THE ARTIST LEVEL');
    };
  }, [controller, level]);

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
      customBlocks={[...blocks(skin), ...(customBlocks || [])]}
      options={{
        grayOutUndeletableBlocks: true,
        ...(options || {}),
      }}
      onInject={onInject}
      plugins={[ToolboxTrashcanPlugin, BlockLimitsPlugin, FieldColour]}
      {...rest}
    />
  );
};

export default ArtistLevel;
