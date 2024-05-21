import {expect} from '../../util/reconfiguredChai';
import {
  rateLimit,
  resetRateLimit,
  RATE_LIMIT,
  RATE_LIMIT_INTERVAL_MS,
} from '../../../src/storage/rateLimit';

import commonMsg from '@cdo/locale';
import applabMsg from '@cdo/applab/locale';
import sinon from 'sinon';
import commands from '@cdo/apps/applab/commands';
import storage from '@cdo/apps/storage/datablockStorage';
import Applab from '@cdo/apps/applab/applab';
import setupBlocklyGlobal from '../../util/setupBlocklyGlobal';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';

describe('DatablockStorage', () => {
  beforeEach(() => {
    resetRateLimit();
  });
  afterEach(() => {
    resetRateLimit();
  });

  describe('rate limiting', () => {
    it('succeeds if calling less times than the rate limit', done => {
      const now = Date.now();

      for (let i = 0; i < RATE_LIMIT; i++) {
        const time = now + i;
        rateLimit(time);
      }

      done();
    });
    it('fails if called one more time than the rate limit', done => {
      const now = Date.now();

      for (let i = 0; i < RATE_LIMIT; i++) {
        const time = now + i;
        rateLimit(time);
      }

      // This should be over the rate limit
      expect(() => rateLimit(now + RATE_LIMIT)).to.throw(Error);

      done();
    });
    it('it succeeds if called more than the rate limit, but after waiting rate limit interval', done => {
      let now = Date.now();

      for (let i = 0; i < RATE_LIMIT; i++) {
        const time = now + i;
        rateLimit(time);
      }

      now += RATE_LIMIT_INTERVAL_MS;
      for (let i = 0; i < RATE_LIMIT; i++) {
        const time = now + i;
        rateLimit(time);
      }
      done();
    });
  });

  describe('applab commands.js', () => {
    let _fetch;

    beforeEach(() => {
      _fetch = sinon.stub(storage, '_fetch').returns(true);

      stubRedux();

      Applab.init({
        useDatablockStorage: true,
        channel: 'bar',
        baseUrl: 'foo',
        skin: {},
        level: {
          editCode: 'foo',
        },
      });
    });

    afterEach(() => {
      _fetch.restore();
    });

    it('calls createRecord', async () => {
      const params = {table: 'test', record: {col1: 'success'}};
      commands.createRecord(params);
      sinon.assert.calledOnceWithExactly(
        _fetch,
        ...['create_record', 'PUT', params]
      );
    });
  });
});
