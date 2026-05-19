import React, {useState, useEffect, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {
  setCalendarData,
  clearCalendarPlan,
  setCalendarPlanData,
  setCalendarPlanError,
  setCalendarPlanLoading,
} from '@cdo/apps/code-studio/calendarRedux';
import {
  setUnitSummaryReduxData,
  UnitSummaryResponse,
} from '@cdo/apps/code-studio/components/progress/UnitSummaryUtils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  asyncLoadCoursesWithProgress,
  getSelectedUnitName,
  getSelectedUnitPosition,
  getSelectedCourseName,
} from '@cdo/apps/redux/unitSelectionRedux';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import UnitSelectorV2 from '../teacherDashboardShared/UnitSelectorV2';

import {CalendarPlanCalendar} from './calendar';
import CalendarDateTimeProvider from './calendar/CalendarDateTimeProvider';
import {CalendarDragPayload} from './calendar/calendarDragUtils';
import CalendarLessonDrawer from './calendar/CalendarLessonDrawer';
import {
  fetchSectionCalendarPlan,
  resetSectionCalendarPlan,
  saveSectionCalendarPlan,
} from './calendar/calendarPlanApi';
import {
  placeCalendarItemsIntoSessions,
  placeItemInSession,
  replaceItemsInSessions,
  removeMatchingPlanItems,
} from './calendar/calendarPlannerUtils';
import {
  CalendarPlanItem,
  CalendarPlanSession,
  CalendarSplitLessonPart,
  SectionCalendarPlan,
} from './calendar/calendarPlanTypes';
import CalendarScheduleSettings from './calendar/CalendarScheduleSettings';
import {CalendarEmptyState} from './CalendarEmptyState';

import styles from './teacher-navigation.module.scss';

const WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS = [
  45, 90, 135, 180, 225, 270, 315, 360, 405, 450,
];
const DEFAULT_WEEKLY_INSTRUCTIONAL_MINUTES =
  WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS[4];

function buildDefaultPlan(
  sectionId: number,
  courseName: string,
  unitPosition: number,
  weeklyInstructionalMinutes: number
): SectionCalendarPlan {
  return {
    sectionId,
    unitId: 0,
    courseName,
    unitPosition,
    startDate: null,
    mode: 'weekly_minutes',
    weeklyInstructionalMinutes,
    recurringSessions: [],
    oneOffSessions: [],
    cancellations: [],
    items: [],
  };
}

