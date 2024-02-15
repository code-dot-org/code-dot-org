import React from 'react';
import {useCDOIDEContext} from '../CDOIDEContext';

import './styles/side-bar.css';

export const SideBar = () => {
  const {
    config: {sideBar},
  } = useCDOIDEContext();
  return (
    <div className="left-side-bar">
      {sideBar.map(i => (
        <img
          key={i}
          alt={i}
          src={`/cdo-codemirror-editor-poc/${i}`}
          onClick={() => alert('not implemented')}
          style={{cursor: 'pointer'}}
        />
      ))}
    </div>
  );
};
