import classNames from 'classnames';
import React, {useState} from 'react';

import {useTwoPanelLayout} from '@cdo/apps/lab2/hooks/useTwoPanelLayout';
import {getAppOptionsIsBuildingQuizQuestions} from '@cdo/apps/lab2/projects/utils';
import {LabProps} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import useQuizAttemptView from './attempt/useQuizAttemptView';
import useQuizBuilderView from './builder/useQuizBuilderView';

import styles from './quiz-view.module.scss';

const RESOURCE_PANEL_MIN_WIDTH = 350;

// Shared shell for both quiz modes - build and attempt.
const QuizView: React.FunctionComponent<LabProps> = props => {
  const isBuilderMode = !!getAppOptionsIsBuildingQuizQuestions();
  // isBuilderMode comes from a static script tag, not state, so it can't
  // change across renders of a mounted Quiz - call both to keep the hooks
  // unconditional, and use whichever one applies.
  const builderView = useQuizBuilderView(props);
  const attemptView = useQuizAttemptView(props);
  const {resourcePanelProps, workspaceContent} = isBuilderMode
    ? builderView
    : attemptView;

  const [hasResourcePanelTabs, setHasResourcePanelTabs] = useState(false);
  const isStandaloneCollapsed = useAppSelector(
    state => state.lab2View.isStandaloneCollapsed
  );
  const isResourcePanelExpanded =
    hasResourcePanelTabs && !isStandaloneCollapsed;

  const {containerRef, sidebarWidth, sidebarSeparatorProps, isSidebarResizing} =
    useTwoPanelLayout({
      sidebarMinWidth: RESOURCE_PANEL_MIN_WIDTH,
      isSidebarExpanded: isResourcePanelExpanded,
      appName: 'quiz',
    });

  return (
    <div className={styles.quiz} ref={containerRef}>
      <div
        className={classNames(
          styles.resourcePanel,
          !isResourcePanelExpanded && styles.resourcePanelCollapsed
        )}
        style={isResourcePanelExpanded ? {width: sidebarWidth} : undefined}
      >
        <ResourcePanel
          levelProperties={props.levelProperties}
          isRunning={false}
          hasRun={false}
          hasEdited={false}
          hideAllNavigation
          onHasTabsChange={setHasResourcePanelTabs}
          {...resourcePanelProps}
        />
      </div>
      {isResourcePanelExpanded ? (
        <ResizeBar
          isVertical
          isDragging={isSidebarResizing}
          separatorProps={sidebarSeparatorProps}
        />
      ) : (
        <div className={styles.divider} />
      )}
      <div className={styles.content}>{workspaceContent}</div>
    </div>
  );
};

export default QuizView;
