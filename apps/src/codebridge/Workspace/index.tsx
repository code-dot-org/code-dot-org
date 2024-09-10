import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {Editor} from '@codebridge/Editor';
import {FileTabs} from '@codebridge/FileTabs';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import {START_SOURCES, WARNING_BANNER_MESSAGES} from '@cdo/apps/lab2/constants';
import {isProjectTemplateLevel} from '@cdo/apps/lab2/lab2Redux';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {setRestoredOldVersion} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import ProjectTemplateWorkspaceIcon from '@cdo/apps/templates/ProjectTemplateWorkspaceIcon';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import HeaderButtons from './HeaderButtons';

import moduleStyles from './workspace.module.scss';

const Workspace = () => {
  const {config} = useCodebridgeContext();
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const projectTemplateLevel = useAppSelector(isProjectTemplateLevel);
  const viewingOldVersion = useAppSelector(
    state => state.lab2Project.viewingOldVersion
  );
  const hasRestoredOldVersion = useAppSelector(
    state => state.lab2Project.restoredOldVersion
  );
  const dispatch = useAppDispatch();

  const headerContent = (
    <>
      {commonI18n.workspaceHeaderShort()}{' '}
      {projectTemplateLevel && <ProjectTemplateWorkspaceIcon />}
    </>
  );

  const closeRestoredVersionBanner = () => {
    dispatch(setRestoredOldVersion(false));
  };

  return (
    <PanelContainer
      id="editor-workspace"
      headerContent={headerContent}
      rightHeaderContent={<HeaderButtons />}
      className={moduleStyles.workspace}
    >
      <FileTabs />
      {isStartMode && (
        <div
          id="startSourcesWarningBanner"
          className={moduleStyles.warningBanner}
        >
          {projectTemplateLevel
            ? WARNING_BANNER_MESSAGES.TEMPLATE
            : WARNING_BANNER_MESSAGES.STANDARD}
        </div>
      )}
      <Editor
        langMapping={config.languageMapping}
        editableFileTypes={config.editableFileTypes}
      />
      {viewingOldVersion && (
        <Alert text={codebridgeI18n.viewingOldVersion()} type={'warning'} />
      )}
      {hasRestoredOldVersion && (
        <Alert
          text={codebridgeI18n.restoredOldVersion()}
          type={'success'}
          onClose={closeRestoredVersionBanner}
        />
      )}
    </PanelContainer>
  );
};
export default Workspace;
