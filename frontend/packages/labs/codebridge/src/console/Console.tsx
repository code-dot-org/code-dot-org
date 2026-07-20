import {IconButton} from '@mui/material';
import {FitAddon} from '@xterm/addon-fit';
import {ImageAddon} from '@xterm/addon-image';
import {Terminal} from '@xterm/xterm';
import {useEffect, useRef, useState} from 'react';

import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {FontSize, PanelContainer} from '@code-dot-org/lab';

import CodebridgeRegistry from '../CodebridgeRegistry';
import {useCodebridgeRuntime} from '../contexts';
import {useAppSelector} from '../redux/store';

import styles from './console.module.css';
import ConsoleManager from './ConsoleManager';
import {darkTheme, lightTheme} from './consoleThemes';
import ControlButtons from './ControlButtons';

import '@xterm/xterm/css/xterm.css';

// Enter=13, Backspace=127. Control characters (<32) other than Enter are ignored.
const ENTER = 13;
const BACKSPACE = 127;

/**
 * The xterm.js console. Program output is written through the {@link ConsoleManager}
 * (registered on {@link CodebridgeRegistry} so the lab's off-tree runner can reach
 * it); user input is buffered and sent to the runtime's `sendConsoleInput` on
 * Enter. Ported and trimmed from apps/src/codebridge/Console/Console.tsx —
 * analytics, the image addon, and level-change clearing are deferred (as is the
 * backend persistence of the font-size choice, which is session-only here).
 */
