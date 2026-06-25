import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {Typography, Button as MuiButton} from '@mui/material';
import React from 'react';
import {useSelector} from 'react-redux';

import DCDO from '@cdo/apps/dcdo';
import {FlashHandler, Flash} from '@cdo/apps/flashes/FlashHandler';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {rosterProvider as rosterProviderSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import experiments from '@cdo/apps/util/experiments';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import AddSectionDialog from '../../teacherDashboard/AddSectionDialog';
import RosterDialog from '../../teacherDashboard/RosterDialog';
import {beginEditingSection} from '../../teacherDashboard/teacherSectionsRedux';

import {ArchiveAllModal} from './ArchiveAllModal';
import {CreateDemoSectionPopup} from './CreateDemoSectionPopup';
import {ArchivedToggleOption} from './TeacherHomepage';

import styles from './teacherHomepage.module.scss';

interface HeaderProps {
  selectedArchiveToggle: ArchivedToggleOption;
  setSelectedArchiveToggle: (value: ArchivedToggleOption) => void;
  onResumeOnboarding: () => void;
  onboardingHidden: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedArchiveToggle,
  setSelectedArchiveToggle,
  onResumeOnboarding,
  onboardingHidden,
}) => {
  const dispatch = useAppDispatch();

  const [archiveAllModalOpen, setArchiveAllModalOpen] =
    React.useState<boolean>(false);

  const [createDemoOpen, setCreateDemoOpen] = React.useState<boolean>(false);

  const rosterProvider = useSelector(rosterProviderSelector);

  const [flash, setFlash] = React.useState<Flash | null>(null);

  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('openAddSectionDialog') === 'true') {
      dispatch(beginEditingSection());
    }
  }, [dispatch]);

  const onSectionCreateButtonClick = () => {
    analyticsReporter.sendEvent(EVENTS.SECTION_SETUP_STARTED, {});
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
          <MuiButton
            id="create-section-button"
            variant="contained"
            color="primary"
            size="small"
            className={styles.createSectionButton}
            onClick={onSectionCreateButtonClick}
            type="button"
            startIcon={<FontAwesomeV6Icon iconName="plus" iconStyle="solid" />}
          >
            {i18n.newClassSection()}
          </MuiButton>
          <ActionDropdown
            name="More options"
            size="s"
            labelText={i18n.moreOptions()}
            options={[
              {
                label: i18n.archiveAllSections(),
                icon: {iconName: 'box-archive', iconStyle: 'solid'},
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
              ...(experiments.isEnabled('demo-section')
                ? [
                    {
                      label: 'Create practice class',
                      icon: {
                        iconName: 'square-dashed-circle-plus',
                        iconStyle: 'solid' as const,
                      },
                      value: 'create-demo-section',
                      onClick: () => {
                        setCreateDemoOpen(true);
                      },
                    },
                  ]
                : []),
              ...((experiments.isEnabled(experiments.ONBOARDING) ||
                DCDO.get('onboarding-enabled', false)) &&
              onboardingHidden
                ? [
                    {
                      label: 'Resume onboarding',
                      icon: {
                        iconName: 'rocket',
                        iconStyle: 'solid' as const,
                      },
                      value: 'resume-onboarding',
                      onClick: onResumeOnboarding,
                    },
                  ]
                : []),
            ]}
            useIconButton
            triggerButtonProps={{
              children: (
                <FontAwesomeV6Icon
                  iconName="ellipsis-vertical"
                  iconStyle="solid"
                />
              ),
              color: 'tertiary',
              variant: 'outlined',
            }}
          />
          {archiveAllModalOpen && (
            <ArchiveAllModal onClose={() => setArchiveAllModalOpen(false)} />
          )}
          {createDemoOpen && experiments.isEnabled('demo-section') && (
            <CreateDemoSectionPopup onClose={() => setCreateDemoOpen(false)} />
          )}
        </div>
      </div>
      <AddSectionDialog />
      <RosterDialog />
    </div>
  );
};
