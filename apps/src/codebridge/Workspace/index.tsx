import React from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import {useCodebridgeContext} from '../codebridgeContext';
import {Editor} from '../Editor';
import {FileTabs} from '../FileTabs';

import HeaderButtons from './HeaderButtons';

const Workspace = () => {
  const {config} = useCodebridgeContext();
  return (
    <PanelContainer
      id="editor-workspace"
      headerContent={'Workspace'}
      rightHeaderContent={<HeaderButtons />}
    >
      <div>
        <FileTabs />
        <Editor
          langMapping={config.languageMapping}
          editableFileTypes={config.allowedLanguages}
        />
      </div>
    </PanelContainer>
  );
};
export default Workspace;
