import {Heading2} from '@code-dot-org/component-library/typography';
import React from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {asyncLoadTeacherHomepageSectionData} from '../../teacherDashboard/teacherSectionsRedux';

import {Header} from './Header';
import {SectionList} from './SectionList';

import styles from './teacherHomepage.module.scss';

export type ArchivedToggleOption = 'teaching' | 'archived';

export const TeacherHomepage: React.FC = () => {
  const teacherName = useAppSelector(state => state.currentUser.displayName);

  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(asyncLoadTeacherHomepageSectionData());
  }, [dispatch]);

  React.useEffect(() => {
    analyticsReporter.sendEvent(
      EVENTS.NEW_TEACHER_HOMEPAGE_VISITED,
      {},
      PLATFORMS.BOTH
    );
  }, []);

  const [selectedArchiveToggle, setSelectedArchiveToggle] =
    React.useState<ArchivedToggleOption>('teaching');

  const onArchiveToggleChange = (value: ArchivedToggleOption) => {
    const toggleEvent =
      value === 'teaching'
        ? EVENTS.SECTION_LIST_TEACHING_TOGGLE_CLICKED
        : EVENTS.SECTION_LIST_ARCHIVE_TOGGLE_CLICKED;
    analyticsReporter.sendEvent(toggleEvent, {}, PLATFORMS.BOTH);
    setSelectedArchiveToggle(value);
  };

  return (
    <div className={styles.teacherHomepage}>
      <div className={styles.teacherHomepageBody}>
        <Heading2>{i18n.welcome({teacherName: teacherName})}</Heading2>

        <div className={styles.teacherHomepageContent}>
          <div className={styles.teacherHomepageLeftContent}>
            <Header
              selectedArchiveToggle={selectedArchiveToggle}
              setSelectedArchiveToggle={onArchiveToggleChange}
            />
            <SectionList
              showHiddenOnly={selectedArchiveToggle === 'archived'}
            />
          </div>
          <div className={styles.blankAnnouncement} />
        </div>
      </div>
    </div>
  );
};
