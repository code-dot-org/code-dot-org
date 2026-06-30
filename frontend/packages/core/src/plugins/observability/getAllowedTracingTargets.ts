import {getDashboardApiUrl} from '../../dashboard/getDashboardApiUrl';
import type {Environment} from '../../environment';

/**
 * Hosts and patterns allowed to receive Sentry tracing headers.
 *
 * Each regex pins the hostname tightly:
 *   - `^https://` anchors the scheme so userinfo (`https://target@evil/`)
 *     cannot smuggle a trusted hostname into another host's URL.
 *   - The terminator `(?:/|\?|#|$)` immediately after the hostname prevents
 *     suffix-injection attacks like `https://target.evil.example/`. We
 *     deliberately exclude `:` from the terminator — it would reopen the
 *     userinfo bypass via `https://target:port@evil.example`.
 *   - Subdomain wildcards use `[a-z0-9-]+` (a single DNS label) rather than
 *     `.*` so a path component like `/foo.workers.dev` cannot be mistaken
 *     for a hostname.
 *
 * Returning regexes (rather than strings) is also important. Sentry's
 * matching for string targets uses `String.prototype.ncludes`, so a string
 * like `https://studio.code.org` would match anywhere in a URL — including
 * paths and query strings of attacker-controlled hosts (e.g.
 * `https://evil.example/?next=https://studio.code.org`).
 */
export function getAllowedTracingTargets(
  environment: Environment,
): Array<RegExp> {
  return [dashboardTarget(environment), aiGatewayTarget];
}

const HOST_TERMINATOR = '(?:/|\\?|#|$)';

const aiGatewayTarget =
  /^https:\/\/(?:ai-gateway\.code\.org|[a-z0-9-]+\.code-org\.workers\.dev)(?:\/|\?|#|$)/;

function dashboardTarget(environment: Environment): RegExp {
  if (environment === 'adhoc') {
    return /^https:\/\/[a-z0-9-]+\.cdn-code\.org(?:\/|\?|#|$)/;
  }
  return new RegExp(
    `^${escapeRegex(getDashboardApiUrl(environment))}${HOST_TERMINATOR}`,
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
