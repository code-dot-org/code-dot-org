import {Heading2} from '@code-dot-org/component-library/typography';
import React from 'react';

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

  const [selectedArchiveToggle, setSelectedArchiveToggle] =
    React.useState<ArchivedToggleOption>('teaching');

  return (
    <div className={styles.teacherHomepage}>
      <div className={styles.teacherHomepageBody}>
        <Heading2>{i18n.welcome({teacherName: teacherName})}</Heading2>

        <div className={styles.teacherHomepageContent}>
          <div className={styles.teacherHomepageLeftContent}>
            <Header
              selectedArchiveToggle={selectedArchiveToggle}
              setSelectedArchiveToggle={setSelectedArchiveToggle}
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
