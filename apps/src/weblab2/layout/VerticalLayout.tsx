import SegmentedButtons, {
  SegmentedButtonsProps,
} from '@code-dot-org/component-library/segmentedButtons';
import {OverlineTwoText} from '@code-dot-org/component-library/typography';
import {InfoPanel} from '@codebridge/InfoPanel/InfoPanel';
import {LayoutProps} from '@codebridge/types';
import HeaderButtons from '@codebridge/Workspace/HeaderButtons';
import Workspace from '@codebridge/Workspace/Workspace';
import classNames from 'classnames';
import React, {useEffect} from 'react';

import {HTMLPreview} from '@cdo/apps/codebridge/FilePreview/HTMLPreview';
import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import weblab2I18n from '@cdo/apps/weblab2/locale';

import {setViewMode} from '../redux';
import {ViewMode} from '../types';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';

const MIN_INFO_PANEL_WIDTH = 150;
const INITIAL_INFO_PANEL_WIDTH = 300;
const INITIAL_INFO_PANEL_WIDTH_WIDGET = 500;
const MIN_EDITOR_WIDTH = 300;
const MIN_PREVIEW_WIDTH = 200;
const INITIAL_PREVIEW_WIDTH = 600;
const INITIAL_PREVIEW_WIDTH_WIDGET = 900;

const VerticalLayout: React.FunctionComponent<LayoutProps> = ({
  isProjectLevel,
  isWidgetView,
}) => {
  const viewMode = useAppSelector(state => state.weblab2.viewMode);
  const dispatch = useAppDispatch();

  const infoPanelInitialWidth = isProjectLevel
    ? 0
    : isWidgetView
    ? INITIAL_INFO_PANEL_WIDTH_WIDGET
    : INITIAL_INFO_PANEL_WIDTH;

  const editorMinWidth = isWidgetView ? 0 : MIN_EDITOR_WIDTH;
  const previewInitialWidth = isWidgetView
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
      minWidth: isProjectLevel ? 0 : MIN_INFO_PANEL_WIDTH,
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
        value: ViewMode.CODE,
        iconLeft: {
          iconName: 'code',
          iconStyle: 'solid',
        },
      },
      {
        label: weblab2I18n.preview(),
        value: ViewMode.PREVIEW,
        iconLeft: {
          iconName: 'eye',
          iconStyle: 'solid',
        },
      },
      {
        label: weblab2I18n.splitView(),
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
  };

  useEffect(() => {
    setRightPanelSize(
      isWidgetView ? INITIAL_PREVIEW_WIDTH_WIDGET : INITIAL_PREVIEW_WIDTH
    );
  }, [setRightPanelSize, isWidgetView]);

  useEffect(() => {
    if (!isProjectLevel) {
      setLeftPanelSize(
        isWidgetView
          ? INITIAL_INFO_PANEL_WIDTH_WIDGET
          : INITIAL_INFO_PANEL_WIDTH
      );
    } else {
      setLeftPanelSize(0);
    }
  }, [isProjectLevel, setLeftPanelSize, isWidgetView]);

  return (
    <div
      className={
        isProjectLevel
          ? moduleStyles.containerWithFooter
          : moduleStyles.defaultContainer
      }
    >
      <div className={moduleStyles.layoutContainer}>
        {!isProjectLevel && (
          <>
            <InfoPanel
              style={{width: leftPanelWidth}}
              className={classNames(moduleStyles.flexShrink0, panelClassName)}
            />
            <ResizeBar
              isVertical={true}
              separatorProps={leftPanelSeparatorProps}
              isDragging={leftPanelDragging}
            />
          </>
        )}
        <div
          className={classNames(
            moduleStyles.flexColumn,
            moduleStyles.shrinkAndGrow
          )}
        >
          <div className={moduleStyles.headerContainer}>
            {isWidgetView ? (
              <span />
            ) : (
              <SegmentedButtons {...viewModeButtonsProps} />
            )}
            <OverlineTwoText noMargin>
              {weblab2I18n.workspace()}
            </OverlineTwoText>
            <HeaderButtons />
          </div>
          <div className={moduleStyles.editorAndPreviewContainer}>
            {!isWidgetView && viewMode !== ViewMode.PREVIEW && (
              <>
                <Workspace
                  style={{width: middlePanelWidth}}
                  className={classNames(
                    moduleStyles.shrinkAndGrow,
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
                  moduleStyles.shrinkAndGrow,
                  panelClassName
                )}
              >
                <HTMLPreview />
              </div>
            )}
          </div>
        </div>
      </div>
      {isProjectLevel && <div className={moduleStyles.footerArea} />}
    </div>
  );
};

export default VerticalLayout;
