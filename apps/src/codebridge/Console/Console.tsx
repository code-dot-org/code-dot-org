import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import RightButtons from '@codebridge/RightButtons/RightButtons';
import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils';
import {FitAddon} from '@xterm/addon-fit';
import {ImageAddon} from '@xterm/addon-image';
import {Terminal} from '@xterm/xterm';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {FontSize} from '@cdo/apps/lab2/constants';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {fetchAndSaveConsoleFontSize} from '@cdo/apps/lab2/redux/lab2ViewRedux';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import '@xterm/xterm/css/xterm.css';

import ConsoleManager from './ConsoleManager';
import {darkTheme, lightTheme} from './consoleThemes';
import ControlButtons from './ControlButtons';

import moduleStyles from './console.module.scss';

// An xterm.js console component.
const Console: React.FunctionComponent = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [didInit, setDidInit] = useState(false);
  const [consoleManager, setConsoleManager] = useState<ConsoleManager | null>(
    null
  );
  const {sendConsoleInput, levelProperties} = useCodebridgeContext();
  const appName = levelProperties.appName;

  const hasMiniApp = useAppSelector(
    state => !!state.lab2Project.projectSources?.labConfig?.miniApp?.name
  );
  const fontSizeKey = useAppSelector(
    state => state.lab2View.consoleFontSizeKey
  );
  const {signInState} = useAppSelector(state => state.currentUser);
  const dispatch = useAppDispatch();
  const {theme} = useTheme();

  const clearOutput = useCallback(
    (sendAnalytics: boolean) => {
      CodebridgeRegistry.getInstance()
        .getConsoleManager()
        ?.clearTerminalLines();
      if (sendAnalytics) {
        sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_CLEAR_CONSOLE, appName);
      }
    },
    [appName]
  );

  // Clear console when we change levels. Don't send an analytics event
  // as the user did not initiate this action.
  // We clear on level load start so that logs don't get replayed
  // onto the new console. We clear on complete to ensure that no new logs
  // (for example a "program stopped" message, which occurs if the program was in
  // progress during the level change) get shown on the new console.
  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, () => {
    clearOutput(false);
  });
  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () => {
    clearOutput(false);
  });

  // Handler for terminal input. This manages storing input into a buffer
  // and sending it to the console manager when the user presses enter.
  const onData = useCallback(
    (data: string) => {
      const consoleManager =
        CodebridgeRegistry.getInstance().getConsoleManager();
      const terminal = consoleManager?.getTerminal();
      if (!terminal || !consoleManager) {
        return;
      }
      const charCode = data.charCodeAt(0);
      if (charCode === 13) {
        // new line
        terminal.writeln('');
        // send input
        if (sendConsoleInput) {
          sendConsoleInput(consoleManager.getInputBuffer());
        }
        // reset buffer
        consoleManager.saveAndClearInputBuffer();
      } else if (charCode < 32) {
        // control characters, do nothing
      } else if (charCode === 127) {
        // backspace
        terminal.write('\b \b');
        consoleManager.backspaceInputBuffer();
      } else {
        terminal.write(data);
        consoleManager.appendToInputBuffer(data);
      }
    },
    [sendConsoleInput]
  );

  const ignoreEscapeAndTab = (e: KeyboardEvent) => {
    if (e.key === 'Tab' || e.key === 'Escape') {
      return false;
    } else {
      return true;
    }
  };

  useEffect(() => {
    if (!terminalRef || terminalRef.current === null || didInit) {
      return;
    }

    let existingTerminalLines: string[] = [];

    const existingConsoleManager =
      CodebridgeRegistry.getInstance().getConsoleManager();
    if (existingConsoleManager) {
      existingTerminalLines = existingConsoleManager.getTerminalLines();
    }

    const terminal = new Terminal({
      screenReaderMode: true,
      minimumContrastRatio: 4.5,
      tabStopWidth: 2,
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    const imageAddon = new ImageAddon();
    terminal.loadAddon(imageAddon);
    const newConsoleManager = new ConsoleManager(terminal, fitAddon);
    CodebridgeRegistry.getInstance().setConsoleManager(newConsoleManager);
    setConsoleManager(newConsoleManager);
    terminal.open(terminalRef.current);
    terminal.onData(onData);
    fitAddon.fit();
    window.addEventListener('resize', () => fitAddon.fit());
    terminal.options = {
      fontSize: FontSize[fontSizeKey],
      theme: theme === 'Dark' ? darkTheme : lightTheme,
    };

    // Right now we are tracking lines from the previous console so we can replay them here.
    // We may be able to avoid this after
    // this pr goes in: https://github.com/xtermjs/xterm.js/pull/5253
    // After that, we may just be able to call open() on the existing terminal instance
    // and move it to the new container.
    if (existingTerminalLines.length > 0) {
      const lines = existingTerminalLines.join('\n');
      newConsoleManager.writeConsoleMessage(lines);
    }

    // Prevent keyboard trap.
    terminal.attachCustomKeyEventHandler(ignoreEscapeAndTab);

    setDidInit(true);
  }, [didInit, terminalRef, onData, fontSizeKey, theme]);

  // Apply updated font size to console whenever fontSizeKey changes.
  useEffect(() => {
    const consoleManager = CodebridgeRegistry.getInstance().getConsoleManager();
    const terminal = consoleManager?.getTerminal();
    if (terminal) {
      terminal.options.fontSize = FontSize[fontSizeKey];
    }
  }, [fontSizeKey]);

  useEffect(() => {
    const consoleManager = CodebridgeRegistry.getInstance().getConsoleManager();
    const terminal = consoleManager?.getTerminal();
    if (terminal) {
      terminal.options.theme = theme === 'Dark' ? darkTheme : lightTheme;
    }
  }, [theme]);

  // Load the user's preferred console font size from the backend which is saved
  // per app type (currently in pythonlab) for signed-in users.
  // When the user selects a different font size from settings, it's saved on the backend.
  // We mark font size is loaded once the value is fetched (signed-in) or skipped (signed-out).
  useEffect(() => {
    if (signInState !== SignInState.SignedIn) {
      return;
    }
    dispatch(fetchAndSaveConsoleFontSize({appName}));
  }, [signInState, appName, dispatch]);

  return (
    <PanelContainer
      id="codebridge-console"
      className={moduleStyles[`consoleContainer${theme}`]}
      headerContent={codebridgeI18n.consoleHeader()}
      rightHeaderContent={
        <RightButtons
          clearOutput={() => clearOutput(true)}
          consoleManager={consoleManager}
        />
      }
      leftHeaderContent={!hasMiniApp && <ControlButtons />}
      headerClassName={moduleStyles.consoleHeader}
    >
      <div
        ref={terminalRef}
        className={moduleStyles.consoleV2}
        id="uitest-codebridge-console"
      />
    </PanelContainer>
  );
};

export default Console;
