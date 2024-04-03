import {useCDOIDEContext} from '@cdoide/cdoIDEContext';
import React from 'react';

import './styles/sideBar.css';

const defaultCallback = () => window.alert('Not implemented');

export const SideBar = React.memo(() => {
  const {
    config: {sideBar},
  } = useCDOIDEContext();
  return (
    <div className="left-side-bar">
      {sideBar.map(i => (
        <div
          key={i.icon}
          onClick={i.action || defaultCallback}
          style={{cursor: 'pointer'}}
        >
          <i className={`fa-regular fa-2xl ${i.icon}`} />
          {i.label}
        </div>
      ))}
    </div>
  );
});
