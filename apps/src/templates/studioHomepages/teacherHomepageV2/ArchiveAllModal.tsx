import Modal from '@code-dot-org/component-library/modal';
import React from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {archiveAllSections} from '../../teacherDashboard/teacherSectionsRedux';

interface ArchiveAllModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchiveAllModal: React.FC<ArchiveAllModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [confirmed, setConfirmed] = React.useState(false);

  const [numHidden, setNumHidden] = React.useState(0);

  const [isLoading, setIsLoading] = React.useState(false);

  const dispatch = useAppDispatch();

  if (!isOpen) {
    return null;
  }

  const archiveAll = () => {
    setIsLoading(true);
    HttpClient.post('/sections/archive_all')
      .then(response => {
        dispatch(archiveAllSections());
        setConfirmed(true);
        return response.json();
      })
      .then(json => {
        if (json.num_hidden) {
          setNumHidden(json.num_hidden);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.log('error archiving all sections', error);
        setIsLoading(false);
      });
  };

  const areYouSureProps = {
    title: i18n.areYouSure(),
    description: i18n.archiveAllWarning(),
    primaryButtonProps: {
      text: i18n.archiveAllSections(),
      onClick: archiveAll,
      isPending: isLoading,
    },
    secondaryButtonProps: {
      text: i18n.cancel(),
      onClick: onClose,
    },
  };

  const doneArchiving = {
    title: i18n.archivedAllSections(),
    description: i18n.numArchivedSections({numHidden}),
    primaryButtonProps: {
      text: i18n.closeDialog(),
      onClick: onClose,
    },
  };

  const modalProps = confirmed ? doneArchiving : areYouSureProps;

  return <Modal {...modalProps} onClose={onClose} />;
};
