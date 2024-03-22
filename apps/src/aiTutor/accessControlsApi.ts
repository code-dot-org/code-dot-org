import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import MetricsReporter from '@cdo/apps/lib/metrics/MetricsReporter';
import {MetricEvent} from '@cdo/apps/lib/metrics/events';
import {StudentAccessData} from './types';

const formatDataForToggle = (student: StudentAccessData) => {
  const studentDataForToggle: Record<string, any> = {};
  studentDataForToggle['id'] = student.id;
  studentDataForToggle['name'] = student.name;
  studentDataForToggle['aiTutorAccessDenied'] = student.aiTutorAccessDenied;
  return studentDataForToggle;
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
    const data = await response.json();
    const students = data.map(formatDataForToggle);
    return students;
  } catch (error) {
    //   MetricsReporter.logError({
    //     event: MetricEvent.AI_TUTOR_CHAT_FETCH_FAIL,
    //     errorMessage: error,
    //   });
  }
};
