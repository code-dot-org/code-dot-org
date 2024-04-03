import {DebuggerWrapper} from '@cdoide/debugger/DebuggerWrapper';
import {RunBar} from '@cdoide/RunBar';
import {ProjectFileType} from '@cdoide/types';
import React, {useState} from 'react';
import Sandbox from 'websandbox';

import './styles/jsPreview.css';

type JSPreviewProps = {
  file: ProjectFileType;
};

export const JSPreview = ({file}: JSPreviewProps) => {
  const [output, setOutput] = useState<string[][]>([]);

  const runSandbox = () => {
    const debugApi = {
      consoleLog: (...messages: string[]) => {
        setOutput(o => [...o, messages]);
        return Promise.resolve('messaged');
      },
    };

    for (const e of Array.from(
      document.getElementsByClassName('js-preview-output')
    )) {
      e.innerHTML = '';
    }
    Sandbox.create(debugApi, {
      frameContainer: document.getElementsByClassName('js-preview-output')[0],
    }).promise.then(function (sandbox: {run: (code: string) => void}) {
      setOutput([]);
      sandbox.run(
        `
        console.log = Websandbox.connection.remote.consoleLog;
        ${file.contents}
      `
      );
    });
  };

  return (
    <div className="js-preview-wrapper">
      <DebuggerWrapper contentFrameHeight="1fr" debuggerOutput={output}>
        <div className="js-preview-container">
          <div className="js-preview-output">pending...</div>
        </div>
      </DebuggerWrapper>
      <RunBar run={runSandbox} />
    </div>
  );
};
