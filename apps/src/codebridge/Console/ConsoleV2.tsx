import {FitAddon} from '@xterm/addon-fit';
import {Terminal} from '@xterm/xterm';
import React, {useEffect, useRef, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import '@xterm/xterm/css/xterm.css';

import CodebridgeRegistry from '../CodebridgeRegistry';

import ControlButtons from './ControlButtons';
import RightButtons from './RightButtons';

import moduleStyles from './console.module.scss';

const ConsoleV2: React.FunctionComponent = () => {
  const hasMiniApp = useAppSelector(
    state => !!state.lab.levelProperties?.miniApp
  );
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
    // if (CodebridgeRegistry.getInstance().getTerminal()) {
    //   const existingTerminal = CodebridgeRegistry.getInstance().getTerminal();
    //   existingTerminal?.open(terminalRef.current);
    //   const fitAddon = CodebridgeRegistry.getInstance().getTerminalFitAddon();
    //   fitAddon?.fit();
    //   setDidInit(true);
    //   return;
    // }

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
      leftHeaderContent={!hasMiniApp && <ControlButtons />}
      headerClassName={moduleStyles.consoleHeader}
    >
      <div ref={terminalRef} className={moduleStyles.consoleV2} />
    </PanelContainer>
  );
};

export default ConsoleV2;
