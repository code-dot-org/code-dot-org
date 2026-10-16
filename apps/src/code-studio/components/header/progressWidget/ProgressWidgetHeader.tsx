import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import ProgressWidget, {
  ProgressBubble,
  ProgressWidgetSaveProps,
} from '@code-dot-org/component-library/progressWidget';
import {Button} from '@mui/material';
import {isEqual} from 'lodash';
import moment from 'moment';
import React, {MouseEvent, useEffect, useMemo, useRef, useState} from 'react';

import {canChangeLevelInPage} from '@cdo/apps/code-studio/browserNavigation';
import {navigateToLevelId} from '@cdo/apps/code-studio/progressRedux';
import {
  getCurrentLevels,
  lessonExtrasUrl,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {
  ProjectState,
  projectUpdatedStatuses,
} from '@cdo/apps/code-studio/projectRedux';
import WithConditionalTooltip from '@cdo/apps/codebridge/components/WithConditionalTooltip';
import {requestHeaderContinue} from '@cdo/apps/lab2/progress/headerNavigation';
import {getBubbleUrl} from '@cdo/apps/templates/progress/BubbleFactory';
import {lessonExtrasHref} from '@cdo/apps/templates/progress/LessonExtrasProgressBubble';
import {commonI18n} from '@cdo/apps/types/locale';
import {RootState} from '@cdo/apps/types/redux';
import useWindowSize from '@cdo/apps/util/hooks/useWindowSize';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

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

const SAVED_TIME_REFRESH_MS = 30 * 1000;

interface HeaderState {
  isRtl: boolean;
  project: ProjectState;
  pageConstants?: {locale?: string};
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
  /** Loads the unit's progress for the lesson menu. */
  onLessonMenuOpen: () => void;
}

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function useSaveStatus(): ProgressWidgetSaveProps {
  const online = useOnline();
  const now = useNow(SAVED_TIME_REFRESH_MS);
  const {project, locale} = useAppSelector(state => {
    const headerState = state as unknown as HeaderState;
    return {
      project: headerState.project,
      locale: headerState.pageConstants?.locale,
    };
  }, isEqual);
  const {showProjectUpdatedAt, projectUpdatedStatus, projectUpdatedAt} =
    project;

  if (!showProjectUpdatedAt) {
    return {saveStatus: 'none'};
  }
  if (!online) {
    return {saveStatus: 'offline', saveStatusLabel: "You're offline"};
  }
  switch (projectUpdatedStatus) {
    case projectUpdatedStatuses.error:
      return {saveStatus: 'failed', saveStatusLabel: commonI18n.notSaved()};
    case projectUpdatedStatuses.saving:
      return {saveStatus: 'saving', saveStatusLabel: commonI18n.saving()};
    default: {
      if (!projectUpdatedAt) {
        return {saveStatus: 'saved', saveStatusLabel: 'Saved'};
      }
      const updatedAt = moment(projectUpdatedAt);
      const timeAgo = (locale ? updatedAt.locale(locale) : updatedAt).from(now);
      return {saveStatus: 'saved', saveStatusLabel: `Saved ${timeAgo}`};
    }
  }
}

/** The level header's middle for a unit with the progress widget. */
const ProgressWidgetHeader: React.FunctionComponent<
  ProgressWidgetHeaderProps
> = ({scriptData, lessonName, onLessonMenuOpen}) => {
  const dispatch = useAppDispatch();
  const isRtl = useAppSelector(
    state => (state as unknown as HeaderState).isRtl
  );
  // getCurrentLevels builds a new array per call; isEqual skips needless re-renders.
  const levels = useAppSelector(getCurrentLevels, isEqual) as WidgetLevel[];
  const currentLevel = useMemo(
    () =>
      levels
        .flatMap(level => [level, ...(level.sublevels ?? [])])
        .find(level => level.isCurrentLevel),
    [levels]
  );
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
  const saveProps = useSaveStatus();
  const [, windowHeight] = useWindowSize();

  const [menuOpen, setMenuOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Eyes UI tests wait on these.
  useEffect(() => {
    document.documentElement.dataset.headerPresent = 'true';
    return remeasureOnFontsReady(() => {
      window.requestAnimationFrame(() => {
        document.documentElement.dataset.headerFontsRelaidOut = 'true';
      });
    });
  }, []);

  // In-page navigation keeps this header mounted.
  useEffect(() => {
    setMenuOpen(false);
  }, [currentLevelId]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const lessonButton = () =>
      widgetRef.current?.querySelector<HTMLElement>('[aria-expanded]');
    const closeOnOutsideClick = (event: Event) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !lessonButton()?.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        lessonButton()?.focus();
      }
    };
    document.addEventListener('click', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('click', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    if (!menuOpen) {
      onLessonMenuOpen();
    }
    setMenuOpen(!menuOpen);
  };

  const onBonusLevel =
    isLessonExtras ||
    levels.some(level => level.id === currentLevelId && level.bonus);

  const bubbles = levels
    .filter(level => !level.bonus)
    .map((level, index) => {
      const active = isActive(level);
      const navigatesInPage = canChangeLevelInPage(currentLevel, level);
      return (
        <ProgressBubble
          key={`${index}-${level.id}`}
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
                  // Modified clicks open the level's URL in a new tab.
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
                    return;
                  }
                  e.preventDefault();
                  dispatch(navigateToLevelId(level.id));
                }
              : undefined
          }
        />
      );
    });

  const action = navigation && (
    <WithConditionalTooltip
      showTooltip={!navigation.enabled && !!navigation.tooltip}
      tooltipProps={{title: navigation.tooltip, placement: 'bottom'}}
    >
      <Button
        id="instructions-continue-button"
        variant="contained"
        color="secondary"
        size="extraSmall"
        disabled={!navigation.enabled}
        onClick={requestHeaderContinue}
        endIcon={<FontAwesomeV6Icon iconName="arrow-right" iconStyle="solid" />}
      >
        {navigation.label}
      </Button>
    </WithConditionalTooltip>
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
          bubblesLabel="Lesson progress"
          {...saveProps}
          action={action}
        >
          {bubbles}
          {extrasUrl && (
            <ProgressBubble
              levelType="lessonExtras"
              isActive={onBonusLevel}
              href={onBonusLevel ? undefined : lessonExtrasHref(extrasUrl)}
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
          windowHeight={windowHeight}
        />
      )}
    </div>
  );
};

export default ProgressWidgetHeader;
