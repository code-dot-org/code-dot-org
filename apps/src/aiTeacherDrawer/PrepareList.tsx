import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useEffect, useState} from 'react';

import {asyncLoadSectionData} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import SectionPodcastCard, {SuggestedLesson} from './SectionPodcastCard';

import styles from './prepare-list.module.scss';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const PrepareList: React.FC = () => {
  const dispatch = useAppDispatch();
  const sections = useAppSelector(state => state.teacherSections);
  // undefined value = fetch in flight; null = fetched, no lesson for section
  const [suggestedLessons, setSuggestedLessons] = useState<Record<
    number,
    SuggestedLesson | null
  > | null>(null);

  useEffect(() => {
    dispatch(asyncLoadSectionData());
  }, [dispatch]);

  useEffect(() => {
    HttpClient.fetchJson<Record<number, SuggestedLesson | null>>(
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

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Prepare</h2>
      <div className={styles.datePickerSection}>
        <span className={styles.datePickerLabel}>Show prep content for</span>
        <div className={styles.datePicker}>
          <span>{formatDate(new Date())}</span>
          <FontAwesomeV6Icon iconName="chevron-down" />
        </div>
      </div>
      {activeSections.length === 0 ? (
        <div className={styles.emptyState}>No active sections found.</div>
      ) : (
        activeSections.map(section => (
          <SectionPodcastCard
            key={section.id}
            sectionName={section.name}
            avatarColor={section.avatar_color ?? 0}
            avatarEmoji={section.avatar_emoji ?? 0}
            lesson={suggestedLessons ? suggestedLessons[section.id] : undefined}
          />
        ))
      )}
    </div>
  );
};

export default PrepareList;
