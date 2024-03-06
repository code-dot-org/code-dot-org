import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import MetricsReporter from '@cdo/apps/lib/metrics/MetricsReporter';
import {MetricEvent} from '@cdo/apps/lib/metrics/events';
import {StudentAccessData} from './types';

const formatDataForToggle = (student: StudentAccessData) => {
  const studentDataForToggle = {};
  studentDataForToggle["id"] = student.id;
  studentDataForToggle["name"] = student.name 
  studentDataForToggle["aiTutorAccessDenied"] = student.ai_tutor_access_denied;
  console.log("studentDataForToggle", studentDataForToggle)
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
    });
    const data = await response.json();
    console.log('data: ', data);
    const students = data.map(formatDataForToggle);
    console.log("students in api", students)
    return students;
  } catch (error) {
    console.log('error: ', error);
    //   MetricsReporter.logError({
    //     event: MetricEvent.AI_TUTOR_CHAT_FETCH_FAIL,
    //     errorMessage: error,
    //   });
  }
};
