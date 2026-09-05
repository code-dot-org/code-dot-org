import AichatContextManager from '../aichat/aichatContextManager';
import HttpClient from '../util/HttpClient';

import {
  parseTurnstileEnforcementMode,
  type TurnstileEnforcementMode,
} from './turnstile/enforcementMode';

export const PRODUCTION_AI_GATEWAY_URL = 'https://ai-gateway.code.org';

/**
 * Hostnames a gateway override may name. Preview deployments of the worker
 * live on the org's own Cloudflare account subdomain, and only a worker
 * deployed to that account can hold such a hostname — which is the whole
 * reason it is safe to take one from the page URL. A gateway request carries
 * a signed JWT for the current user together with their prompt, so an
 * override that accepted any host would be an exfiltration link: send someone
 * a level URL, collect their token and what they typed.
 *
 * Anchored at both ends on purpose. `evil.com/x.code-org.workers.dev` and
 * `foo.code-org.workers.dev.evil.com` are the two shapes this has to refuse.
 */
const PREVIEW_HOSTNAME = /^[a-z0-9][a-z0-9-]*\.code-org\.workers\.dev$/;

const GATEWAY_URL_PARAM = 'aiGatewayUrl';

// So a playtest session says once where its traffic is going, without a line
// per request.
let announcedOverride: string | undefined;

/**
 * The gateway this page talks to: production, unless the URL names a preview
 * deployment on the org's Cloudflare subdomain.
 *
 * Deliberately not persisted — no localStorage, no experiment. The parameter
 * has to be on the URL you are looking at, so closing the tab or dropping it
 * from the address bar puts you back on production immediately. A stale
 * preview URL outliving its deployment is a worse failure than retyping the
 * parameter.
 *
 * Accepts `?aiGatewayUrl=https://name.code-org.workers.dev` or the bare
 * hostname. Only the hostname is ever used: the URL is rebuilt from it, so a
 * path, port, query, fragment or embedded credentials in the supplied value
 * cannot reach the request.
 */
export function getAiGatewayUrl(): string {
  let raw: string | null = null;
  try {
    raw = new URLSearchParams(window.location.search).get(GATEWAY_URL_PARAM);
  } catch {
    // No window (a test, a worker); production is the only sane answer.
    return PRODUCTION_AI_GATEWAY_URL;
  }
  if (!raw) {
    return PRODUCTION_AI_GATEWAY_URL;
  }

  const hostname = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[/?#].*$/, '');

  if (!PREVIEW_HOSTNAME.test(hostname)) {
    // Loud: silently serving production while the URL says otherwise is how a
    // playtest ends up measuring the wrong deployment.
    console.warn(
      `[aiGateway] Ignoring ${GATEWAY_URL_PARAM}=${raw} — only ` +
        `*.code-org.workers.dev is accepted. Using production.`
    );
    return PRODUCTION_AI_GATEWAY_URL;
  }

  const url = `https://${hostname}`;
  if (announcedOverride !== url) {
    announcedOverride = url;
    console.info(`[aiGateway] Using gateway override ${url}`);
  }
  return url;
}

/** Wire payloads carry binary as base64; every caller wants the bytes. */
export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  return Uint8Array.from(binaryString, char => char.charCodeAt(0));
};

export interface GatewayAccessToken {
  /** Signed RS256 JWT, valid for one minute, sent with the gateway request. */
  token: string;
  /**
   * Whether this request must carry a Turnstile token. Resolved server-side and
   * also embedded as a claim in `token`, so the browser's decision and the
   * worker's enforcement always come from the same value.
   */
  turnstileEnforcementMode: TurnstileEnforcementMode;
}

export async function fetchAccessToken(): Promise<GatewayAccessToken> {
  const response = await HttpClient.post(
    '/ai_gateway/access_token',
    JSON.stringify({
      aichatContext: AichatContextManager.getContext(),
    }),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );
  // turnstileEnforcementMode is deliberately typed as unknown rather than asserted: it is
  // absent from servers predating the flag, and parseTurnstileEnforcementMode is what
  // turns anything unexpected into a safe default.
  const value = (await response.json()) as {
    token: string;
    turnstileEnforcementMode?: unknown;
  };
  return {
    token: value.token,
    turnstileEnforcementMode: parseTurnstileEnforcementMode(
      value.turnstileEnforcementMode
    ),
  };
}

export function getModelString(model: unknown) {
  let modelString: string;

  if (typeof model === 'string') {
    modelString = model;
  } else {
    const safeModel = model as unknown as Record<string, unknown>;
    if (
      safeModel !== null &&
      typeof safeModel === 'object' &&
      typeof safeModel.modelId === 'string'
    ) {
      modelString = safeModel.modelId;
    } else {
      throw new Error('Invalid model provided to Gateway.');
    }
  }
  return modelString;
}
