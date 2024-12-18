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

  useEffect(() => {
    if (!terminalRef || terminalRef.current === null || didInit) {
      return;
    }

    const terminal = new Terminal({
      screenReaderMode: true,
      minimumContrastRatio: 4.5,
    });
    CodebridgeRegistry.getInstance().setTerminal(terminal);
    terminal.open(terminalRef.current);
    terminal.onData(onData);

    // Prevent keyboard trap.
    const ignoredKeys = ['Tab', 'Esc'];
    terminal.attachCustomKeyEventHandler(e => {
      if (ignoredKeys.includes(e.key)) {
        return false;
      } else {
        return true;
      }
    });

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
      <div ref={terminalRef} />
    </PanelContainer>
  );
};

export default ConsoleV2;
