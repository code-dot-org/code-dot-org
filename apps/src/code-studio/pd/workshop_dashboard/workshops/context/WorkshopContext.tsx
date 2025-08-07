import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import {useParams} from 'react-router-dom';

import {WorkshopContextValue, WorkshopData, EnrollmentData} from '../types';

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

// API response types (matching the actual API structure)
interface ApiWorkshopSession {
  id: string;
  start: string;
  end: string;
  session_format: string;
  location_name?: string;
  code?: string;
  'show_link?': boolean;
  attendance_count: number;
}

interface ApiWorkshopData {
  id: string;
  state: 'Not Started' | 'In Progress' | 'Ended';
  time_zone: string;
  name: string;
  course: string;
  subject: string;
  course_offering_names: string;
  sessions: ApiWorkshopSession[];
  facilitators: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  regional_partner_name: string;
  'account_required_for_attendance?': boolean;
  'ready_to_close?': boolean;
  registration_link?: string;
  created_at: string;
  enrolled_teacher_count?: number;
  hidden?: boolean;
}

// Helper function to transform API response to our clean types
const transformWorkshopData = (apiData: ApiWorkshopData): WorkshopData => ({
  id: apiData.id,
  state: apiData.state,
  timeZone: apiData.time_zone,
  name: apiData.name,
  course: apiData.course,
  subject: apiData.subject,
  courseOfferingNames: apiData.course_offering_names,
  sessions:
    apiData.sessions?.map((session: ApiWorkshopSession) => ({
      id: session.id,
      start: session.start,
      end: session.end,
      sessionFormat: session.session_format as 'in_person' | 'virtual',
      locationName: session.location_name,
      code: session.code,
      showLink: session['show_link?'] || false,
      attendanceCount: session.attendance_count || 0,
    })) || [],
  facilitators:
    apiData.facilitators?.map(facilitator => ({
      id: facilitator.id,
      name: facilitator.name,
      email: facilitator.email,
    })) || [],
  regionalPartnerName: apiData.regional_partner_name,
  accountRequiredForAttendance:
    apiData['account_required_for_attendance?'] || false,
  readyToClose: apiData['ready_to_close?'] || false,
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
  const [enrollments, setEnrollments] = useState<EnrollmentData[] | null>(null);
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

      // Update workshop with enrollment count
      setWorkshop(prev =>
        prev
          ? {
              ...prev,
              enrolledTeacherCount: data.length,
            }
          : null
      );
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
    if (workshop?.id) {
      loadEnrollments();
    }
  }, [workshop?.id, loadEnrollments]);

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
