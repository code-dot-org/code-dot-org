import {Button} from '@mui/material';
import {useEffect, useRef} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {PanelContainer} from '@code-dot-org/lab/components';

import {useWorldRuntime} from '../runtime/WorldRuntimeContext';

import styles from './consolePanel.module.css';

/**
 * The Console/Debugger box: shows the console output the preview relays from the
 * running game (and compile / engine errors). WorldLayout places it under
 * whichever pane is showing the game — under the preview in split / preview-only
 * view, under the editor when the editor is the only pane.
 *
 * It uses the shared `PanelContainer` header (as the workspace does) so its
 * title bar matches the rest of the lab and themes in light/dark. The output is
 * a scrollable, keyboard-focusable region (WCAG 2.2 SC 2.1.1: a scrollable
 * container must be reachable), labelled, with no focusable rows — one tab stop
 * regardless of line count. Mirrors web-lab's console reasoning.
 */
export const ConsolePanel = () => {
  const {consoleLog, clearConsole} = useWorldRuntime();
  const listRef = useRef<HTMLDivElement | null>(null);

  // Keep the newest line in view.
  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [consoleLog]);

  return (
    <div className={styles.slot}>
      <PanelContainer
        id="world-console"
        headerContent="Console"
        rightHeaderContent={
          <Button
            variant="text"
            size="extraSmall"
            startIcon={
              <FontAwesomeV6Icon iconName="eraser" iconStyle="solid" />
            }
            onClick={clearConsole}
            disabled={consoleLog.length === 0}
          >
            Clear
          </Button>
        }
      >
        <div
          ref={listRef}
          className={styles.list}
          role="region"
          aria-label="Console output"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollable region requires keyboard access per WCAG 2.2 SC 2.1.1
          tabIndex={0}
        >
          {consoleLog.length === 0 ? (
            <div className={styles.empty}>No output yet.</div>
          ) : (
            consoleLog.map((line, index) => (
              <div
                // The log is append-only; index is a stable key here.
                key={index}
                className={
                  line.level === 'error' || line.level === 'warn'
                    ? `${styles.line} ${styles.lineError}`
                    : styles.line
                }
              >
                {line.text}
                {line.repeats !== undefined && line.repeats > 1 && (
                  // A count rather than four hundred copies of one sentence
                  // (WorldRuntimeContext.collapse). Beside the text, so the
                  // line still reads as the thing that was said.
                  <span className={styles.repeats}>×{line.repeats}</span>
                )}
              </div>
            ))
          )}
        </div>
      </PanelContainer>
    </div>
  );
};

export default ConsolePanel;
