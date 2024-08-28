import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import React, {useState} from 'react';

import './styles/sideBar.css';

export const SideBar = React.memo(() => {
  const {config} = useCodebridgeContext();
  const [activePane, setActivePane] = useState<string>(
    config.activeLeftNav || config.leftNav[0].component
  );

  const {
    config: {leftNav},
  } = useCodebridgeContext();
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
