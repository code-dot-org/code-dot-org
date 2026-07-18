import {FitAddon} from '@xterm/addon-fit';
import {Terminal} from '@xterm/xterm';
import {useEffect, useRef} from 'react';

import {Button} from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';

import CodebridgeRegistry from '../CodebridgeRegistry';
import {useCodebridgeRuntime} from '../contexts';

import styles from './console.module.css';
import ConsoleManager from './ConsoleManager';
import {darkTheme, lightTheme} from './consoleThemes';
import ControlButtons from './ControlButtons';

import '@xterm/xterm/css/xterm.css';

const DEFAULT_FONT_SIZE = 14;

// Enter=13, Backspace=127. Control characters (<32) other than Enter are ignored.
const ENTER = 13;
const BACKSPACE = 127;

/**
 * The xterm.js console. Program output is written through the {@link ConsoleManager}
 * (registered on {@link CodebridgeRegistry} so the lab's off-tree runner can reach
 * it); user input is buffered and sent to the runtime's `sendConsoleInput` on
 * Enter. Ported and trimmed from apps/src/codebridge/Console/Console.tsx —
 * per-user font size (backend), analytics, the image addon, and level-change
 * clearing are deferred.
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

  // Create the terminal once.
  useEffect(() => {
    if (!terminalRef.current) {
      return;
    }

    const terminal = new Terminal({
      screenReaderMode: true,
      minimumContrastRatio: 4.5,
      tabStopWidth: 2,
      // Translate bare \n to \r\n so the cursor returns to column 0 on each
      // newline; otherwise prompts like "name?\n" leave input indented.
      convertEol: true,
      fontSize: DEFAULT_FONT_SIZE,
      theme: isDark ? darkTheme : lightTheme,
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    const manager = new ConsoleManager(terminal, fitAddon);
    CodebridgeRegistry.setConsoleManager(manager);

    terminal.open(terminalRef.current);
    fitAddon.fit();

    terminal.onData((data: string) => {
      const charCode = data.charCodeAt(0);
      if (charCode === ENTER) {
        terminal.writeln('');
        sendInputRef.current?.(manager.getInputBuffer());
        manager.saveAndClearInputBuffer();
      } else if (charCode === BACKSPACE) {
        terminal.write('\b \b');
        manager.backspaceInputBuffer();
      } else if (charCode >= 32) {
        terminal.write(data);
        manager.appendToInputBuffer(data);
      }
      // charCode < 32 (other control characters): ignored.
    });

    // Let Tab and Escape move focus out of the terminal instead of being
    // captured, so the console is not a keyboard trap.
    terminal.attachCustomKeyEventHandler(
      event => !(event.key === 'Tab' || event.key === 'Escape'),
    );

    const onResize = () => fitAddon.fit();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      terminal.dispose();
      CodebridgeRegistry.setConsoleManager(null);
    };
  }, []);

  // Apply theme changes live.
  useEffect(() => {
    const terminal = CodebridgeRegistry.getConsoleManager()?.getTerminal();
    if (terminal) {
      terminal.options.theme = isDark ? darkTheme : lightTheme;
    }
  }, [isDark]);

  return (
    <div className={styles.console}>
      <div className={styles.header}>
        <strong>Console</strong>
        <span className={styles.headerActions}>
          <ControlButtons />
          <Button
            isIconOnly
            icon={{iconName: 'trash'}}
            aria-label="Clear console"
            onClick={() =>
              CodebridgeRegistry.getConsoleManager()?.clearTerminalLines()
            }
            type="tertiary"
            color="gray"
            size="xs"
          />
        </span>
      </div>
      <div
        ref={terminalRef}
        className={styles.terminal}
        aria-label="Console output"
      />
    </div>
  );
};

export default Console;
