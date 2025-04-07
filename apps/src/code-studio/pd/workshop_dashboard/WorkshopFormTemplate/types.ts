import {Dispatch} from 'react';

export interface Option {
  value: string;
  label: string;
}

export interface FieldConfig<T extends WorkshopFormState | SessionFormState> {
  required: boolean;
  stateKey: keyof T;
  label: string;
  helperMessage?: string;
  options?: Option[];
}
export interface SessionFields {
  date: FieldConfig<SessionFormState>;
  start: FieldConfig<SessionFormState>;
  end: FieldConfig<SessionFormState>;
  session_format: FieldConfig<SessionFormState>;
  location_name?: FieldConfig<SessionFormState>;
  location_address?: FieldConfig<SessionFormState>;
  meeting_link?: FieldConfig<SessionFormState>;
}

export interface WorkshopFields {
  name?: FieldConfig<WorkshopFormState>;
  capacity?: FieldConfig<WorkshopFormState>;
  grades?: FieldConfig<WorkshopFormState>;
  description?: FieldConfig<WorkshopFormState>;
  notes?: FieldConfig<WorkshopFormState>;
  suppress_email?: FieldConfig<WorkshopFormState>;
  regional_partner_id?: FieldConfig<WorkshopFormState>;
  organizer_id?: FieldConfig<WorkshopFormState>;
  facilitators?: FieldConfig<WorkshopFormState>;
  subject?: FieldConfig<WorkshopFormState>;
  fee?: FieldConfig<WorkshopFormState>;
  prereq?: FieldConfig<WorkshopFormState>;
  hidden?: FieldConfig<WorkshopFormState>;
  registration_link?: FieldConfig<WorkshopFormState>;
  course_offerings?: FieldConfig<WorkshopFormState>;
  participant_group_type?: FieldConfig<WorkshopFormState>;
  time_zone?: FieldConfig<WorkshopFormState>;
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
  id: number;
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

type BasicsKeys =
  | 'name'
  | 'grades'
  | 'subject'
  | 'prereq'
  | 'hasPrereq'
  | 'capacity'
  | 'description'
  | 'courseOfferings';

type PartnerFacilitatorKeys = 'facilitators' | 'regionalPartnerId';

type AdditionalInfoKeys = 'fee' | 'participantGroupType' | 'notes';

type EmailsRemindersKeys = 'suppressEmail';

type PublishSettingsKeys = 'registrationLink' | 'hidden';

export type Errors<SectionKeys extends string> = Partial<
  Record<SectionKeys, string>
>;

export type SessionErrors = Partial<
  Record<SessionFormState['id'], Errors<keyof SessionFormState>>
>;

export type WorkshopErrors = Errors<keyof WorkshopFormState>;

export interface BasicsProps
  extends SectionProps,
    Pick<WorkshopFormState, BasicsKeys> {
  errors: WorkshopErrors;
}

export interface PartnerFacilitatorProps
  extends SectionProps,
    Pick<WorkshopFormState, PartnerFacilitatorKeys> {
  regionalPartnerData: RegionalPartner[] | null;
  facilitatorData: Facilitator[] | null;
  errors: WorkshopErrors;
}

export interface AdditionalInfoProps
  extends SectionProps,
    Pick<WorkshopFormState, AdditionalInfoKeys> {
  errors: WorkshopErrors;
}

export interface EmailsRemindersProps
  extends SectionProps,
    Pick<WorkshopFormState, EmailsRemindersKeys> {}

export interface PublishSettingsProps
  extends SectionProps,
    Pick<WorkshopFormState, PublishSettingsKeys> {
  errors: WorkshopErrors;
}

export interface ScheduleProps
  extends SectionProps,
    Pick<WorkshopFormState, 'timeZone'> {
  sessions: SessionFormState[];
  dispatchSessions: Dispatch<SessionAction>;
  errors: SessionErrors;
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
