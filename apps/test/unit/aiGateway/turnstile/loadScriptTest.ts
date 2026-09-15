import type {loadTurnstileScript as LoadTurnstileScript} from '@cdo/apps/aiGateway/turnstile/loadScript';

// loadTurnstileScript memoizes in module scope, so each test needs a fresh copy
// of the module rather than a reset helper.
const importFresh = (): typeof LoadTurnstileScript => {
  jest.resetModules();
  return require('@cdo/apps/aiGateway/turnstile/loadScript')
    .loadTurnstileScript;
};

const injectedScript = () =>
  document.head.querySelector('script') as HTMLScriptElement | null;

describe('loadTurnstileScript', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    delete (window as {turnstile?: unknown}).turnstile;
  });

  it('injects one script tag and reuses the promise while in flight', async () => {
    const loadTurnstileScript = importFresh();

    const first = loadTurnstileScript();
    const second = loadTurnstileScript();

    expect(second).toBe(first);
    expect(document.head.querySelectorAll('script')).toHaveLength(1);

    injectedScript()?.dispatchEvent(new Event('load'));
    await expect(first).resolves.toBeUndefined();
  });

  it('rejects with script_load_failed and removes the dead tag', async () => {
    const loadTurnstileScript = importFresh();

    const loading = loadTurnstileScript();
    injectedScript()?.dispatchEvent(new Event('error'));

    await expect(loading).rejects.toMatchObject({
      reason: 'script_load_failed',
    });
    expect(injectedScript()).toBeNull();
  });

  // The bug this guards: caching the rejection made one failed load permanent,
  // so every later caller replayed it instantly and no retry reached the network.
  it('retries on the next call instead of replaying a cached rejection', async () => {
    const loadTurnstileScript = importFresh();

    const failed = loadTurnstileScript();
    injectedScript()?.dispatchEvent(new Event('error'));
    await expect(failed).rejects.toMatchObject({reason: 'script_load_failed'});

    const retried = loadTurnstileScript();

    expect(retried).not.toBe(failed);
    expect(injectedScript()).not.toBeNull();

    injectedScript()?.dispatchEvent(new Event('load'));
    await expect(retried).resolves.toBeUndefined();
  });

  it('keeps serving a resolved load from cache without re-injecting', async () => {
    const loadTurnstileScript = importFresh();

    const first = loadTurnstileScript();
    injectedScript()?.dispatchEvent(new Event('load'));
    await first;

    document.head.innerHTML = '';
    await expect(loadTurnstileScript()).resolves.toBeUndefined();
    expect(injectedScript()).toBeNull();
  });
});
