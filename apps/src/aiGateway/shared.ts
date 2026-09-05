import AichatContextManager from '../aichat/aichatContextManager';
import DCDO from '../dcdo';
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

/**
 * DCDO key naming a gateway for this environment to use, so a dev or adhoc
 * deploy can point at a preview worker without a rebuild and without a URL
 * parameter on every page. Forwarded to the frontend by dcdo.rb's
 * frontend_config, which defaults it to production — so an unset key names
 * the normal place rather than leaving this to infer it, and the fallback
 * below only covers a page that never received the value at all.
 *
 * Same allowlist as the URL parameter. DCDO is server-controlled rather than
 * user-supplied, so this is not the exfiltration risk the parameter is — but
 * a typo that silently redirected an environment's AI traffic is its own
 * problem, and one validator for both sources is less to reason about.
 */
const GATEWAY_URL_DCDO_KEY = 'ai-gateway-url';

// So a playtest session says once where its traffic is going, without a line
// per request.
let announcedOverride: string | undefined;

/**
 * Validate one candidate gateway against the allowlist. Returns undefined,
 * loudly, for anything else: silently serving production while the URL or
 * DCDO says otherwise is how a playtest ends up measuring the wrong
 * deployment.
 */
function validateGatewayUrl(raw: string, source: string): string | undefined {
  const hostname = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[/?#].*$/, '');

  // Naming production explicitly is how a page gets back to production from
  // an environment whose DCDO points somewhere else.
  if (`https://${hostname}` === PRODUCTION_AI_GATEWAY_URL) {
    return PRODUCTION_AI_GATEWAY_URL;
  }
  if (!PREVIEW_HOSTNAME.test(hostname)) {
    console.warn(
      `[aiGateway] Ignoring gateway "${raw}" from ${source} — only ` +
        `*.code-org.workers.dev and ${PRODUCTION_AI_GATEWAY_URL} are ` +
        `accepted. Using production.`
    );
    return undefined;
  }
  // Rebuilt from the hostname alone, so a path, port, query, fragment or
  // embedded credentials in the value never reach the request.
  return `https://${hostname}`;
}

/**
 * The gateway this page talks to. In order: the `aiGatewayUrl` URL parameter,
 * the `ai-gateway-url` DCDO value for this environment, then production.
 *
 * The parameter is deliberately not persisted — no localStorage, no
 * experiment — so it has to be on the URL in front of you and a preview host
 * cannot outlive its deployment in someone's browser. Standing configuration
 * for a whole deploy belongs in DCDO instead, which is revertible without a
 * build and cannot be set by whoever sends you a link.
 */
export function getAiGatewayUrl(): string {
  let fromQuery: string | null = null;
  try {
    fromQuery = new URLSearchParams(window.location.search).get(
      GATEWAY_URL_PARAM
    );
  } catch {
    // No window (a test, a worker); production is the only sane answer.
    return PRODUCTION_AI_GATEWAY_URL;
  }
  if (fromQuery) {
    return announce(validateGatewayUrl(fromQuery, 'the page URL'));
  }

  const fromDcdo = DCDO.get(GATEWAY_URL_DCDO_KEY, PRODUCTION_AI_GATEWAY_URL);
  if (typeof fromDcdo === 'string' && fromDcdo) {
    return announce(validateGatewayUrl(fromDcdo, GATEWAY_URL_DCDO_KEY));
  }

  return PRODUCTION_AI_GATEWAY_URL;
}

function announce(url: string | undefined): string {
  if (!url || url === PRODUCTION_AI_GATEWAY_URL) {
    return PRODUCTION_AI_GATEWAY_URL;
  }
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
