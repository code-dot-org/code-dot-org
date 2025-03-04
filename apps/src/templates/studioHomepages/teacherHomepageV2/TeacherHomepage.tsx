import {Button} from '@code-dot-org/component-library/button';
import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {Heading2, Heading4} from '@code-dot-org/component-library/typography';
import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {SectionList} from './SectionList';

import styles from './teacherHomepage.module.scss';

export const TeacherHomepage: React.FC = () => {
  const teacherName = useAppSelector(state => state.currentUser.displayName);

  const [showHiddenOnly, setShowHiddenOnly] = React.useState(false);

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
                  value === 'teaching'
                    ? setShowHiddenOnly(false)
                    : setShowHiddenOnly(true)
                }
                selectedButtonValue={showHiddenOnly ? 'archived' : 'teaching'}
                buttons={[
                  {
                    label: 'Teaching',
                    value: 'teaching',
                  },
                  {
                    label: 'Archived',
                    value: 'archived',
                  },
                ]}
                size="s"
              />
              <div className={styles.headerButtonRowRight}>
                <Button
                  iconLeft={{iconName: 'plus', iconStyle: 'solid'}}
                  text="New class section"
                  onClick={() => {}}
                  size="s"
                  className={styles.createSectionButton}
                />
                <ActionDropdown
                  name="More options"
                  size="s"
                  labelText="More options"
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
            <SectionList showHiddenOnly={showHiddenOnly} />
          </div>
          <div className={styles.blankAnnouncement} />
        </div>
      </div>
    </div>
  );
};
