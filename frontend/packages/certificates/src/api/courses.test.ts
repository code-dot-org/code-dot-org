import {expect, it} from 'vitest';

import {CertificateCourseSchema} from './courses';

it('ignores additive fields from a rolling deploy', () => {
  const course = {
    courseKind: 'hoc' as const,
    durationHours: 1,
    localizedTitle: 'Hour of Code',
    prefilledTitle: true,
    resolution: 'matched' as const,
    templateFilename: 'hour_of_ai_certificate.png',
    unitGroupTitle: null,
  };

  expect(CertificateCourseSchema.parse({...course, futureKey: true})).toEqual(
    course,
  );
});
