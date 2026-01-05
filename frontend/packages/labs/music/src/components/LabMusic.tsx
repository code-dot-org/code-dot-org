'use client';

import * as Blockly from 'blockly/core';

import React, {useRef, useMemo, useEffect} from 'react';

import {BlocklyWorkspace} from '@code-dot-org/blockly-workspace';
import type {
  Environment,
  BlocklySerialization,
} from '@code-dot-org/blockly-workspace';
import ToolboxTrashcanPlugin from '@code-dot-org/blockly-workspace/plugins/toolboxTrashcan';
import ThrasosRenderer from '@code-dot-org/blockly-workspace/renderers/thrasos';
import DefaultTheme from '@code-dot-org/blockly-workspace/themes/default';
import type {Level} from '@code-dot-org/api/models/levels';

import blocks from '../blockly/blocks';
import type {MusicData} from '../types';

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

export interface LabMusicProps {
  levelData: Level<MusicData>;
}

const LabMusic: React.FunctionComponent<LabMusicProps> = ({levelData}) => {
  const workspaceRef = useRef<Blockly.Workspace | null>(null);

  // Set up the driver
  useEffect(() => {
    return () => {
      console.log('UNINIT THE MUSIC LEVEL');
    };
  }, [levelData]);

  const toolboxBlocks = useMemo(
    () =>
      levelData.multipleChoice
        ? undefined
        : levelData.subData?.toolboxBlocks?.contents?.length === 0
          ? undefined
          : levelData.subData?.toolboxBlocks,
    [levelData],
  );

  return (
    <div>
      <BlocklyWorkspace<Environment>
        options={{
          readOnly: levelData.multipleChoice ? true : undefined,
        }}
        startBlocks={
          levelData.template?.subData?.startBlocks ||
          levelData.subData?.startBlocks ||
          DefaultStartBlocks
        }
        blocks={blocks}
        toolboxBlocks={toolboxBlocks}
        theme={DefaultTheme}
        renderer={ThrasosRenderer}
        workspaceRef={workspaceRef}
        plugins={[ToolboxTrashcanPlugin]}
      />
    </div>
  );
};

export default LabMusic;
