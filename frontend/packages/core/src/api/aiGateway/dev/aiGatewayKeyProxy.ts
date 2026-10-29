// A Vite plugin that stands in for the AI gateway with a developer's own
// Google key, which the browser never sees:
//
//   browser ──POST /__ai-gateway──▶ vite dev server ──▶ Gemini API
//                                    (holds GOOGLE_GENERATIVE_AI_API_KEY)
//
// Turn it on with VITE_AI_GATEWAY_URL=/__ai-gateway. It cannot ship: it runs
// only under `vite serve`, refuses production mode, reads the key from the
// Node process rather than import.meta.env (which Vite inlines into the
// bundle), and does not mount without a key. It runs none of the gateway's
// checks, and the access token still comes from dashboard or its mock.

import type {Plugin} from 'vite';

import {
  GEMINI_API_URL,
  type GatewayRequest,
  gatewayResponse,
  geminiRequest,
} from './gemini';

export const AI_GATEWAY_DEV_ROUTE = '/__ai-gateway';

export interface AiGatewayKeyProxyOptions {
  /** Where to find the key; GOOGLE_GENERATIVE_AI_API_KEY by default. */
  envVar?: string;
  /** Model ids to send in place of the ones asked for, e.g. Vertex-only ones. */
  models?: Record<string, string>;
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

export const aiGatewayKeyProxy = (
  options: AiGatewayKeyProxyOptions = {},
): Plugin => {
  const envVar = options.envVar ?? 'GOOGLE_GENERATIVE_AI_API_KEY';
  return {
    name: 'ai-gateway-key-proxy',
    apply: 'serve',
    configureServer(server) {
      const key = process.env[envVar];
      if (server.config.mode === 'production' || !key) {
        return;
      }
      server.middlewares.use(AI_GATEWAY_DEV_ROUTE, (req, res) => {
        const send = (status: number, body: object) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };
        if (req.method !== 'POST') {
          send(405, {error: 'POST only'});
          return;
        }
        readBody(req)
          .then(async text => {
            const request = JSON.parse(text) as GatewayRequest;
            const model = options.models?.[request.model] ?? request.model;
            const reply = await fetch(
              `${GEMINI_API_URL}/${encodeURIComponent(model)}:generateContent`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-goog-api-key': key,
                },
                body: JSON.stringify(geminiRequest(request)),
              },
            );
            const body = await reply.json();
            if (!reply.ok) {
              send(reply.status, {error: body});
              return;
            }
            send(200, gatewayResponse(request, body));
          })
          .catch(error => send(500, {error: String(error)}));
      });
    },
  };
};
