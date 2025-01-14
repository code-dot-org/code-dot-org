import React from 'react';
import {useBlocker} from 'react-router-dom';

import Modal from '@cdo/apps/componentLibrary/modal/Modal';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import SectionsSetUpContainer from '../sectionsRefresh/SectionsSetUpContainer';
import {selectedSectionSelector} from '../teacherDashboard/teacherSectionsReduxSelectors';

interface DashboardSectionSettingsProps {
  redirectUrl: string;
}

const preventNavigationUnloadListener = (event: BeforeUnloadEvent) => {
  event.returnValue = '';
  event.preventDefault();
};

const DashboardSectionSettings: React.FunctionComponent<
  DashboardSectionSettingsProps
> = ({redirectUrl}) => {
  const selectedSection = useAppSelector(selectedSectionSelector);

  const blocker = useBlocker(
    ({currentLocation, nextLocation}) =>
      // value !== '' &&
      currentLocation.pathname !== nextLocation.pathname
  );

  addEventListener('beforeunload', preventNavigationUnloadListener);

  return (
    <div>
      <SectionsSetUpContainer
        isUsersFirstSection={false}
        sectionToBeEdited={selectedSection}
        defaultRedirectUrl={redirectUrl}
      />
      {blocker.state === 'blocked' && (
        <Modal
          title="Are you sure you want to leave?"
          description="Changes to your section may not have been saved"
          onClose={() => blocker.reset()}
          primaryButtonProps={{
            text: 'Continue',
            onClick: () => {
              blocker.proceed();
              removeEventListener(
                'beforeunload',
                preventNavigationUnloadListener
              );
            },
          }}
          secondaryButtonProps={{
            text: 'Cancel',
            onClick: () => blocker.reset(),
          }}
        />
      )}
    </div>
  );
};

export default DashboardSectionSettings;
