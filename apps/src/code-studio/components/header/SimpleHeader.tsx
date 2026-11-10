// The level header's middle for a unit whose simple_progress property is
// set: the progress widget with the lesson's name as text, a bubble per level
// that fills in as the level is done, the project's save status, and a slot
// the lab fills with a button of its own. The bubbles are pictures, not links:
// the unit is walked in order, with no going back or ahead.

import ProgressWidget, {
  ProgressBubble,
  ProgressBubbleStatus,
  ProgressWidgetSaveProps,
  ProgressWidgetSaveStatus,
} from '@code-dot-org/component-library/progressWidget';
import {isEqual} from 'lodash';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {getCurrentLevels} from '@cdo/apps/code-studio/progressReduxSelectors';
import {ProjectState} from '@cdo/apps/code-studio/projectRedux';
import {LevelWithProgress} from '@cdo/apps/types/progressTypes';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import ProjectInfo from './ProjectInfo';
import remeasureOnFontsReady from './remeasureOnFontsReady';
import {SAVE_STATUS_ICONS} from './saveStatusIcons';

import styles from './simple-header.module.scss';

/** The lab portals its header button, if it has one, into the element
    with this id. */
export const HEADER_ACTION_ID = 'simple_header_action';

// The header page's store has no typed root state; these are the slices
// this component reads.
interface HeaderState {
  isRtl: boolean;
  project: ProjectState;
}

const bubbleStatusByLevelStatus: Record<string, ProgressBubbleStatus> = {
  [LevelStatus.attempted]: 'inProgress',
  [LevelStatus.passed]: 'passed',
  [LevelStatus.perfect]: 'completed',
  [LevelStatus.free_play_complete]: 'completed',
  [LevelStatus.completed_assessment]: 'completed',
  [LevelStatus.submitted]: 'completed',
};

const statusLabel: Record<ProgressBubbleStatus, string> = {
  notStarted: 'not started',
  inProgress: 'in progress',
  passed: 'passed',
  completed: 'completed',
  keepWorking: 'keep working',
  error: 'rejected',
};

// 'default' is a project not saved yet: nothing to report.
const widgetSaveStatus: Record<
  ProjectState['projectUpdatedStatus'],
  ProgressWidgetSaveStatus
> = {
  default: 'none',
  saving: 'saving',
  saved: 'saved',
  error: 'failed',
};

interface SimpleHeaderProps {
  lessonName?: string;
}

const SimpleHeader: React.FunctionComponent<SimpleHeaderProps> = ({
  lessonName,
}) => {
  const isRtl = useSelector((state: HeaderState) => state.isRtl);
  const {showProjectUpdatedAt, projectUpdatedStatus} = useSelector(
    (state: HeaderState) => state.project,
  );
  // getCurrentLevels builds a new array per call, and none until the lesson
  // is known; isEqual skips needless re-renders.
  const levels = (useSelector(getCurrentLevels, isEqual) ??
    []) as LevelWithProgress[];

  // Eyes UI tests key on these to tell a page with this header from one with
  // a server-rendered header, and to wait for the font swap.
  useEffect(() => {
    document.documentElement.dataset.headerPresent = 'true';
    return remeasureOnFontsReady(() => {
      window.requestAnimationFrame(() => {
        document.documentElement.dataset.headerFontsRelaidOut = 'true';
      });
    });
  }, []);

  const saveStatus = showProjectUpdatedAt
    ? widgetSaveStatus[projectUpdatedStatus]
    : 'none';
  const saveProps: ProgressWidgetSaveProps =
    saveStatus === 'none'
      ? {saveStatus}
      : {
          saveStatus,
          saveStatusLabel: SAVE_STATUS_ICONS[projectUpdatedStatus].title,
        };

  return (
    <div id="header_middle_content" className={styles.row}>
      <div id="project_info_container" className={styles.projectInfo}>
        <ProjectInfo isRtl={isRtl} />
      </div>
      <div className={styles.widget} data-theme="Light">
        <ProgressWidget
          lessonLabel={lessonName ?? ''}
          bubblesLabel="Lesson progress"
          actionSlotId={HEADER_ACTION_ID}
          {...saveProps}
        >
          {levels.map(level => {
            const active =
              !!level.isCurrentLevel ||
              !!level.sublevels?.some(sublevel => sublevel.isCurrentLevel);
            const status =
              bubbleStatusByLevelStatus[level.status] ?? 'notStarted';
            return (
              <ProgressBubble
                key={level.id}
                status={status}
                isActive={active}
                levelNumber={level.levelNumber}
                ariaLabel={`Level ${level.levelNumber ?? ''}, ${
                  statusLabel[status]
                }`}
              />
            );
          })}
        </ProgressWidget>
      </div>
    </div>
  );
};

export default SimpleHeader;
