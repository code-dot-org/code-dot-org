import {useState, type CSSProperties} from 'react';

import {InfoPanel, Workspace} from '@code-dot-org/codebridge';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {PanelContainer, ResizeHandle, WorkspaceHeader} from '@code-dot-org/lab';

import {ViewMode, type ViewModeType} from '../constants';
import {DebugProvider, useDebug} from '../debug/DebugContext';
import {DebugPanel} from '../debug/DebugPanel';
import {HTMLPreview} from '../preview/HTMLPreview';

import styles from './webLayout.module.css';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const INSTRUCTIONS = {initial: 320, min: 200, max: 640};
const PREVIEW = {initial: 460, min: 240, max: 900};
const DEBUG = {initial: 300, min: 200, max: 560};

/**
 * The Web Lab workspace, mirroring legacy's weblab2 VerticalLayout: the
 * instructions / resource panel on the far left, and beside it a single
 * workspace column.
 *
 * The editor and the preview are two panes *inside* that column, under one
 * shared header — the preview has no header of its own. That is what lets the
 * debug panel span the full width beneath both of them rather than being
 * trapped in a right-hand column with the preview. The header's segmented
 * buttons collapse the split to either pane alone.
 *
 * ```
 * ┌─────────────┬───────────────────────────────────────┐
 * │             │ [Code|Preview|Split]   header         │
 * │ instructions├───────────────────┬───────────────────┤
 * │             │ editor            │ preview           │
 * │             ├───────────────────┴───────────────────┤
 * │             │ debug (console + network)             │
 * └─────────────┴───────────────────────────────────────┘
 * ```
 */
const WebWorkspace = () => {
  const [instructionsWidth, setInstructionsWidth] = useState(
    INSTRUCTIONS.initial,
  );
  const [previewWidth, setPreviewWidth] = useState(PREVIEW.initial);
  const [debugHeight, setDebugHeight] = useState(DEBUG.initial);
  const [viewMode, setViewMode] = useState<ViewModeType>(ViewMode.SPLIT);

  // Opened from the preview toolbar, closed from there or from the panel's own
  // close button; the layout only gives it room.
  const {isOpen: isDebugPanelOpen} = useDebug();

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
        documentationUrl="/docs/ide/web"
        // Web Lab's console is the debug panel's, styled by the design system,
        // so the Codebridge console font-size setting would do nothing here.
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
          id="web-workspace"
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
                  ariaLabel: 'View web preview only',
                  iconLeft: {iconName: 'eye', iconStyle: 'solid'},
                },
                {
                  value: ViewMode.SPLIT,
                  label: 'Split View',
                  ariaLabel: 'View code and web preview side by side',
                  iconLeft: {iconName: 'table-columns', iconStyle: 'solid'},
                },
              ]}
            />
          }
        >
          <div className={styles.editorAndPreview}>
            {showEditor && (
              <div className={styles.editorPane}>
                <Workspace />
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
                <HTMLPreview />
              </div>
            )}
          </div>
        </PanelContainer>

        {isDebugPanelOpen && (
          <>
            <ResizeHandle
              axis="y"
              ariaLabel="Resize debug panel"
              value={debugHeight}
              min={DEBUG.min}
              max={DEBUG.max}
              onDelta={dy =>
                setDebugHeight(h => clamp(h - dy, DEBUG.min, DEBUG.max))
              }
              onReset={() => setDebugHeight(DEBUG.initial)}
            />
            <div className={styles.debugPane} style={{height: debugHeight}}>
              <DebugPanel />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * DebugProvider spans the preview (which reports what the page did), the debug
 * panel (which shows it), and the layout (which gives the panel room), so it
 * wraps the workspace rather than living inside it.
 */
const WebLayout = () => (
  <DebugProvider>
    <WebWorkspace />
  </DebugProvider>
);

export default WebLayout;
