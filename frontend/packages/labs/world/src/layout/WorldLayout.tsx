import {useMemo, useState, type CSSProperties} from 'react';

import {InfoPanel, Workspace} from '@code-dot-org/codebridge';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {
  PanelContainer,
  ResizeHandle,
  WorkspaceHeader,
} from '@code-dot-org/lab/components';
import {useMaybeLevelProperties, useSources} from '@code-dot-org/lab/contexts';
import {useAppSelector} from '@code-dot-org/lab/redux';
import type {Setting} from '@code-dot-org/lab/resourcePanel';

import {useWorldBlocklyTheme} from '../blockly/worldBlocklyTheme';
import {ENTRY_FILE, ViewMode, type ViewModeType} from '../constants';
import {ConsolePanel} from '../debug/ConsolePanel';
import {showsFileBrowser, type WorldLevelProperties} from '../levelData';
import {WorldPreview} from '../preview/WorldPreview';
import {fileIdAt} from '../runtime/projectFiles';

import styles from './worldLayout.module.css';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const INSTRUCTIONS = {initial: 320, min: 200, max: 640};
const PREVIEW = {initial: 460, min: 240, max: 900};

/**
 * The World Lab workspace, mirroring web-lab's `WebLayout`: the instructions /
 * resource panel on the far left, and beside it a single workspace column.
 *
 * The editor and the preview are two panes *inside* that column, under one
 * shared header. The header's segmented buttons collapse the split to either
 * pane alone.
 *
 * ```
 * ┌─────────────┬───────────────────────────────────────┐
 * │             │ [Code|Preview|Split]   header         │
 * │ instructions├───────────────────┬───────────────────┤
 * │             │ editor            │ world preview     │
 * │             │                   ├───────────────────┤
 * │             │                   │ console           │
 * └─────────────┴───────────────────┴───────────────────┘
 * ```
 *
 * The Console/Debugger box follows the running game: it sits under the preview
 * pane in split / preview-only view, and under the editor pane when the editor
 * is the only pane. It is not a full-width bar under both (web-lab's shape).
 */
const WorldLayout = () => {
  // A level about one file has nothing to browse (levelData).
  const level = useMaybeLevelProperties<WorldLevelProperties>();
  const browsable = showsFileBrowser(level);

  // …and with nothing to browse, closing a tab can be a one-way door. Every
  // other file is reachable from a block that names it (blockly/openModule),
  // but the world itself is what those blocks are IN — close it and there is
  // no list to reopen it from and no block left to ask. So it is pinned, and
  // only while the browser is hidden: with a browser, closing it is an
  // ordinary thing to do and one click to undo.
  const {currentSources} = useSources<MultiFileSource>();
  const entryFileId = useMemo(
    () => (browsable ? undefined : fileIdAt(currentSources.source, ENTRY_FILE)),
    [browsable, currentSources],
  );
  const [instructionsWidth, setInstructionsWidth] = useState(
    INSTRUCTIONS.initial,
  );
  const [previewWidth, setPreviewWidth] = useState(PREVIEW.initial);
  const [viewMode, setViewMode] = useState<ViewModeType>(ViewMode.SPLIT);

  // The base ResourcePanel collapses to its icon strip; when it does, the
  // instructions resize seam has nothing to size, so hide it.
  const isInstructionsCollapsed = useAppSelector(
    state => state.labView?.isStandaloneCollapsed ?? false,
  );

  // A "Block Color Theme" dropdown in the settings pane. The context applies the
  // choice (and its dark variant) to the Blockly editors.
  const {options, selectedBase, setSelectedBase} = useWorldBlocklyTheme();
  const blocklyThemeSetting = useMemo<Setting>(
    () => ({
      id: 'blocklyTheme',
      label: 'Block Color Theme',
      options: [...options],
      selectedValue: selectedBase,
      onChange: setSelectedBase,
    }),
    [options, selectedBase, setSelectedBase],
  );

  const showEditor = viewMode !== ViewMode.PREVIEW;
  const showPreview = viewMode !== ViewMode.CODE;
  const isSplit = showEditor && showPreview;

  return (
    // The instructions width rides on a custom property so it can land on the
    // ResourcePanel itself (which takes a className but no style prop).
    <div
      className={styles.layout}
      style={
        {'--instructions-width': `${instructionsWidth}px`} as CSSProperties
      }
    >
      <InfoPanel
        className={styles.instructions}
        documentationUrl="/docs/ide/world"
        hasConsole={false}
        extraSettings={[blocklyThemeSetting]}
      />
      {!isInstructionsCollapsed && (
        <ResizeHandle
          axis="x"
          ariaLabel="Resize instructions"
          value={instructionsWidth}
          min={INSTRUCTIONS.min}
          max={INSTRUCTIONS.max}
          onDelta={dx =>
            setInstructionsWidth(w =>
              clamp(w + dx, INSTRUCTIONS.min, INSTRUCTIONS.max),
            )
          }
          onReset={() => setInstructionsWidth(INSTRUCTIONS.initial)}
        />
      )}

      <div className={styles.workspaceColumn}>
        <PanelContainer
          id="world-workspace"
          className={styles.workspacePanel}
          headerContent={<WorkspaceHeader />}
          leftHeaderContent={
            <SegmentedButtons
              size="xs"
              selectedButtonValue={viewMode}
              onChange={value => setViewMode(value as ViewModeType)}
              buttons={[
                {
                  value: ViewMode.CODE,
                  label: 'Code',
                  ariaLabel: 'View code editor only',
                  iconLeft: {iconName: 'code', iconStyle: 'solid'},
                },
                {
                  value: ViewMode.PREVIEW,
                  label: 'Preview',
                  ariaLabel: 'View world preview only',
                  iconLeft: {iconName: 'eye', iconStyle: 'solid'},
                },
                {
                  value: ViewMode.SPLIT,
                  label: 'Split View',
                  ariaLabel: 'View code and world preview side by side',
                  iconLeft: {iconName: 'table-columns', iconStyle: 'solid'},
                },
              ]}
            />
          }
        >
          <div className={styles.editorAndPreview}>
            {showEditor && (
              <div className={styles.editorPane}>
                <div className={styles.editorMain}>
                  <Workspace
                    hideFileBrowser={!browsable}
                    pinnedFileId={entryFileId}
                  />
                </div>
                {/* Code-only view: the console falls back to under the editor. */}
                {!showPreview && <ConsolePanel />}
              </div>
            )}
            {isSplit && (
              <ResizeHandle
                axis="x"
                ariaLabel="Resize preview"
                value={previewWidth}
                min={PREVIEW.min}
                max={PREVIEW.max}
                // Dragging right shrinks the preview: it is the trailing pane,
                // so its width moves opposite to the pointer.
                onDelta={dx =>
                  setPreviewWidth(w => clamp(w - dx, PREVIEW.min, PREVIEW.max))
                }
                onReset={() => setPreviewWidth(PREVIEW.initial)}
              />
            )}
            {showPreview && (
              // Alone, the preview takes the whole column; split, it is sized by
              // the divider and the editor takes what is left.
              <div
                className={
                  isSplit
                    ? styles.previewPane
                    : `${styles.previewPane} ${styles.previewPaneFull}`
                }
                style={isSplit ? {width: previewWidth} : undefined}
              >
                <WorldPreview />
                {/* The console lives under the preview whenever it is shown. */}
                <ConsolePanel />
              </div>
            )}
          </div>
        </PanelContainer>
      </div>
    </div>
  );
};

export default WorldLayout;
