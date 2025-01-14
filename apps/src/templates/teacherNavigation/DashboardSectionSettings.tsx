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
  const [isEditInProgress, setIsEditInProgress] = React.useState(false);

  const blocker = useBlocker(
    ({currentLocation, nextLocation}) =>
      isEditInProgress && currentLocation.pathname !== nextLocation.pathname
  );

  React.useEffect(() => {
    if (isEditInProgress) {
      addEventListener('beforeunload', preventNavigationUnloadListener);
    } else {
      removeEventListener('beforeunload', preventNavigationUnloadListener);
    }
    return () => {
      removeEventListener('beforeunload', preventNavigationUnloadListener);
    };
  }, [isEditInProgress]);

  // TODO(lfm): i18n
  return (
    <div>
      <SectionsSetUpContainer
        isUsersFirstSection={false}
        sectionToBeEdited={selectedSection}
        defaultRedirectUrl={redirectUrl}
        setIsEditInProgress={setIsEditInProgress}
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
