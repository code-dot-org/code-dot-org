// Pythonlab view
import React from 'react';
import PythonEditor from './PythonEditor';
import moduleStyles from './pythonlab-view.module.scss';
import SidePanel from './SidePanel';

const PythonlabView: React.FunctionComponent = () => {
  return (
    <div className={moduleStyles.pythonlab}>
      <SidePanel />
      <PythonEditor />
    </div>
  );
};

export default PythonlabView;
