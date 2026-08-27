import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React, {useEffect, useMemo, useState} from 'react';

import {asyncLoadSectionData} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import LessonSummaryScreen from './LessonSummaryScreen';
import SectionPodcastCard, {
  SuggestedLesson,
  SuggestedLessonEntry,
} from './SectionPodcastCard';

import styles from './prepare-list.module.scss';

const COMING_UP = 'coming_up';

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

  const todayISO = useMemo(() => localISODate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [detailInfo, setDetailInfo] = useState<{
    lesson: SuggestedLesson;
    sectionName: string;
  } | null>(null);

  useEffect(() => {
    dispatch(asyncLoadSectionData());
  }, [dispatch]);

  useEffect(() => {
    HttpClient.fetchJson<Record<number, SectionLessonData | null>>(
      '/api/v1/sections/suggested_lessons'
    )
      .then(response => setSuggestedLessons(response?.value ?? {}))
      .catch(() => setSuggestedLessons({}));
  }, []);

  const activeSections: Section[] = (sections?.sectionIds ?? [])
    .map((id: number) => sections.sections[id])
    .filter(
      (s: Section): s is Section =>
        !!s && !s.hidden && s.participantType === 'student'
    );

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

  return (
    <div className={styles.container}>
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
      {activeSections.length === 0 ? (
        <div className={styles.emptyState}>No active sections found.</div>
      ) : (
        activeSections.map(section => {
          const lesson = lessonForDate(
            suggestedLessons ? suggestedLessons[section.id] : undefined
          );
          return (
            <SectionPodcastCard
              key={section.id}
              sectionName={section.name}
              avatarColor={section.avatar_color ?? 0}
              avatarEmoji={section.avatar_emoji ?? 0}
              lesson={lesson}
              onSectionClick={
                lesson !== null && lesson !== undefined
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
