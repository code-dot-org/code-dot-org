import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import type {BlockDefinition,BlocklySerialization} from '@code-dot-org/blockly-workspace';
import BlockLimitsPlugin from '@code-dot-org/blockly-workspace/plugins/blockLimits';
import FieldColour from '@code-dot-org/blockly-workspace/plugins/fields/fieldColour';
import ToolboxTrashcanPlugin from '@code-dot-org/blockly-workspace/plugins/toolboxTrashcan';
import ThrasosRenderer from '@code-dot-org/blockly-workspace/renderers/thrasos';
import DefaultTheme from '@code-dot-org/blockly-workspace/themes/default';
import {getCodeFromBlockJsonSource, getAllGeneratedCode} from '@code-dot-org/blockly-workspace/utils';
import LabBlockly, {LabBlocklyProps} from '@code-dot-org/lab-blockly';
import type {Level} from '@code-dot-org/models/levels';

import * as defaultAPI from '../api';
import Artist from '../Artist';
import artistBlocks from '../blocks';
import {skinFor} from '../skins';
import type {ArtistData} from '../types';

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

export interface LabArtistProps extends LabBlocklyProps {
  levelData: Level<ArtistData>;
  api?: object;
  blocks?: BlockDefinition[];
  /** A class to apply to the existing visualization container */
  visualizationClassName?: string;
}

/**
 * Wraps a Blockly-based Artist level.
 */
const LabArtist: React.FunctionComponent<LabArtistProps> = ({
  levelData,
  blocks,
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

  const skin = skinFor(levelData.subData?.skinId || 'artist');

  const onInject = useCallback(() => {
    if (container.current) {
      const predrawCode = levelData.subData?.predrawBlocks
        ? getCodeFromBlockJsonSource(levelData.subData.predrawBlocks)
        : undefined;

      const solutionCode = levelData.subData?.solutionBlocks
        ? getCodeFromBlockJsonSource(levelData.subData.solutionBlocks)
        : undefined;

      console.log(
        'LEVEL',
        levelData,
        levelData.subData?.predrawBlocks,
        predrawCode,
        solutionCode,
      );
      controller.current = new Artist({
        api: {...defaultAPI, ...(api || {})},
        level: levelData.subData || {
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
  }, [controller, levelData]);

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
    <LabBlockly<ArtistData>
      levelData={levelData}
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
      blocks={[...artistBlocks(skin), ...(blocks || [])]}
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

export default LabArtist;
