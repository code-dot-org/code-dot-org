import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {Editor} from '@codebridge/Editor';
import {FileTabs} from '@codebridge/FileTabs';
import React from 'react';

import {isProjectTemplateLevel} from '@cdo/apps/lab2/lab2Redux';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import ProjectTemplateWorkspaceIcon from '@cdo/apps/templates/ProjectTemplateWorkspaceIcon';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import HeaderButtons from './HeaderButtons';

import moduleStyles from './workspace.module.scss';
const Workspace = () => {
  const {config} = useCodebridgeContext();
  const projectTemplateLevel = useAppSelector(isProjectTemplateLevel);

  const headerContent = (
    <>
      {commonI18n.workspaceHeaderShort()}{' '}
      {projectTemplateLevel && <ProjectTemplateWorkspaceIcon />}
    </>
  );

  return (
    <PanelContainer
      id="editor-workspace"
      headerContent={headerContent}
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
