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
        <div key={i}>
          <i
            className={`fa-regular fa-2xl ${i}`}
            onClick={() => alert('not implemented')}
            style={{cursor: 'pointer'}}
          />
        </div>
      ))}
    </div>
  );
};
