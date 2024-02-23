import React, {useState} from 'react';

import './styles/left-pane.css';

import {useCDOIDEContext} from '../CDOIDEContext';
import {NavBar} from './NavBar';
import {SideBar} from './SideBar';
import {Instructions, Files, Search} from './nav-bar-components';

const dispatch: Record<string, React.FunctionComponent> = {
  Instructions,
  Files,
  Search,
};

export const LeftPane = () => {
  const {config} = useCDOIDEContext();

  const [activePane, setActivePane] = useState<string>(
    config.activeLeftNav || config.leftNav[0].component
  );

  const Component = dispatch[activePane];

  return (
    <div
      className="left-pane-outer"
      style={{gridTemplateColumns: config.showSideBar ? '1fr 9fr' : '1fr'}}
    >
      {config.showSideBar && <SideBar />}
      <div className="left-pane-inner">
        <div className="left-nav">
          <NavBar setActivePane={setActivePane} activePane={activePane} />
        </div>
        <div className="left-main">
          <Component />
        </div>
      </div>
    </div>
  );
};
