import {Dispatch} from 'react';

export interface Option {
  value: string;
  label: string;
}

export interface FieldConfig {
  required: boolean;
  options?: Option[];
}

export interface SessionFields {
  start: FieldConfig;
  end: FieldConfig;
  session_format: FieldConfig;
  location_name?: FieldConfig;
  location_address?: FieldConfig;
  meeting_link?: FieldConfig;
}

export interface WorkshopFields {
  name: FieldConfig;
  capacity: FieldConfig;
  grades: FieldConfig;
  description: FieldConfig;
  notes?: FieldConfig;
  suppress_email?: FieldConfig;
  regional_partner_id?: FieldConfig;
  organizer_id?: FieldConfig;
  facilitators?: FieldConfig;
  subject?: FieldConfig;
  fee?: FieldConfig;
  prereq?: FieldConfig;
  hidden?: FieldConfig;
  registration_link?: FieldConfig;
  course_offerings?: FieldConfig;
  participant_group_type?: FieldConfig;
}

export interface WorkshopCourseConfig {
  slug: string;
  label: string;
  session_fields: SessionFields;
  fields: WorkshopFields;
}

export interface WorkshopFormTemplateProps {
  config: WorkshopCourseConfig;
}

export interface Organizer {
  id: number;
  name: string;
  email: string;
}

export type SessionFormat = 'virtual' | 'in_person';

export interface Session {
  id: number;
  start: string;
  end: string;
  code?: string;
  location_address?: string;
  location_name?: string;
  meeting_link?: string;
  session_format?: SessionFormat;
}

export interface SessionFormState {
  id: string;
  date: string;
  start: string;
  end: string;
  locationAddress: string;
  locationName: string;
  meetingLink: string;
  format: SessionFormat;
  sameAsPrevious: boolean;
}

export interface Workshop {
  course: string;
  name: string;
  capacity: number;
  grades?: string[];
  description?: string;
  notes?: string;
  suppress_email?: boolean;
  regional_partner_id?: number;
  organizer?: Organizer;
  facilitators?: number[];
  subject?: string;
  fee?: string;
  prereq?: string;
  hidden?: boolean;
  registration_link?: string;
  sessions: Session[];
  course_offerings?: number[];
  participant_group_type?: string;
  time_zone?: string;
}

export interface CourseOffering {
  id: number;
  display_name: string;
}

export interface RegionalPartner {
  id: number;
  name: string;
}

export interface Facilitator {
  id: number;
  name: string;
  email: string;
}

export interface WorkshopFormState {
  id?: number;
  course: string;
  capacity: string;
  description: string;
  facilitators: number[];
  fee: string;
  grades: string[];
  hidden: boolean;
  name: string;
  notes: string;
  organizerId: number | null;
  prereq: string;
  hasPrereq: boolean;
  regionalPartnerId: number | null;
  registrationLink: string;
  subject: string;
  suppressEmail: boolean;
  courseOfferings: string[];
  participantGroupType: string;
  timeZone: string;
}

export interface SectionProps {
  dispatchWorkshop: Dispatch<WorkshopAction>;
  config: WorkshopCourseConfig;
}

export interface BasicsProps
  extends SectionProps,
    Pick<
      WorkshopFormState,
      | 'name'
      | 'grades'
      | 'subject'
      | 'prereq'
      | 'hasPrereq'
      | 'capacity'
      | 'description'
      | 'courseOfferings'
    > {}

export interface PartnerFacilitatorProps
  extends SectionProps,
    Pick<WorkshopFormState, 'facilitators' | 'regionalPartnerId'> {}

export interface AdditionalInfoProps
  extends SectionProps,
    Pick<WorkshopFormState, 'fee' | 'participantGroupType' | 'notes'> {}

export interface EmailsRemindersProps
  extends SectionProps,
    Pick<WorkshopFormState, 'suppressEmail'> {}

export interface PublishSettingsProps
  extends SectionProps,
    Pick<WorkshopFormState, 'registrationLink' | 'hidden'> {}

export interface ScheduleProps
  extends SectionProps,
    Pick<WorkshopFormState, 'timeZone'> {
  sessions: SessionFormState[];
  dispatchSessions: Dispatch<SessionAction>;
}

export interface PublishCancelButtonsProps {
  publish: () => void;
  cancel: () => void;
}

export type SessionAction =
  | {type: 'ADD_SESSION'}
  | {type: 'UPDATE_SESSION'; payload: Partial<SessionFormState>; id: string}
  | {type: 'SET_SESSIONS'; payload: SessionFormState[]}
  | {type: 'DELETE_SESSION'; id: string}
  | {type: 'UPDATE_SESSION_SAME_AS_PREVIOUS'; id: string};

export type WorkshopAction =
  | {type: 'UPDATE_WORKSHOP'; payload: Partial<WorkshopFormState>}
  | {type: 'ADD_GRADE'; payload: string}
  | {type: 'REMOVE_GRADE'; payload: string}
  | {type: 'ADD_COURSE_OFFERING'; payload: string}
  | {type: 'REMOVE_COURSE_OFFERING'; payload: string}
  | {type: 'SET_COURSE_OFFERINGS'; payload: string[]}
  | {type: 'SET_WORKSHOP'; payload: WorkshopFormState};
