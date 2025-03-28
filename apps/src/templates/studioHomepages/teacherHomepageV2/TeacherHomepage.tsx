import {Heading2} from '@code-dot-org/component-library/typography';
import React from 'react';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {asyncLoadTeacherHomepageSectionData} from '../../teacherDashboard/teacherSectionsRedux';

import {EmptyHomepage} from './EmptyHomepage';
import {Header} from './Header';
import {SectionList} from './SectionList';
import {TeacherPromotions} from './TeacherPromotions';

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
            {numSections === 0 ? (
              <EmptyHomepage showHiddenOnly={showHiddenOnly} />
            ) : (
              <SectionList
                showHiddenOnly={selectedArchiveToggle === 'archived'}
              />
            )}
          </div>
          <TeacherPromotions />
        </div>
      </div>
    </div>
  );
};
