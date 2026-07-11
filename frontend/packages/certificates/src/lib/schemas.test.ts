import {expect, it} from 'vitest';

import {CertificateCourseInfoSchema} from './schemas';

it('ignores additive course fields from a rolling deploy', () => {
  const course = {
    courseType: 'hoc' as const,
    durationHours: 1,
    localizedTitle: 'Hour of Code',
    prefilledTitle: true,
    templateFilename: 'hour_of_ai_certificate.png',
    unitGroupTitle: null,
  };

  expect(
    CertificateCourseInfoSchema.parse({...course, futureKey: true}),
  ).toEqual(course);
});