const Console = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const {sendConsoleInput} = useCodebridgeRuntime();
  // Read through a ref so the terminal's onData handler always calls the latest
  // runtime callback without recreating the terminal.
  const sendInputRef = useRef(sendConsoleInput);
  sendInputRef.current = sendConsoleInput;

  const {theme} = useTheme(true);
  const isDark = theme === 'Dark';

  // Console font size (Settings menu). Read through a ref so the mount-once
  // terminal creation picks up the current value; a separate effect applies
  // later changes live.
  const consoleFontSizeKey = useAppSelector(
    state => state.labView.consoleFontSizeKey,
  );
  const fontSizePx = FontSize[consoleFontSizeKey];
  const fontSizeRef = useRef(fontSizePx);
  fontSizeRef.current = fontSizePx;

  // The clear button is disabled while running or when the console has no
  // output (legacy RightButtons). The manager is created asynchronously inside
  // the rAF below, so surface it via state to drive the subscription effect.
  const [consoleManager, setConsoleManager] = useState<ConsoleManager | null>(
    null,
  );
  const [hasConsoleOutput, setHasConsoleOutput] = useState(false);
  const isRunning = useAppSelector(state => state.labSystem.isRunning);

  // Create the terminal once.
  useEffect(() => {
    const container = terminalRef.current;
    if (!container) {
      return;
    }

    // Defer terminal creation by one frame. Under React StrictMode (which the
    // studio host uses) the mount effect runs, is cleaned up, then runs again —
    // synchronously. Creating the terminal inline would `open()` it (scheduling
    // an async xterm render) only for the immediate cleanup to dispose it; that
    // orphaned render then reads the torn-down renderer and throws "reading
    // 'dimensions'", leaving a broken console. Deferring to rAF lets the cleanup
    // cancel the pending creation, so exactly one terminal is ever opened.
    let terminal: Terminal | undefined;
    let resizeObserver: ResizeObserver | undefined;

    const frame = requestAnimationFrame(() => {
      terminal = new Terminal({
        screenReaderMode: true,
        minimumContrastRatio: 4.5,
        tabStopWidth: 2,
        // Translate bare \n to \r\n so the cursor returns to column 0 on each
        // newline; otherwise prompts like "name?\n" leave input indented.
        convertEol: true,
        fontSize: fontSizeRef.current,
        theme: isDark ? darkTheme : lightTheme,
      });
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      // Renders inline images (matplotlib figures) written via getImageMessage's
      // iTerm2 escape sequence.
      terminal.loadAddon(new ImageAddon());

      const manager = new ConsoleManager(terminal, fitAddon);
      CodebridgeRegistry.setConsoleManager(manager);
      setConsoleManager(manager);

      terminal.open(container);

      // fit() throws if the container has no size yet (it reads dimensions that
      // aren't computed until layout). Guard it, and refit whenever the
      // container resizes — which also covers the initial zero-size mount.
      const safeFit = () => {
        try {
          fitAddon.fit();
        } catch {
          // No layout dimensions yet; a later resize will fit.
        }
      };
      safeFit();

      terminal.onData((data: string) => {
        const charCode = data.charCodeAt(0);
        if (charCode === ENTER) {
          terminal!.writeln('');
          sendInputRef.current?.(manager.getInputBuffer());
          manager.saveAndClearInputBuffer();
        } else if (charCode === BACKSPACE) {
          terminal!.write('\b \b');
          manager.backspaceInputBuffer();
        } else if (charCode >= 32) {
          terminal!.write(data);
          manager.appendToInputBuffer(data);
        }
        // charCode < 32 (other control characters): ignored.
      });

      // Let Tab and Escape move focus out of the terminal instead of being
      // captured, so the console is not a keyboard trap.
      terminal.attachCustomKeyEventHandler(
        event => !(event.key === 'Tab' || event.key === 'Escape'),
      );

      // Refit on container resize (also covers the initial zero-size mount).
      // ResizeObserver is absent in jsdom, so guard it.
      resizeObserver =
        typeof ResizeObserver !== 'undefined'
          ? new ResizeObserver(safeFit)
          : undefined;
      resizeObserver?.observe(container);
    });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      terminal?.dispose();
      CodebridgeRegistry.setConsoleManager(null);
      setConsoleManager(null);
    };
  }, []);

  // Track whether the console has any output, so the clear button can disable
  // when empty (legacy RightButtons subscribes to the same listener).
  useEffect(() => {
    if (!consoleManager) {
      return;
    }
    setHasConsoleOutput(consoleManager.getTerminalLines().length > 0);
    const handleUpdate = (terminalLines: string[]) => {
      setHasConsoleOutput(terminalLines.length > 0);
    };
    consoleManager.addTerminalLinesListener(handleUpdate);
    return () => {
      consoleManager.removeTerminalLinesListener(handleUpdate);
    };
  }, [consoleManager]);

  // Apply theme changes live.
  useEffect(() => {
    const terminal = CodebridgeRegistry.getConsoleManager()?.getTerminal();
    if (terminal) {
      terminal.options.theme = isDark ? darkTheme : lightTheme;
    }
  }, [isDark]);

  // Apply font-size changes live, refitting so the column/row count updates.
  useEffect(() => {
    const manager = CodebridgeRegistry.getConsoleManager();
    const terminal = manager?.getTerminal();
    if (terminal) {
      terminal.options.fontSize = fontSizePx;
      try {
        manager?.getTerminalFitAddon().fit();
      } catch {
        // No layout dimensions yet; a later resize will fit.
      }
    }
  }, [fontSizePx]);

  return (
    <PanelContainer
      id="codebridge-console"
      className={styles.console}
      headerContent="Console"
      leftHeaderContent={<ControlButtons />}
      rightHeaderContent={
        <WithTooltip
          tooltipProps={{
            text: 'Clear console',
            size: 'xs',
            direction: 'onLeft',
            tooltipId: 'clear-console-tooltip',
          }}
        >
          <IconButton
            aria-label="Clear console"
            variant="text"
            color="tertiary"
            size="extraSmall"
            disabled={isRunning || !hasConsoleOutput}
            onClick={() =>
              CodebridgeRegistry.getConsoleManager()?.clearTerminalLines()
            }
          >
            <FontAwesomeV6Icon iconName="eraser" />
          </IconButton>
        </WithTooltip>
      }
    >
      <div
        ref={terminalRef}
        className={
          isDark ? `${styles.terminal} ${styles.terminalDark}` : styles.terminal
        }
        aria-label="Console output"
      />
    </PanelContainer>
  );
};

export default Console;
