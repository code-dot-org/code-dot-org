import {DialogControlInterface} from '@cdo/apps/lab2/views/dialogs';
import {GenericPromptProps} from '@cdo/apps/lab2/views/dialogs/GenericPrompt';

export const getDialogControlMock = (
  dialogInput: string
): Pick<DialogControlInterface, 'showDialog'> => ({
  showDialog: ({validateInput}: GenericPromptProps) => {
    const error = validateInput?.(dialogInput);
    if (error) {
      return Promise.resolve({type: 'cancel', args: error});
    } else {
      return Promise.resolve({type: 'confirm', args: dialogInput});
    }
  },
});

export const getDialogAlertMock = (
  type: 'cancel' | 'confirm'
): Pick<DialogControlInterface, 'showDialog'> => ({
  showDialog: () => {
    if (type === 'confirm') {
      return Promise.resolve({type: 'confirm'});
    } else {
      return Promise.resolve({type: 'cancel'});
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
