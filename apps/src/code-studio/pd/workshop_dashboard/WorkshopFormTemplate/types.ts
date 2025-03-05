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
  id?: number;
  start: string;
  end: string;
  locationAddress: string;
  locationName: string;
  meetingLink: string;
  sessionFormat: SessionFormat;
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
  course_offerings?: string[];
  participant_group_type?: string;
  time_zone?: string;
}

export interface WorkshopFormState {
  course: string;
  capacity?: number;
  description: string;
  facilitators: number[];
  fee: string;
  grades: string[];
  hidden: boolean;
  name: string;
  notes: string;
  organizerId?: number;
  prereq: string;
  regionalPartnerId?: number;
  registrationLink: string;
  subject: string;
  suppressEmail: boolean;
  courseOfferings: string[];
  participantGroupType: string;
  timeZone: string;
}
