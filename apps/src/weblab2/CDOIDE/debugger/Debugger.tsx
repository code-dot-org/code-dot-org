import React, {useState, useEffect} from 'react';
import './styles/debugger.css';

type DebuggerProps = {
  output?: string[][];
};

export const Debugger = React.memo(({output}: DebuggerProps) => {
  const [myOutput, setMyOutput] = useState(output);

  useEffect(() => setMyOutput(output), [output]);

  return (
    <div className="debugger-pane">
      <div className="debugger-title-bar">
        <div className="debugger-title">Console</div>
        <button type="button" onClick={() => setMyOutput(undefined)}>
          Clear console
        </button>
      </div>
      <div className="debugger-view">
        {myOutput?.map(line => line.join(', ')).join('\n')}
      </div>
    </div>
  );
});
