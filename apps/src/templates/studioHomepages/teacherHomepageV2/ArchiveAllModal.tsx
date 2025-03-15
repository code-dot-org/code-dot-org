import Dialog from '@code-dot-org/component-library/dialog';
import React from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import SafeMarkdown from '../../SafeMarkdown';
import {archiveAllSections} from '../../teacherDashboard/teacherSectionsRedux';

interface ArchiveAllModalProps {
  onClose: () => void;
}

export const ArchiveAllModal: React.FC<ArchiveAllModalProps> = ({onClose}) => {
  const [isConfirmed, setIsConfirmed] = React.useState(false);

  const [numHidden, setNumHidden] = React.useState(0);

  const [isLoading, setIsLoading] = React.useState(false);

  const dispatch = useAppDispatch();

  const archiveAll = React.useCallback(() => {
    setIsLoading(true);
    HttpClient.post('/sections/archive_all')
      .then(response => response.json())
      .then(json => {
        dispatch(archiveAllSections());
        if (json.num_hidden) {
          setNumHidden(json.num_hidden);
        }
        setIsLoading(false);
        setIsConfirmed(true);
      })
      .catch(error => {
        console.log('error archiving all sections', error);
        setIsLoading(false);
      });
  }, [dispatch, setIsLoading, setIsConfirmed, setNumHidden]);

  const areYouSureProps = React.useMemo(
    () => ({
      title: i18n.archiveWarning(),
      customContent: <SafeMarkdown markdown={i18n.archiveAllNote()} />,
      primaryButtonProps: {
        text: i18n.archiveAllSections(),
        onClick: archiveAll,
        isPending: isLoading,
      },
      secondaryButtonProps: {
        text: i18n.cancel(),
        onClick: onClose,
      },
    }),
    [archiveAll, isLoading, onClose]
  );

  const doneArchiving = React.useMemo(
    () => ({
      title: i18n.archivedAllSections(),
      description: i18n.numArchivedSections({numHidden}),
      primaryButtonProps: {
        text: i18n.closeDialog(),
        onClick: onClose,
      },
    }),
    [numHidden, onClose]
  );

  return (
    <Dialog
      {...(isConfirmed ? doneArchiving : areYouSureProps)}
      onClose={onClose}
    />
  );
};
