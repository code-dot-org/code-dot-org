export type CourseOfferingFacilitatedWorkshop = {
  id: number;
  title: string;
  sessions: {start: string}[];
  link: string;
  is_virtual: boolean;
};

/** Summarized course offering shape */
export interface CourseOffering {
  key: string;
  display_name: string;
  marketing_initiative?: string;
  grade_levels?: string; // comma-separated
  image?: string;
  cs_topic?: string; // comma-separated
  school_subject?: string;
  device_compatibility?: string; // JSON string
  description?: string;
  professional_learning_program?: string;
  video?: string;
  published_date?: string; // ISO date
  is_translated?: boolean; // frontend-only field
  duration?: string; // added by summarize_for_catalog
  duration_in_hours?: number;
  course_version_path?: string;
  course_version_id?: number;
  course_id?: number;
  script_id?: number;
  self_paced_pl_course_offering_path?: string;
  available_resources?: Record<string, string>;
  facilitated_workshops?: CourseOfferingFacilitatedWorkshop[];
}
