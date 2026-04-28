import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';

import {AddFileHandler} from './types';

/**
 * Add file action that uses the provided addFileHandler. This allows labs to control how files are added and to
 * implement custom logic within the lab, such as file name validation and handling duplicates.
 */
export function onClickAddFile(
  backpackApi: BackpackClientApi,
  fileName: string,
  addAlert: (type: 'success' | 'danger', message: string) => void,
  setActionInProgress: (inProgress: boolean) => void,
  addFileHandler: AddFileHandler
) {
  const getFile = async () => {
    setActionInProgress(true);
    const response = await backpackApi.fetchFileResponse(fileName);
    if (!response || response instanceof Error) {
      setActionInProgress(false);
      throw new Error('Error fetching file from backpack');
    }
    const contentType =
      response.headers.get('Content-Type') || 'application/octet-stream';
    const blob = await response.blob();
    setActionInProgress(false);
    return new File([blob], fileName, {type: contentType});
  };

  const notifySuccess = (
    method: 'new' | 'replace' | 'rename',
    message: string
  ) => {
    const event =
      method === 'new'
        ? EVENTS.IMPORT_FROM_BACKPACK_NEW
        : method === 'replace'
        ? EVENTS.IMPORT_FROM_BACKPACK_REPLACE
        : EVENTS.IMPORT_FROM_BACKPACK_RENAME;
    sendLab2AnalyticsEvent(event, {fileType: fileName.split('.').pop() || ''});
    addAlert('success', message);
  };
  const notifyError = (message: string) => addAlert('danger', message);

  addFileHandler({fileName, getFile, notifySuccess, notifyError});
}
