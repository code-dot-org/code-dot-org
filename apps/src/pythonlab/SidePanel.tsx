import React from 'react';
import moduleStyles from './side-panel.module.scss';

const SidePanel: React.FunctionComponent = () => {
  return (
    <div className={moduleStyles.sidePanel}>
      <div>A side panel!</div>
    </div>
  );
};

export default SidePanel;
