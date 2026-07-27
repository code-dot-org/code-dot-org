import {useState, type CSSProperties} from 'react';

import {InfoPanel, Workspace} from '@code-dot-org/codebridge';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {
  PanelContainer,
  ResizeHandle,
  WorkspaceHeader,
} from '@code-dot-org/lab/components';

import {ViewMode, type ViewModeType} from '../constants';
import {ConsolePanel} from '../debug/ConsolePanel';
import {WorldPreview} from '../preview/WorldPreview';

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
  const [instructionsWidth, setInstructionsWidth] = useState(
    INSTRUCTIONS.initial,
  );
  const [previewWidth, setPreviewWidth] = useState(PREVIEW.initial);
  const [viewMode, setViewMode] = useState<ViewModeType>(ViewMode.SPLIT);

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
      />
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
                  <Workspace />
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