function newCalendarClientId(prefix: string) {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const UnitCalendar: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [draftPlan, setDraftPlan] = useState<SectionCalendarPlan | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isDraggingCalendarBlock, setIsDraggingCalendarBlock] = useState(false);

  const selectedSection = useAppSelector(selectedSectionSelector);

  const unitName = useSelector(state => getSelectedUnitName(state));
  let unitPosition = useSelector(state => getSelectedUnitPosition(state));
  let courseName = useSelector(state => getSelectedCourseName(state));

  if (!(unitPosition && courseName)) {
    unitPosition = selectedSection.unitPosition;
    courseName = selectedSection.courseVersionName;
  }

  const hasCalendar = useAppSelector(state => state.calendar?.showCalendar);

  const calendarLessons = useAppSelector(
    state => state.calendar?.calendarLessons
  );

  const calendarCourseName = useAppSelector(
    state => state.calendar?.courseName
  );
  const calendarUnitPosition = useAppSelector(
    state => state.calendar?.unitPosition
  );
  const savedPlan = useAppSelector(state => state.calendar?.savedPlan);
  const savedPlanLoadStatus = useAppSelector(
    state => state.calendar?.savedPlanLoadStatus
  );
  const savedPlanError = useAppSelector(
    state => state.calendar?.savedPlanError
  );

  const {userId, userType} = useAppSelector(state => state.currentUser);

  const isLoadingCoursesWithProgress = useSelector(
    (state: {unitSelection: {isLoadingCoursesWithProgress: boolean}}) =>
      state.unitSelection.isLoadingCoursesWithProgress
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncLoadCoursesWithProgress());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedSection.courseOfferingId || !(courseName && unitPosition)) {
      dispatch(
        setCalendarData({
          unitName: null,
          unitPosition: null,
          courseName: null,
          showCalendar: false,
          calendarLessons: null,
          versionYear: null,
        })
      );
    } else if (
      !isLoading &&
      courseName &&
      unitPosition &&
      userType &&
      userId &&
      (hasCalendar === undefined ||
        calendarLessons === null ||
        courseName !== calendarCourseName ||
        unitPosition !== calendarUnitPosition)
    ) {
      setIsLoading(true);
      const fetchUnitSummaryPath = `/dashboardapi/unit_summary/${courseName}/${unitPosition}`;
      HttpClient.fetchJson<UnitSummaryResponse>(fetchUnitSummaryPath)
        .then(response => response?.value)
        .then(responseJson => {
          // Initialize Redux state with the new data
          setUnitSummaryReduxData(responseJson, dispatch, userType, userId);
          setIsLoading(false);

          analyticsReporter.sendEvent(EVENTS.VIEW_UNIT_CALENDAR, {
            unitName,
          });
        })
        .catch(error => {
          console.error('Error loading unit calendar', error);

          analyticsReporter.sendEvent(EVENTS.UNIT_CALENDAR_FAILURE, {
            unitName,
          });
          return null;
        });
    }

    setHasInitialLoad(true);
  }, [
    unitName,
    userId,
    userType,
    hasCalendar,
    calendarLessons,
    dispatch,
    isLoading,
    selectedSection.courseOfferingId,
    selectedSection.courseVersionName,
    courseName,
    unitPosition,
    calendarCourseName,
    calendarUnitPosition,
  ]);

  const needsReload = useAppSelector(
    state => state.teacherSections.needsReload
  );

  useEffect(() => {
    dispatch(clearCalendarPlan());
  }, [courseName, dispatch, selectedSection.id, unitPosition]);

  useEffect(() => {
    if (
      !hasCalendar ||
      !courseName ||
      !unitPosition ||
      !selectedSection.id ||
      savedPlanLoadStatus !== 'idle'
    ) {
      return;
    }

    dispatch(setCalendarPlanLoading());
    fetchSectionCalendarPlan(selectedSection.id, courseName, unitPosition)
      .then(response => dispatch(setCalendarPlanData(response.plan)))
      .catch(error => {
        console.error('Error loading section calendar plan', error);
        dispatch(setCalendarPlanError(error.message));
      });
  }, [
    courseName,
    dispatch,
    hasCalendar,
    savedPlanLoadStatus,
    selectedSection.id,
    unitPosition,
  ]);

  useEffect(() => {
    if (!hasCalendar || !courseName || !unitPosition || !selectedSection.id) {
      setDraftPlan(null);
      return;
    }

    const nextPlan =
      savedPlan ||
      buildDefaultPlan(
        selectedSection.id,
        courseName,
        unitPosition,
        DEFAULT_WEEKLY_INSTRUCTIONAL_MINUTES
      );
    setDraftPlan(nextPlan);
  }, [courseName, hasCalendar, savedPlan, selectedSection.id, unitPosition]);

  const detailedCalendarSessions = useMemo(() => {
    if (!draftPlan || !calendarLessons) {
      return [];
    }

    return placeCalendarItemsIntoSessions(draftPlan, calendarLessons);
  }, [calendarLessons, draftPlan]);

  const hasUnsavedPlanChanges = useMemo(() => {
    if (!draftPlan || !courseName || !unitPosition || !selectedSection.id) {
      return false;
    }

    const savedOrDefaultPlan =
      savedPlan ||
      buildDefaultPlan(
        selectedSection.id,
        courseName,
        unitPosition,
        draftPlan.weeklyInstructionalMinutes ||
          DEFAULT_WEEKLY_INSTRUCTIONAL_MINUTES
      );
    return JSON.stringify(draftPlan) !== JSON.stringify(savedOrDefaultPlan);
  }, [courseName, draftPlan, savedPlan, selectedSection.id, unitPosition]);

  const handleSavePlan = async () => {
    if (!draftPlan) {
      return;
    }

    setIsSavingPlan(true);
    try {
      const response = await saveSectionCalendarPlan(draftPlan);
      dispatch(setCalendarPlanData(response.plan));
    } catch (error) {
      console.error('Error saving section calendar plan', error);
      dispatch(setCalendarPlanError((error as Error).message));
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleResetPlan = async () => {
    if (!courseName || !unitPosition || !selectedSection.id) {
      return;
    }

    if (!window.confirm(i18n.resetCalendarPlanConfirmation())) {
      return;
    }

    try {
      await resetSectionCalendarPlan(
        selectedSection.id,
        courseName,
        unitPosition
      );
      dispatch(setCalendarPlanData(null));
      setDraftPlan(
        buildDefaultPlan(
          selectedSection.id,
          courseName,
          unitPosition,
          DEFAULT_WEEKLY_INSTRUCTIONAL_MINUTES
        )
      );
    } catch (error) {
      console.error('Error resetting section calendar plan', error);
      dispatch(setCalendarPlanError((error as Error).message));
    }
  };

  const calendarItemFromPayload = (
    payload: CalendarDragPayload
  ): CalendarPlanItem | null => {
    if (payload.item) {
      return payload.item;
    }

    if (!payload.lesson) {
      return null;
    }

    return {
      clientId: `lesson-${payload.lesson.id}`,
      itemType: 'lesson',
      lessonId: payload.lesson.id,
      plannedMinutes: payload.lesson.duration,
      removed: false,
    };
  };

  const handleDropItem = (
    payload: CalendarDragPayload,
    targetSession: CalendarPlanSession,
    targetIndex: number
  ) => {
    const item = calendarItemFromPayload(payload);
    if (!item) {
      return;
    }

    setDraftPlan(plan =>
      plan ? placeItemInSession(plan, item, targetSession, targetIndex) : plan
    );
  };

  const handleSplitLesson = (
    item: CalendarPlanItem,
    targetSession: CalendarPlanSession,
    parts: CalendarSplitLessonPart[]
  ) => {
    if (!item.lessonId) {
      return;
    }

    const splitGroupId =
      item.splitGroupId || newCalendarClientId('split-lesson');
    const existingSplitPlacements = detailedCalendarSessions
      .flatMap(session =>
        session.items.map((sessionItem, index) => ({
          item: sessionItem,
          session,
          sessionSort: index,
        }))
      )
      .filter(({item: sessionItem}) =>
        item.splitGroupId
          ? sessionItem.splitGroupId === item.splitGroupId
          : sessionItem.clientId === item.clientId
      )
      .sort(
        (a, b) => (a.item.splitPartIndex || 0) - (b.item.splitPartIndex || 0)
      );
    const existingSplitPlacementsByClientId = new Map(
      existingSplitPlacements.map(placement => [
        placement.item.clientId,
        placement,
      ])
    );
    const fallbackPlacement = {
      item,
      session: targetSession,
      sessionSort: targetSession.items.findIndex(
        sessionItem => sessionItem.clientId === item.clientId
      ),
    };
    const placements = parts.map((part, index) => {
      const existingPlacement = part.clientId
        ? existingSplitPlacementsByClientId.get(part.clientId)
        : undefined;
      const session = existingPlacement?.session || targetSession;
      const sessionSort =
        existingPlacement?.sessionSort ??
        Math.max(fallbackPlacement.sessionSort, 0) +
          Math.max(0, index - existingSplitPlacements.length + 1);
      const isSplit = parts.length > 1;
      return {
        item: {
          ...(existingPlacement?.item || item),
          clientId:
            existingPlacement?.item.clientId ||
            part.clientId ||
            (index === 0
              ? item.clientId
              : newCalendarClientId(`lesson-${item.lessonId}-copy`)),
          plannedMinutes: part.minutes,
          splitGroupId: isSplit ? splitGroupId : undefined,
          splitPartIndex: isSplit ? index + 1 : undefined,
          splitPartCount: isSplit ? parts.length : undefined,
        },
        session,
        sessionSort,
      };
    });

    setDraftPlan(plan =>
      plan
        ? replaceItemsInSessions(
            plan,
            existingSplitPlacements.length
              ? existingSplitPlacements.map(({item}) => item)
              : [item],
            placements
          )
        : plan
    );
  };

  const handleRemoveItem = (item: CalendarPlanItem) => {
    setDraftPlan(plan => {
      if (!plan) {
        return plan;
      }

      if (item.itemType === 'placeholder') {
        return {
          ...plan,
          items: plan.items.filter(
            planItem => planItem.clientId !== item.clientId
          ),
        };
      }

      if (item.splitGroupId) {
        const remainingSplitItems = plan.items
          .filter(
            planItem =>
              planItem.splitGroupId === item.splitGroupId &&
              planItem.clientId !== item.clientId &&
              !planItem.removed
          )
          .sort((a, b) => (a.splitPartIndex || 0) - (b.splitPartIndex || 0));

        if (remainingSplitItems.length > 0) {
          const remainingSplitItemsByClientId = new Map(
            remainingSplitItems.map((planItem, index) => [
              planItem.clientId,
              remainingSplitItems.length === 1
                ? {
                    ...planItem,
                    splitGroupId: undefined,
                    splitPartIndex: undefined,
                    splitPartCount: undefined,
                  }
                : {
                    ...planItem,
                    splitPartIndex: index + 1,
                    splitPartCount: remainingSplitItems.length,
                  },
            ])
          );

          return {
            ...plan,
            mode: 'detailed_sessions',
            items: plan.items
              .filter(planItem => planItem.clientId !== item.clientId)
              .map(
                planItem =>
                  remainingSplitItemsByClientId.get(planItem.clientId) ||
                  planItem
              ),
          };
        }
      }

      return {
        ...plan,
        mode: 'detailed_sessions',
        items: [
          ...removeMatchingPlanItems(plan.items, item),
          {
            ...item,
            sessionDate: undefined,
            sessionClientId: undefined,
            sessionSort: undefined,
            removed: true,
          },
        ],
      };
    });
  };

  const handleDropToTrash = (payload: CalendarDragPayload) => {
    const item = calendarItemFromPayload(payload);
    if (item) {
      handleRemoveItem(item);
    }
  };

  if (
    !hasInitialLoad ||
    isLoading ||
    isLoadingCoursesWithProgress ||
    needsReload
  ) {
    return <Spinner size={'large'} />;
  }

  return (
    <div>
      {<CalendarEmptyState />}
      <div className={styles.calendarContentContainer}>
        {hasCalendar && (
          <div>
            <div className={styles.calendarDropdowns}>
              <div className={styles.calendarDropdown}>
                <UnitSelectorV2
                  className={styles.calendarUnitDropdown}
                  filterToSelectedCourse={true}
                  labelText={i18n.lessonsFor()}
                  isLabelVisible
                />
              </div>
            </div>
            {draftPlan && (
              <CalendarDateTimeProvider>
                <CalendarScheduleSettings
                  plan={draftPlan}
                  onPlanChange={setDraftPlan}
                  onSave={handleSavePlan}
                  onReset={handleResetPlan}
                  isSaving={isSavingPlan}
                />
              </CalendarDateTimeProvider>
            )}
            {hasUnsavedPlanChanges && (
              <div className={styles.calendarStatusMessage}>
                {i18n.unsavedChanges()}
              </div>
            )}
            {savedPlanError && (
              <div className={styles.calendarErrorMessage} role="alert">
                {i18n.calendarPlanSaveError()}
              </div>
            )}
            {draftPlan && calendarLessons && (
              <div className={styles.calendarPlannerLayout}>
                <CalendarLessonDrawer
                  isDragging={isDraggingCalendarBlock}
                  plan={draftPlan}
                  lessons={calendarLessons}
                  onPlanChange={setDraftPlan}
                  onDropToTrash={handleDropToTrash}
                  onDragStateChange={setIsDraggingCalendarBlock}
                />
                <div className={styles.calendarPlannerMain}>
                  <CalendarPlanCalendar
                    sessions={detailedCalendarSessions}
                    lessons={calendarLessons}
                    onDropItem={handleDropItem}
                    onDragStateChange={setIsDraggingCalendarBlock}
                    onSplitLesson={handleSplitLesson}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitCalendar;
