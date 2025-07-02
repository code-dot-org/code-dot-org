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

export type UserInfoForWorkshop = {
  id: number;
  email: string;
  is_student?: boolean;
  first_name?: string;
  last_name?: string;
  school_info?: {
    school_id?: number;
    country?: string;
    school_name?: string;
    school_zip?: string;
  };
};

export type WorkshopEnrollmentParams = Pick<
  UserInfoForWorkshop,
  'email' | 'first_name' | 'last_name' | 'school_info'
> & {
  user_id: number;
};

export interface GetUserInfoForWorkshopResponse {
  userInfo: UserInfoForWorkshop | null;
}
