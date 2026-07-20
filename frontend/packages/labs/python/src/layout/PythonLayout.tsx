import {useState, type CSSProperties} from 'react';

import {Console, InfoPanel, Workspace} from '@code-dot-org/codebridge';
import {
  PanelContainer,
  ResizeHandle,
  WorkspaceHeader,
} from '@code-dot-org/lab/components';

import styles from './pythonLayout.module.css';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

// Legacy's INITIAL_INFO_PANEL_WIDTH / MIN_LEFT_PANEL_WIDTH equivalents.
const INSTRUCTIONS = {initial: 320, min: 200, max: 640};
const CONSOLE = {initial: 260, min: 100, max: 620};

/**
 * The Python Lab workspace. Mirrors the legacy pythonlab HorizontalLayout: the
 * instructions / resource panel on the far left, then a right column with the
 * Codebridge workspace on top (file browser + editor with tabs) and the console
 * spanning the full width below. Every divider is drag-to-resize, and
 * double-clicking one restores its default size (as legacy's
 * react-resizable-layout separators do). The mini-app preview is still deferred.
 */
const PythonLayout = () => {
  const [instructionsWidth, setInstructionsWidth] = useState(
    INSTRUCTIONS.initial,
  );
  const [consoleHeight, setConsoleHeight] = useState(CONSOLE.initial);

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
        documentationUrl="/docs/ide/python"
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

      <div className={styles.rightColumn}>
        <div className={styles.workspaceSection}>
          <PanelContainer
            id="python-workspace"
            headerContent={<WorkspaceHeader />}
          >
            <Workspace />
          </PanelContainer>
        </div>
        <ResizeHandle
          axis="y"
          ariaLabel="Resize console"
          value={consoleHeight}
          min={CONSOLE.min}
          max={CONSOLE.max}
          onDelta={dy =>
            setConsoleHeight(h => clamp(h - dy, CONSOLE.min, CONSOLE.max))
          }
          onReset={() => setConsoleHeight(CONSOLE.initial)}
        />
        <div className={styles.consolePane} style={{height: consoleHeight}}>
          <Console />
        </div>
      </div>
    </div>
  );
};

export default PythonLayout;
