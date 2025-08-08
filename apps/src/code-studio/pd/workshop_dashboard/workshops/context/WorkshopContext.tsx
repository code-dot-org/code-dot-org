import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import {useParams} from 'react-router-dom';

import {Workshop} from '../../WorkshopFormTemplate/types';
import {WorkshopContextValue, WorkshopData, WorkshopEnrollment} from '../types';

const WorkshopContext = createContext<WorkshopContextValue | null>(null);

export const useWorkshopContext = (): WorkshopContextValue => {
  const context = useContext(WorkshopContext);
  if (!context) {
    throw new Error(
      'useWorkshopContext must be used within a WorkshopProvider'
    );
  }
  return context;
};

interface WorkshopProviderProps {
  children: ReactNode;
}

// Transform Workshop API response to WorkshopData for display components
export const transformWorkshopData = (apiData: Workshop): WorkshopData => ({
  id: apiData.id,
  state: apiData.state,
  timeZone: apiData.time_zone,
  name: apiData.name,
  course: apiData.course,
  subject: apiData.subject,
  courseOfferingNames: apiData.course_offering_names,
  sessions: apiData.sessions.map(session => ({
    id: session.id,
    start: session.start,
    end: session.end,
    sessionFormat: session.session_format,
    locationName: session.location_name,
    locationAddress: session.location_address,
    meetingLink: session.meeting_link,
    code: session.code,
    showLink: session['show_link?'] ?? false,
    attendanceCount: session.attendance_count,
  })),
  facilitators: apiData.facilitators.map(facilitator => ({
    id: facilitator.id,
    name: facilitator.name,
    email: facilitator.email,
  })),
  regionalPartnerName: apiData.regional_partner_name,
  accountRequiredForAttendance:
    apiData['account_required_for_attendance?'] ?? false,
  readyToClose: apiData['ready_to_close?'] ?? false,
  registrationLink: apiData.registration_link,
  createdAt: apiData.created_at,
  enrolledTeacherCount: apiData.enrolled_teacher_count,
  hidden: apiData.hidden,
});

export const WorkshopProvider: React.FC<WorkshopProviderProps> = ({
  children,
}) => {
  const {workshopId} = useParams<{workshopId: string}>();
  const [workshop, setWorkshop] = useState<WorkshopData | null>(null);
  const [enrollments, setEnrollments] = useState<WorkshopEnrollment[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkshop = useCallback(async () => {
    if (!workshopId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/pd/workshops/${workshopId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch workshop: ${response.status}`);
      }

      const data = await response.json();
      const transformedData = transformWorkshopData(data);
      setWorkshop(transformedData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load workshop data'
      );
      setWorkshop(null);
    } finally {
      setLoading(false);
    }
  }, [workshopId]);

  const loadEnrollments = useCallback(async () => {
    if (!workshopId) return;

    setLoadingEnrollments(true);

    try {
      const response = await fetch(
        `/api/v1/pd/workshops/${workshopId}/enrollments`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch enrollments: ${response.status}`);
      }

      const data = await response.json();
      setEnrollments(data);
    } catch (err) {
      console.error('Failed to load enrollments:', err);
    } finally {
      setLoadingEnrollments(false);
    }
  }, [workshopId]);

  // Load data when component mounts or workshopId changes
  useEffect(() => {
    loadWorkshop();
  }, [loadWorkshop]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  const contextValue: WorkshopContextValue = {
    workshop,
    enrollments,
    loading,
    loadingEnrollments,
    error,
    loadWorkshop,
    loadEnrollments,
  };

  return (
    <WorkshopContext.Provider value={contextValue}>
      {children}
    </WorkshopContext.Provider>
  );
};
