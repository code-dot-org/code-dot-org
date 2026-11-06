// The level header's middle for a unit whose simple_progress property is
// set: one bar with the lesson's name, a bubble per level that fills in as
// the level is done, the project's save status, and a slot the lab fills
// with a button of its own (HeaderActionButton). The bubbles are pictures,
// not links: the unit is walked in order, with no going back or ahead.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {ProgressBubble} from '@code-dot-org/component-library/progressWidget';
import {Typography as MuiTypography} from '@mui/material';
import {isEqual} from 'lodash';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {getCurrentLevels} from '@cdo/apps/code-studio/progressReduxSelectors';
import {ProjectState} from '@cdo/apps/code-studio/projectRedux';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import ProjectInfo from './ProjectInfo';
import remeasureOnFontsReady from './remeasureOnFontsReady';

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

/** The fields of a getCurrentLevels entry the bubbles read. */
interface HeaderLevel {
  id: string;
  status?: string;
  levelNumber?: number;
  isCurrentLevel?: boolean;
  sublevels?: HeaderLevel[];
}

type BubbleStatus = React.ComponentProps<typeof ProgressBubble>['status'];

const bubbleStatusByLevelStatus: Record<string, BubbleStatus> = {
  [LevelStatus.attempted]: 'inProgress',
  [LevelStatus.passed]: 'passed',
  [LevelStatus.perfect]: 'completed',
  [LevelStatus.free_play_complete]: 'completed',
  [LevelStatus.completed_assessment]: 'completed',
  [LevelStatus.submitted]: 'completed',
};

const statusLabel: Record<NonNullable<BubbleStatus>, string> = {
  notStarted: 'not started',
  inProgress: 'in progress',
  passed: 'passed',
  completed: 'completed',
  keepWorking: 'keep working',
  error: 'rejected',
};

const SAVE_ICONS: Record<
  ProjectState['projectUpdatedStatus'],
  {iconName: string; label: string}
> = {
  default: {iconName: 'cloud', label: 'Not saved'},
  saving: {iconName: 'cloud-arrow-up', label: 'Saving'},
  saved: {iconName: 'cloud-check', label: 'Saved'},
  error: {iconName: 'cloud-exclamation', label: 'Save failed'},
};

interface SimpleHeaderProps {
  scriptData: {simpleProgressImage?: string};
  /** The lesson's name, on the bar's first pill. */
  lessonName?: string;
}

const SimpleHeader: React.FunctionComponent<SimpleHeaderProps> = ({
  scriptData,
  lessonName,
}) => {
  const isRtl = useSelector((state: HeaderState) => state.isRtl);
  const {showProjectUpdatedAt, projectUpdatedStatus} = useSelector(
    (state: HeaderState) => state.project
  );
  // getCurrentLevels builds a new array per call; isEqual skips needless
  // re-renders.
  const levels = useSelector(getCurrentLevels, isEqual) as HeaderLevel[];

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

  const saveIcon = SAVE_ICONS[projectUpdatedStatus];

  return (
    <div id="header_middle_content" className={styles.row}>
      <div id="project_info_container" className={styles.projectInfo}>
        <ProjectInfo isRtl={isRtl} />
      </div>
      {scriptData.simpleProgressImage && (
        <img
          src={scriptData.simpleProgressImage}
          alt=""
          className={styles.image}
        />
      )}
      <div className={styles.bar} data-theme="Light">
        {lessonName && (
          <div className={styles.lesson}>
            <MuiTypography
              variant="body3"
              component="span"
              className={styles.lessonName}
              title={lessonName}
            >
              {lessonName}
            </MuiTypography>
          </div>
        )}
        <div
          className={styles.bubbles}
          role="group"
          aria-label="Lesson progress"
        >
          {levels.map(level => {
            const active =
              !!level.isCurrentLevel ||
              !!level.sublevels?.some(sublevel => sublevel.isCurrentLevel);
            const status =
              bubbleStatusByLevelStatus[level.status ?? ''] ?? 'notStarted';
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
        </div>
        {showProjectUpdatedAt && (
          <div className={styles.save}>
            <FontAwesomeV6Icon
              iconName={saveIcon.iconName}
              title={saveIcon.label}
              aria-label={saveIcon.label}
              role="img"
              className={styles.saveIcon}
            />
          </div>
        )}
        <div id={HEADER_ACTION_ID} className={styles.action} />
      </div>
    </div>
  );
};

export default SimpleHeader;
