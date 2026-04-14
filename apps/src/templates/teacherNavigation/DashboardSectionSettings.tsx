import Modal from '@code-dot-org/component-library/modal';
import _ from 'lodash';
import React from 'react';
import {useBlocker, useParams} from 'react-router-dom';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import LoadingSectionsSetUpContainer from '../sectionsRefresh/LoadingSectionsSetUpContainer';
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
  const {isLoadingSectionData, needsReload} = useAppSelector(
    state => state.teacherSections
  );
  const urlSectionId = useParams().sectionId;
  const isLoading = React.useMemo(
    () =>
      isLoadingSectionData ||
      needsReload ||
      _.toNumber(urlSectionId) !== selectedSection.id,
    [isLoadingSectionData, needsReload, urlSectionId, selectedSection.id]
  );

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

  return (
    <div>
      {isLoading ? (
        <LoadingSectionsSetUpContainer defaultRedirectUrl={redirectUrl} />
      ) : (
        <SectionsSetUpContainer
          isUsersFirstSection={false}
          sectionToBeEdited={selectedSection}
          defaultRedirectUrl={redirectUrl}
          setIsEditInProgress={setIsEditInProgress}
        />
      )}
      {blocker.state === 'blocked' && (
        <Modal
          title={i18n.saveBlockerModalTitle()}
          description={i18n.saveBlockerModalDescription()}
          onClose={() => blocker.reset()}
          primaryButtonProps={{
            text: i18n.continue(),
            onClick: () => {
              blocker.proceed();
            },
          }}
          secondaryButtonProps={{
            text: i18n.dialogCancel(),
            onClick: () => blocker.reset(),
          }}
        />
      )}
    </div>
  );
};

export default DashboardSectionSettings;
