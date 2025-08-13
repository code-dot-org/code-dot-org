export function getSiteType() {
  return process.env.SITE_TYPE ?? 'corporate';
}
