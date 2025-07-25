import {Button} from '@code-dot-org/component-library/button';
import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {Heading4} from '@code-dot-org/component-library/typography';
import React from 'react';

import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import AddSectionDialog from '../../teacherDashboard/AddSectionDialog';
import RosterDialog from '../../teacherDashboard/RosterDialog';
import {beginEditingSection} from '../../teacherDashboard/teacherSectionsRedux';

import {ArchiveAllModal} from './ArchiveAllModal';
import {ArchivedToggleOption} from './TeacherHomepage';

import styles from './teacherHomepage.module.scss';

interface HeaderProps {
  selectedArchiveToggle: ArchivedToggleOption;
  setSelectedArchiveToggle: (value: ArchivedToggleOption) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedArchiveToggle,
  setSelectedArchiveToggle,
}) => {
  const dispatch = useAppDispatch();

  const [archiveAllModalOpen, setArchiveAllModalOpen] =
    React.useState<boolean>(false);

  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('openAddSectionDialog') === 'true') {
    dispatch(beginEditingSection());
  }

  return (
    <div>
      <Heading4>{i18n.classSections()}</Heading4>
      <div className={styles.headerButtonRow}>
        <SegmentedButtons
          onChange={value =>
            setSelectedArchiveToggle(value as ArchivedToggleOption)
          }
          selectedButtonValue={selectedArchiveToggle}
          buttons={[
            {
              id: 'ui-test-teaching',
              label: i18n.teaching(),
              value: 'teaching',
            },
            {
              id: 'ui-test-archived',
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
            options={[
              {
                label: i18n.archiveAllSections(),
                icon: {iconName: 'gear', iconStyle: 'solid'},
                value: 'archive',
                onClick: () => {
                  setArchiveAllModalOpen(true);
                },
              },
            ]}
            triggerButtonProps={{
              icon: {iconName: 'ellipsis-vertical', iconStyle: 'solid'},
              isIconOnly: true,
              color: 'gray',
              type: 'secondary',
            }}
          />
          {archiveAllModalOpen && (
            <ArchiveAllModal onClose={() => setArchiveAllModalOpen(false)} />
          )}
        </div>
      </div>
      <AddSectionDialog />
      <RosterDialog />
    </div>
  );
};
