// A Vite plugin that holds the key, so the browser never does.
//
//   browser ──POST /__images/draw──▶ vite dev server ──▶ the provider
//                                     (holds OPENAI_API_KEY)
//
// Everything about it is arranged so it cannot ship, and the arrangement is
// copied deliberately from `@code-dot-org/aitutor`'s `dev/keyProxy` rather
// than reinvented:
//
//   - `apply: 'serve'` — Vite never runs this during a build, so there is no
//     path by which it ends up in a bundle.
//   - It refuses to mount for `mode === 'production'`, which is `vite preview`
//     and anything else that serves a built site.
//   - The key is read from the NODE PROCESS, never from `import.meta.env`.
//     Vite inlines the latter into the client bundle, which is the whole
//     accident this exists to prevent.
//   - No key means the drawing route does not mount at all — but the STATUS
//     route always does, because "a dev server with no key" and "not a dev
//     server" are different situations and the wizard treats them differently
//     (`generate/chooseImageGenerator`).
//
// IT RUNS NONE OF THE MODERATION A PRODUCT PATH WOULD. That is the difference
// between a developer trying something locally and a lab serving students, and
// it is why the transports do not share a name
// (specs/IMAGE_GENERATION.md).

import type {Plugin} from 'vite';

import {DEFAULT_IMAGE_MODEL, drawWithOpenAi} from './openai';
import {
  DRAW_ROUTE,
  STATUS_ROUTE,
  type DrawProxyRequest,
  type ImageProxyStatus,
} from './protocol';

export interface ImageProxyOptions {
  /**
   * Where to find the key. Defaults to `OPENAI_API_KEY`.
   *
   * Named rather than passed, so a key never appears in a config file that
   * somebody might commit.
   */
  envVar?: string;
  /** Overrides `WORLD_IMAGE_MODEL`, which overrides the provider default. */
  model?: string;
}

const readBody = (request: {
  on(event: string, handler: (chunk?: unknown) => void): void;
}): Promise<string> =>
  new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += String(chunk);
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });

export const imageKeyProxy = (options: ImageProxyOptions = {}): Plugin => {
  const envVar = options.envVar ?? 'OPENAI_API_KEY';

  return {
    name: 'world-image-key-proxy',
    // Dev server only. A build never calls this hook, so nothing here can be
    // bundled even by accident.
    apply: 'serve',

    configureServer(server) {
      const mode = server.config.mode;
      const apiKey = process.env[envVar];
      const model =
        options.model ?? process.env.WORLD_IMAGE_MODEL ?? DEFAULT_IMAGE_MODEL;

      const status: ImageProxyStatus =
        mode === 'production'
          ? {available: false, reason: 'not served in production mode'}
          : apiKey
            ? {available: true, model}
            : {available: false, reason: `${envVar} is not set`};

      // ALWAYS, even with no key: answering at all is what tells the lab it is
      // running in the harness, which is what lets it offer the fixture.
      server.middlewares.use(STATUS_ROUTE, (_request, response) => {
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify(status));
      });

      if (!status.available) {
        server.config.logger.info(`  ➜  Image drawing: off (${status.reason})`);
        return;
      }
      server.config.logger.info(`  ➜  Image drawing: ${model} via ${envVar}`);

      server.middlewares.use(DRAW_ROUTE, (request, response, next) => {
        if (request.method !== 'POST') {
          next();
          return;
        }
        void (async () => {
          response.setHeader('content-type', 'application/json');
          try {
            const asked = JSON.parse(
              await readBody(request),
            ) as DrawProxyRequest;
            // Narrowed by the guard above, which returns when there is no
            // key — the drawing route does not mount without one.
            const reply = await drawWithOpenAi(asked, apiKey as string, model);
            // The wizard gets words it can show; the terminal gets what the
            // provider actually said, because the developer who owns the key
            // is the only person who can act on it.
            if (reply.detail) {
              server.config.logger.error(
                `Image drawing: ${envVar} request failed — ${reply.detail}`,
              );
            }
            response.end(JSON.stringify(reply));
          } catch (error) {
            // A 200 carrying a failure, not a 500: the wizard renders an
            // attempt that came back empty and has nothing to do with an HTTP
            // status.
            const detail =
              error instanceof Error ? error.message : String(error);
            server.config.logger.error(`Image drawing: ${detail}`);
            response.end(
              JSON.stringify({
                pictures: [],
                failure: 'The drawing service could not be reached.',
                detail,
              }),
            );
          }
        })();
      });
    },
  };
};

export default imageKeyProxy;
