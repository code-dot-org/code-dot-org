import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import ProgressWidget, {
  ProgressBubble,
  ProgressWidgetSaveStatus,
} from '@code-dot-org/component-library/progressWidget';
import {Button, Tooltip} from '@mui/material';
import {isEqual} from 'lodash';
import moment from 'moment';
import React, {MouseEvent, useEffect, useRef, useState} from 'react';

import {canChangeLevelInPage} from '@cdo/apps/code-studio/browserNavigation';
import {navigateToLevelId} from '@cdo/apps/code-studio/progressRedux';
import {
  getCurrentLevel,
  getCurrentLevels,
  lessonExtrasUrl,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {
  ProjectState,
  projectUpdatedStatuses,
} from '@cdo/apps/code-studio/projectRedux';
import {requestHeaderContinue} from '@cdo/apps/lab2/progress/headerNavigation';
import {getBubbleUrl} from '@cdo/apps/templates/progress/BubbleFactory';
import {commonI18n} from '@cdo/apps/types/locale';
import {RootState} from '@cdo/apps/types/redux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import progress from '../../../progress';
import {HeaderPopupPanel} from '../HeaderPopup';
import ProjectInfo from '../ProjectInfo';
import remeasureOnFontsReady from '../remeasureOnFontsReady';

import {
  WidgetLevel,
  bubbleAriaLabel,
  bubbleLevelType,
  bubbleStatus,
  isActive,
  isAssessment,
} from './progressWidgetLevels';
import useOnline from './useOnline';

import styles from './progress-widget-header.module.scss';

interface HeaderState {
  isRtl: boolean;
  project: ProjectState;
}

// HeaderPopup.jsx is untyped.
const LessonMenuPanel = HeaderPopupPanel as React.ForwardRefExoticComponent<
  {
    scriptData: object;
    windowHeight: number;
  } & React.RefAttributes<HTMLDivElement>
>;

interface ProgressWidgetHeaderProps {
  scriptData: {name: string};
  lessonName: string;
}

function useSaveStatus(): {
  saveStatus: ProgressWidgetSaveStatus;
  saveStatusLabel?: string;
} {
  const online = useOnline();
  const {showProjectUpdatedAt, projectUpdatedStatus, projectUpdatedAt} =
    useAppSelector(state => (state as unknown as HeaderState).project);

  if (!showProjectUpdatedAt) {
    return {saveStatus: 'none'};
  }
  if (!online) {
    return {
      saveStatus: 'offline',
      saveStatusLabel: commonI18n.progressWidgetOffline(),
    };
  }
  switch (projectUpdatedStatus) {
    case projectUpdatedStatuses.error:
      return {
        saveStatus: 'failed',
        saveStatusLabel: commonI18n.progressWidgetNotSaved(),
      };
    case projectUpdatedStatuses.saving:
      return {
        saveStatus: 'saving',
        saveStatusLabel: commonI18n.progressWidgetSaving(),
      };
    default:
      return projectUpdatedAt
        ? {
            saveStatus: 'saved',
            saveStatusLabel: commonI18n.progressWidgetSaved({
              timeAgo: moment(projectUpdatedAt).fromNow(),
            }),
          }
        : {saveStatus: 'none'};
  }
}

/**
 * The level header's middle for a unit with the progress widget: the project
 * info, then the lesson menu, save status, bubbles and the lab's Continue
 * button in one group.
 */
const ProgressWidgetHeader: React.FunctionComponent<
  ProgressWidgetHeaderProps
> = ({scriptData, lessonName}) => {
  const dispatch = useAppDispatch();
  const isRtl = useAppSelector(
    state => (state as unknown as HeaderState).isRtl
  );
  // The selector builds a new array per call; compare by content or every
  // store change re-renders the row.
  const levels = useAppSelector(getCurrentLevels, isEqual) as WidgetLevel[];
  const currentLevel = useAppSelector(getCurrentLevel) as WidgetLevel;
  const currentLevelId = useAppSelector(
    (state: RootState) => state.progress.currentLevelId
  );
  const extrasUrl = useAppSelector((state: RootState) =>
    lessonExtrasUrl(state.progress, state.progress.currentLessonId)
  ) as string | undefined;
  const isLessonExtras = useAppSelector(
    (state: RootState) => state.progress.isLessonExtras
  );
  const navigation = useAppSelector(
    (state: RootState) => state.header.headerNavigation
  );
  const {saveStatus, saveStatusLabel} = useSaveStatus();

  const [menuOpen, setMenuOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const closeOnOutsideClick = (event: Event) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !widgetRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', closeOnOutsideClick);
    return () => document.removeEventListener('click', closeOnOutsideClick);
  }, [menuOpen]);

  const toggleMenu = () => {
    if (!menuOpen) {
      progress.retrieveProgress(scriptData.name, scriptData, currentLevelId);
    }
    setMenuOpen(!menuOpen);
  };

  const onBonusLevel =
    isLessonExtras ||
    levels.some(level => level.id === currentLevelId && level.bonus);

  const bubbles = levels
    .filter(level => !level.bonus)
    .map(level => {
      const active = isActive(level);
      const navigatesInPage = canChangeLevelInPage(currentLevel, level);
      return (
        <ProgressBubble
          key={level.id}
          levelType={bubbleLevelType(level)}
          status={bubbleStatus(level)}
          isActive={active}
          isAssessment={isAssessment(level)}
          levelNumber={level.levelNumber}
          disabled={level.isLocked}
          ariaLabel={bubbleAriaLabel(level)}
          href={
            active
              ? undefined
              : getBubbleUrl(level.url, null, null, true) ?? undefined
          }
          onClick={
            !active && navigatesInPage
              ? (e: MouseEvent<HTMLElement>) => {
                  e.preventDefault();
                  dispatch(navigateToLevelId(level.id));
                }
              : undefined
          }
        />
      );
    });

  const action = navigation && (
    <Tooltip title={navigation.tooltip ?? ''} placement="bottom">
      {/* A disabled button fires no events, so the tooltip listens here. */}
      <span>
        <Button
          variant="contained"
          color="secondary"
          size="extraSmall"
          disabled={!navigation.enabled}
          onClick={requestHeaderContinue}
          endIcon={
            <FontAwesomeV6Icon iconName="arrow-right" iconStyle="solid" />
          }
        >
          {navigation.label}
        </Button>
      </span>
    </Tooltip>
  );

  return (
    <div id="header_middle_content" className={styles.row}>
      <div id="project_info_container" className={styles.projectInfo}>
        <ProjectInfo isRtl={isRtl} />
      </div>
      <div ref={widgetRef} className={styles.widget}>
        <ProgressWidget
          lessonLabel={lessonName}
          onLessonClick={toggleMenu}
          lessonMenuExpanded={menuOpen}
          saveStatus={saveStatus}
          saveStatusLabel={saveStatusLabel}
          action={action}
        >
          {bubbles}
          {extrasUrl && (
            <ProgressBubble
              levelType="lessonExtras"
              isActive={onBonusLevel}
              href={onBonusLevel ? undefined : extrasUrl}
              ariaLabel={commonI18n.stageExtras()}
              tooltip={commonI18n.stageExtras()}
            />
          )}
        </ProgressWidget>
      </div>
      {menuOpen && (
        <LessonMenuPanel
          ref={menuRef}
          scriptData={scriptData}
          windowHeight={window.innerHeight}
        />
      )}
    </div>
  );
};

export default ProgressWidgetHeader;
