import * as Blockly from 'blockly/core';

import classNames from 'classnames';
import type {FunctionComponent} from 'react';
import {useRef, useMemo, useEffect} from 'react';

import {getAppOptionsEditBlocks} from '@code-dot-org/api';
import {BlocklyWorkspace} from '@code-dot-org/blockly-workspace';
import type {
  Environment,
  BlocklySerialization,
} from '@code-dot-org/blockly-workspace';
import {GuideInstructions, LabConstants} from '@code-dot-org/lab';
import ToolboxTrashcanPlugin from '@code-dot-org/blockly-workspace/plugins/toolboxTrashcan';
import ThrasosRenderer from '@code-dot-org/blockly-workspace/renderers/thrasos';
import DefaultTheme from '@code-dot-org/blockly-workspace/themes/default';
import type {Level} from '@code-dot-org/api/models/levels';

import blocks from '../../blockly/blocks';
import {InstructionsPosition} from '../../redux/musicSlice';
import {useAppSelector} from '../../redux/store';
import type {MusicData} from '../../types';

import styles from './musicLab.module.scss';

//const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
const isToolboxMode = getAppOptionsEditBlocks() === LabConstants.TOOLBOX_BLOCKS;

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

export interface MusicLabProps {
  level: Level<MusicData>;
}

const MusicLab: FunctionComponent<MusicLabProps> = ({level}) => {
  const workspaceRef = useRef<Blockly.Workspace | null>(null);

  // Set up the driver
  useEffect(() => {
    return () => {
      console.log('UNINIT THE MUSIC LEVEL');
    };
  }, [level]);

  const toolboxBlocks = useMemo(
    () =>
      level.multipleChoice
        ? undefined
        : level.subData?.toolboxBlocks?.contents?.length === 0
          ? undefined
          : level.subData?.toolboxBlocks,
    [level],
  );

  const timelineAtTop = useAppSelector(state => state.music.timelineAtTop);
  const instructionsPosition = useAppSelector(
    state => state.music.instructionsPosition,
  );

  return (
    <div className={styles.musicLab}>
      <div
        className={classNames(
          styles.mainContent,
          timelineAtTop && styles.reverse,
        )}
      >
        <GuideInstructions
          levelProperties={{
            id: 1,
            name: 'music-lab',
            appName: 'music',
            longInstructions:
              'This is a demo of music lab within a vite application',
          }}
          isRunning={false}
          hasRun={false}
          hasEdited={false}
        />
        <div
          id="work-area"
          className={classNames(styles.workArea, {
            // Allow full height when the play area is hidden.
            [styles.toolboxMode]: isToolboxMode,
            [styles.reverse]:
              instructionsPosition === InstructionsPosition.RIGHT,
          })}
        >
          <BlocklyWorkspace<Environment>
            options={{
              readOnly: level.multipleChoice ? true : undefined,
            }}
            startBlocks={
              level.template?.subData?.startBlocks ||
              level.subData?.startBlocks ||
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
      </div>
    </div>
  );
};

export default MusicLab;
