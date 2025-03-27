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
  id?: number;
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
  state: WorkshopFormState;
  handleChange: <K extends keyof WorkshopFormState>(
    update: Record<K, WorkshopFormState[K]>
  ) => void;
  config: WorkshopCourseConfig;
  courseOfferings?: CourseOffering[] | null;
  regionalPartners?: RegionalPartner[] | null;
  facilitators?: Facilitator[] | null;
}

export interface ScheduleProps extends SectionProps {
  sessions: SessionFormState[];
  handleSessions: (sessions: SessionFormState[]) => void;
}

export interface PublishCancelButtonsProps {
  publish: () => void;
  cancel: () => void;
}
