// A Vite plugin that holds the key, so the browser never does.
//
//   browser ──POST /__tutor/complete──▶ vite dev server ──▶ api.anthropic.com
//                                        (holds ANTHROPIC_API_KEY)
//
// Everything about it is arranged so it cannot ship (specs/PLAN.md §7):
//
//   - `apply: 'serve'` — Vite never runs it during a build, so there is no
//     path by which it ends up in a bundle.
//   - It refuses to mount for `mode === 'production'` even under `serve`,
//     which is `vite preview` and anything else that serves a built site.
//   - The key is read from the NODE PROCESS, never from `import.meta.env`.
//     Vite inlines the latter into the client bundle, which is the whole
//     accident this exists to prevent.
//   - No key means it does not mount at all, and `/__tutor/status` says so.
//     Silence would read as a broken tutor rather than a missing key.
//
// It runs NONE of the moderation the dashboard path runs. That is the
// difference between a developer trying something locally and a product serving
// students, and it is why the two transports do not share a name.

import type {Plugin} from 'vite';

import {askAnthropic, DEFAULT_MODEL} from './anthropic';
import {
  COMPLETE_ROUTE,
  STATUS_ROUTE,
  type ProxyRequest,
  type ProxyStatus,
} from './protocol';

export interface KeyProxyOptions {
  /**
   * Where to find the key. Defaults to `ANTHROPIC_API_KEY`.
   *
   * Named rather than passed, so a key never appears in a config file that
   * somebody might commit.
   */
  envVar?: string;
  /** Overrides `TUTOR_MODEL`, which overrides {@link DEFAULT_MODEL}. */
  model?: string;
}

const readBody = (request: {
  on(event: string, handler: (chunk?: unknown) => void): void;
}): Promise<string> =>
  new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });

export const tutorKeyProxy = (options: KeyProxyOptions = {}): Plugin => {
  const envVar = options.envVar ?? 'ANTHROPIC_API_KEY';

  return {
    name: 'aitutor-key-proxy',
    // Dev server only. A build never calls this hook, so nothing here can be
    // bundled even by accident.
    apply: 'serve',

    configureServer(server) {
      const mode = server.config.mode;
      const apiKey = process.env[envVar];
      const model = options.model ?? process.env.TUTOR_MODEL ?? DEFAULT_MODEL;

      const status: ProxyStatus =
        mode === 'production'
          ? {available: false, reason: 'not served in production mode'}
          : apiKey
            ? {available: true, model}
            : {available: false, reason: `${envVar} is not set`};

      server.middlewares.use(STATUS_ROUTE, (_request, response) => {
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify(status));
      });

      if (!status.available) {
        server.config.logger.info(
          `  ➜  AI Tutor proxy: off (${status.reason})`,
        );
        return;
      }
      server.config.logger.info(`  ➜  AI Tutor proxy: ${model} via ${envVar}`);

      server.middlewares.use(COMPLETE_ROUTE, (request, response, next) => {
        if (request.method !== 'POST') {
          next();
          return;
        }
        void (async () => {
          response.setHeader('content-type', 'application/json');
          try {
            const body = JSON.parse(await readBody(request)) as ProxyRequest;
            const reply = await askAnthropic(
              body,
              apiKey as string,
              body.model ?? model,
            );
            // The panel gets a status it has copy for; the terminal gets what
            // the provider actually said, because the developer who owns the
            // key is the only person who can act on it.
            if (reply.detail) {
              server.config.logger.error(
                `AI Tutor proxy: ${envVar} request failed — ${reply.detail}`,
              );
            } else if (!reply.text && reply.structured === undefined) {
              // A 200 with nothing in it. The panel now shows an error rather
              // than nothing at all, but only the terminal can say WHY —
              // usually a model that answered in a block shape this proxy does
              // not read, or a schema the provider rejected silently.
              server.config.logger.warn(
                'AI Tutor proxy: the model answered with no text and no tool ' +
                  'call. Set TUTOR_DEBUG=1 to log the whole response.',
              );
            }
            if (process.env.TUTOR_DEBUG) {
              server.config.logger.info(
                `AI Tutor proxy: ${JSON.stringify(reply).slice(0, 2000)}`,
              );
            }
            response.end(JSON.stringify(reply));
          } catch (error) {
            // A 200 carrying a failure, not a 500: the panel renders a failed
            // turn and has nothing to do with an HTTP status. The message goes
            // to the terminal, where the developer who owns the key is looking.
            const message = (error as Error).message;
            server.config.logger.error(`AI Tutor proxy: ${message}`);
            response.end(
              JSON.stringify({text: '', failure: 'error', detail: message}),
            );
          }
        })();
      });
    },
  };
};

export default tutorKeyProxy;
