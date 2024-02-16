import React from 'react';
import './styles/nav-bar.css';

import {useCDOIDEContext} from '../CDOIDEContext';

type NavBarProps = {
  setActivePane: (newActivePane: string) => void;
  activePane: string;
};

export const NavBar = ({setActivePane, activePane}: NavBarProps) => {
  const {
    config: {leftNav},
  } = useCDOIDEContext();

  return (
    <div className="nav-bar">
      {leftNav.map(nav => (
        <div key={nav.icon}>
          <i
            className={`fa-regular fa-2xl ${nav.icon}`}
            onClick={() => setActivePane(nav.component)}
            style={{
              cursor: 'pointer',
              backgroundColor: nav.component === activePane ? '#666' : '',
            }}
          />
        </div>
      ))}
    </div>
  );
};
