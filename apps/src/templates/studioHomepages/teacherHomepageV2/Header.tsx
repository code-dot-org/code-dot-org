import {Button} from '@code-dot-org/component-library/button';
import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {Typography} from '@mui/material';
import React from 'react';
import {useSelector} from 'react-redux';

import {FlashHandler, Flash} from '@cdo/apps/flashes/FlashHandler';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {rosterProvider as rosterProviderSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
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

  const rosterProvider = useSelector(rosterProviderSelector);

  const [flash, setFlash] = React.useState<Flash | null>(null);

  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('openAddSectionDialog') === 'true') {
      dispatch(beginEditingSection());
    }
  }, [dispatch]);

  const onSectionCreateButtonClick = () => {
    analyticsReporter.sendEvent(
      EVENTS.SECTION_SETUP_STARTED,
      {},
      PLATFORMS.BOTH
    );
    dispatch(beginEditingSection());
  };

  const syncCleverSections = async () => {
    try {
      const response = await fetch('/api/v1/roster/clever/sections/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': await getAuthenticityToken(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFlash([['notice', data.message]]);
      } else {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
    } catch (e) {
      console.error(e);
      setFlash([['alert', i18n.statsTableFailure()]]);
    }
  };

  return (
    <div id="teacher-home-header">
      {flash && <FlashHandler flash={flash} onClose={() => setFlash(null)} />}
      <Typography variant="h4" gutterBottom>
        {i18n.classSections()}
      </Typography>
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
            onClick={onSectionCreateButtonClick}
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
              ...(rosterProvider === SectionLoginType.clever
                ? [
                    {
                      label: i18n.syncAllLoginTypeSections({
                        loginType: i18n.loginTypeClever(),
                      }),
                      icon: {iconName: 'sync', iconStyle: 'solid' as const},
                      value: 'syncCleverSections',
                      onClick: syncCleverSections,
                    },
                  ]
                : []),
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
