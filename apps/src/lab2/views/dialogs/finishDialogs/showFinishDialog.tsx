// The finish dialogs that stand on their own, keyed by a level's
// finish_dialog. Any lab can name one; the share dialog's finish variants
// (hoc2024, hoai2025) are served by the share dialog instead.

import React, {useCallback, useState} from 'react';
import {Provider} from 'react-redux';

import {waitForShareFailureRefresh} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {FinishDialogId, ProjectType} from '@cdo/apps/lab2/types';
import {getStore} from '@cdo/apps/redux';
import {
  createReactRoot,
  unmountReactRoot,
} from '@cdo/apps/util/createReactRoot';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import trackEvent from '@cdo/apps/util/trackEvent';

import Hoai2026Congrats from './Hoai2026Congrats';

export interface FinishDialogProps {
  onClose: () => void;
  /** The project's share link; absent while the project cannot be shared. */
  shareUrl?: string;
  projectType?: ProjectType;
  /** Saves and opens a remix of the project, as the header's Remix does. */
  onRemix: () => void;
}

const FINISH_DIALOGS: Record<
  FinishDialogId,
  React.FunctionComponent<FinishDialogProps>
> = {
  hoai2026: Hoai2026Congrats,
};

export function isFinishDialogId(id: string | undefined): id is FinishDialogId {
  return !!id && id in FINISH_DIALOGS;
}

const FINISH_DIALOG_CONTAINER_ID = 'finish-dialog';

const FinishDialogHost: React.FunctionComponent<{
  dialogId: FinishDialogId;
  shareUrl: string | null;
  projectType?: ProjectType;
  onClose: () => void;
  onRemix: () => void;
}> = ({dialogId, shareUrl, projectType, onClose, onRemix}) => {
  const [open, setOpen] = useState(true);
  const shareable = useAppSelector(
    state => !state.lab.shareFailure && !state.lab.isBlockedAbuse
  );
  const close = useCallback(() => {
    setOpen(false);
    onClose();
  }, [onClose]);
  if (!open) {
    return null;
  }
  const Dialog = FINISH_DIALOGS[dialogId];
  // The host is outside the lab's theme provider, as the share dialog is.
  return (
    <div data-theme={Lab2Registry.getInstance().getTheme()}>
      <Dialog
        onClose={close}
        shareUrl={shareable && shareUrl ? shareUrl : undefined}
        projectType={projectType}
        onRemix={onRemix}
      />
    </div>
  );
};

/**
 * Save, then show the level's finish dialog. Closing it leaves the student
 * on the level.
 */
export function showFinishDialog(dialogId: FinishDialogId): void {
  const projectManager = Lab2Registry.getInstance().getProjectManager();
  if (!projectManager) {
    return;
  }
  const shareUrl = projectManager.getShareUrl();
  const projectType = projectManager.getProjectType();
  const remix = () => {
    projectManager.flushSave().then(() => projectManager.redirectToRemix());
  };
  // The share filter runs on save; wait for its answer so the dialog opens
  // knowing whether the project can be shared.
  projectManager
    .flushSave()
    .then(waitForShareFailureRefresh)
    .then(() => {
      let container = document.getElementById(FINISH_DIALOG_CONTAINER_ID);
      if (!container) {
        container = document.createElement('div');
        container.id = FINISH_DIALOG_CONTAINER_ID;
        document.body.appendChild(container);
      }
      const onClose = () => unmountReactRoot(container as Element);
      createReactRoot(
        <Provider store={getStore()}>
          <FinishDialogHost
            dialogId={dialogId}
            shareUrl={shareUrl}
            projectType={projectType}
            onClose={onClose}
            onRemix={remix}
          />
        </Provider>,
        container
      );
      trackEvent('finish', 'finish_open_dialog', {value: dialogId});
    });
}
