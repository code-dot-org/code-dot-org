import {useState, type CSSProperties} from 'react';

import {InfoPanel, Workspace} from '@code-dot-org/codebridge';
import {PanelContainer, ResizeHandle, WorkspaceHeader} from '@code-dot-org/lab';

import styles from './webLayout.module.css';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const INSTRUCTIONS = {initial: 320, min: 200, max: 640};
const PREVIEW = {initial: 460, min: 240, max: 900};

/**
 * The Web Lab workspace. Mirrors the legacy weblab2 VerticalLayout: the
 * instructions / resource panel on the far left, the Codebridge workspace (file
 * browser + editor with tabs) in the middle, and the page preview on the right.
 * Both dividers drag to resize and restore their default on double-click.
 *
 * The preview is a placeholder for now — the real one renders the project in an
 * iframe served by a project service worker (legacy htmlPreview/), and the debug
 * panel (console + network) sits beneath it. Both are separate increments.
 */
const WebLayout = () => {
  const [instructionsWidth, setInstructionsWidth] = useState(
    INSTRUCTIONS.initial,
  );
  const [previewWidth, setPreviewWidth] = useState(PREVIEW.initial);

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
        <PanelContainer id="web-workspace" headerContent={<WorkspaceHeader />}>
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

      <div className={styles.previewPane} style={{width: previewWidth}}>
        <PanelContainer id="web-preview" headerContent="Preview">
          <div className={styles.previewPlaceholder}>
            The page preview lands in the next increment.
          </div>
        </PanelContainer>
      </div>
    </div>
  );
};

export default WebLayout;
