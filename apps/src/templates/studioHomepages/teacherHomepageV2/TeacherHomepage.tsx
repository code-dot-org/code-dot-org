import {Heading2} from '@code-dot-org/component-library/typography';
import React from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {atRiskAgeGatedSections} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {AgeGatedSectionsBanner} from '../../policy_compliance/AgeGatedSectionsModal/AgeGatedSectionsBanner';
import {
  asyncLoadTeacherHomepageSectionData,
  asyncLoadCoteacherInvite,
} from '../../teacherDashboard/teacherSectionsRedux';
import CoteacherInviteNotification from '../CoteacherInviteNotification';

import {EmptyHomepage} from './EmptyHomepage';
import {Header} from './Header';
import {SectionList} from './SectionList';
import TeacherHomepagePopups from './TeacherHomepagePopups';
import TeacherPromotions from './TeacherPromotions';

import styles from './teacherHomepage.module.scss';

export type ArchivedToggleOption = 'teaching' | 'archived';

const LOGGED_TEACHER_SESSION = 'logged_teacher_session';

interface TeacherHomepageProps {
  studioUrlPrefix: string;
}

const TeacherHomepage: React.FC<TeacherHomepageProps> = ({studioUrlPrefix}) => {
  const teacherName = useAppSelector(state => state.currentUser.displayName);
  const teacherId = useAppSelector(state => state.currentUser.userId);

  const dispatch = useAppDispatch();

  const [CAPmodalOpen, setCAPModalOpen] = React.useState(false);
  const toggleCAPModal = () => {
    setCAPModalOpen(!CAPmodalOpen);
  };

  const ageGatedSections = useAppSelector(atRiskAgeGatedSections);

  const shouldDisplayAtRiskAgeGatedWarning = () => {
    return ageGatedSections?.length > 0;
  };

  React.useEffect(() => {
    dispatch(asyncLoadTeacherHomepageSectionData());
    dispatch(asyncLoadCoteacherInvite());
  }, [dispatch]);

  React.useEffect(() => {
    // Send one analytics event when a teacher logs in. Use session storage to determine
    // whether they've just logged in.
    if (
      !!teacherId &&
      tryGetSessionStorage(LOGGED_TEACHER_SESSION, 'false') !== 'true'
    ) {
      trySetSessionStorage(LOGGED_TEACHER_SESSION, 'true');

      analyticsReporter.sendEvent(
        EVENTS.TEACHER_LOGIN_EVENT,
        {
          'user id': teacherId,
        },
        PLATFORMS.BOTH
      );
    }
    analyticsReporter.sendEvent(
      EVENTS.NEW_TEACHER_HOMEPAGE_VISITED,
      {},
      PLATFORMS.BOTH
    );
  }, [teacherId]);

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

            {shouldDisplayAtRiskAgeGatedWarning() && (
              <AgeGatedSectionsBanner
                toggleModal={toggleCAPModal}
                modalOpen={CAPmodalOpen}
                ageGatedSections={ageGatedSections}
              />
            )}

            <CoteacherInviteNotification
              isForPl={false}
              destructiveLoad={true}
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
      <TeacherHomepagePopups />
    </div>
  );
};

export default TeacherHomepage;
