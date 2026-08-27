import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useEffect, useMemo, useState} from 'react';

import {asyncLoadSectionData} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {
  TEACHER_NAVIGATION_BASE_URL,
  TEACHER_NAVIGATION_PATHS,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import LessonSummaryScreen from './LessonSummaryScreen';
import PrepareEmptyState, {PrepareEmptyStateType} from './PrepareEmptyState';
import SectionPodcastCard, {
  SuggestedLesson,
  SuggestedLessonEntry,
} from './SectionPodcastCard';

import styles from './prepare-list.module.scss';

const COMING_UP = 'coming_up';

const TEACHER_DASHBOARD_HOME_PATH = `${TEACHER_NAVIGATION_BASE_URL}/${TEACHER_NAVIGATION_PATHS.home}`;

interface SectionLessonData extends SuggestedLesson {
  history?: SuggestedLessonEntry[];
  coming_up?: SuggestedLesson | null;
}

function localISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDate(isoDate: string): string {
  const [y, mo, d] = isoDate.split('-').map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// A null lesson can mean several things: no course is assigned, a course is
// assigned but no specific unit has been chosen within it yet (a normal,
// deliberate state for multi-unit courses - the suggested-lesson feature has
// no unit to compute progress against until one is picked), the section has
// no students yet (so there's no progress to compute against either), or the
// assigned unit has since been retired (so nothing can be computed for it).
// The first three are all determinable up front from section data alone;
// whatever's left over once those are ruled out is the retired-unit case.
function getEmptyStateType(
  section: Section,
  lesson: SuggestedLesson | null | undefined
): PrepareEmptyStateType | null {
  if (!section.courseId) return 'no_course';
  if (!section.unitId) return 'no_unit';
  if (section.studentCount === 0) return 'no_students';
  if (lesson === undefined) return null;
  if (lesson?.completed_unit) return 'completed';
  if (lesson === null) return 'unavailable';
  return null;
}

interface PrepareListProps {
  onNavigateToChats?: () => void;
}

const PrepareList: React.FC<PrepareListProps> = ({onNavigateToChats}) => {
  const dispatch = useAppDispatch();
  const sections = useAppSelector(state => state.teacherSections);
  const [suggestedLessons, setSuggestedLessons] = useState<Record<
    number,
    SectionLessonData | null
  > | null>(null);

  // suggested_lesson_history entries are date-stamped by the server in UTC
  // (config.time_zone), while a teacher's browser reports the local
  // calendar date. Anyone west of UTC (all of the US) hits a window each
  // day - mid-afternoon onward in Pacific time - where those two dates
  // disagree, which used to make "yesterday" (or any history lookup) fail
  // to match and silently render as empty. Once the server tells us its
  // own idea of "today" (serverToday), that's what all date matching
  // below uses; the local guess is only a placeholder until it arrives.
  const localTodayISO = useMemo(() => localISODate(new Date()), []);
  const [serverToday, setServerToday] = useState<string | null>(null);
  const todayISO = serverToday ?? localTodayISO;
  const [selectedDate, setSelectedDate] = useState<string>(localTodayISO);
  const [detailInfo, setDetailInfo] = useState<{
    lesson: SuggestedLesson;
    sectionName: string;
  } | null>(null);
  const [emptyStateSectionId, setEmptyStateSectionId] = useState<number | null>(
    null
  );

  const sectionsAreLoaded = sections?.sectionsAreLoaded;

  useEffect(() => {
    // asyncLoadSectionData toggles the shared asyncLoadComplete flag, which
    // the teacher dashboard homepage's section list also reads to decide
    // whether to show its own loading spinner. On dashboard pages, sections
    // are already loaded by the time the drawer can be opened, so skipping
    // the redundant fetch here avoids flashing that spinner just from
    // opening the Prepare tab. Pages outside the dashboard (e.g. curriculum
    // pages) haven't loaded section data yet, so we still fetch there.
    if (!sectionsAreLoaded) {
      dispatch(asyncLoadSectionData());
    }
  }, [dispatch, sectionsAreLoaded]);

  useEffect(() => {
    HttpClient.fetchJson<{
      today: string;
      sections: Record<number, SectionLessonData | null>;
    }>('/api/v1/sections/suggested_lessons')
      .then(response => {
        setSuggestedLessons(response?.value?.sections ?? {});
        setServerToday(response?.value?.today ?? null);
      })
      .catch(() => setSuggestedLessons({}));
  }, []);

  // The date picker defaults to the browser's local "today" before the
  // fetch above resolves. If the server's real today turns out to be a
  // different date (see comment above), and the teacher hasn't since
  // picked a date of their own, snap the selection to match.
  useEffect(() => {
    if (serverToday && serverToday !== localTodayISO) {
      setSelectedDate(current =>
        current === localTodayISO ? serverToday : current
      );
    }
  }, [serverToday, localTodayISO]);

  const activeSections: Section[] = (sections?.sectionOrder ?? [])
    .map((id: number) => sections.sections[id])
    .filter((s: Section): s is Section => !!s);

  // The drawer stays mounted across client-side navigation within the
  // teacher dashboard SPA, so selectedSectionId can be stale/irrelevant
  // (e.g. it defaults to the first section on the plain homepage). Only
  // trust it as "the section this page is about" off the homepage.
  const isTeacherDashboardHome = useMemo(
    () => window.location.pathname.includes(TEACHER_DASHBOARD_HOME_PATH),
    []
  );
  const selectedSectionId = isTeacherDashboardHome
    ? null
    : sections?.selectedSectionId;

  const hasComingUp = useMemo(
    () =>
      !!suggestedLessons &&
      Object.values(suggestedLessons).some(d => d?.coming_up),
    [suggestedLessons]
  );

  const availableDates = useMemo(() => {
    const dateSet = new Set([todayISO]);
    if (suggestedLessons) {
      Object.values(suggestedLessons).forEach(data => {
        data?.history?.forEach(entry => dateSet.add(entry.date));
      });
    }
    const dates = Array.from(dateSet).sort();
    return hasComingUp ? [...dates, COMING_UP] : dates;
  }, [suggestedLessons, todayISO, hasComingUp]);

  function lessonForDate(
    data: SectionLessonData | null | undefined
  ): SuggestedLesson | null | undefined {
    if (data === undefined) return undefined;
    if (data === null) return null;
    if (selectedDate === COMING_UP) return data.coming_up ?? null;
    if (selectedDate === todayISO) return data;
    return data.history?.find(e => e.date === selectedDate) ?? null;
  }

  if (detailInfo) {
    return (
      <LessonSummaryScreen
        lesson={detailInfo.lesson}
        sectionName={detailInfo.sectionName}
        onBack={() => setDetailInfo(null)}
        onNavigateToChats={onNavigateToChats}
      />
    );
  }

  const emptyStateSection =
    activeSections.find(s => s.id === emptyStateSectionId) ?? null;
  const emptyStateType = emptyStateSection
    ? getEmptyStateType(
        emptyStateSection,
        lessonForDate(
          suggestedLessons ? suggestedLessons[emptyStateSection.id] : undefined
        )
      )
    : null;

  return (
    <div className={styles.container}>
      {emptyStateSection && emptyStateType && (
        <button
          type="button"
          className={styles.backButton}
          onClick={() => setEmptyStateSectionId(null)}
        >
          <FontAwesomeV6Icon iconName="chevron-left" />
          Back
        </button>
      )}
      <h2 className={styles.heading}>Prepare</h2>
      <div className={styles.datePickerSection}>
        <SimpleDropdown
          items={availableDates.map(date => ({
            value: date,
            text: date === COMING_UP ? 'Coming up' : formatDate(date),
          }))}
          labelText="Show prep content for"
          name="date-picker"
          selectedValue={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
      </div>
      {emptyStateSection && emptyStateType ? (
        <PrepareEmptyState type={emptyStateType} section={emptyStateSection} />
      ) : activeSections.length === 0 ? (
        <div className={styles.emptyState}>No active sections found.</div>
      ) : (
        activeSections.map(section => {
          const lesson = lessonForDate(
            suggestedLessons ? suggestedLessons[section.id] : undefined
          );
          const sectionEmptyStateType = getEmptyStateType(section, lesson);
          return (
            <SectionPodcastCard
              key={section.id}
              sectionName={section.name}
              avatarColor={section.avatar_color ?? 0}
              avatarEmoji={section.avatar_emoji ?? 0}
              isActiveSection={section.id === selectedSectionId}
              lesson={lesson}
              onSectionClick={
                sectionEmptyStateType
                  ? () => setEmptyStateSectionId(section.id)
                  : lesson
                  ? () => setDetailInfo({lesson, sectionName: section.name})
                  : undefined
              }
            />
          );
        })
      )}
    </div>
  );
};

export default PrepareList;
