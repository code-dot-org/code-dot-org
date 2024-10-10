import {DialogControlInterface} from '@cdo/apps/lab2/views/dialogs';
import {GenericPromptProps} from '@cdo/apps/lab2/views/dialogs/GenericPrompt';

export const getDialogControlMock = (
  newFolderName: string
): Pick<DialogControlInterface, 'showDialog'> => ({
  showDialog: ({validateInput}: GenericPromptProps) => {
    const error = validateInput?.(newFolderName);
    if (error) {
      return Promise.resolve({type: 'cancel', args: error});
    } else {
      return Promise.resolve({type: 'confirm', args: newFolderName});
    }
  },
});

type AnalyticsDataType = {event: string};
type AnalyticsMockType = (event: string) => void;

export const getAnalyticsMock = (): [AnalyticsDataType, AnalyticsMockType] => {
  const analyticsData = {} as AnalyticsDataType;
  const mock = (event: string) => {
    analyticsData.event = event;
  };

  return [analyticsData, mock];
};
