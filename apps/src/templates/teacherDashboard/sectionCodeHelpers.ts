// Strips the provider prefix from a rostered section code to get the id the
// roster import/sync endpoints expect. Google Classroom (G-<id>) and Clever
// (C-<id>) codes are the prefix plus the bare course id. ClassLink codes are
// CL-<TenantId>|<classSourcedId>; only the sourcedId is returned, since the
// server takes the tenant from the signed-in user's own credential. The split
// is on the first pipe only: a district-supplied sourcedId may itself contain
// a pipe, while the ClassLink-assigned tenant id cannot.
export function courseIdFromSectionCode(sectionCode: string): string {
  if (sectionCode.startsWith('CL-')) {
    const rest = sectionCode.slice('CL-'.length);
    const pipeIndex = rest.indexOf('|');
    return pipeIndex === -1 ? rest : rest.slice(pipeIndex + 1);
  }
  return sectionCode.replace(/^[GC]-/, '');
}
