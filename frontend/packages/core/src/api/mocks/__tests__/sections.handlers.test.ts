// Coverage for the teacher-dashboard sections MSW handlers (F0-T6): the two
// contracts this change owns (GET /api/v1/teacher_dashboard/sections, GET
// /dashboardapi/section/:id) plus the four registered scenario tags
// (TDF-MSW-03..06, scenario-registry.md).

import {afterAll, afterEach, beforeAll, describe, expect, it} from 'vitest';

import {
  SectionSchema,
  TeacherDashboardSectionsResponseSchema,
} from '../../dashboard/sections/sections.schemata';
import {clearActiveScenario, setActiveScenario} from '../index';
import {mockServer} from '../server';

const LAB_KEY = 'teacher-dashboard';

beforeAll(() => mockServer.listen({onUnhandledRequest: 'error'}));
afterEach(() => {
  mockServer.resetHandlers();
  clearActiveScenario();
});
afterAll(() => mockServer.close());

const getSections = () =>
  fetch('https://studio.code.org/api/v1/teacher_dashboard/sections');
const getSection = (id: number) =>
  fetch(`https://studio.code.org/dashboardapi/section/${id}`);

describe('default handlers (no scenario active)', () => {
  it('GET /api/v1/teacher_dashboard/sections parses as TeacherDashboardSectionsResponseSchema', async () => {
    const body = await (await getSections()).json();
    const result = TeacherDashboardSectionsResponseSchema.safeParse(body);
    expect(
      result.success,
      JSON.stringify(result.success ? null : result.error.issues, null, 2),
    ).toBe(true);
  });

  it('GET /dashboardapi/section/:id parses as SectionSchema', async () => {
    const body = await (await getSection(5)).json();
    const result = SectionSchema.safeParse(body);
    expect(
      result.success,
      JSON.stringify(result.success ? null : result.error.issues, null, 2),
    ).toBe(true);
  });
});

describe('sections-empty (TDF-MSW-03)', () => {
  it('returns an empty payload', async () => {
    setActiveScenario({labKey: LAB_KEY, tag: 'sections-empty'});
    const body = await (await getSections()).json();
    const result = TeacherDashboardSectionsResponseSchema.safeParse(body);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sections).toEqual([]);
      expect(result.data.section_order).toBeNull();
    }
  });
});

describe('sections-one (TDF-MSW-04)', () => {
  it('returns a single scriptless section', async () => {
    setActiveScenario({labKey: LAB_KEY, tag: 'sections-one'});
    const body = await (await getSections()).json();
    const result = TeacherDashboardSectionsResponseSchema.safeParse(body);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sections).toHaveLength(1);
      expect(result.data.sections[0].courseVersionName).toBeNull();
      expect(result.data.sections[0].unitName).toBeNull();
    }
  });
});

describe('sections-many-ordered (TDF-MSW-05)', () => {
  it('returns >=3 sections and a non-null section_order', async () => {
    setActiveScenario({labKey: LAB_KEY, tag: 'sections-many-ordered'});
    const body = await (await getSections()).json();
    const result = TeacherDashboardSectionsResponseSchema.safeParse(body);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sections.length).toBeGreaterThanOrEqual(3);
      expect(result.data.section_order).not.toBeNull();
    }
  });
});

describe('sections-archived-mixed (TDF-MSW-06)', () => {
  it('returns hidden:true and hidden:false entries', async () => {
    setActiveScenario({labKey: LAB_KEY, tag: 'sections-archived-mixed'});
    const body = await (await getSections()).json();
    const result = TeacherDashboardSectionsResponseSchema.safeParse(body);
    expect(result.success).toBe(true);
    if (result.success) {
      const hiddenFlags = result.data.sections.map(section => section.hidden);
      expect(hiddenFlags).toContain(true);
      expect(hiddenFlags).toContain(false);
    }
  });
});
