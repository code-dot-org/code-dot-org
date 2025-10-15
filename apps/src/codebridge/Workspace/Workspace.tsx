import Alert from '@code-dot-org/component-library/alert';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import ToggleFileBrowserButton from '@codebridge/components/ToggleFileBrowserButton';
import {Editor} from '@codebridge/Editor/Editor';
import {FileBrowser} from '@codebridge/FileBrowser/FileBrowser';
import {FileTabs} from '@codebridge/FileTabs/FileTabs';
import classnames from 'classnames';
import React, {useEffect, useRef} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {START_SOURCES, WARNING_BANNER_MESSAGES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {setRestoredOldVersion} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {isProjectTemplateLevel} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import WorkspaceHeader from '@cdo/apps/lab2/views/components/WorkspaceHeader';
import i18n from '@cdo/apps/pythonlab/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const projectTemplateLevel = useAppSelector(isProjectTemplateLevel);
  const viewingOldVersion = useAppSelector(
    state => state.lab2Project.viewingOldVersion
  );
  const hasRestoredOldVersion = useAppSelector(
    state => state.lab2Project.restoredOldVersion
  );
  const showLockedFilesBanner = useAppSelector(
    state => state.codebridgeWorkspace.showLockedFilesBanner
  );
  const projectTooLarge = useAppSelector(
    state => state.lab2Project.projectTooLarge
  );
  const showFileBrowser = useAppSelector(
    state => state.codebridgeWorkspace.showFileBrowser
  );
  const dispatch = useAppDispatch();

  const closeRestoredVersionBanner = () => {
    dispatch(setRestoredOldVersion(false));
  };

  // Sets keydown event listener on the editor container to handle Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Move focus back to codemirror-container
        containerRef.current?.focus();
      }
    };
    const observer = new MutationObserver(() => {
      const cmContentDiv = document.querySelector('.cm-content') as HTMLElement;
      if (cmContentDiv) {
        cmContentDiv.addEventListener('keydown', handleKeyDown);
        observer.disconnect(); // Stop observing once the element is found
      }
    });

    observer.observe(document.body, {childList: true, subtree: true});

    return () => observer.disconnect(); // Cleanup observer on unmount
  }, []);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const cmContentDiv = document.querySelector('.cm-content');

    if (cmContentDiv) {
      cmContentDiv.setAttribute('aria-label', i18n.codeEditorEditing());
      cmContentDiv.setAttribute('tabIndex', '-1'); // Ensure focusability

      if (event.key === 'Enter') {
        // Open the .cm-content (focus it)
        (cmContentDiv as HTMLElement).focus();
      }
    }
  };

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
            <ToggleFileBrowserButton />
          </div>
          <FileTabs />
          {showFileBrowser && <FileBrowser />}
          {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
          <div
            className={classnames(moduleStyles.workplaceEditorWrapper, {
              [moduleStyles.withFileBrowser]: showFileBrowser,
            })}
            tabIndex={0}
            onKeyDown={onKeyDown}
            aria-label={i18n.codeEditorDescription()}
            ref={containerRef}
            role="application"
            id="uitest-codebridge-editor"
          >
            {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
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
            {viewingOldVersion && (
              <Alert
                text={codebridgeI18n.viewingOldVersion()}
                type={'warning'}
              />
            )}
            {hasRestoredOldVersion && (
              <Alert
                text={codebridgeI18n.restoredOldVersion()}
                type={'success'}
                onClose={closeRestoredVersionBanner}
              />
            )}
          </div>
        </div>
      </PanelContainer>
    </div>
  );
};
export default Workspace;
