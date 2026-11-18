import {act, renderHook} from '@testing-library/react-hooks';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import {
  setIsTeacherOfProjectOwner,
  setShareCheckPending,
  setShareFailure,
} from '@cdo/apps/lab2/lab2Redux';
import {
  fetchIsTeacherOfProjectOwner,
  fetchShareFailure,
} from '@cdo/apps/lab2/projects/channelsApi';
import {ShareFailure} from '@cdo/apps/lab2/types';
import useShareCheck, {
  checksOnLoad,
  SHARE_CHECK_MAX_WAIT_MS,
} from '@cdo/apps/p5lab/spritelab/lab2/views/useShareCheck';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

jest.mock('@cdo/apps/lab2/projects/channelsApi', () => ({
  ...jest.requireActual('@cdo/apps/lab2/projects/channelsApi'),
  fetchShareFailure: jest.fn(),
  fetchIsTeacherOfProjectOwner: jest.fn(),
}));

const mockFetchShareFailure = fetchShareFailure as jest.Mock;
const mockFetchIsTeacher = fetchIsTeacherOfProjectOwner as jest.Mock;
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
    mockFetchIsTeacher.mockReset().mockResolvedValue(false);
  });

  afterEach(() => restoreRedux());

  const renderCheck = (channelId: string | undefined, checkOnLoad: boolean) => {
    // renderHook passes initialProps to the wrapper too, hence the prop type.
    const wrapper = ({
      children,
    }: {
      children?: React.ReactNode;
      channelId?: string;
      checkOnLoad?: boolean;
    }) => <Provider store={store}>{children}</Provider>;
    return renderHook(
      (props: {channelId: string | undefined; checkOnLoad: boolean}) =>
        useShareCheck(props.channelId, props.checkOnLoad),
      {wrapper, initialProps: {channelId, checkOnLoad}}
    );
  };
  const flush = () => act(async () => {});
  // A check whose answer the test gives later.
  const slowCheck = () => {
    let answer: (failure: ShareFailure | null) => void = () => {};
    mockFetchShareFailure.mockReturnValueOnce(
      new Promise(resolve => (answer = resolve))
    );
    return (failure: ShareFailure | null) => answer(failure);
  };
  const stored = () =>
    dispatchSpy.mock.calls
      .map(([action]) => action)
      .filter(action => action.type === setShareFailure(null).type)
      .map(action => action.payload);

  it('asks once as a level that checks on load opens, and stores the answer', async () => {
    const {rerender} = renderCheck('abc', true);
    await flush();
    rerender({channelId: 'abc', checkOnLoad: true});
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

    act(() => {
      store.dispatch({type: 'test/openShare'});
    });
    await flush();
    expect(mockFetchShareFailure).toHaveBeenCalledTimes(3);
  });

  it('stores an answer that arrives after the dialog has closed', async () => {
    renderCheck('abc', false);
    const answer = slowCheck();
    act(() => {
      store.dispatch({type: 'test/openShare'});
    });
    act(() => {
      store.dispatch({type: 'test/closeShare'});
    });
    answer(null);
    await flush();

    expect(stored()).toEqual([null]);
  });

  it('ignores an older answer that arrives after a newer one', async () => {
    const answerPageOpen = slowCheck();
    renderCheck('abc', true);
    const answerDialogOpen = slowCheck();
    act(() => {
      store.dispatch({type: 'test/openShare'});
    });
    answerDialogOpen(null);
    await flush();
    answerPageOpen(FAILURE);
    await flush();

    expect(stored()).toEqual([null]);
  });

  it('drops an answer for a project the lab has left', async () => {
    const answer = slowCheck();
    const {rerender} = renderCheck('abc', true);
    rerender({channelId: 'xyz', checkOnLoad: false});
    dispatchSpy.mockClear();
    answer(FAILURE);
    await flush();

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("finds out whether the viewer is the owner's teacher before storing a failure", async () => {
    mockFetchIsTeacher.mockResolvedValue(true);
    renderCheck('abc', true);
    await flush();

    expect(mockFetchIsTeacher).toHaveBeenCalledWith('abc');
    expect(dispatchSpy.mock.calls.map(([action]) => action)).toEqual([
      setIsTeacherOfProjectOwner(true),
      setShareFailure(FAILURE),
    ]);
  });

  it('stores the failure when the teacher lookup cannot be made', async () => {
    mockFetchIsTeacher.mockRejectedValue(new Error('offline'));
    renderCheck('abc', true);
    await flush();

    expect(dispatchSpy.mock.calls.map(([action]) => action)).toEqual([
      setIsTeacherOfProjectOwner(false),
      setShareFailure(FAILURE),
    ]);
  });

  it('does not ask about the teacher for a project with nothing flagged', async () => {
    mockFetchShareFailure.mockResolvedValue(null);
    renderCheck('abc', true);
    await flush();

    expect(mockFetchIsTeacher).not.toHaveBeenCalled();
    expect(stored()).toEqual([null]);
  });

  it('does not ask as a level that does not check on load opens', async () => {
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

  it('keeps the answer when the lab leaves the screen', async () => {
    const {unmount} = renderCheck('abc', true);
    await flush();
    dispatchSpy.mockClear();
    unmount();

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('clears the answer when the project changes', async () => {
    const {rerender} = renderCheck('abc', false);
    await flush();
    dispatchSpy.mockClear();
    rerender({channelId: 'xyz', checkOnLoad: false});

    expect(dispatchSpy).toHaveBeenCalledWith(setShareFailure(null));
  });

  it('leaves the project viewable when the check cannot be made', async () => {
    mockFetchShareFailure.mockRejectedValue(new Error('offline'));
    renderCheck('abc', true);
    await flush();

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  describe("while the share dialog's check is under way", () => {
    const pendingCalls = () =>
      dispatchSpy.mock.calls
        .map(([action]) => action)
        .filter(action => action.type === setShareCheckPending(true).type)
        .map(action => action.payload);

    it('holds the link back from the moment the dialog opens until the answer', async () => {
      renderCheck('abc', false);
      act(() => {
        store.dispatch({type: 'test/openShare'});
      });
      expect(pendingCalls()).toEqual([true]);

      await flush();
      expect(pendingCalls()).toEqual([true, false]);
      expect(dispatchSpy).toHaveBeenCalledWith(setShareFailure(FAILURE));
    });

    it('stops holding when the check cannot be made', async () => {
      mockFetchShareFailure.mockRejectedValue(new Error('offline'));
      renderCheck('abc', false);
      act(() => {
        store.dispatch({type: 'test/openShare'});
      });
      await flush();

      expect(pendingCalls()).toEqual([true, false]);
    });

    it('stops holding after the longest wait when the check is slow', () => {
      jest.useFakeTimers();
      mockFetchShareFailure.mockReturnValue(new Promise(() => {}));
      renderCheck('abc', false);
      act(() => {
        store.dispatch({type: 'test/openShare'});
      });
      act(() => {
        jest.advanceTimersByTime(SHARE_CHECK_MAX_WAIT_MS - 1);
      });
      expect(pendingCalls()).toEqual([true]);

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(pendingCalls()).toEqual([true, false]);
      jest.useRealTimers();
    });

    it('stops holding when the dialog closes before the answer', () => {
      mockFetchShareFailure.mockReturnValue(new Promise(() => {}));
      renderCheck('abc', false);
      act(() => {
        store.dispatch({type: 'test/openShare'});
      });
      act(() => {
        store.dispatch({type: 'test/closeShare'});
      });

      expect(pendingCalls()).toEqual([true, false]);
    });
  });
});

describe('checksOnLoad', () => {
  it('checks a project page as it loads', () => {
    expect(checksOnLoad({isProjectLevel: true})).toBe(true);
  });

  it('checks a level in a unit whose header offers Share and Remix', () => {
    expect(checksOnLoad({hideShareAndRemix: false})).toBe(true);
  });

  it('checks a level in a unit that ends in a finish dialog', () => {
    expect(
      checksOnLoad({hideShareAndRemix: true, finishDialog: 'hoai2026'})
    ).toBe(true);
  });

  it('waits for the share dialog on any other level in a unit', () => {
    expect(checksOnLoad({})).toBe(false);
    expect(checksOnLoad({hideShareAndRemix: true})).toBe(false);
  });
});
