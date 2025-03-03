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

export interface Organizer {
  id: number;
  name: string;
  email: string;
}

export interface Session {
  id: number;
  start: string;
  end: string;
  code?: string;
  location_address?: string;
  location_name?: string;
  meeting_link?: string;
  session_format?: 'virtual' | 'in_person';
}

export interface SessionFormState {
  id: number | null;
  start: string | null;
  end: string | null;
  code: string | null;
  locationAddress: string | null;
  locationName: string | null;
  meetingLink: string | null;
  sessionFormat: 'virtual' | 'in_person' | null;
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
  course: string | null;
  capacity: number | null;
  description: string | null;
  facilitators: number[];
  fee: string | null;
  grades: string[];
  hidden: boolean | null;
  name: string | null;
  notes: string | null;
  organizerId: number | null;
  prereq: string | null;
  regionalPartnerId: number | null;
  registrationLink: string | null;
  subject: string | null;
  suppressEmail: boolean | null;
  courseOfferings: string[];
  participantGroupType: string | null;
  timeZone: string | null;
}
