import {describe, expect, it} from 'vitest';

import {
  SectionSchema,
  TeacherDashboardSectionsResponseSchema,
} from './sections.schemata';

import bootstrapSections from './__fixtures__/bootstrap-sections.json';
import sectionMergedProvider from './__fixtures__/section-merged-provider.json';
import sectionMergedScript from './__fixtures__/section-merged-script.json';
import sectionMergedScriptless from './__fixtures__/section-merged-scriptless.json';
import sectionMergedUnitGroup from './__fixtures__/section-merged-unit-group.json';

// Recorded server JSON (dashboardapi/section/:id merge), see design.md §6 (TDF-MSW-01).
const FIXTURES = {
  scriptless: sectionMergedScriptless,
  script: sectionMergedScript,
  unitGroup: sectionMergedUnitGroup,
  provider: sectionMergedProvider,
};

describe('SectionSchema against recorded merged section JSON', () => {
  it.each(Object.entries(FIXTURES))(
    'parses the %s fixture',
    (_name, fixture) => {
      const result = SectionSchema.safeParse(fixture);
      expect(
        result.success,
        JSON.stringify(result.success ? null : result.error.issues, null, 2),
      ).toBe(true);
    },
  );
});

// Recorded server JSON (GET /api/v1/teacher_dashboard/sections), F0-T1
// bootstrap-sections.json (TDF-MSW-02): 3 sections, non-null section_order.
describe('TeacherDashboardSectionsResponseSchema against recorded bootstrap JSON', () => {
  it('parses the bootstrap-sections fixture', () => {
    const result =
      TeacherDashboardSectionsResponseSchema.safeParse(bootstrapSections);
    expect(
      result.success,
      JSON.stringify(result.success ? null : result.error.issues, null, 2),
    ).toBe(true);
  });
});
