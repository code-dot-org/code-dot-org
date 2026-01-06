import {isDevelopmentEnvironment, isTestEnvironment} from '@cdo/apps/utils';
import {
  AllowedFontHostnames,
  AllowedHostnameSuffixes,
  AllowedImageHostnameSuffixes,
} from '@cdo/generated-scripts/sharedConstants';

// This is copied from codeprojects_preview_controller.rb to enable setting a content security policy
// on the frontend. Explanation of the policy can be found there.
export function generateContentSecurityPolicyForPreview(codeStudioUrl: string) {
  const previewUrl = location.origin;
  // Chrome will block connecting to an http url from an https page, even with upgrade-insecure-requests.
  // Therefore we explicitly set the prefix to 'http', which will also allow https.
  const prefix = 'http://';
  const allowedConnectSrc = AllowedHostnameSuffixes.map(
    hostname => `${prefix}${hostname} ${prefix}*.${hostname}`
  ).join(' ');

  const allowedImageSrc = AllowedImageHostnameSuffixes.map(
    hostname => `${prefix}${hostname} ${prefix}*.${hostname}`
  ).join(' ');
  const allowedFontSrc = AllowedFontHostnames.map(
    hostname => `${prefix}${hostname} ${prefix}*.${hostname}`
  ).join(' ');

  const default_src = "'self' blob:";
  const connect_src = `'self' ${allowedConnectSrc}`;
  const script_src_base = "'self' blob:";
  const script_src_eval = "'unsafe-eval'";
  const script_src_inline = "'unsafe-inline'";
  const style_src_base = `'self' blob: ${allowedFontSrc}`;
  const style_src_inline = "'unsafe-inline'";
  const img_src = `'self' data: blob: ${codeStudioUrl} ${allowedImageSrc}`;
  const frame_ancestors = `${codeStudioUrl} 'self' ${previewUrl}`;
  const script_src = `${script_src_base} ${script_src_eval} ${script_src_inline}`;
  const style_src = `${style_src_base} ${style_src_inline}`;
  const font_src = `'self' ${allowedFontSrc}`;

  const policies = [
    `default-src ${default_src}`,
    `connect-src ${connect_src}`,
    `frame-ancestors ${frame_ancestors}`,
    `script-src ${script_src}`,
    `style-src ${style_src}`,
    `img-src ${img_src}`,
    `font-src ${font_src}`,
  ];

  if (!isDevelopmentEnvironment() || !isTestEnvironment()) {
    policies.push('upgrade-insecure-requests');
  }

  return policies.join('; ');
}
