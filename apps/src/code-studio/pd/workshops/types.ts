import {SessionFormat} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/types';
import {WorkshopFormats} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

export interface OrganizerInfo {
  name: string;
  email: string;
}

export interface FacilitatorInfo {
  name: string;
  email: string;
  bio?: string;
  image_path?: string;
}

export interface SessionInfo {
  id: number;
  start: string;
  end: string;
  is_local: boolean;
  location_name?: string;
  location_address?: string;
  meeting_link?: string;
  session_format: SessionFormat;
  description?: string;
  notes?: string;
}

export interface GetWorkshopInfoScriptDataResponse {
  id: number;
  course: string;
  subject?: string;
  course_offerings?: string[];
  name?: string;
  capacity: number;
  num_enrollments: number;
  grade_levels?: string[];
  sessions: SessionInfo[];
  format: keyof typeof WorkshopFormats;
  location_name?: string;
  fee?: string;
  prereq?: string;
  description?: string;
  notes?: string;
  custom_registration_link?: string;
  regional_partner_name?: string;
  organizer: OrganizerInfo;
  facilitators?: FacilitatorInfo[];
}

export interface WorkshopInfo {
  id: number;
  course: string;
  subject?: string;
  courseOfferings?: string[];
  name?: string;
  capacity: number;
  numEnrollments: number;
  gradeLevels?: string[];
  sessions: SessionInfo[];
  format: keyof typeof WorkshopFormats;
  locationName?: string;
  fee?: string;
  prereq?: string;
  description?: string;
  notes?: string;
  customRegistrationLink?: string;
  regionalPartnerName?: string;
  organizer: OrganizerInfo;
  facilitators?: FacilitatorInfo[];
}

export const workshopInfoDataResponseToParams = (
  response: GetWorkshopInfoScriptDataResponse | null
): WorkshopInfo | null => {
  if (!response) return null;

  return {
    id: response.id,
    course: response.course,
    subject: response.subject,
    courseOfferings: response.course_offerings,
    name: response.name,
    capacity: response.capacity,
    numEnrollments: response.num_enrollments,
    gradeLevels: response.grade_levels,
    sessions: response.sessions,
    format: response.format,
    locationName: response.location_name,
    fee: response.fee,
    prereq: response.prereq,
    description: response.description,
    notes: response.notes,
    customRegistrationLink: response.custom_registration_link,
    regionalPartnerName: response.regional_partner_name,
    organizer: response.organizer,
    facilitators: response.facilitators,
  };
};

export interface GetUserInfoForWorkshopResponse {
  id: number;
  email: string;
  display_name: string;
  is_student?: boolean;
  given_name?: string;
  family_name?: string;
  educator_role?: string;
  school_info?: {
    school_id?: number;
    country?: string;
    school_name?: string;
    school_zip?: string;
    school_type?: string;
  };
}

export type UserInfoForWorkshop = {
  userInfo: {
    id: number;
    email: string;
    displayName: string;
    isStudent?: boolean;
    givenName?: string;
    familyName?: string;
    educatorRole?: string;
    schoolInfo?: {
      schoolId?: number;
      country?: string;
      schoolName?: string;
      schoolZip?: string;
      schoolType?: string;
    };
  } | null;
};

export type UserWorkshopEnrollment = {
  id: number;
  workshopId: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  email: string;
  code?: string;
  surveySentAt?: string;
  completedSurveyId?: number;
  schoolInfoId?: number;
  deletedAt?: string;
  applicationId?: number;
};

export const userInfoDataResponseToParams = (
  response: GetUserInfoForWorkshopResponse | null
): UserInfoForWorkshop | null => {
  if (!response) return null;

  return {
    userInfo: {
      id: response.id,
      email: response.email,
      displayName: response.display_name,
      isStudent: response.is_student,
      givenName: response.given_name,
      familyName: response.family_name,
      educatorRole: response.educator_role,
      schoolInfo: {
        schoolId: response.school_info?.school_id,
        country: response.school_info?.country,
        schoolName: response.school_info?.school_name,
        schoolZip: response.school_info?.school_zip,
        schoolType: response.school_info?.school_type,
      },
    },
  };
};
