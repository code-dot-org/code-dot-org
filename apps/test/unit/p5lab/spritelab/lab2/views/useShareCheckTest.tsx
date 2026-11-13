import {act, renderHook} from '@testing-library/react-hooks';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import {setShareFailure} from '@cdo/apps/lab2/lab2Redux';
import {fetchShareFailure} from '@cdo/apps/lab2/projects/channelsApi';
import {ShareFailure} from '@cdo/apps/lab2/types';
import useShareCheck from '@cdo/apps/p5lab/spritelab/lab2/views/useShareCheck';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

jest.mock('@cdo/apps/lab2/projects/channelsApi', () => ({
  ...jest.requireActual('@cdo/apps/lab2/projects/channelsApi'),
  fetchShareFailure: jest.fn(),
}));

const mockFetchShareFailure = fetchShareFailure as jest.Mock;
const FAILURE = {type: 'phone', content: '555-0100'} as ShareFailure;

describe('useShareCheck', () => {
  let store: Store;
  let dispatchSpy: jest.SpyInstance;

  beforeEach(() => {
    stubRedux();
    registerReducers({
      shareDialog: (
        state: {isOpen: boolean} = {isOpen: false},
        action: {type: string}
      ) =>
        action.type === 'test/openShare'
          ? {isOpen: true}
          : action.type === 'test/closeShare'
          ? {isOpen: false}
          : state,
    });
    store = getStore();
    dispatchSpy = jest.spyOn(store, 'dispatch');
    mockFetchShareFailure.mockReset().mockResolvedValue(FAILURE);
  });

  afterEach(() => restoreRedux());

  const renderCheck = (
    channelId: string | undefined,
    isProjectPage: boolean
  ) => {
    // renderHook passes initialProps to the wrapper too, hence the prop type.
    const wrapper = ({
      children,
    }: {
      children?: React.ReactNode;
      channelId?: string;
      isProjectPage?: boolean;
    }) => <Provider store={store}>{children}</Provider>;
    return renderHook(
      (props: {channelId: string | undefined; isProjectPage: boolean}) =>
        useShareCheck(props.channelId, props.isProjectPage),
      {wrapper, initialProps: {channelId, isProjectPage}}
    );
  };
  const flush = () => act(async () => {});

  it('asks once as a project page opens, and publishes the answer', async () => {
    const {rerender} = renderCheck('abc', true);
    await flush();
    rerender({channelId: 'abc', isProjectPage: true});
    await flush();

    expect(mockFetchShareFailure).toHaveBeenCalledTimes(1);
    expect(mockFetchShareFailure).toHaveBeenCalledWith('abc');
    expect(dispatchSpy).toHaveBeenCalledWith(setShareFailure(FAILURE));
  });

  it('asks again each time the share dialog opens', async () => {
    renderCheck('abc', true);
    await flush();
    expect(mockFetchShareFailure).toHaveBeenCalledTimes(1);

    mockFetchShareFailure.mockResolvedValue(null);
    act(() => {
      store.dispatch({type: 'test/openShare'});
    });
    await flush();
    expect(mockFetchShareFailure).toHaveBeenCalledTimes(2);
    expect(dispatchSpy).toHaveBeenCalledWith(setShareFailure(null));

    act(() => {
      store.dispatch({type: 'test/closeShare'});
    });
    await flush();
    expect(mockFetchShareFailure).toHaveBeenCalledTimes(2);
  });

  it('does not ask on a level in a unit, even when its share dialog opens', async () => {
    renderCheck('abc', false);
    act(() => {
      store.dispatch({type: 'test/openShare'});
    });
    await flush();

    expect(mockFetchShareFailure).not.toHaveBeenCalled();
  });

  it('does not ask on a level in a unit', async () => {
    renderCheck('abc', false);
    await flush();

    expect(mockFetchShareFailure).not.toHaveBeenCalled();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('does not ask before the project is known', async () => {
    renderCheck(undefined, true);
    await flush();

    expect(mockFetchShareFailure).not.toHaveBeenCalled();
  });

  it('clears the answer when the page is left', async () => {
    const {unmount} = renderCheck('abc', true);
    await flush();
    dispatchSpy.mockClear();
    unmount();

    expect(dispatchSpy).toHaveBeenCalledWith(setShareFailure(null));
  });

  it('leaves the project viewable when the check cannot be made', async () => {
    mockFetchShareFailure.mockRejectedValue(new Error('offline'));
    renderCheck('abc', true);
    await flush();

    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
