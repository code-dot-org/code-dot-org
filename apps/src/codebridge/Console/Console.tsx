import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils';
import {FitAddon} from '@xterm/addon-fit';
import {ImageAddon} from '@xterm/addon-image';
import {Terminal} from '@xterm/xterm';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import '@xterm/xterm/css/xterm.css';

import ConsoleManager from './ConsoleManager';
import ControlButtons from './ControlButtons';
import RightButtons from './RightButtons';

import moduleStyles from './console.module.scss';

// An xterm.js console component.
const Console: React.FunctionComponent = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [didInit, setDidInit] = useState(false);
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);

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

  const hasMiniApp = useAppSelector(
    state => !!state.lab.levelProperties?.miniApp
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

  const onData = (data: string) => {
    const terminal = CodebridgeRegistry.getInstance()
      .getConsoleManager()
      ?.getTerminal();
    if (!terminal) {
      return;
    }
    const charCode = data.charCodeAt(0);
    if (charCode === 13) {
      // new line
      terminal.writeln('');
    } else if (charCode < 32) {
      // control characters, do nothing
    } else if (charCode === 127) {
      // backspace
      terminal.write('\b \b');
    } else {
      terminal.write(data);
    }
  };

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
    const consoleManager = new ConsoleManager(terminal, fitAddon);
    CodebridgeRegistry.getInstance().setConsoleManager(consoleManager);
    terminal.open(terminalRef.current);
    terminal.onData(onData);
    fitAddon.fit();

    // Right now we are tracking lines from the previous console so we can replay them here.
    // We may be able to avoid this after
    // this pr goes in: https://github.com/xtermjs/xterm.js/pull/5253
    // After that, we may just be able to call open() on the existing terminal instance
    // and move it to the new container.
    if (existingTerminalLines.length > 0) {
      const lines = existingTerminalLines.join('\n');
      consoleManager.writeConsoleMessage(lines);
    }

    // Prevent keyboard trap.
    terminal.attachCustomKeyEventHandler(ignoreEscapeAndTab);

    setDidInit(true);
  }, [didInit, terminalRef]);

  return (
    <PanelContainer
      id="codebridge-console"
      className={moduleStyles.consoleContainer}
      headerContent={codebridgeI18n.consoleHeader()}
      rightHeaderContent={
        <RightButtons clearOutput={() => clearOutput(true)} />
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
