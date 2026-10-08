// The workspace a placed actor, or the map itself, carries in a `.map` file
// (specs/MAP_FIRST.md, "The editor's modes"; specs/MAP_SCRIPTS_PLAN.md).
//
// The map editor's third view. For a placement it is an actor file's shape
// for one instance — the kind's events with `this actor` as their subject,
// the actor's and the world's properties, and `the ⟨placement⟩` for a
// neighbour — and for the map it is `define event` and the two map hats. What
// it holds is one placement's `blocks` (or the map's), a whole workspace
// serialization, read and written through the map document's own `onChange`
// rather than a file's.
//
// A workspace of its own rather than the file editor with a different file:
// `BlocklyFileEditor` is keyed to a FILE — its palette, its rename machinery,
// its body surfaces, the singletons it installs — and a placement is a
// subtree of a document that is not a workspace at all. What is shared is
// what can be: the block definitions, the palette builder, the theme, the
// localization, the stand-ins for block types nothing defines — and the
// workspace as sections (`blockly/useSectionWorkspace`): collapsible, reordered
// by dragging, a "+" between them, the map's own definition first.

import {Button, Typography} from '@mui/material';
import {useEffect, useMemo, useRef, useState} from 'react';

import {
  Blockly,
  BlocklyProvider,
  BlocklyWorkspace,
  RectangleInputPlugin,
  ScrollBlockDragger,
  TopLeftMetricsManager,
  TriangleInputPlugin,
  type BlocklySerialization,
} from '@code-dot-org/blockly';
import DisableOrphansPlugin from '@code-dot-org/blockly/plugins/disableOrphans';
import ScrollOptionsPlugin from '@code-dot-org/blockly/plugins/scrollOptions';
import ToolboxTrashcanPlugin from '@code-dot-org/blockly/plugins/toolboxTrashcan';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useLocalization} from '@code-dot-org/core/plugins/localization';
import {useSources} from '@code-dot-org/lab/contexts';

import {buildDomainPalette} from '../blockly/domainBlocks';
import {type EventChoice} from '../blockly/eventChoices';
import type {FileKind} from '../blockly/fileKind';
import {eventsNarrowerFor, eventsUnheardBy} from '../blockly/kindEvents';
import {localizeBlocks, localizeToolbox} from '../blockly/localizeBlocks';
import {setCurrentPlacements} from '../blockly/moduleOptions';
import {projectOwnMetas, projectRuleMetas} from '../blockly/projectModules';
import {standInBlocks} from '../blockly/standInBlocks';
import {withoutBlocks, withoutEmptyHeadings} from '../blockly/toolboxFilter';
import {DesignSystemToolboxPlugin} from '../blockly/toolboxStyle';
import {useSectionWorkspace} from '../blockly/useSectionWorkspace';
import {useWorldBlocklyTheme} from '../blockly/worldBlocklyTheme';
import {refreshFor} from '../library/refreshRegistries';
import {projectFiles} from '../runtime/projectFiles';

import styles from './mapEditor.module.css';

const plugins = [
  ToolboxTrashcanPlugin,
  ScrollOptionsPlugin,
  DisableOrphansPlugin,
  TriangleInputPlugin('Actor'),
  RectangleInputPlugin('Vector'),
  DesignSystemToolboxPlugin,
];

export interface PlacementScriptEditorProps {
  /** What the header says this is: the placement's name and kind, or the map. */
  title: string;
  /** `placement` for a placed actor's workspace, `map` for the map's own. */
  kind: Extract<FileKind, 'placement' | 'map'>;
  /** The placed actor's kind, `actors/button`; nothing for the map's own. */
  actorKind?: string;
  /**
   * What the session remembers this workspace's collapsed sections under:
   * the map file and the placement, or the map's own.
   */
  memoryKey: string;
  /** The map's module path — `maps/pauseMenu` — whose events are at home here. */
  mapModule: string;
  /** Every placement id in the map, for `the ⟨placement⟩`. */
  placements: readonly string[];
  /** The workspace as stored, or nothing yet. */
  contents: BlocklySerialization | undefined;
  onChange: (next: BlocklySerialization) => void;
  onBack: () => void;
  isReadOnly: boolean;
}

