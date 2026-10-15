import {renderHook, act} from '@testing-library/react-hooks';

import {useFlaggedImage} from '@cdo/apps/lab2/hooks/useFlaggedImage';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  post: jest.fn(),
}));

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  getInstance: () => ({
    getMetricsReporter: () => ({logError: jest.fn()}),
  }),
}));

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  sendEvent: jest.fn(),
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
      result.current.handleCancelFlaggedImage('sketchlab');
    });
    expect(result.current.flaggedImageData).toBeNull();
    expect(uploadFunction).not.toHaveBeenCalled();
  });
});
