import {renderHook} from '@testing-library/react-hooks';

import {useAiTutorResponseSchemaSettings} from '@cdo/apps/weblab2/hooks/useAiTutorResponseSchemaSettings';

const mockDispatch = jest.fn();
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

const mockSendLab2AnalyticsEvent = jest.fn();
jest.mock('@cdo/apps/lab2/utils', () => ({
  sendLab2AnalyticsEvent: (...args: unknown[]) =>
    mockSendLab2AnalyticsEvent(...args),
}));

const source = {
  files: {
    '1': {
      id: '1',
      name: 'index.html',
      language: 'html',
      contents: '<p>mine</p>',
      folderId: '0',
      active: true,
      open: true,
    },
  },
  folders: {},
  openFiles: ['1'],
};

// An accept/reject-eligible response: a build answerType with a supported file
// type. This is the case that loads the model's code into the project.
const acceptRejectResponse = {
  answer: {
    answerType: 'buildHTML',
    explanation: 'Added a heading.',
    code: [{filename: 'index.html', sourceCode: '<h1>from the model</h1>'}],
  },
};

const proseResponse = {
  answer: {
    answerType: 'general',
    explanation: 'Try a heading element.',
    code: [],
  },
};

const renderSettings = (isWidgetView?: boolean) =>
  renderHook(() =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useAiTutorResponseSchemaSettings(source as any, isWidgetView)
  ).result.current!;

describe('useAiTutorResponseSchemaSettings (weblab2)', () => {
  beforeEach(() => jest.clearAllMocks());

  // formatForDisplay runs over every message in the transcript on every render,
  // so it has to be safe to call any number of times, for any reader.
  it('formatForDisplay dispatches nothing and reports no analytics', () => {
    const {formatForDisplay} = renderSettings();

    const text = formatForDisplay(acceptRejectResponse);

    expect(text).toContain('Added a heading.');
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockSendLab2AnalyticsEvent).not.toHaveBeenCalled();
  });

  it('formatForDisplay is stable across renders so the transcript memo holds', () => {
    const {result, rerender} = renderHook(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useAiTutorResponseSchemaSettings(source as any, false)
    );
    const first = result.current!.formatForDisplay;
    rerender();

    expect(result.current!.formatForDisplay).toBe(first);
  });

  it('onResponse loads the code and enters the review state', () => {
    const {onResponse} = renderSettings();

    onResponse!(acceptRejectResponse);

    expect(mockSendLab2AnalyticsEvent).toHaveBeenCalledTimes(1);
    const dispatched = mockDispatch.mock.calls.map(([action]) => action.type);
    expect(dispatched).toContain('lab2Project/setViewingAiTutorVersion');
    expect(dispatched).toContain('lab2Project/setSource');
  });

  it('onResponse ignores a response with no code to review', () => {
    const {onResponse} = renderSettings();

    onResponse!(proseResponse);

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockSendLab2AnalyticsEvent).not.toHaveBeenCalled();
  });

  it('onResponse does nothing in the widget view', () => {
    const {onResponse} = renderSettings(true);

    onResponse!(acceptRejectResponse);

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  // Display and effect must agree: if the effect declines the accept/reject
  // flow, the text must not describe one.
  it('formats as copy-paste exactly when onResponse declines', () => {
    const {formatForDisplay, onResponse} = renderSettings(true);

    const text = formatForDisplay(acceptRejectResponse);
    onResponse!(acceptRejectResponse);

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(text).toContain('index.html');
  });
});
