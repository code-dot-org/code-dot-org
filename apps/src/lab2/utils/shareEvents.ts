import {queryParams} from '@cdo/apps/code-studio/utils';
import {ProjectType, ShareDialogId} from '@cdo/apps/lab2/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

import {sendLab2AnalyticsEvent} from './analyticsReporterHelper';

/** The dialog that offers a project's share link: the Share button's dialog
    or a finish dialog. */
export type ShareSource = 'share_dialog' | `${ShareDialogId}_finish_dialog`;

export const shareSource = (dialogId?: ShareDialogId): ShareSource =>
  dialogId ? `${dialogId}_finish_dialog` : 'share_dialog';

interface SharedProject {
  projectType: ProjectType;
  channelId: string;
}

export function reportShareDialogOpened(
  project: SharedProject,
  source: ShareSource
) {
  sendLab2AnalyticsEvent(EVENTS.LAB2_SHARE_DIALOG_OPENED, {
    ...project,
    source,
  });
}

export function reportShareLinkCopied(
  project: SharedProject,
  source: ShareSource
) {
  sendLab2AnalyticsEvent(EVENTS.LAB2_SHARE_LINK_COPIED, {...project, source});
}

export function reportSharePageVisited(
  project: SharedProject,
  isOwner: boolean
) {
  sendLab2AnalyticsEvent(EVENTS.LAB2_SHARE_PAGE_VISITED, {
    ...project,
    isOwner,
    // A dialog's QR code adds this parameter to the share link.
    fromQrCode: queryParams('qr') === 'true',
  });
}
