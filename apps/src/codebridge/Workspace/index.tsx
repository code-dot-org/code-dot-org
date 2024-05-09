import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {Editor} from '@codebridge/Editor';
import {FileTabs} from '@codebridge/FileTabs';
import React from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

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
