// The finish dialogs that stand on their own, keyed by a level's
// finish_dialog. Any lab can name one; the share dialog's finish variants
// (hoc2024, hoai2025) are served by the share dialog instead.

import React from 'react';
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
  /** Saves and opens a remix of the project; absent while the project may
      not be remixed, for the reasons the header's Remix button honors. */
  onRemix?: () => void;
  /** The unit's finish URL, where a certificate is offered; absent when the
      unit has none. */
  certificateUrl?: string;
}

const FINISH_DIALOGS: Record<
  FinishDialogId,
  React.FunctionComponent<FinishDialogProps>
> = {
  hoai2026: Hoai2026Congrats,
};

export function isFinishDialogId(id: string | undefined): id is FinishDialogId {
  // Own keys only: a level property naming "constructor" is not a dialog.
  return !!id && Object.prototype.hasOwnProperty.call(FINISH_DIALOGS, id);
}

// The header's project state, which the lab's typed root state does not
// carry; the level page's store holds both.
interface ProjectShareState {
  project?: {inRestrictedShareMode?: boolean; exceedsAbuseThreshold?: boolean};
}

const FINISH_DIALOG_CONTAINER_ID = 'finish-dialog';

const FinishDialogHost: React.FunctionComponent<{
  dialogId: FinishDialogId;
  shareUrl: string | null;
  projectType?: ProjectType;
  onClose: () => void;
  onRemix: () => void;
  certificateUrl?: string;
}> = ({dialogId, shareUrl, projectType, onClose, onRemix, certificateUrl}) => {
  const shareable = useAppSelector(
    state => !state.lab.shareFailure && !state.lab.isBlockedAbuse
  );
  // What keeps the header's Remix button away: a blocked project, or one
  // whose sharing is restricted.
  const remixable = useAppSelector(state => {
    const {project} = state as unknown as ProjectShareState;
    return (
      !state.lab.isBlockedAbuse &&
      !project?.inRestrictedShareMode &&
      !project?.exceedsAbuseThreshold
    );
  });
  const Dialog = FINISH_DIALOGS[dialogId];
  // The host is outside the lab's theme provider, as the share dialog is.
  return (
    <div data-theme={Lab2Registry.getInstance().getTheme()}>
      <Dialog
        onClose={onClose}
        shareUrl={shareable && shareUrl ? shareUrl : undefined}
        projectType={projectType}
        onRemix={remixable ? onRemix : undefined}
        certificateUrl={certificateUrl}
      />
    </div>
  );
};

function finishDialogContainer(): HTMLElement {
  const existing = document.getElementById(FINISH_DIALOG_CONTAINER_ID);
  if (existing) {
    return existing;
  }
  const container = document.createElement('div');
  container.id = FINISH_DIALOG_CONTAINER_ID;
  document.body.appendChild(container);
  return container;
}

/**
 * Save, then show the level's finish dialog. Closing it leaves the student
 * on the level.
 */
export function showFinishDialog(
  dialogId: FinishDialogId,
  certificateUrl?: string
): void {
  const projectManager = Lab2Registry.getInstance().getProjectManager();
  if (!projectManager) {
    return;
  }
  const shareUrl = projectManager.getShareUrl();
  const projectType = projectManager.getProjectType();
  const remix = () => {
    projectManager
      .saveAndRemix()
      .catch(error => console.error('Remix from the finish dialog:', error));
  };
  // The share filter runs on save; wait for its answer so the dialog opens
  // knowing whether the project can be shared.
  projectManager
    .flushSave()
    .then(waitForShareFailureRefresh)
    .then(() => {
      const container = finishDialogContainer();
      const onClose = () => unmountReactRoot(container);
      createReactRoot(
        <Provider store={getStore()}>
          <FinishDialogHost
            dialogId={dialogId}
            shareUrl={shareUrl}
            projectType={projectType}
            onClose={onClose}
            onRemix={remix}
            certificateUrl={certificateUrl}
          />
        </Provider>,
        container
      );
      trackEvent('finish', 'finish_open_dialog', {value: dialogId});
    });
}
