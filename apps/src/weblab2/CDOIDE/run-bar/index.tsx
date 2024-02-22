import React from 'react';
import './styles/run-bar.css';

export const RunBar = () => {
  return (
    <div className="run-bar">
      <div>
        <button type="button" onClick={() => alert('not implemented')}>
          Share
        </button>
      </div>
      <div>
        <button type="button" onClick={() => alert('not implemented')}>
          Run
        </button>
      </div>
      <div>
        <button type="button" onClick={() => alert('not implemented')}>
          Finish
        </button>
      </div>
    </div>
  );
};
