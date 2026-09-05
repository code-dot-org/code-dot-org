import {type Page} from '@playwright/test';

import {requestWithCsrf} from './api';

export type SectionParticipantType = 'student' | 'teacher' | 'facilitator';

export interface CreatedSection {
  sectionCode: string;
  sectionUrl: string;
}

/**
 * Create an email-login section for the signed-in teacher, mirroring
 * section_management_steps.rb. The page must already be on the target host
 * under the teacher's session, so the CSRF token is theirs.
 */
export async function createSection(
  page: Page,
  {
    participantType = 'student',
  }: {participantType?: SectionParticipantType} = {},
): Promise<CreatedSection> {
  const grade = participantType === 'student' ? 'Other' : 'pl';
  const {ok, status, body} = await requestWithCsrf(
    page,
    'POST',
    '/dashboardapi/sections',
    {login_type: 'email', participant_type: participantType, grade},
  );
  if (!ok) {
    throw new Error(`sections POST failed: ${status}`);
  }
  const {code: sectionCode} = JSON.parse(body) as {code: string};
  return {sectionCode, sectionUrl: `/join/${sectionCode}`};
}

/**
 * Join a section through the UI rather than POST /join, so the real
 * enrollment flow runs. The joining account's session must already be current.
 */
export async function joinSection(
  page: Page,
  sectionUrl: string,
): Promise<void> {
  await page.goto(sectionUrl);
  await page.getByRole('button', {name: 'Join', exact: true}).click();
  await page.waitForURL(url => url.pathname === '/home');
}

/**
 * Assign the currently signed-in student to a course/unit via
 * /api/test/assign_course_and_unit_as_student, mirroring steps.rb's "I am
 * assigned to course ... unit ..." step. When no teacherEmail is given, the
 * endpoint creates a brand-new teacher and section of its own to hold the
 * assignment — it is not the student's existing section's teacher.
 */
export async function assignCourseAndUnitAsStudent(
  page: Page,
  {
    courseName,
    unitPosition,
    teacherEmail,
  }: {courseName: string; unitPosition: number; teacherEmail?: string},
): Promise<void> {
  const {ok, status} = await requestWithCsrf(
    page,
    'POST',
    '/api/test/assign_course_and_unit_as_student',
    {
      course_name: courseName,
      unit_position: unitPosition,
      teacher_email: teacherEmail,
    },
  );
  if (!ok) {
    throw new Error(`assign_course_and_unit_as_student failed: ${status}`);
  }
}
