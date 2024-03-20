import {useCDOIDEContext} from '@cdoide/cdo-ide-context';
import React from 'react';

import {Debugger} from './Debugger';
import './styles/debugger-wrapper.css';

type DebuggerWrapperProps = React.PropsWithChildren & {
  contentFrameHeight?: string;
  debuggerOutput?: string[][];
};

export const DebuggerWrapper = React.memo(
  ({
    contentFrameHeight = '1fr',
    debuggerOutput,
    children,
  }: DebuggerWrapperProps) => {
    const {config} = useCDOIDEContext();

    return (
      <div
        className="debugger-wrapper"
        style={{
          gridTemplateRows: config.showDebug
            ? `${contentFrameHeight} 1fr`
            : 'auto',
        }}
      >
        <div className="debugger-wrapper-child">{children}</div>
        <Debugger output={debuggerOutput} />
      </div>
    );
  }
);
