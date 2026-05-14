// Thin wrappers around our Rails AiLessonsController.

import HttpClient from '@cdo/apps/util/HttpClient';

import {LessonPlan} from './types';

const JSON_HEADERS = {'Content-Type': 'application/json'};

export async function createLesson(lesson: LessonPlan): Promise<string> {
  const response = await HttpClient.post(
    '/ai_lessons',
    JSON.stringify(lesson),
    true,
    JSON_HEADERS
  );
  const data = (await response.json()) as {id: string};
  return data.id;
}

export async function updateLesson(
  id: string,
  lesson: LessonPlan
): Promise<void> {
  await HttpClient.put(
    `/ai_lessons/${id}`,
    JSON.stringify(lesson),
    true,
    JSON_HEADERS
  );
}

export async function loadLesson(id: string): Promise<LessonPlan> {
  const response = await HttpClient.get(`/ai_lessons/${id}.json`, false, {});
  return (await response.json()) as LessonPlan;
}

export async function deleteLesson(id: string): Promise<void> {
  await HttpClient.delete(`/ai_lessons/${id}`, true);
}
