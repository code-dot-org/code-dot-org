export interface Unit {
  /** Slug, e.g. `csd1-2023`. This is what the CSV's unit_name column carries. */
  name: string;
  /** Human-readable title, shown in the UI only. */
  title: string;
}

export interface Student {
  id: number;
  /** Null for email/OAuth/LTI students, who never get one generated. */
  username: string | null;
  name: string;
  familyName: string | null;
}

export interface Section {
  id: number;
  name: string;
  hidden: boolean;
  courseName: string | null;
  /** Empty when the section has neither a unit nor a course assigned. */
  units: Unit[];
  students: Student[];
}

export interface SectionSelection {
  studentIds: Set<number>;
  unitNames: Set<string>;
}

export type Selection = Record<number, SectionSelection>;

export interface ExportRow {
  student_username: string;
  student_id: string;
  unit_name: string;
}

export const CSV_COLUMNS = [
  'student_username',
  'student_id',
  'unit_name',
] as const;
