/**
 * Host derivation for links that leave dashboard for pegasus.
 *
 * Dashboard and pegasus are separate hosts that share a deployment prefix:
 * studio.code.org pairs with code.org, test-studio.code.org with
 * test.code.org, localhost-studio.code.org:3000 with
 * localhost.code.org:3000. Dashboard renders a pegasus link from the server's
 * own CDO.code_org_url, so a test that hardcodes one deployment's host passes
 * only against that deployment.
 */

/**
 * Map a dashboard URL to the host of its paired pegasus deployment.
 *
 * Strips the "studio" label: a leading "studio." is dropped entirely, and a
 * "-studio" suffix on the first label is removed. The port is preserved, since
 * local deployments carry one.
 *
 * @param dashboardUrl absolute URL on a dashboard host, e.g. page.url()
 * @returns host (domain and port, no protocol), e.g. "test.code.org"
 */
export function pegasusHost(dashboardUrl: string): string {
  const {hostname, port} = new URL(dashboardUrl);
  const host = hostname.replace(/^studio\./, '').replace(/-studio\./, '.');
  return port ? `${host}:${port}` : host;
}
