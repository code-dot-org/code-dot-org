import {useState, type CSSProperties} from 'react';

import {InfoPanel, Workspace} from '@code-dot-org/codebridge';
import {PanelContainer, ResizeHandle, WorkspaceHeader} from '@code-dot-org/lab';

import {DebugProvider} from '../debug/DebugContext';
import {DebugPanel} from '../debug/DebugPanel';
import {HTMLPreview} from '../preview/HTMLPreview';

import styles from './webLayout.module.css';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const INSTRUCTIONS = {initial: 320, min: 200, max: 640};
const PREVIEW = {initial: 460, min: 240, max: 900};
const DEBUG = {initial: 220, min: 80, max: 560};

/**
 * The Web Lab workspace. Mirrors the legacy weblab2 VerticalLayout: the
 * instructions / resource panel on the far left, the Codebridge workspace (file
 * browser + editor with tabs) in the middle, and the page preview on the right.
 * Both dividers drag to resize and restore their default on double-click.
 *
 * The preview renders the project in an iframe on its own origin, served by a
 * project service worker (legacy htmlPreview/), with the debug panel (console +
 * network) beneath it. The preview chrome (URL bar, refresh, viewport toggle) is
 * a separate increment.
 */
const WebLayout = () => {
  const [instructionsWidth, setInstructionsWidth] = useState(
    INSTRUCTIONS.initial,
  );
  const [previewWidth, setPreviewWidth] = useState(PREVIEW.initial);
  const [debugHeight, setDebugHeight] = useState(DEBUG.initial);

  return (
    // DebugProvider spans the preview (which reports what the page did) and the
    // debug panel (which shows it).
    // The instructions width rides on a custom property so it can land on the
    // ResourcePanel itself (which takes a className but no style prop).
    <DebugProvider>
      <div
        className={styles.layout}
        style={
          {'--instructions-width': `${instructionsWidth}px`} as CSSProperties
        }
      >
        <InfoPanel
          className={styles.instructions}
          documentationUrl="/docs/ide/web"
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

        <div className={styles.workspaceSection}>
          <PanelContainer
            id="web-workspace"
            headerContent={<WorkspaceHeader />}
          >
            <Workspace />
          </PanelContainer>
        </div>

        <ResizeHandle
          axis="x"
          ariaLabel="Resize preview"
          value={previewWidth}
          min={PREVIEW.min}
          max={PREVIEW.max}
          // Dragging right shrinks the preview: it is the trailing panel, so its
          // width moves opposite to the pointer.
          onDelta={dx =>
            setPreviewWidth(w => clamp(w - dx, PREVIEW.min, PREVIEW.max))
          }
          onReset={() => setPreviewWidth(PREVIEW.initial)}
        />

        {/* The preview and the debug panel share the right-hand column: the
          panel reports what the previewed page logged and requested. */}
        <div className={styles.previewPane} style={{width: previewWidth}}>
          <div className={styles.previewSection}>
            <PanelContainer id="web-preview" headerContent="Preview">
              <HTMLPreview />
            </PanelContainer>
          </div>
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
        </div>
      </div>
    </DebugProvider>
  );
};

export default WebLayout;
