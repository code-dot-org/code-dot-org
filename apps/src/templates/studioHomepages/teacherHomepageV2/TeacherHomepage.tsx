import {Button} from '@code-dot-org/component-library/button';
import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {Heading2, Heading4} from '@code-dot-org/component-library/typography';
import React from 'react';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import AddSectionDialog from '../../teacherDashboard/AddSectionDialog';
import {
  asyncLoadTeacherHomepageSectionData,
  beginEditingSection,
} from '../../teacherDashboard/teacherSectionsRedux';

import {SectionList} from './SectionList';

import styles from './teacherHomepage.module.scss';

type ArchivedToggleOption = 'teaching' | 'archived';

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
            <Heading4>{i18n.classSections()}</Heading4>
            <div className={styles.headerButtonRow}>
              <SegmentedButtons
                onChange={value =>
                  setSelectedArchiveToggle(value as ArchivedToggleOption)
                }
                selectedButtonValue={selectedArchiveToggle}
                buttons={[
                  {
                    label: i18n.teaching(),
                    value: 'teaching',
                  },
                  {
                    label: i18n.archived(),
                    value: 'archived',
                  },
                ]}
                size="s"
              />
              <div className={styles.headerButtonRowRight}>
                <Button
                  iconLeft={{iconName: 'plus', iconStyle: 'solid'}}
                  text={i18n.newClassSection()}
                  onClick={() => dispatch(beginEditingSection())}
                  size="s"
                  className={styles.createSectionButton}
                />
                <ActionDropdown
                  name="More options"
                  size="s"
                  labelText={i18n.moreOptions()}
                  options={[]}
                  triggerButtonProps={{
                    icon: {iconName: 'ellipsis-vertical', iconStyle: 'solid'},
                    isIconOnly: true,
                    color: 'gray',
                    type: 'secondary',
                  }}
                />
              </div>
            </div>
            <SectionList
              showHiddenOnly={selectedArchiveToggle === 'archived'}
            />
          </div>
          <div className={styles.blankAnnouncement} />
        </div>
      </div>
      <AddSectionDialog />
    </div>
  );
};
