import {render, screen, act} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import labReducer from '@cdo/apps/lab2/lab2Redux';
import lab2ProjectReducer, {
  setProjectSource,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import predictLevelReducer from '@cdo/apps/lab2/redux/predictLevelRedux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import {IframeMessageType} from '@cdo/apps/weblab2/htmlPreview/constants';
import {HTMLPreview} from '@cdo/apps/weblab2/htmlPreview/HTMLPreview';
import networkReducer from '@cdo/apps/weblab2/redux/networkRedux';
import weblab2Reducer from '@cdo/apps/weblab2/weblab2Redux';

const logWarning = jest.fn();

jest.mock('@codebridge/codebridgeContext', () => ({
  useCodebridgeContext: () => ({levelProperties: {id: 1}}),
}));

jest.mock('@cdo/apps/lab2/projects/utils', () => ({
  getAppOptionsViewingExemplar: () => false,
  getAppOptionsEditingExemplar: () => false,
  getIsStartMode: () => false,
}));

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({getMetricsReporter: () => ({logWarning})}),
  },
}));

jest.mock('@cdo/apps/util/codeprojectsPreviewOrigin', () => ({
  getInnerEnvironment: () => ({
    subdomain: '',
    isLocalhost: false,
    port: '',
  }),
}));

jest.mock('@cdo/apps/util/sandboxedPreviewDomain', () => ({
  getPreviewDomain: () => 'codeprojects.org',
}));

jest.mock('@cdo/apps/lab2/hooks/useLifecycleNotifier', () => ({
  __esModule: true,
  default: () => {},
}));

jest.mock('@cdo/apps/lab2/views/components/PanelContainer', () => ({
  __esModule: true,
  default: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

jest.mock('@cdo/apps/weblab2/htmlPreview/HTMLPreviewHeader', () => ({
  HTMLPreviewHeader: () => <div />,
}));

const CONNECTION_TIMEOUT_MS = 15000;
const ERROR_TITLE = 'Unable to Load Preview';

describe('HTMLPreview connection error', () => {
  let store: Store;

  beforeEach(() => {
    jest.useFakeTimers();
    logWarning.mockClear();
    stubRedux();
    registerReducers({
      lab: labReducer,
      lab2Project: lab2ProjectReducer,
      predictLevel: predictLevelReducer,
      weblab2: weblab2Reducer,
      weblab2Network: networkReducer,
    });
    store = getStore();
    store.dispatch(
      setProjectSource({
        source: {
          files: {
            'file-1': {
              id: 'file-1',
              name: 'index.html',
              language: 'html',
              contents: '<html></html>',
              folderId: '0',
              open: true,
              active: true,
            },
          },
          folders: {},
        },
      })
    );
  });

  afterEach(() => {
    restoreRedux();
    jest.useRealTimers();
  });

  const renderPreview = () =>
    render(
      <Provider store={store}>
        <HTMLPreview />
      </Provider>
    );

  // The preview iframe is cross-origin, so stand in for it by posting the
  // ready message from the origin the component built for it.
  const reportIframeReady = () =>
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: screen.getByTitle('Web Preview').getAttribute('src') || '',
          data: {type: IframeMessageType.IFRAME_READY},
        })
      );
    });

  it('shows the firewall message when the preview never connects', () => {
    renderPreview();
    expect(screen.queryByText(ERROR_TITLE)).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(CONNECTION_TIMEOUT_MS);
    });

    expect(screen.getByText(ERROR_TITLE)).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: /IT requirements page/})
    ).toHaveAttribute('href', 'https://code.org/educate/it');
    expect(logWarning).toHaveBeenCalledTimes(1);
  });

  it('keeps the iframe mounted so a late connection recovers', () => {
    renderPreview();

    act(() => {
      jest.advanceTimersByTime(CONNECTION_TIMEOUT_MS);
    });
    expect(screen.getByTitle('Web Preview')).toBeInTheDocument();

    reportIframeReady();

    expect(screen.queryByText(ERROR_TITLE)).not.toBeInTheDocument();
  });

  it('does not show the message once the preview connects', () => {
    renderPreview();
    reportIframeReady();

    act(() => {
      jest.advanceTimersByTime(CONNECTION_TIMEOUT_MS);
    });

    expect(screen.queryByText(ERROR_TITLE)).not.toBeInTheDocument();
    expect(logWarning).not.toHaveBeenCalled();
  });
});
