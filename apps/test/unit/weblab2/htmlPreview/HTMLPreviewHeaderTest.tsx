import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import labReducer, {setIsShareView} from '@cdo/apps/lab2/lab2Redux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import {PreviewViewMode} from '@cdo/apps/weblab2/htmlPreview/constants';
import {HTMLPreviewHeader} from '@cdo/apps/weblab2/htmlPreview/HTMLPreviewHeader';
import weblab2Reducer, {
  setInspectorEnabled,
} from '@cdo/apps/weblab2/weblab2Redux';

const ENABLE_LABEL = 'Turn on element inspector';
const DISABLE_LABEL = 'Turn off element inspector';

describe('HTMLPreviewHeader inspector toggle', () => {
  let store: Store;

  beforeEach(() => {
    stubRedux();
    registerReducers({lab: labReducer, weblab2: weblab2Reducer});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderHeader() {
    return render(
      <Provider store={store}>
        <HTMLPreviewHeader
          value="index.html"
          onChange={() => {}}
          onSubmit={() => {}}
          canNavigateBack={false}
          canNavigateForward={false}
          onNavigateBack={() => {}}
          onNavigateForward={() => {}}
          onRefresh={() => {}}
          onToggleFullScreen={() => {}}
          previewViewMode={PreviewViewMode.DESKTOP}
          setPreviewViewMode={() => {}}
          onStopPreview={() => {}}
          isStopEnabled
          fetchFileSearchOptions={async () => []}
        />
      </Provider>
    );
  }

  function inspectorEnabled() {
    return (store.getState() as {weblab2: {inspectorEnabled: boolean}}).weblab2
      .inspectorEnabled;
  }

  it('renders the toggle with the enable label by default', () => {
    renderHeader();
    expect(
      screen.getByRole('button', {name: ENABLE_LABEL})
    ).toBeInTheDocument();
  });

  it('shows the disable label and aria-pressed when enabled', () => {
    store.dispatch(setInspectorEnabled(true));
    renderHeader();
    const button = screen.getByRole('button', {name: DISABLE_LABEL});
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('dispatches setInspectorEnabled(true) when clicked', async () => {
    renderHeader();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', {name: ENABLE_LABEL}));
    expect(inspectorEnabled()).toBe(true);
  });

  it('is hidden in share view', () => {
    store.dispatch(setIsShareView(true));
    renderHeader();
    expect(
      screen.queryByRole('button', {name: ENABLE_LABEL})
    ).not.toBeInTheDocument();
  });
});
