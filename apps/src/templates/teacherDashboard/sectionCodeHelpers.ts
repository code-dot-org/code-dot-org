/**
 * Derives the provider course id to send to a roster import/sync endpoint
 * from a rostered section's code.
 *
 * Google Classroom (G-<id>) and Clever (C-<id>) codes are a prefix plus the
 * bare course id. ClassLink codes are CL-<TenantId>|<classSourcedId>, and
 * only the class sourcedId — everything after the first pipe — is sent: the
 * server derives the tenant from the signed-in user's own credential, never
 * from the client. The first-pipe split matters because a district-supplied
 * sourcedId may itself contain a pipe, while the ClassLink-assigned tenant id
 * cannot.
 */
export function courseIdFromSectionCode(sectionCode: string): string {
  if (sectionCode.startsWith('CL-')) {
    const rest = sectionCode.slice('CL-'.length);
    const pipeIndex = rest.indexOf('|');
    return pipeIndex === -1 ? rest : rest.slice(pipeIndex + 1);
  }
  return sectionCode.replace(/^[GC]-/, '');
}
