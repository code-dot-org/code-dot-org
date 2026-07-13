// Pages served from a dedicated *.preview.codeprojects.org subdomain (Web Lab 2's
// HTML preview, Python Lab's pyodide sandbox) are isolated from studio.code.org's
// cookies/session, but still need to compute the studio.code.org origin they were
// loaded from, to validate and address postMessages back to their parent.
export function getOuterOrigin() {
  const regex = /[^.]+\.preview\.([^.]+)\.codeprojects\.org/;
  const match = location.hostname.match(regex);
  const environment = match && match[1] ? `${match[1]}-` : '';
  const port =
    'localhost-' === environment && location.port ? `:${location.port}` : '';
  const cdn = environment.includes('adhoc') ? 'cdn-' : '';
  return `${location.protocol}//${environment}studio.${cdn}code.org${port}`;
}
