import {Heading2} from '@code-dot-org/component-library/typography';
import React from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {
  asyncLoadTeacherHomepageSectionData,
  asyncLoadCoteacherInvite,
} from '../../teacherDashboard/teacherSectionsRedux';

import {EmptyHomepage} from './EmptyHomepage';
import {Header} from './Header';
import {SectionList} from './SectionList';
import TeacherHomepageDrawer from './TeacherHomepageDrawer';
import TeacherPromotions from './TeacherPromotions';

import styles from './teacherHomepage.module.scss';

export type ArchivedToggleOption = 'teaching' | 'archived';

interface TeacherHomepageProps {
  studioUrlPrefix: string;
}

export const TeacherHomepage: React.FC<TeacherHomepageProps> = ({
  studioUrlPrefix,
}) => {
  const teacherName = useAppSelector(state => state.currentUser.displayName);

  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(asyncLoadTeacherHomepageSectionData());
    dispatch(asyncLoadCoteacherInvite());
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

  const sections = useAppSelector(state => state.teacherSections.sections);

  // The server uses hidden to mean the same thing as archived.
  const showHiddenOnly = selectedArchiveToggle === 'archived';

  const numSections = React.useMemo(
    () =>
      Object.values(sections).filter(
        section => showHiddenOnly === section.hidden
      ).length,
    [sections, showHiddenOnly]
  );

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
        <Heading2>
          {teacherName
            ? i18n.welcome({teacherName: teacherName})
            : i18n.welcomeWithoutName()}
        </Heading2>
        <div className={styles.teacherHomepageContent}>
          <div className={styles.teacherHomepageLeftContent}>
            <Header
              selectedArchiveToggle={selectedArchiveToggle}
              setSelectedArchiveToggle={onArchiveToggleChange}
            />

            {numSections === 0 ? (
              <EmptyHomepage showHiddenOnly={showHiddenOnly} />
            ) : (
              <SectionList
                showHiddenOnly={selectedArchiveToggle === 'archived'}
                studioUrlPrefix={studioUrlPrefix}
              />
            )}
          </div>
          <TeacherPromotions />
        </div>
      </div>
      <TeacherHomepageDrawer />
    </div>
  );
};

export default TeacherHomepage;
