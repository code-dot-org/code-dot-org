import {registerLevelKindSchema} from '@code-dot-org/core/api';
import type {BlocklyLabProps} from '@code-dot-org/lab-classic';
import {BlocklyLab} from '@code-dot-org/lab-classic';
import ToolboxTrashcanPlugin from '@code-dot-org/blockly/plugins/toolboxTrashcan';
import BlockLimitsPlugin from '@code-dot-org/blockly/plugins/blockLimits';
import DisableOrphansPlugin from '@code-dot-org/blockly/plugins/disableOrphans';
import GrayOutUndeletableBlocksPlugin from '@code-dot-org/blockly/plugins/grayOutUndeletableBlocks';
import ThrasosRenderer from '@code-dot-org/blockly/renderers/thrasos';
import blocks from './blocks';
import skins, {skinFor} from './skins';

import MazeLab from './components/MazeLab';

import {LevelKindSchema} from './schema';
import type {
  MazeDoneEventDetail,
  MazeLabEditingProps,
  MazeLevelProperties,
} from './types';

import styles from './app.module.scss';

// The package's build entry is App.tsx alone (vite.config's `lib.entry`) —
// a named export not reachable from here never makes it into dist/App.d.ts,
// so the host's map-painting/toolbox-tray palette UI (studio's
// PropertiesPanel) needs these re-exported here, not just from editing.ts.
export {getPaintTools, type PaintTool} from './editing';
export {
  getToolboxPalette,
  trayFromToolboxXml,
  toolboxXmlFromTray,
  type ToolboxPaletteEntry,
  type ToolboxTrayEntry,
} from './editing';

registerLevelKindSchema('maze', LevelKindSchema);

// Originally derived `levelId` from a project-editor URL
// (/app/projects/maze/:id/edit); the host now supplies it — matching
// music-lab's App, which takes the same host-driven shape.
function App({
  onLevelResult,
  editing,
  ...props
}: Omit<
  BlocklyLabProps<MazeLevelProperties>,
  'defaultSources' | 'blocklyProps'
> & {
  /** Fires when a run finishes — surfaces the pass/fail verdict to the host. */
  onLevelResult?: (detail: MazeDoneEventDetail) => void;
  /** Author-mode section selection — see MazeLabEditingProps. */
  editing?: MazeLabEditingProps;
}) {
  return (
    <>
      <div className={styles.app}>
        <BlocklyLab<MazeLevelProperties>
          {...props}
          defaultSources={{source: {}}}
          standaloneProjectType="maze"
          // `blocklyProps` is a plain object (BlocklyProviderProps), not a
          // function of levelProperties — passing a function here type-checks
          // (every field of BlocklyProviderProps is optional, so a function
          // structurally satisfies it) but spreads to no props at all
          // (`{...blocklyProps}` on a function spreads its own enumerable
          // properties, which is none), silently dropping `blocks` from
          // BlocklyProvider's context. That leaves MazeLab's own
          // skin-specific `blocks` prop on <BlocklyWorkspace> as the only
          // registration path, which runs in an effect ordered AFTER the
          // one that injects the workspace and opens the initial toolbox
          // flyout — the flyout tries to instantiate a block type Blockly
          // has not registered yet and throws. Registering a (skin-neutral)
          // superset here, in the context path that runs before injection,
          // fixes the race; MazeLab's later skin-specific pass still
          // corrects block images/labels for the level's actual skin.
          blocklyProps={{
            renderer: ThrasosRenderer,
            blocks: blocks(skinFor(skins, 'birds')),
            plugins: [
              ToolboxTrashcanPlugin,
              BlockLimitsPlugin,
              DisableOrphansPlugin,
              GrayOutUndeletableBlocksPlugin,
            ],
          }}
        >
          <MazeLab onLevelResult={onLevelResult} editing={editing} />
        </BlocklyLab>
      </div>
    </>
  );
}

export default App;
