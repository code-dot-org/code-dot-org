import React from 'react';
import PropTypes from 'prop-types';
import {expect} from '../../util/reconfiguredChai';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {allowConsoleErrors} from '../../util/testUtils';
import {useFetch} from '@cdo/apps/util/useFetch';

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
    fetchSpy = sinon.stub(window, 'fetch');
    useFetchReturnValue.current = undefined;
  });

  afterEach(() => {
    fetchSpy.restore();
  });

  it('returns expected data on successful fetch', async () => {
    const expectedData = {name: 'Joe', age: 10};
    fetchSpy.returns(Promise.resolve({ok: true, json: () => expectedData}));

    mount(<UseFetchHarness url={'/'} options={{}} deps={[]} />);
    await processEventLoop();

    expect(fetchSpy).to.be.calledOnce;
    const {data, error} = useFetchReturnValue.current;
    expect(data).to.equal(expectedData);
    expect(error).to.be.null;
  });

  it('returns error on fetch error', async () => {
    fetchSpy.returns(Promise.reject('some network error'));

    mount(<UseFetchHarness url={'/'} options={{}} deps={[]} />);
    await processEventLoop();

    expect(fetchSpy).to.be.calledOnce;
    const {data, error} = useFetchReturnValue.current;
    expect(data).to.be.null;
    expect(error).to.be.not.null;
  });

  it('returns error on HTTP error', async () => {
    fetchSpy.returns(Promise.resolve({ok: false, status: 500}));

    mount(<UseFetchHarness url={'/'} options={{}} deps={[]} />);
    await processEventLoop();

    expect(fetchSpy).to.be.calledOnce;
    const {data, error} = useFetchReturnValue.current;
    expect(data).to.be.null;
    expect(error).to.be.not.null;
  });

  it('returns correct values for loading', async () => {
    let resolvePromise;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    fetchSpy.returns(promise);

    mount(<UseFetchHarness url={'/'} options={{}} deps={[]} />);
    await processEventLoop();

    expect(useFetchReturnValue.current.loading).to.be.true;

    const data = {};
    resolvePromise({ok: true, json: () => data});
    await processEventLoop();

    expect(useFetchReturnValue.current.loading).to.be.false;
  });
});
