import {renderHook, act} from '@testing-library/react-hooks';

import {useFlaggedImage} from '@cdo/apps/lab2/hooks/useFlaggedImage';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  post: jest.fn(),
}));

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  getInstance: () => ({
    getMetricsReporter: () => ({logError: jest.fn()}),
  }),
}));

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {
    sendEvent: jest.fn(),
  },
}));

const mockDispatch = jest.fn();
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({lab: {channel: {id: 'channel-1'}}}),
  useAppDispatch: () => mockDispatch,
}));

describe('useFlaggedImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores flagged image data and clears it on cancel', () => {
    const {result} = renderHook(() => useFlaggedImage());
    const file = new File(['data'], 'photo.png', {type: 'image/png'});
    const uploadFunction = jest.fn();

    act(() => {
      result.current.onImageFlagged(file, 'png', uploadFunction);
    });
    expect(result.current.flaggedImageData).toEqual({
      file,
      fileType: 'png',
      uploadFunction,
    });

    act(() => {
      result.current.handleCancelFlaggedImage('sketchlab', false);
    });
    expect(result.current.flaggedImageData).toBeNull();
    expect(uploadFunction).not.toHaveBeenCalled();
    expect(analyticsReporter.sendEvent).toHaveBeenCalledWith(
      EVENTS.CANCEL_FLAGGED_CUSTOM_IMAGE,
      {UploaderType: 'Lab2 File Uploader', ProjectType: 'sketchlab'}
    );
  });

  it('reports a signed out cancel under its own event', () => {
    const {result} = renderHook(() => useFlaggedImage());

    act(() => {
      result.current.handleCancelFlaggedImage('sketchlab', true);
    });
    expect(analyticsReporter.sendEvent).toHaveBeenCalledWith(
      EVENTS.SIGNED_OUT_FLAGGED_CUSTOM_IMAGE,
      {UploaderType: 'Lab2 File Uploader', ProjectType: 'sketchlab'}
    );
    expect(analyticsReporter.sendEvent).not.toHaveBeenCalledWith(
      EVENTS.CANCEL_FLAGGED_CUSTOM_IMAGE,
      expect.anything()
    );
  });
});
