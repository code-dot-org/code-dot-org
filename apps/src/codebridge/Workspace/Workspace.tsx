import Alert from '@code-dot-org/component-library/alert';
import {BodyFourText} from '@code-dot-org/component-library/typography';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import ToggleFileBrowserButton from '@codebridge/components/ToggleFileBrowserButton';
import {Editor} from '@codebridge/Editor/Editor';
import {FileBrowser} from '@codebridge/FileBrowser/FileBrowser';
import {FileBrowserHeaderPopUpButton} from '@codebridge/FileBrowser/FileBrowserHeaderPopUpButton';
import {FileTabs} from '@codebridge/FileTabs/FileTabs';
import classnames from 'classnames';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {START_SOURCES, WARNING_BANNER_MESSAGES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {
  isReadOnlyWorkspace,
  isProjectTemplateLevel,
} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import WorkspaceHeader from '@cdo/apps/lab2/views/components/WorkspaceHeader';
import currentLocale from '@cdo/apps/util/currentLocale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import HeaderButtons from './HeaderButtons';

import moduleStyles from './workspace.module.scss';

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
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);
  const containerRef = useRef<HTMLDivElement>(null);
  const projectTemplateLevel = useAppSelector(isProjectTemplateLevel);

  const showLockedFilesBanner = useAppSelector(
    state => state.codebridgeWorkspace.showLockedFilesBanner
  );
  const projectTooLarge = useAppSelector(
    state => state.lab2Project.projectTooLarge
  );
  const showFileBrowser = useAppSelector(
    state => state.codebridgeWorkspace.showFileBrowser
  );
  const viewingOldVersion = useAppSelector(
    state => state.lab2Project.viewingOldVersion
  );
  const versionDetails = useAppSelector(
    state => state.lab2Project.versionDetails
  );
  const isTeacherOfProjectOwner = useAppSelector(
    state => state.lab.isTeacherOfProjectOwner
  );

  // Persist the teacher viewing state once detected to ensure
  // the alert remains visible even if the component refreshes
  // when another student profile is selected.
  const [isTeacherViewingStudent, setIsTeacherViewingStudent] = useState(false);

  useEffect(() => {
    // Update the state to match current Redux values
    // This ensures the alert shows when conditions are true
    // and persists even if Redux state temporarily becomes undefined during refresh
    if (isTeacherOfProjectOwner && isReadOnly) {
      setIsTeacherViewingStudent(true);
    } else if (!isTeacherOfProjectOwner && !isReadOnly) {
      setIsTeacherViewingStudent(false);
    }
  }, [isTeacherOfProjectOwner, isReadOnly]);

  const locale = currentLocale();
  const versionDate = useMemo(() => {
    if (!versionDetails?.lastModified) {
      return '';
    }
    const dateFormatter = new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
    // The Regex here removes the space before AM/PM to match mocks and make more compact.
    return dateFormatter
      .format(new Date(versionDetails.lastModified))
      .replace(/\s(AM|PM)/gi, '$1');
  }, [versionDetails, locale]);

  const versionBannerText = versionDate ? (
    <>
      You're viewing a previous version of this project from{' '}
      <strong>{versionDate}</strong>.
    </>
  ) : (
    "You're viewing the initial version of this project."
  );

  return (
    <div style={style} className={className}>
      <PanelContainer
        id="editor-workspace"
        hideHeaders={hideHeaders}
        headerContent={<WorkspaceHeader />}
        rightHeaderContent={<HeaderButtons />}
        className={moduleStyles.workspace}
        headerClassName={moduleStyles.workspaceHeader}
      >
        {isTeacherViewingStudent && (
          <Alert
            className={moduleStyles.workspaceAlertBanner}
            text="You are viewing a student project in read only mode."
            type="info"
            size="xs"
          />
        )}
        {viewingOldVersion && (
          <Alert
            className={moduleStyles.workspaceAlertBanner}
            text={versionBannerText}
            type="warning"
            size="xs"
          />
        )}
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
              <BodyFourText
                className={moduleStyles.fileBrowserHeaderText}
                noMargin
              >
                {codebridgeI18n.filesHeader()}
              </BodyFourText>
            )}
            <div className={moduleStyles.fileBrowserHeaderButtons}>
              {showFileBrowser && !isReadOnly && (
                <FileBrowserHeaderPopUpButton />
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
            {projectTooLarge && (
              <Alert text={codebridgeI18n.projectTooLarge()} type={'danger'} />
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
