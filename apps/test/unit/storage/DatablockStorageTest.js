import {
  rateLimit,
  resetRateLimit,
  RATE_LIMIT,
  RATE_LIMIT_INTERVAL_MS,
} from '../../../src/storage/rateLimit';

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
      expect(() => rateLimit(now + RATE_LIMIT)).toThrow(Error);

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
});
