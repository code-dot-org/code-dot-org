import {RedisStringsHandler} from '@trieb.work/nextjs-turbo-redis-cache';

/**
 * @typedef {import('@trieb.work/nextjs-turbo-redis-cache').RedisStringsHandler} RedisStringsHandler
 */
class RedisCacheHandler {
  cachedHandler;

  constructor() {
    const isRedisCacheEnabled =
      process.env.REDIS_URL && process.env.NODE_ENV === 'production';

    if (isRedisCacheEnabled) {
      console.debug(`Using Redis cache`);
      this.cachedHandler = new RedisStringsHandler({
        database: 0,
        keyPrefix: 'marketing-sites::',
        sharedTagsKey: '__sharedTags__',
        // Enable TLS if the REDIS_URL starts with 'rediss://'
        ...(process.env.REDIS_URL.startsWith('rediss://')
          ? {
              socketOptions: {
                tls: true,
              },
            }
          : undefined),
      });
    } else {
      console.warn('Redis cache disabled, using no-op handler');
      // Create a no-op handler if Redis is disabled
      this.cachedHandler = {
        get: async () => null,
        set: async () => {},
        revalidateTag: async () => {},
        resetRequestCache: async () => {},
      };
    }
  }

  /**
   * @param {...Parameters<RedisStringsHandler['get']>} args
   * @returns {ReturnType<RedisStringsHandler['get']>}
   */
  get(...args) {
    return this.cachedHandler.get(...args);
  }

  /**
   * @param {...Parameters<RedisStringsHandler['set']>} args
   * @returns {ReturnType<RedisStringsHandler['set']>}
   */
  set(...args) {
    return this.cachedHandler.set(...args);
  }

  /**
   * @param {...Parameters<RedisStringsHandler['revalidateTag']>} args
   * @returns {ReturnType<RedisStringsHandler['revalidateTag']>}
   */
  revalidateTag(...args) {
    return this.cachedHandler.revalidateTag(...args);
  }

  /**
   * @param {...Parameters<RedisStringsHandler['resetRequestCache']>} args
   * @returns {ReturnType<RedisStringsHandler['resetRequestCache']>}
   */
  resetRequestCache(...args) {
    return this.cachedHandler.resetRequestCache(...args);
  }
}

export default RedisCacheHandler;
