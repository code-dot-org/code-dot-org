import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import {StudentServerData} from './types';

const formatServerData = (student: StudentServerData) => ({
  id: student.id,
  name: student.name,
  aiTutorAccessDenied: student.ai_tutor_access_denied,
});

export const handleUpdateAITutorAccess = async (
  userId: number,
  newAccess: boolean
) => {
  try {
    const response = await fetch(`/api/v1/users/${userId}/ai_tutor_access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify({ai_tutor_access: newAccess}),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.AI_TUTOR_UPDATE_USER_ACCESS_FAIL,
      errorMessage: JSON.stringify(error),
    });
    // We need to rethrow the error so that the toggle can revert to its original state.
    throw error;
  }
};

export const handleUpdateSectionAITutorEnabled = async (
  sectionId: number,
  newEnabled: boolean
) => {
  try {
    const response = await fetch(
      `/api/v1/sections/${sectionId}/ai_tutor_enabled`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': await getAuthenticityToken(),
        },
        body: JSON.stringify({ai_tutor_enabled: newEnabled}),
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.AI_TUTOR_UPDATE_SECTION_ACCESS_FAIL,
      errorMessage: JSON.stringify(error),
    });
    // We need to rethrow the error so that the toggle can revert to its original state.
    throw error;
  }
};

// Fetch students and whether they have access to AI Tutor or not.
export const fetchStudents = async (sectionId: number) => {
  try {
    const response = await fetch(
      `/dashboardapi/sections/${sectionId}/students`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': await getAuthenticityToken(),
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const studentData = await response.json();
    return studentData.map(formatServerData);
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.AI_TUTOR_CHAT_FETCH_FAIL,
      errorMessage: JSON.stringify(error),
    });
    throw error;
  }
};
