import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {Editor} from '@codebridge/Editor';
import {FileTabs} from '@codebridge/FileTabs';
import React from 'react';

import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';

import HeaderButtons from './HeaderButtons';

import moduleStyles from './workspace.module.scss';
const Workspace = () => {
  const {config} = useCodebridgeContext();
  return (
    <PanelContainer
      id="editor-workspace"
      headerContent={'Workspace'}
      rightHeaderContent={<HeaderButtons />}
      className={moduleStyles.workspace}
    >
      <FileTabs />
      <Editor
        langMapping={config.languageMapping}
        editableFileTypes={config.editableFileTypes}
      />
    </PanelContainer>
  );
};
export default Workspace;
