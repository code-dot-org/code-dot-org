import Alert from '@code-dot-org/component-library/alert';
import SegmentedButtons, {
  SegmentedButtonsProps,
} from '@code-dot-org/component-library/segmentedButtons';
import {InfoPanel} from '@codebridge/InfoPanel/InfoPanel';
import {LayoutProps} from '@codebridge/types';
import HeaderButtons from '@codebridge/Workspace/HeaderButtons';
import Workspace from '@codebridge/Workspace/Workspace';
import classNames from 'classnames';
import React, {useEffect} from 'react';

import {HTMLPreview} from '@cdo/apps/codebridge/FilePreview/HTMLPreview';
import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import WorkspaceHeader from '@cdo/apps/lab2/views/components/WorkspaceHeader';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import weblab2I18n from '@cdo/apps/weblab2/locale';

import {ViewMode} from '../types';
import {setViewMode} from '../weblab2Redux';

import lab2Styles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';
import weblab2Styles from '@cdo/apps/weblab2/layout/vertical-layout.module.scss';

const MIN_INFO_PANEL_WIDTH = 250;
const INITIAL_INFO_PANEL_WIDTH = 400;
const INITIAL_INFO_PANEL_WIDTH_WIDGET = 500;
const MIN_EDITOR_WIDTH = 300;
const MIN_PREVIEW_WIDTH = 320;
const INITIAL_PREVIEW_WIDTH = 400;
const INITIAL_PREVIEW_WIDTH_WIDGET = 900;
const INITIAL_INFO_PANEL_WIDTH_COLLAPSED = 55;
const INITIAL_PREVIEW_WIDTH_COLLAPSED = 650;

const VerticalLayout: React.FunctionComponent<LayoutProps> = ({
  isWidgetView,
}) => {
  const viewMode = useAppSelector(state => state.weblab2.viewMode);
  const isStandaloneCollapsed = useAppSelector(
    state => state.lab2View.isStandaloneCollapsed
  );
  const isAiTutorVersion = useAppSelector(
    state => state.lab2Project.viewingAiTutorVersion
  );

  const dispatch = useAppDispatch();

  const infoPanelInitialWidth = isStandaloneCollapsed
    ? INITIAL_INFO_PANEL_WIDTH_COLLAPSED
    : isWidgetView
    ? INITIAL_INFO_PANEL_WIDTH_WIDGET
    : INITIAL_INFO_PANEL_WIDTH;

  const editorMinWidth = isWidgetView ? 0 : MIN_EDITOR_WIDTH;
  const previewInitialWidth = isStandaloneCollapsed
    ? INITIAL_PREVIEW_WIDTH_COLLAPSED
    : isWidgetView
    ? INITIAL_PREVIEW_WIDTH_WIDGET
    : INITIAL_PREVIEW_WIDTH;

  const {
    leftPanelWidth,
    middlePanelWidth,
    rightPanelWidth,
    leftPanelSeparatorProps,
    leftPanelDragging,
    setRightPanelSize,
    setLeftPanelSize,
    rightPanelSeparatorProps,
    rightPanelDragging,
    panelClassName,
  } = useVerticalLayout({
    leftPanel: {
      minWidth: MIN_INFO_PANEL_WIDTH,
      initialWidth: infoPanelInitialWidth,
      name: 'instructions',
    },
    middlePanel: {
      minWidth: editorMinWidth,
      name: 'editor',
    },
    rightPanel: {
      minWidth: MIN_PREVIEW_WIDTH,
      initialWidth: previewInitialWidth,
      name: 'preview',
    },
    appName: 'weblab2',
  });

  const viewModeButtonsProps: SegmentedButtonsProps = {
    buttons: [
      {
        label: weblab2I18n.code(),
        ariaLabel: 'View code editor only',
        value: ViewMode.CODE,
        iconLeft: {
          iconName: 'code',
          iconStyle: 'solid',
        },
      },
      {
        label: weblab2I18n.preview(),
        ariaLabel: 'View web preview only',
        value: ViewMode.PREVIEW,
        iconLeft: {
          iconName: 'eye',
          iconStyle: 'solid',
        },
      },
      {
        label: weblab2I18n.splitView(),
        ariaLabel: 'View code and web preview side by side',
        value: ViewMode.SPLIT,
        iconLeft: {
          iconName: 'table-columns',
          iconStyle: 'solid',
        },
      },
    ],
    size: 'xs',
    selectedButtonValue: viewMode,
    onChange: viewMode => dispatch(setViewMode(viewMode as ViewMode)),
    className: weblab2Styles.truncateButtonText,
  };

  useEffect(() => {
    setRightPanelSize(
      isStandaloneCollapsed
        ? INITIAL_PREVIEW_WIDTH_COLLAPSED
        : isWidgetView
        ? INITIAL_PREVIEW_WIDTH_WIDGET
        : INITIAL_PREVIEW_WIDTH
    );
  }, [setRightPanelSize, isWidgetView, isStandaloneCollapsed]);

  useEffect(() => {
    setLeftPanelSize(
      isStandaloneCollapsed
        ? INITIAL_INFO_PANEL_WIDTH_COLLAPSED
        : isWidgetView
        ? INITIAL_INFO_PANEL_WIDTH_WIDGET
        : INITIAL_INFO_PANEL_WIDTH
    );
  }, [setLeftPanelSize, isWidgetView, isStandaloneCollapsed]);

  return (
    <div className={lab2Styles.defaultContainer}>
      <div className={lab2Styles.layoutContainer}>
        <InfoPanel
          style={{width: leftPanelWidth}}
          className={classNames(lab2Styles.flexShrink0, panelClassName)}
        />
        <ResizeBar
          isVertical={true}
          separatorProps={leftPanelSeparatorProps}
          isDragging={leftPanelDragging}
        />

        <div
          className={classNames(
            lab2Styles.flexColumn,
            lab2Styles.shrinkAndGrow
          )}
        >
          <PanelContainer
            id="workspace"
            className={weblab2Styles.headerContainer}
            headerContent={<WorkspaceHeader />}
            leftHeaderContent={
              isWidgetView ? undefined : (
                <SegmentedButtons {...viewModeButtonsProps} />
              )
            }
            rightHeaderContent={<HeaderButtons />}
          />
          <div className={weblab2Styles.workspaceContainer}>
            {isAiTutorVersion && (
              <div className={weblab2Styles.aiTutorVersionContainer}>
                <Alert
                  text={
                    'AI Tutor generated changes to your project. Accept to apply changes or reject to discard.'
                  }
                  type={'aqua'}
                />
              </div>
            )}
            <div className={weblab2Styles.editorAndPreviewContainer}>
              {!isWidgetView && viewMode !== ViewMode.PREVIEW && (
                <>
                  <Workspace
                    style={{width: middlePanelWidth}}
                    className={classNames(
                      lab2Styles.shrinkAndGrow,
                      panelClassName
                    )}
                    hideHeaders
                  />
                  <ResizeBar
                    isVertical={true}
                    separatorProps={rightPanelSeparatorProps}
                    isDragging={rightPanelDragging}
                  />
                </>
              )}
              {viewMode !== ViewMode.CODE && (
                <div
                  style={{width: rightPanelWidth}}
                  className={classNames(
                    lab2Styles.shrinkAndGrow,
                    panelClassName
                  )}
                >
                  <HTMLPreview />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalLayout;
