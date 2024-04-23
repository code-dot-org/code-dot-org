import {useCDOIDEContext} from '@cdoide/cdoIDEContext';
import React, {useState} from 'react';

import './styles/sideBar.css';

/* type NavBarProps = {
  setActivePane: (newActivePane: string) => void;
  activePane: string;
}; */

export const SideBar = React.memo(() => {
  const {config} = useCDOIDEContext();
  const [activePane, setActivePane] = useState<string>(
    config.activeLeftNav || config.leftNav[0].component
  );

  const {
    config: {leftNav},
  } = useCDOIDEContext();
  if (!leftNav || !leftNav.length) {
    return null;
  }
  return (
    <div className="side-bar">
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
