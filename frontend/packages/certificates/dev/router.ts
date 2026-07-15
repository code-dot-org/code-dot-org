// Hand-rolled, dev-harness-only route matcher. The product routes live in the
// studio TanStack route tree (frontend/apps/studio/src/routes).

export type CertificateRouteKind =
  | 'home'
  | 'share'
  | 'blank'
  | 'batch'
  | 'print'
  | 'congrats'
  | 'not-found';

export interface CertificateRouteMatch {
  encodedParams?: string;
  kind: CertificateRouteKind;
  search: URLSearchParams;
}

export interface CertificateScenario {
  id: string;
  kind: CertificateRouteKind;
  notes: string;
  url: string;
}

export function matchCertificateRoute(
  pathname: string,
  search = '',
): CertificateRouteMatch {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  if (normalizedPath === '/') {
    return {kind: 'home', search: new URLSearchParams(search)};
  }

  if (normalizedPath === '/certificates/blank') {
    return {kind: 'blank', search: new URLSearchParams(search)};
  }

  if (normalizedPath === '/certificates/batch') {
    return {kind: 'batch', search: new URLSearchParams(search)};
  }

  if (normalizedPath === '/congrats') {
    return {kind: 'congrats', search: new URLSearchParams(search)};
  }

  const shareMatch = normalizedPath.match(/^\/certificates\/([^/]+)$/);
  if (shareMatch) {
    return {
      encodedParams: shareMatch[1],
      kind: 'share',
      search: new URLSearchParams(search),
    };
  }

  const printMatch = normalizedPath.match(/^\/print_certificates\/([^/]+)$/);
  if (printMatch) {
    return {
      encodedParams: printMatch[1],
      kind: 'print',
      search: new URLSearchParams(search),
    };
  }

  return {kind: 'not-found', search: new URLSearchParams(search)};
}
