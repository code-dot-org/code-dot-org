import {FitAddon} from '@xterm/addon-fit';
import {Terminal} from '@xterm/xterm';
import React, {useEffect, useRef, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import '@xterm/xterm/css/xterm.css';

import CodebridgeRegistry from '../CodebridgeRegistry';
import {usePreviewPanel} from '../hooks/usePreviewPanel';

import {writeConsoleMessage} from './ConsoleHelper';
import ControlButtons from './ControlButtons';
import RightButtons from './RightButtons';

import moduleStyles from './console.module.scss';

const ConsoleV2: React.FunctionComponent = () => {
  const {showPreviewPanel} = usePreviewPanel();
  const terminalRef = useRef<HTMLDivElement>(null);
  const [didInit, setDidInit] = useState(false);
  const clearOutput = () => {
    CodebridgeRegistry.getInstance().clearTerminalLines();
  };

  // Clear console when we change levels. Don't send an analytics event
  // as the user did not initiate this action.
  // TODO: Add analytics
  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () => clearOutput());

  const onData = (data: string) => {
    const terminal = CodebridgeRegistry.getInstance().getTerminal();
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

    const terminal = new Terminal({
      screenReaderMode: true,
      minimumContrastRatio: 4.5,
      tabStopWidth: 2,
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    CodebridgeRegistry.getInstance().setTerminal(terminal);
    CodebridgeRegistry.getInstance().setTerminalFitAddon(fitAddon);
    terminal.open(terminalRef.current);
    terminal.onData(onData);
    fitAddon.fit();

    // Right now we are tracking lines in the registry so we can replay them here.
    // We may be able to avoid this after
    // this pr goes in: https://github.com/xtermjs/xterm.js/pull/5253
    // After that, we may just be able to call open() on the existing terminal instance
    // and move it to the new container.
    const existingLines = CodebridgeRegistry.getInstance().getTerminalLines();
    if (existingLines.length > 0) {
      const lines = existingLines.join('\n');
      CodebridgeRegistry.getInstance().clearTerminalLines();
      writeConsoleMessage(lines);
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
      rightHeaderContent={<RightButtons clearOutput={clearOutput} />}
      leftHeaderContent={!showPreviewPanel && <ControlButtons />}
      headerClassName={moduleStyles.consoleHeader}
    >
      <div ref={terminalRef} className={moduleStyles.consoleV2} />
    </PanelContainer>
  );
};

export default ConsoleV2;
