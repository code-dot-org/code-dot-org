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
