// @vitest-environment jsdom
import {describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../../transports/types';
import {createSectionsApi} from '../sections.api';

function fakeTransport(result: unknown = undefined) {
  const request = vi.fn().mockResolvedValue(result);
  const transport = {request} as unknown as Transport;
  return {api: createSectionsApi(transport), request};
}

const WIRE_SECTION_SUMMARY = {
  id: 1,
  name: 'Period 1',
  code: 'ABCDEF',
  login_type: 'email',
  hidden: false,
  grades: ['3'],
  participant_type: 'student',
  studentCount: 1,
  course_display_name: 'Single-Unit Course 2026',
  courseVersionName: 'ui-test-single-unit-course-2026',
  unit_id: 42,
  unitPosition: 1,
  avatar_color: 0,
  avatar_emoji: 0,
  demo_type: null,
};

describe('createSectionsApi.listSections', () => {
  it('GETs /api/v1/sections and parses an empty array', async () => {
    const {api, request} = fakeTransport([]);

    const sections = await api.listSections();

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({method: 'GET', url: '/api/v1/sections'}),
    );
    expect(sections).toEqual([]);
  });

  it('parses a two-element array into camelCased SectionSummary objects', async () => {
    const second = {
      ...WIRE_SECTION_SUMMARY,
      id: 2,
      name: 'Period 2',
      code: null,
      course_display_name: null,
      courseVersionName: null,
      unit_id: null,
      unitPosition: null,
      studentCount: 0,
    };
    const {api} = fakeTransport([WIRE_SECTION_SUMMARY, second]);

    const sections = await api.listSections();

    expect(sections).toHaveLength(2);
    expect(sections[0]).toMatchObject({
      id: 1,
      name: 'Period 1',
      code: 'ABCDEF',
      loginType: 'email',
      hidden: false,
      grades: ['3'],
      participantType: 'student',
      studentCount: 1,
      courseDisplayName: 'Single-Unit Course 2026',
      courseVersionName: 'ui-test-single-unit-course-2026',
      unitId: 42,
      unitPosition: 1,
      avatarColor: 0,
      avatarEmoji: 0,
      demoType: null,
    });
    expect(sections[1]).toMatchObject({
      id: 2,
      code: null,
      courseDisplayName: null,
      unitId: null,
      studentCount: 0,
    });
  });

  it('rejects when an element is missing id', async () => {
    const missingId: Record<string, unknown> = {...WIRE_SECTION_SUMMARY};
    delete missingId.id;
    const {api} = fakeTransport([missingId]);

    await expect(api.listSections()).rejects.toThrow();
  });

  it('rejects when an element is missing name', async () => {
    const missingName: Record<string, unknown> = {...WIRE_SECTION_SUMMARY};
    delete missingName.name;
    const {api} = fakeTransport([missingName]);

    await expect(api.listSections()).rejects.toThrow();
  });
});
