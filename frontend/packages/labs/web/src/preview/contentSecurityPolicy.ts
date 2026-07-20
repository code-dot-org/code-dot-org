// The content-security policy the project service worker applies when serving
// student pages. Ported from
// apps/src/weblab2/htmlPreview/contentSecurityPolicyHelper.ts, which is itself a
// copy of dashboard's codeprojects_preview_controller.rb — any change here
// should be mirrored there. Scripts are allowed/denied on the frontend (not the
// server) so predict levels can disable them per level.
//
// The allow-lists legacy pulls from `@cdo/generated-scripts/sharedConstants`
// (AllowedHostnameSuffixes / AllowedImageHostnameSuffixes / AllowedFontHostnames)
// are host configuration, not something this package can generate. They arrive
// through {@link PreviewPolicyHosts} so the host supplies its own; the defaults
// below are empty, which yields a strictly-'self' policy.

export interface PreviewPolicyHosts {
  /** Hostname suffixes student code may `connect-src` to. */
  connect?: string[];
  /** Hostname suffixes student code may load images from. */
  image?: string[];
  /** Hostnames student code may load fonts from. */
  font?: string[];
}

export interface PreviewPolicyOptions {
  /** The studio origin embedding the preview; allowed to frame it. */
  codeStudioUrl: string;
  /** False on predict levels, where student scripts must not run. */
  scriptsAllowed: boolean;
  /** The preview's own origin (defaults to this page's). */
  previewOrigin?: string;
  hosts?: PreviewPolicyHosts;
  /** Adds `upgrade-insecure-requests`; off for local development. */
  upgradeInsecureRequests?: boolean;
}

const expand = (hostnames: string[] = []) =>
  hostnames
    .map(hostname => `http://${hostname} http://*.${hostname}`)
    .join(' ');

export function generateContentSecurityPolicyForPreview({
  codeStudioUrl,
  scriptsAllowed,
  previewOrigin = location.origin,
  hosts = {},
  upgradeInsecureRequests = false,
}: PreviewPolicyOptions): string {
  const allowedConnectSrc = expand(hosts.connect);
  const allowedImageSrc = expand(hosts.image);
  const allowedFontSrc = expand(hosts.font);

  const policies = [
    `default-src 'self' blob:`,
    `connect-src 'self' ${allowedConnectSrc}`.trim(),
    `frame-ancestors ${codeStudioUrl} 'self' ${previewOrigin}`,
    `script-src ${
      scriptsAllowed ? `'self' blob: 'unsafe-eval' 'unsafe-inline'` : `'none'`
    }`,
    `style-src 'self' blob: ${allowedFontSrc} 'unsafe-inline'`.replace(
      /\s+/g,
      ' ',
    ),
    `img-src 'self' blob: ${codeStudioUrl} ${allowedImageSrc}`.trim(),
    `font-src 'self' ${allowedFontSrc}`.trim(),
    `form-action 'none'`,
  ];

  if (upgradeInsecureRequests) {
    policies.push('upgrade-insecure-requests');
  }

  return policies.join('; ');
}
