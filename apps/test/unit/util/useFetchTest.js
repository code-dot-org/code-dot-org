import {act, waitFor} from '@testing-library/react';
import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import PropTypes from 'prop-types';
import React from 'react';

import {useFetch} from '@cdo/apps/util/useFetch';

import {allowConsoleErrors} from '../../util/testUtils';

// Functional react component to host the useFetch hook
let useFetchReturnValue = {current: null};
const UseFetchHarness = ({url, options, deps}) => {
  useFetchReturnValue.current = useFetch(url, options, deps);
  return null;
};

UseFetchHarness.propTypes = {
  url: PropTypes.string,
  options: PropTypes.object,
  deps: PropTypes.array,
};

// Convenience method; tests can use "await processEventLoop()" to wait for
// all items in the event loop to be processed.
const processEventLoop = () => new Promise(resolve => setTimeout(resolve, 0));

describe('useFetch', () => {
  allowConsoleErrors();

  let fetchSpy;

  beforeEach(() => {
    fetchSpy = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
    useFetchReturnValue.current = undefined;
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('returns expected data on successful fetch', async () => {
    const expectedData = {name: 'Joe', age: 10};
    fetchSpy.mockReturnValue(
      Promise.resolve({ok: true, json: () => expectedData})
    );

    await act(async () => {
      mount(<UseFetchHarness url={'/'} options={{}} deps={[]} />);
    });
    await processEventLoop();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const {data, error} = useFetchReturnValue.current;
    expect(data).toBe(expectedData);
    expect(error).toBeNull();
  });

  it('returns error on fetch error', async () => {
    fetchSpy.mockReturnValue(Promise.reject('some network error'));

    await act(async () => {
      mount(<UseFetchHarness url={'/'} options={{}} deps={[]} />);
    });
    await processEventLoop();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      const {data, error} = useFetchReturnValue.current;
      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });
  });

  it('returns error on HTTP error', async () => {
    fetchSpy.mockReturnValue(Promise.resolve({ok: false, status: 500}));

    await act(async () => {
      mount(<UseFetchHarness url={'/'} options={{}} deps={[]} />);
    });
    await processEventLoop();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const {data, error} = useFetchReturnValue.current;
    expect(data).toBeNull();
    expect(error).not.toBeNull();
  });

  it('returns correct values for loading', async () => {
    let resolvePromise;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    fetchSpy.mockReturnValue(promise);

    await act(async () => {
      mount(<UseFetchHarness url={'/'} options={{}} deps={[]} />);
    });
    await processEventLoop();

    expect(useFetchReturnValue.current.loading).toBe(true);

    const data = {};
    await act(async () => {
      resolvePromise({ok: true, json: () => data});
    });
    await processEventLoop();

    expect(useFetchReturnValue.current.loading).toBe(false);
  });

  it('returns correct values for empty url', async () => {
    await act(async () => {
      mount(<UseFetchHarness url={''} options={{}} deps={[]} />);
    });
    await processEventLoop();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(useFetchReturnValue.current.loading).toBe(false);
    const {data, error} = useFetchReturnValue.current;
    expect(data).toBeNull();
    expect(error).toBeNull();
  });

  it('returns a refetch function', async () => {
    const expectedData = {name: 'Joe', age: 10};
    fetchSpy.mockReturnValue(
      Promise.resolve({ok: true, json: () => expectedData})
    );

    await act(async () => {
      mount(<UseFetchHarness url={'/'} options={{}} deps={[]} />);
    });
    await processEventLoop();

    const {refetch} = useFetchReturnValue.current;
    expect(typeof refetch).toBe('function');
  });

  it('refetch triggers a new fetch request', async () => {
    const initialData = {name: 'Joe', age: 10};
    const refetchData = {name: 'Jane', age: 20};

    fetchSpy
      .mockReturnValueOnce(Promise.resolve({ok: true, json: () => initialData}))
      .mockReturnValueOnce(
        Promise.resolve({ok: true, json: () => refetchData})
      );

    await act(async () => {
      mount(<UseFetchHarness url={'/api/users'} options={{}} deps={[]} />);
    });
    await processEventLoop();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(useFetchReturnValue.current.data).toBe(initialData);

    await act(async () => {
      useFetchReturnValue.current.refetch();
    });
    await processEventLoop();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(useFetchReturnValue.current.data).toBe(refetchData);
  });
});
