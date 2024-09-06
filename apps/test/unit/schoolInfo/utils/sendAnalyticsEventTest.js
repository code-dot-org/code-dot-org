import {PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {sendAnalyticsEvent} from '@cdo/apps/schoolInfo/utils/sendAnalyticsEvent';

// Mock the analyticsReporter module
jest.mock('@cdo/apps/lib/util/AnalyticsReporter', () => ({
  sendEvent: jest.fn(),
}));

describe('sendAnalyticsEvent', () => {
  const mockSendEvent = analyticsReporter.sendEvent;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call analyticsReporter.sendEvent with the correct parameters', () => {
    const eventName = 'EVENT_NAME';
    const data = {key: 'value'};

    sendAnalyticsEvent(eventName, data);

    expect(mockSendEvent).toHaveBeenCalledWith(eventName, data, PLATFORMS.BOTH);
  });
});
