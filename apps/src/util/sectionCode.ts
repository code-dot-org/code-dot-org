export const normalizeSectionCode = (sectionCode: string) =>
  sectionCode.replace(/\s/g, '').toUpperCase();
