import React from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import {FileTabs} from '../FileTabs';
import {EditorComponent} from '../types';

import HeaderButtons from './HeaderButtons';

interface WorkspaceProps {
  EditorComponent: EditorComponent | React.ExoticComponent;
}

const Workspace: React.FunctionComponent<WorkspaceProps> = ({
  EditorComponent,
}) => {
  return (
    <PanelContainer
      id="editor-workspace"
      headerContent={'Workspace'}
      rightHeaderContent={<HeaderButtons />}
    >
      <div>
        <FileTabs />
        <EditorComponent />
      </div>
    </PanelContainer>
  );
};

export default Workspace;
