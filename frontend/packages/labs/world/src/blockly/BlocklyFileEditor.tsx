import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

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
import type {CustomEditorProps} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {ImportEffectDialog} from '../effect/ImportEffectDialog';
import {importStockEffect} from '../effect/importStockEffect';
import type {StockEffect} from '../effect/stock';
import {ImportRuleDialog} from '../rules/ImportRuleDialog';
import {importStockRule} from '../rules/importStockRule';
import type {StockRule} from '../rules/stock';
import {filePath, projectFiles} from '../runtime/projectFiles';

import styles from './blocklyFileEditor.module.css';
import {buildDomainPalette} from './domainBlocks';
import {setEffectImportHandler} from './effectImport';
import {refreshProjectDropdowns} from './projectDropdowns';
import {projectRuleMetas} from './projectModules';
import {renameRuleInSource, renameRuleReferences} from './renameRule';
import {setRuleImportHandler} from './ruleImport';
import {ruleByName} from './ruleRegistry';
import {useWorldBlocklyTheme} from './worldBlocklyTheme';

// Distinct connector nubs for the lab's own value types, so they read apart from
// the puzzle-tab of numbers/strings: a triangle for `Actor` (`this actor`, every
// `of …` socket) and a square for `Vector` (directional values — velocity, a
// force, gravity's direction).
const plugins = [
  ToolboxTrashcanPlugin,
  ScrollOptionsPlugin,
  DisableOrphansPlugin,
  TriangleInputPlugin('Actor'),
  RectangleInputPlugin('Vector'),
];

// A `.rule` / `.actor` file is a Blockly workspace stored as serialized JSON
// (INTERFACE.md). This is the editor Codebridge mounts for those languages via
// the `editorComponents` seam. It reads the file's JSON into a Blockly
// workspace and writes the workspace back out on every change — through the
// same `onChange` seam the CodeMirror editor uses, so persistence is identical.
//
// The toolbox is the World Lab domain blocks (Actor / Traits / Events); passing
// `DOMAIN_BLOCKS` registers them (and their world-lab generators) on this
// workspace, the same definitions the generator uses.

/**
 * The rule rename this event is, if it is one.
 *
 * A committed edit of a `define rule` block's NAME — `BLOCK_CHANGE`, which
 * Blockly fires when the field editor closes. Typing into the field fires
 * `block_field_intermediate_change` instead, and must not be acted on: a rename
 * rewrites the project and reloads this workspace, which is not a thing to do
 * between two keystrokes.
 */
function ruleRename(
  event: Blockly.Events.Abstract,
  workspace: Blockly.WorkspaceSvg,
): {from: string; to: string; block: Blockly.Block} | undefined {
  if (event.type !== Blockly.Events.BLOCK_CHANGE) {
    return undefined;
  }
  const change = event as Blockly.Events.BlockChange;
  if (change.element !== 'field' || change.name !== 'NAME') {
    return undefined;
  }
  const block = change.blockId
    ? workspace.getBlockById(change.blockId)
    : undefined;
  if (!block || block.type !== 'world_rule') {
    return undefined;
  }
  const from = String(change.oldValue ?? '');
  const to = String(change.newValue ?? '');
  return from && to && from !== to ? {from, to, block} : undefined;
}

/**
 * Whether this event is a rule's name being TYPED, rather than named.
 *
 * Blockly writes a text field on every keystroke, as an intermediate change, so
 * that blocks resize while you type. For most fields persisting that is
 * harmless. For this one it is not: the file would declare "M", "Mo", "Moo"…
 * in turn, each of them a rule name nothing refers to and one of which may
 * collide with a real rule — and the name a rename starts from would be gone
 * before the rename happened. So the keystrokes are shown and not saved; the
 * commit below is what the project hears about.
 */
function isTypingRuleName(
  event: Blockly.Events.Abstract,
  workspace: Blockly.WorkspaceSvg,
): boolean {
  if (event.type !== Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE) {
    return false;
  }
  const change = event as Blockly.Events.BlockFieldIntermediateChange;
  const block = change.blockId
    ? workspace.getBlockById(change.blockId)
    : undefined;
  return change.name === 'NAME' && block?.type === 'world_rule';
}

/** Parse a file's contents into workspace state; empty/invalid → a blank workspace. */
function parseWorkspace(contents: string): BlocklySerialization {
  if (!contents.trim()) {
    return {};
  }
  try {
    return JSON.parse(contents) as BlocklySerialization;
  } catch {
    return {};
  }
}

