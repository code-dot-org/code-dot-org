import React, {useEffect} from 'react';

import {asyncLoadSectionData} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import SectionPodcastCard from './SectionPodcastCard';

import styles from './prepare-list.module.scss';

const PrepareList: React.FC = () => {
  const dispatch = useAppDispatch();
  const sections = useAppSelector(state => state.teacherSections);

  useEffect(() => {
    dispatch(asyncLoadSectionData());
  }, [dispatch]);

  const activeSections: Section[] = (sections?.sectionIds ?? [])
    .map((id: number) => sections.sections[id])
    .filter(
      (s: Section): s is Section =>
        !!s && !s.hidden && s.participantType === 'student'
    );

  if (activeSections.length === 0) {
    return <div className={styles.emptyState}>No active sections found.</div>;
  }

  return (
    <div className={styles.listContainer}>
      {activeSections.map(section => (
        <SectionPodcastCard
          key={section.id}
          sectionId={section.id}
          sectionName={section.name}
        />
      ))}
    </div>
  );
};

export default PrepareList;
