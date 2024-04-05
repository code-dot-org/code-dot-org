import React from 'react';
import './styles/runBar.css';

const defaultCallback = () => window.alert('Not implemented');

export const RunBar = ({run = defaultCallback, finish = defaultCallback}) => {
  return (
    <div className="run-bar">
      <div>
        <button type="button" onClick={run}>
          Run
        </button>
      </div>
      <div>
        <button type="button" onClick={finish}>
          Finish
        </button>
      </div>
    </div>
  );
};
