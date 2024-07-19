import {
  rateLimit,
  resetRateLimit,
  RATE_LIMIT,
  RATE_LIMIT_INTERVAL_MS,
} from '../../../src/storage/rateLimit';

const NO_OP = () => undefined;

describe('DatablockStorage', () => {
  beforeEach(() => {
    resetRateLimit();
  });
  afterEach(() => {
    resetRateLimit();
  });

  describe('rate limiting', () => {
    it('succeeds if calling less times than the rate limit', async () => {
      const now = Date.now();

      for (let i = 0; i < RATE_LIMIT; i++) {
        const time = now + i;
        await rateLimit(NO_OP, time);
      }
    });
    it('fails if called one more time than the rate limit', async () => {
      const now = Date.now();

      for (let i = 0; i < RATE_LIMIT; i++) {
        const time = now + i;
        await rateLimit(NO_OP, time);
      }

      // This should be over the rate limit
      await expect(rateLimit(NO_OP, now + RATE_LIMIT)).rejects.toThrow(Error);
    });
    it('it succeeds if called more than the rate limit, but after waiting rate limit interval', async () => {
      let now = Date.now();

      for (let i = 0; i < RATE_LIMIT; i++) {
        const time = now + i;
        await rateLimit(NO_OP, time);
      }

      now += RATE_LIMIT_INTERVAL_MS;
      for (let i = 0; i < RATE_LIMIT; i++) {
        const time = now + i;
        await rateLimit(NO_OP, time);
      }
    });
  });
});
