import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React, {useState, useEffect, useMemo} from 'react';
import {useSelector} from 'react-redux';

import UnitCalendarGrid from '@cdo/apps//code-studio/components/progress/UnitCalendarGrid';
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

import CalendarDateTimeProvider from './calendar/CalendarDateTimeProvider';
import CalendarLessonDrawer from './calendar/CalendarLessonDrawer';
import {
  fetchSectionCalendarPlan,
  resetSectionCalendarPlan,
  saveSectionCalendarPlan,
} from './calendar/calendarPlanApi';
import CalendarPlanCalendar from './calendar/CalendarPlanCalendar';
import {placeCalendarItemsIntoSessions} from './calendar/calendarPlannerUtils';
import {
  CalendarPlanItem,
  CalendarPlanSession,
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
export const WEEK_WIDTH = 800;

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

const UnitCalendar: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [draftPlan, setDraftPlan] = useState<SectionCalendarPlan | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const [weeklyInstructionalMinutes, setWeeklyInstructionalMinutes] =
    useState<string>(DEFAULT_WEEKLY_INSTRUCTIONAL_MINUTES.toString());

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

  const weeklyMinutesOptions = WEEKLY_INSTRUCTIONAL_MINUTES_OPTIONS.map(
    value => ({
      value: value.toString(),
      text: i18n.minutesLabel({number: value}),
    })
  );

  const handleDropdownChange = (value: string) => {
    setWeeklyInstructionalMinutes(value);
    setDraftPlan(plan =>
      plan
        ? {
            ...plan,
            mode: 'weekly_minutes',
            weeklyInstructionalMinutes: parseInt(value),
          }
        : plan
    );

    analyticsReporter.sendEvent(EVENTS.CHANGED_CALENDAR_MINUTES, {
      unitName,
      minutes: value,
    });
  };

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
    setWeeklyInstructionalMinutes(
      nextPlan.weeklyInstructionalMinutes.toString()
    );
  }, [courseName, hasCalendar, savedPlan, selectedSection.id, unitPosition]);

  const detailedCalendarSessions = useMemo(() => {
    if (!draftPlan || !calendarLessons) {
      return [];
    }

    return placeCalendarItemsIntoSessions(draftPlan, calendarLessons);
  }, [calendarLessons, draftPlan]);

  const hasDetailedSessions =
    draftPlan?.mode === 'detailed_sessions' &&
    !!draftPlan.startDate &&
    (draftPlan.recurringSessions.length > 0 ||
      draftPlan.oneOffSessions.length > 0);

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
        parseInt(weeklyInstructionalMinutes)
      );
    return JSON.stringify(draftPlan) !== JSON.stringify(savedOrDefaultPlan);
  }, [
    courseName,
    draftPlan,
    savedPlan,
    selectedSection.id,
    unitPosition,
    weeklyInstructionalMinutes,
  ]);

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
          parseInt(weeklyInstructionalMinutes)
        )
      );
    } catch (error) {
      console.error('Error resetting section calendar plan', error);
      dispatch(setCalendarPlanError((error as Error).message));
    }
  };

  const handleToggleCancellation = (session: CalendarPlanSession) => {
    setDraftPlan(plan => {
      if (!plan) {
        return plan;
      }

      const existingCancellation = plan.cancellations.find(
        cancellation =>
          cancellation.sessionDate === session.date &&
          (cancellation.recurringSessionClientId === session.sourceClientId ||
            cancellation.oneOffSessionClientId === session.sourceClientId)
      );

      if (existingCancellation) {
        return {
          ...plan,
          cancellations: plan.cancellations.filter(
            cancellation => cancellation !== existingCancellation
          ),
        };
      }

      return {
        ...plan,
        cancellations: [
          ...plan.cancellations,
          {
            sessionDate: session.date,
            recurringSessionClientId:
              session.source === 'recurring'
                ? session.sourceClientId
                : undefined,
            oneOffSessionClientId:
              session.source === 'one_off' ? session.sourceClientId : undefined,
          },
        ],
      };
    });
  };

  const removeMatchingPlanItems = (
    items: CalendarPlanItem[],
    itemToReplace: CalendarPlanItem
  ) =>
    items.filter(item =>
      itemToReplace.lessonId
        ? item.lessonId !== itemToReplace.lessonId
        : item.clientId !== itemToReplace.clientId
    );

  const handleMoveItem = (
    item: CalendarPlanItem,
    currentSession: CalendarPlanSession,
    direction: -1 | 1
  ) => {
    const openSessions = detailedCalendarSessions.filter(
      session => !session.canceled
    );
    const currentIndex = openSessions.findIndex(
      session => session.id === currentSession.id
    );
    const targetSession = openSessions[currentIndex + direction];
    if (!targetSession) {
      return;
    }

    setDraftPlan(plan =>
      plan
        ? {
            ...plan,
            mode: 'detailed_sessions',
            items: [
              ...removeMatchingPlanItems(plan.items, item),
              {
                ...item,
                sessionDate: targetSession.date,
                sessionClientId: targetSession.sourceClientId,
                sessionSort: targetSession.items.length,
                removed: false,
              },
            ],
          }
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
              <div className={styles.calendarDropdown}>
                <SimpleDropdown
                  name="minutesPerWeek"
                  className={styles.calendarMinutesPerWeekDropdown}
                  onChange={event => handleDropdownChange(event.target.value)}
                  items={weeklyMinutesOptions}
                  selectedValue={weeklyInstructionalMinutes}
                  size="s"
                  dropdownTextThickness="thin"
                  labelText={i18n.instructionalMinutesPerWeek()}
                  color="gray"
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
              <CalendarLessonDrawer
                plan={draftPlan}
                lessons={calendarLessons}
                onPlanChange={setDraftPlan}
              />
            )}
            {hasDetailedSessions ? (
              <CalendarPlanCalendar
                sessions={detailedCalendarSessions}
                lessons={calendarLessons || []}
                onToggleCancellation={handleToggleCancellation}
                onMoveItem={handleMoveItem}
                onRemoveItem={handleRemoveItem}
              />
            ) : (
              <UnitCalendarGrid
                lessons={calendarLessons || []}
                weeklyInstructionalMinutes={parseInt(
                  weeklyInstructionalMinutes
                )}
                weekWidth={WEEK_WIDTH}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitCalendar;
