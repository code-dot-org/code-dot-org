import HttpClient from '@cdo/apps/util/HttpClient';

import {
  SectionCalendarPlan,
  SectionCalendarPlanResponse,
} from './calendarPlanTypes';

const jsonHeaders = {'Content-Type': 'application/json'};

function calendarPlanPath(
  sectionId: number,
  courseName: string,
  unitPosition: number
) {
  const query = new URLSearchParams({
    course_name: courseName,
    unit_position: unitPosition.toString(),
  });
  return `/dashboardapi/sections/${sectionId}/calendar_plan?${query}`;
}

export async function fetchSectionCalendarPlan(
  sectionId: number,
  courseName: string,
  unitPosition: number
): Promise<SectionCalendarPlanResponse> {
  const response = await HttpClient.fetchJson<SectionCalendarPlanResponse>(
    calendarPlanPath(sectionId, courseName, unitPosition)
  );
  return response.value;
}

export async function saveSectionCalendarPlan(
  plan: SectionCalendarPlan
): Promise<SectionCalendarPlanResponse> {
  const response = await HttpClient.put(
    calendarPlanPath(plan.sectionId, plan.courseName, plan.unitPosition),
    JSON.stringify({plan}),
    true,
    jsonHeaders
  );
  return response.json();
}

export async function resetSectionCalendarPlan(
  sectionId: number,
  courseName: string,
  unitPosition: number
): Promise<void> {
  await HttpClient.delete(
    calendarPlanPath(sectionId, courseName, unitPosition),
    true
  );
}
