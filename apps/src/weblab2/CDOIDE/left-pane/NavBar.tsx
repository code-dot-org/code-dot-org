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
  console.log(leftNav);
  return (
    <div className="nav-bar">
      {leftNav.map(nav => (
        <img
          key={nav.icon}
          alt={nav.icon}
          src={`/cdo-codemirror-editor-poc/${nav.icon}`}
          onClick={() => setActivePane(nav.component)}
          style={{
            cursor: 'pointer',
            backgroundColor: nav.component === activePane ? '#666' : '',
          }}
        />
      ))}
    </div>
  );
};
