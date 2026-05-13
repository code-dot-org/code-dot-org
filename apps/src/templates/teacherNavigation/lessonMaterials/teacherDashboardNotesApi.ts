import {
  AUTHENTICITY_TOKEN_HEADER,
  getAuthenticityToken,
} from '@cdo/apps/util/AuthenticityTokenStore';
import HttpClient from '@cdo/apps/util/HttpClient';

import {
  TeacherDashboardNote,
  TeacherDashboardNotePayload,
  TeacherDashboardNotesContexts,
  TeacherDashboardNotesResponse,
} from './teacherDashboardNotesTypes';

const API_PATH = '/dashboardapi/v1/teacher_dashboard_notes';

const jsonHeaders = async () => ({
  'Content-Type': 'application/json',
  [AUTHENTICITY_TOKEN_HEADER]: await getAuthenticityToken(),
});

const noteBody = (payload: TeacherDashboardNotePayload) =>
  JSON.stringify({teacherDashboardNote: payload});

export async function fetchTeacherDashboardNotes(
  contexts: TeacherDashboardNotesContexts
) {
  const query = new URLSearchParams({
    section_id: contexts.sectionId.toString(),
    unit_id: contexts.unitId.toString(),
  });

  if (contexts.unitGroupId) {
    query.set('unit_group_id', contexts.unitGroupId.toString());
  }

  if (contexts.lessonId) {
    query.set('lesson_id', contexts.lessonId.toString());
  }

  const response = await HttpClient.fetchJson<TeacherDashboardNotesResponse>(
    `${API_PATH}?${query.toString()}`
  );
  return response.value;
}

export async function createTeacherDashboardNote(
  payload: TeacherDashboardNotePayload
) {
  const response = await HttpClient.fetchJson<TeacherDashboardNote>(API_PATH, {
    method: 'POST',
    headers: await jsonHeaders(),
    body: noteBody(payload),
  });
  return response.value;
}

export async function updateTeacherDashboardNote(
  noteId: number,
  payload: TeacherDashboardNotePayload
) {
  const response = await HttpClient.fetchJson<TeacherDashboardNote>(
    `${API_PATH}/${noteId}`,
    {
      method: 'PATCH',
      headers: await jsonHeaders(),
      body: noteBody(payload),
    }
  );
  return response.value;
}

export async function deleteTeacherDashboardNote(noteId: number) {
  await HttpClient.delete(`${API_PATH}/${noteId}`, true);
}