export const BlocklyFileEditor = ({
  fileId,
  initialContents,
  isReadOnly,
  onChange,
}: CustomEditorProps) => {
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  // Populate the project-derived dropdowns (actors/worlds/animations) BEFORE the
  // workspace deserializes below: a dropdown drops a serialized value that isn't
  // among its options, so the registry must be current first. This runs during
  // render, ahead of the workspace's load effect. (WorldRuntimeContext also
  // refreshes these for the generator; the calls are idempotent.)
  const {currentSources, updateSources} = useSources<MultiFileSource>();
  const files = useMemo(
    () => projectFiles(currentSources.source),
    [currentSources],
  );
  useMemo(() => refreshProjectDropdowns(files), [files]);

  // The stock-effect import, opened from an effect dropdown's `(import…)` row.
  //
  // The dropdown lives inside Blockly, which cannot reach React context or the
  // project sources — so the field asks through a registered handler
  // (./effectImport) and waits on the promise this resolves. Held in a ref
  // because the field calls it long after the render that installed it.
  const [importing, setImporting] = useState(false);
  const resolveImport = useRef<((path: string | undefined) => void) | null>(
    null,
  );
  // Read at import time rather than captured, so the file is written against
  // the project as it stands when the learner chooses, not as it stood when the
  // dialog opened.
  const sourcesRef = useRef(currentSources);
  sourcesRef.current = currentSources;

  // The same machinery for rules. Two handlers rather than one because the two
  // dropdowns want different dialogs; `importing` says which is open, so only
  // one can be at a time — which is what a modal means anyway.
  const [importingRule, setImportingRule] = useState(false);

  useEffect(() => {
    setEffectImportHandler(
      () =>
        new Promise<string | undefined>(resolve => {
          resolveImport.current = resolve;
          setImporting(true);
        }),
    );
    setRuleImportHandler(
      () =>
        new Promise<string | undefined>(resolve => {
          resolveImport.current = resolve;
          setImportingRule(true);
        }),
    );
    // Cleared on unmount so a field on a disposed workspace cannot open a
    // dialog this editor no longer owns.
    return () => {
      setEffectImportHandler(null);
      setRuleImportHandler(null);
    };
  }, []);

  const finishImport = useCallback((path: string | undefined) => {
    setImporting(false);
    setImportingRule(false);
    resolveImport.current?.(path);
    resolveImport.current = null;
  }, []);

  const handleImport = useCallback(
    (effect: StockEffect) => {
      const sources = sourcesRef.current;
      const {source, path} = importStockEffect(sources.source, effect);
      // The file has to be in the project BEFORE the field takes its value: the
      // dropdown rebuilds from the registry, and a value with no matching option
      // is dropped by Blockly.
      updateSources({...sources, source});
      refreshProjectDropdowns(projectFiles(source));
      finishImport(path);
    },
    [updateSources, finishImport],
  );

  const handleRuleImport = useCallback(
    (rule: StockRule) => {
      const sources = sourcesRef.current;
      const {source, name} = importStockRule(sources.source, rule);
      // In the project BEFORE the field takes its value, as with an effect: the
      // dropdown rebuilds from the registry, and a value with no matching
      // option is dropped by Blockly. The value is the rule's NAME — the field
      // says which rule, never which file.
      updateSources({...sources, source});
      refreshProjectDropdowns(projectFiles(source));
      finishImport(name);
    },
    [updateSources, finishImport],
  );

  // The block palette + toolbox for this project: the built-ins, extended with
  // the project's own declarative `.rule` rules (their blocks and categories).
  // Keyed per file, so switching to this editor picks up rules edited elsewhere.
  // The `.rule` being edited, as the module path its members carry — so the
  // palette can offer `set` blocks for THIS rule's own read-only properties and
  // no others (see generateRulePalette). Undefined for every other file type.
  const ownRuleModule = useMemo(() => {
    const path = filePath(currentSources.source, fileId);
    return path?.endsWith('.rule') ? path.replace(/\.rule$/, '') : undefined;
  }, [currentSources.source, fileId]);

  const {blocks, toolbox} = useMemo(
    () => buildDomainPalette(projectRuleMetas(files), {ownRuleModule}),
    [files, ownRuleModule],
  );

  // Parsed once: Codebridge keys this component by file id, so it remounts (and
  // re-reads `initialContents`) when the active file changes.
  const startBlocks = useRef(parseWorkspace(initialContents)).current;

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

  // A workspace to reload once the palette has caught up (see `handleRename`).
  const pendingReload = useRef<BlocklySerialization | null>(null);

  /**
   * Carry a rule's new name through the project.
   *
   * Every reference to a rule is its name, so renaming one is an edit to every
   * file that mentions it — and to this one, whose own members' block types are
   * built from the name too. Returns true when it has written the project
   * itself, so the ordinary per-file save is skipped: `saveFile` closes over the
   * sources of the render that made it, and would put the other files back.
   */
  const handleRename = useCallback(
    (
      rename: {from: string; to: string; block: Blockly.Block},
      contents: string,
    ): boolean => {
      // A name two rules answer to is a reference with two meanings, so a taken
      // one is refused rather than carried: the field goes back to what it was
      // and the block says why.
      //
      // Refusing has to mean the edit did not happen at all. Letting the name
      // stand while the references keep the old one would strand the rule —
      // nothing would name it, and the NEXT rename would carry the name nothing
      // refers to, leaving no rename that could ever put it right.
      const taken = ruleByName(rename.to);
      if (taken && taken.modulePath !== ownRuleModule) {
        // Silently: the revert is not an edit, and an event for it would come
        // back through here as a rename in the other direction.
        Blockly.Events.disable();
        try {
          rename.block.setFieldValue(rename.from, 'NAME');
        } finally {
          Blockly.Events.enable();
        }
        rename.block.setWarningText(
          `Another rule is already called \u201c${rename.to}\u201d. ` +
            'Rules are referred to by name, so this one needs its own.',
        );
        return true;
      }
      rename.block.setWarningText(null);

      const sources = sourcesRef.current;
      const renamed = renameRuleInSource(
        sources.source,
        rename.from,
        rename.to,
      );
      // This file last and from the LIVE workspace: what is on disk for it is a
      // keystroke behind, and the rename is in the workspace we are handling.
      const self = renameRuleReferences(contents, rename.from, rename.to);
      const file = renamed.files[fileId];
      updateSources({
        ...sources,
        source: {
          ...renamed,
          files: {
            ...renamed.files,
            [fileId]: {...file, contents: self ?? contents},
          },
        },
      });
      // The blocks in THIS workspace carry the old name in their types, and a
      // block's type cannot be changed in place. The palette rebuilds from the
      // sources we just wrote; the workspace is reloaded from the rewritten
      // state once it has (see the effect below).
      pendingReload.current = JSON.parse(
        self ?? contents,
      ) as BlocklySerialization;
      return true;
    },
    [fileId, ownRuleModule, updateSources],
  );

  const handleChange = useCallback(
    (event: Blockly.Events.Abstract) => {
      const workspace = workspaceRef.current;
      // Ignore pure UI events (selection, viewport) — only persist real edits.
      if (!workspace || event.isUiEvent || isTypingRuleName(event, workspace)) {
        return;
      }
      const state = Blockly.serialization.workspaces.save(
        workspace,
      ) as BlocklySerialization;
      const contents = JSON.stringify(state, null, 2);
      const rename = ruleRename(event, workspace);
      if (rename && handleRename(rename, contents)) {
        return;
      }
      onChange(contents);
    },
    [onChange, handleRename],
  );

  // Reload after a rename, once `blocks` carries the renamed member types —
  // BlocklyProvider registers them in its own effect, which runs before this one
  // because it is deeper in the tree. Loading with events off: the sources
  // already hold this state, and re-saving it would be a second write of the
  // file for the same edit.
  useEffect(() => {
    const workspace = workspaceRef.current;
    const state = pendingReload.current;
    if (!workspace || !state) {
      return;
    }
    pendingReload.current = null;
    const {scrollX, scrollY} = workspace;
    Blockly.Events.disable();
    try {
      Blockly.serialization.workspaces.load(state, workspace);
    } finally {
      Blockly.Events.enable();
    }
    workspace.scroll(scrollX, scrollY);
  }, [blocks]);

  // The selected block-color theme (its dark variant when the app is in dark
  // mode). `BlocklyWorkspace` applies live updates via its `theme` prop.
  const {theme} = useWorldBlocklyTheme();

  return (
    <div className={styles.editor}>
      {importing && (
        <ImportEffectDialog
          onImport={handleImport}
          onCancel={() => finishImport(undefined)}
        />
      )}
      {importingRule && (
        <ImportRuleDialog
          onImport={handleRuleImport}
          onCancel={() => finishImport(undefined)}
        />
      )}
      <BlocklyProvider blocks={blocks} plugins={plugins} theme={theme}>
        <BlocklyWorkspace
          className={styles.workspace}
          startBlocks={startBlocks}
          toolbox={toolbox}
          options={options}
          theme={theme}
          workspaceRef={workspaceRef}
          onChange={handleChange}
        />
      </BlocklyProvider>
    </div>
  );
};

export default BlocklyFileEditor;
