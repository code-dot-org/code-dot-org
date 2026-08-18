import Alert from '@code-dot-org/component-library/alert';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import ToggleFileBrowserButton from '@codebridge/components/ToggleFileBrowserButton';
import {Editor} from '@codebridge/Editor/Editor';
import {FileBrowser} from '@codebridge/FileBrowser/FileBrowser';
import {FileBrowserHeaderPopUpButton} from '@codebridge/FileBrowser/FileBrowserHeaderPopUpButton';
import {FileTabs} from '@codebridge/FileTabs/FileTabs';
import {Typography} from '@mui/material';
import classnames from 'classnames';
import React, {useRef} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {
  START_SOURCES,
  WIDGET2_SOURCES,
  WARNING_BANNER_MESSAGES,
} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {
  isProjectTemplateLevel,
  isPermanentlyReadOnlyWorkspace,
  isTemporarilyReadOnlyWorkspace,
} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import WorkspaceAlerts from '@cdo/apps/lab2/views/alerts/workspaceAlerts';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {WorkspaceHeader} from '@cdo/apps/lab2/views/components/WorkspaceHeader';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import HeaderButtons from './HeaderButtons';

import moduleStyles from './workspace.module.scss';

// The console carries the full reason the environment failed to set up.
const CODE_ENVIRONMENT_ERROR_MESSAGE =
  'We could not set up your environment. See the console for details.';

interface WorkspaceProps {
  className?: string;
  style?: React.CSSProperties;
  isWidgetView?: boolean;
  hideHeaders?: boolean;
}

const Workspace: React.FunctionComponent<WorkspaceProps> = ({
  style,
  className,
  isWidgetView,
  hideHeaders,
}) => {
  const {config} = useCodebridgeContext();

  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const isWidget2SourcesMode = getAppOptionsEditBlocks() === WIDGET2_SOURCES;
  const containerRef = useRef<HTMLDivElement>(null);
  const projectTemplateLevel = useAppSelector(isProjectTemplateLevel);
  const isPermanentlyReadOnly = useAppSelector(isPermanentlyReadOnlyWorkspace);
  const isTemporarilyReadOnly = useAppSelector(isTemporarilyReadOnlyWorkspace);

  const showLockedFilesBanner = useAppSelector(
    state => state.codebridgeWorkspace.showLockedFilesBanner
  );
  const projectTooLarge = useAppSelector(
    state => state.lab2Project.projectTooLarge
  );
  const codeEnvironmentError = useAppSelector(
    state => state.lab2System.codeEnvironmentError
  );
  const showFileBrowser = useAppSelector(
    state => state.codebridgeWorkspace.showFileBrowser
  );

  return (
    <div style={style} className={className}>
      <PanelContainer
        id="editor-workspace"
        hideHeaders={hideHeaders}
        headerContent={<WorkspaceHeader.Content />}
        rightHeaderContent={
          <>
            <WorkspaceHeader.TemplateIcon />
            <HeaderButtons />
          </>
        }
        className={moduleStyles.workspace}
        headerClassName={moduleStyles.workspaceHeader}
      >
        {!hideHeaders && <WorkspaceAlerts inWorkspaceContainer />}
        <div
          className={classnames(moduleStyles.workspaceWorkarea, {
            [moduleStyles.withFileBrowser]: showFileBrowser,
          })}
        >
          <div
            className={classnames(moduleStyles.workspaceToggleButtonContainer, {
              [moduleStyles.withFileBrowser]: showFileBrowser,
            })}
          >
            {showFileBrowser && (
              <Typography
                className={moduleStyles.fileBrowserHeaderText}
                variant="body4"
                component="h2"
              >
                {codebridgeI18n.filesHeader()}
              </Typography>
            )}
            <div className={moduleStyles.fileBrowserHeaderButtons}>
              {showFileBrowser && !isPermanentlyReadOnly && (
                <FileBrowserHeaderPopUpButton
                  disabled={isTemporarilyReadOnly}
                />
              )}
              <ToggleFileBrowserButton />
            </div>
          </div>
          <FileTabs />
          {showFileBrowser && <FileBrowser />}
          <div
            className={classnames(moduleStyles.workplaceEditorWrapper, {
              [moduleStyles.withFileBrowser]: showFileBrowser,
            })}
            ref={containerRef}
          >
            <Editor
              langMapping={config.languageMapping}
              editableFileTypes={config.editableFileTypes}
            />
          </div>
          <div className={moduleStyles.workspaceWarningArea}>
            {showLockedFilesBanner && (
              <Alert
                text={WARNING_BANNER_MESSAGES.LOCK_FILES}
                type={'info'}
                className={moduleStyles.lockedFilesBanner}
              />
            )}
            {isStartMode && (
              <Alert
                text={
                  projectTemplateLevel
                    ? WARNING_BANNER_MESSAGES.TEMPLATE
                    : WARNING_BANNER_MESSAGES.STANDARD
                }
                type={'warning'}
              />
            )}
            {isWidget2SourcesMode && (
              <Alert
                text={WARNING_BANNER_MESSAGES.EDITING_WIDGET2.replace(
                  '{widgetId}',
                  queryParams('widget2') as string
                )}
                type={'warning'}
              />
            )}

            {projectTooLarge && (
              <Alert text={codebridgeI18n.projectTooLarge()} type={'danger'} />
            )}
            {codeEnvironmentError && (
              <Alert text={CODE_ENVIRONMENT_ERROR_MESSAGE} type={'danger'} />
            )}
            {isWidgetView && (
              <Alert
                text={codebridgeI18n.viewingWidgetView()}
                type={'warning'}
              />
            )}
          </div>
        </div>
      </PanelContainer>
    </div>
  );
};
export default Workspace;
