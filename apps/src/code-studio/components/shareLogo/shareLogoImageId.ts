// Must stay 'logo-img': legacy.scss sizes the share page's logo by this id,
// and _logo.html.haml gives the server-rendered logo the same one. In its own
// file so a lab can import it without ShareLogo's SVG imports.
export const SHARE_LOGO_IMAGE_ID = 'logo-img';