export const PlacementScriptEditor = ({
  title,
  kind,
  actorKind,
  memoryKey,
  mapModule,
  placements,
  contents,
  onChange,
  onBack,
  isReadOnly,
}: PlacementScriptEditorProps) => {
  const {currentSources} = useSources<MultiFileSource>();
  // `locale` is not read; it is the signal to translate again, as in the
  // file editor (`BlocklyFileEditor.localizedBlocks`).
  const locale = useLocalization();
  const {theme} = useWorldBlocklyTheme();

  // The registries the blocks read — actors, images, sounds, maps — as the
  // file editor fills them on mount, since a map may be the first tab open.
  // And this map's placements, which are this workspace's alone.
  const files = useMemo(
    () => projectFiles(currentSources.source),
    [currentSources],
  );
  useMemo(() => refreshFor(currentSources.source), [currentSources]);
  useMemo(() => setCurrentPlacements(placements), [placements]);

  const {blocks, toolbox} = useMemo(() => {
    const rules = projectRuleMetas(files);
    const palette = buildDomainPalette(rules, {
      fileKind: kind,
      ownProperties: projectOwnMetas(files),
      ownMapModule: mapModule,
    });
    const known = new Set(palette.blocks.map(block => block.type));
    // No hat for an event the placed actor cannot hear: its handlers are
    // about it and nobody else (`kindEvents`).
    const unheard = actorKind
      ? eventsUnheardBy(
          palette.toolbox,
          palette.blocks,
          eventsNarrowerFor(files),
          actorKind,
        )
      : new Set<string>();
    return {
      blocks: [
        ...palette.blocks,
        ...standInBlocks(Object.values(files), known),
      ],
      toolbox: withoutEmptyHeadings(withoutBlocks(palette.toolbox, unheard)),
    };
  }, [files, kind, mapModule, actorKind]);
  const localizedBlocks = useMemo(
    () => localizeBlocks(blocks),
    [blocks, locale],
  );
  const localizedToolbox = useMemo(
    () => localizeToolbox(toolbox),
    [toolbox, locale],
  );

  const options = useMemo(
    () => ({
      readOnly: isReadOnly,
      trashcan: false,
      move: {wheel: true, drag: true, scrollbars: true},
      plugins: {
        metricsManager: TopLeftMetricsManager,
        blockDragger: ScrollBlockDragger,
      },
    }),
    [isReadOnly],
  );

  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  // A placed actor's "+" offers what its kind can hear, as the quick add
  // does (`kindEvents`).
  const narrowEvents = useMemo(() => {
    if (!actorKind) {
      return undefined;
    }
    const narrow = eventsNarrowerFor(files);
    return (choices: EventChoice[]) => narrow(choices, actorKind);
  }, [files, actorKind]);
  const sections = useSectionWorkspace({
    memoryKey,
    definitions: blocks,
    getToolbox: () => toolbox,
    narrowEvents,
    isReadOnly,
    workspaceRef,
  });
  // Loaded once, from what the placement held when this opened; what it holds
  // after is what this writes.
  const [startBlocks] = useState(() =>
    sections.prepareFirst((contents ?? {}) as BlocklySerialization),
  );
  // Opening is not editing: Blockly reports what it creates while loading as
  // ordinary change events, and saving those would write the placement the
  // moment its workspace opened (`BlocklyFileEditor.loadedWorkspace`).
  const loadedWorkspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  useEffect(() => {
    return () => {
      loadedWorkspace.current = null;
    };
  }, []);

  const handleChange = (event: Blockly.Events.Abstract) => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      return;
    }
    if (loadedWorkspace.current !== workspace) {
      if (event.type === Blockly.Events.FINISHED_LOADING) {
        loadedWorkspace.current = workspace;
        // One column, in the order the saved positions read, so a section
        // the quick add put first is first — and in view.
        sections.layOut(workspace);
        workspace.scroll(0, 0);
      }
      return;
    }
    sections.handleEvent(event, workspace);
    if (event.isUiEvent) {
      return;
    }
    onChangeRef.current(sections.save(workspace));
  };

  return (
    <div className={styles.script}>
      <div className={styles.scriptHeader}>
        <Button
          variant="text"
          size="extraSmall"
          startIcon={
            <FontAwesomeV6Icon iconName="arrow-left" iconStyle="solid" />
          }
          onClick={onBack}
        >
          Map
        </Button>
        <Typography component="span" variant="label2">
          {title}
        </Typography>
      </div>
      <div className={styles.scriptBlocks} data-notranslate>
        <BlocklyProvider
          blocks={localizedBlocks}
          plugins={plugins}
          theme={theme}
        >
          <BlocklyWorkspace
            key={isReadOnly ? 'read-only' : 'editable'}
            className={styles.scriptWorkspace}
            onInject={sections.onInject}
            startBlocks={startBlocks}
            toolbox={localizedToolbox}
            options={options}
            theme={theme}
            workspaceRef={workspaceRef}
            onChange={handleChange}
          />
        </BlocklyProvider>
        {sections.menu}
        {sections.outlineButton}
      </div>
    </div>
  );
};

export default PlacementScriptEditor;
