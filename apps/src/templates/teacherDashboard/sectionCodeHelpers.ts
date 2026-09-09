// ClassLink splits on the first pipe only: a district-supplied sourcedId may
// itself contain a pipe, while the ClassLink-assigned tenant id cannot.
export function courseIdFromSectionCode(sectionCode: string): string {
  if (sectionCode.startsWith('CL-')) {
    const rest = sectionCode.slice('CL-'.length);
    const pipeIndex = rest.indexOf('|');
    return pipeIndex === -1 ? rest : rest.slice(pipeIndex + 1);
  }
  return sectionCode.replace(/^[GC]-/, '');
}
