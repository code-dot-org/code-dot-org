import React, {createContext, useContext, ReactNode} from 'react';
import {useParams} from 'react-router-dom';

import {useFetch} from '@cdo/apps/util/useFetch';

import {Workshop} from '../../WorkshopFormTemplate/types';
import {WorkshopContextValue, WorkshopData} from '../types';

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

  const {data, loading, error, refetch} = useFetch<Workshop | null>(
    workshopId ? `/api/v1/pd/workshops/${workshopId}` : ''
  );

  // Transform API data to WorkshopData, or null if not loaded/errored
  const workshop = data ? transformWorkshopData(data) : null;

  const contextValue: WorkshopContextValue = {
    workshop,
    loading,
    error,
    loadWorkshop: refetch,
  };

  return (
    <WorkshopContext.Provider value={contextValue}>
      {children}
    </WorkshopContext.Provider>
  );
};
