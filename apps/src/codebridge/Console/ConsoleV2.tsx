import {FitAddon} from '@xterm/addon-fit';
import {Terminal} from '@xterm/xterm';
import React, {useEffect, useRef, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
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
    CodebridgeRegistry.getInstance().getTerminal()?.clear();
  };

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
    const existingTerminal = CodebridgeRegistry.getInstance().getTerminal();
    let existingTerminalData: string | undefined;
    if (existingTerminal) {
      existingTerminal.selectAll();
      existingTerminalData = existingTerminal.getSelection().trim();
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

    // Right now we lose some data (specifically error colors)
    // when the terminal is re-mounted. This may be fixable after
    // this pr goes in: https://github.com/xtermjs/xterm.js/pull/5253
    // If not, we may need to fetch the existing terminal data from redux and re-play it into the terminal :(
    // We also can lose data due to a race condition.
    if (existingTerminalData) {
      writeConsoleMessage(existingTerminalData);
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
