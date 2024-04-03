import {useCDOIDEContext} from '@cdoide/cdoIDEContext';
import React from 'react';

import './styles/navBar.css';

type NavBarProps = {
  setActivePane: (newActivePane: string) => void;
  activePane: string;
};

export const NavBar = React.memo(({setActivePane, activePane}: NavBarProps) => {
  const {
    config: {leftNav},
  } = useCDOIDEContext();
  if (!leftNav || !leftNav.length) {
    return null;
  }
  return (
    <div className="nav-bar">
      {leftNav.map(nav => (
        <div
          key={nav.icon}
          onClick={() => setActivePane(nav.component)}
          style={{
            cursor: 'pointer',
            color: nav.component === activePane ? '#0093a4' : undefined,
          }}
        >
          <i className={`fa-regular fa-2xl ${nav.icon}`} />
        </div>
      ))}
    </div>
  );
});
