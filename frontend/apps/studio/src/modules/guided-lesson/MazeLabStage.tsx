import {lazy, Suspense, useMemo} from 'react';

import {ApiClientProvider, useApiClient} from '@code-dot-org/core/api';

import {useRegisterLabContext} from '@/modules/ai-tutor-host/useRegisterLabContext';

import {createStubbedLabApiClient} from './stubApiClient';
import {useResetLabRedux} from './useResetLabRedux';

import styles from './guidedLesson.module.scss';

// Lazy-load the real Code.org maze lab. Its default export accepts an
// optional `levelId` prop — we pass our config's levelId straight through
// so it never has to read `window.location.pathname`.
const MazeLab = lazy(() => import('@code-dot-org/maze-lab'));

/** Maze tile encoding: 0=wall, 1=open, 2=start, 3=finish, 4=obstacle. */
export type MazeTile = 0 | 1 | 2 | 3 | 4;
export type CompassDir = 0 | 1 | 2 | 3; // 0=N, 1=E, 2=S, 3=W

export interface MazeStageConfig {
  /**
   * Unique numeric id per maze in the lesson. Encoded into the fake URL we
   * set before mount; React Query caches level_properties under this id so
   * sibling mazes don't share a cache entry.
   */
  levelId: number;
  grid: MazeTile[][];
  startDirection: CompassDir;
  /** Optional Blockly XML pre-populated in the workspace. */
  startBlocks?: string;
  /** Optional Blockly XML toolbox. Defaults to TOOLBOX_BASIC. */
  toolboxBlocks?: string;
  /** Optional Blockly XML for the canonical solution (used for hints). */
  solutionBlocks?: string;
  instructions: string;
  /** Optional ideal block count for the hint badge. */
  ideal?: number;
}

interface MazeLabStageProps {
  config: MazeStageConfig;
}

/**
 * Mounts the real `@code-dot-org/maze-lab` package inside the lesson stage.
 *
 * The maze App accepts an optional `levelId` prop — we feed it our config's
 * id directly, which means no URL shenanigans and TanStack Router stays
 * happily on the guided-lesson route.
 */
const MazeLabStage = ({config}: MazeLabStageProps) => {
  const realApi = useApiClient();

  // Reset the shared `@code-dot-org/lab` Redux store before mounting MazeLab,
  // so prior labs' standaloneProjectType / currentLevelId don't leak in.
  const ready = useResetLabRedux({
    currentLevelId: config.levelId,
    standaloneProjectType: undefined,
  });

  useRegisterLabContext(() => ({
    labType: 'maze',
    longInstructions: config.instructions,
  }));

  const stubbedApi = useMemo(() => {
    const levelProperties: Record<string, unknown> = {
      longInstructions: config.instructions,
      shortInstructions: config.instructions,
      maze: JSON.stringify(config.grid),
      startDirection: String(config.startDirection),
      startBlocks: config.startBlocks ?? DEFAULT_START_BLOCKS,
      toolboxBlocks: config.toolboxBlocks ?? TOOLBOX_BASIC,
      solutionBlocks: config.solutionBlocks ?? '<xml/>',
    };
    if (config.ideal !== undefined) {
      levelProperties.ideal = String(config.ideal);
    }
    return createStubbedLabApiClient(realApi, {
      kind: 'maze',
      levelId: config.levelId,
      levelProperties,
    });
  }, [realApi, config]);

  return (
    <div className={styles.musicLabHost}>
      <Suspense
        fallback={<div className={styles.stageEmpty}>Loading Maze Lab…</div>}
      >
        <ApiClientProvider client={stubbedApi}>
          {ready && <MazeLab levelId={String(config.levelId)} />}
        </ApiClientProvider>
      </Suspense>
    </div>
  );
};

/** Default head block — the student snaps their program under `when run`. */
const DEFAULT_START_BLOCKS =
  '<xml><block type="when_run" deletable="false" movable="false"/></xml>';

/** Just movement blocks plus a count-based `repeat`. */
export const TOOLBOX_BASIC = `<xml>
  <block type="maze_moveForward"/>
  <block type="maze_turn"><title name="DIR">turnLeft</title></block>
  <block type="maze_turn"><title name="DIR">turnRight</title></block>
  <block type="controls_repeat_dropdown"><field name="TIMES">3</field></block>
</xml>`;

/** Movement + conditional logic (no loop). */
export const TOOLBOX_CONDITIONAL = `<xml>
  <block type="maze_moveForward"/>
  <block type="maze_turn"><title name="DIR">turnLeft</title></block>
  <block type="maze_turn"><title name="DIR">turnRight</title></block>
  <block type="maze_if"><title name="DIR">isPathForward</title></block>
  <block type="maze_ifElse"><title name="DIR">isPathForward</title></block>
</xml>`;

/** Movement + conditional + count-based and `until finished` loops. */
export const TOOLBOX_FULL = `<xml>
  <block type="maze_moveForward"/>
  <block type="maze_turn"><title name="DIR">turnLeft</title></block>
  <block type="maze_turn"><title name="DIR">turnRight</title></block>
  <block type="maze_if"><title name="DIR">isPathForward</title></block>
  <block type="maze_ifElse"><title name="DIR">isPathForward</title></block>
  <block type="controls_repeat_dropdown"><field name="TIMES">5</field></block>
  <block type="maze_untilBlockedOrNotClear"><title name="DIR">isPathForward</title></block>
</xml>`;

export default MazeLabStage;
