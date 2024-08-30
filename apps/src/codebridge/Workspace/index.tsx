import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {Editor} from '@codebridge/Editor';
import {FileBrowser} from '@codebridge/FileBrowser';
import {FileTabs} from '@codebridge/FileTabs';
import React from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {isProjectTemplateLevel} from '@cdo/apps/lab2/lab2Redux';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import ProjectTemplateWorkspaceIcon from '@cdo/apps/templates/ProjectTemplateWorkspaceIcon';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import HeaderButtons from './HeaderButtons';

import moduleStyles from './workspace.module.scss';
const Workspace = () => {
  const {config} = useCodebridgeContext();
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
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
      <div>
        <FileTabs />
        {isStartMode && (
          <div
            id="startSourcesWarningBanner"
            className={moduleStyles.warningBanner}
          >
            {projectTemplateLevel
              ? 'WARNING: You are editing start sources for a level with a template. Start sources should be defined on the template.'
              : 'You are editing start sources.'}
          </div>
        )}
        <div
          className={moduleStyles.workspaceWorkarea}
          style={{
            gridTemplateColumns: config.showFileBrowser ? '200px auto' : '100%',
          }}
        >
          {config.showFileBrowser && <FileBrowser />}
          <Editor
            langMapping={config.languageMapping}
            editableFileTypes={config.editableFileTypes}
          />
        </div>
      </div>
    </PanelContainer>
  );
};
export default Workspace;
