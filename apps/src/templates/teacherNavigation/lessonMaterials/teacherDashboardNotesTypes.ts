export type TeacherDashboardNoteContextType = 'course' | 'unit' | 'lesson';

export const TEACHER_DASHBOARD_NOTE_COLORS = [
  {value: 'white', label: 'White'},
  {value: 'yellow', label: 'Yellow'},
  {value: 'peach', label: 'Peach'},
  {value: 'mint', label: 'Mint'},
  {value: 'blue', label: 'Blue'},
  {value: 'lavender', label: 'Lavender'},
  {value: 'pink', label: 'Pink'},
  {value: 'gray', label: 'Gray'},
  {value: 'aqua', label: 'Aqua'},
  {value: 'cream', label: 'Cream'},
] as const;

export type TeacherDashboardNoteColor =
  (typeof TEACHER_DASHBOARD_NOTE_COLORS)[number]['value'];

export const DEFAULT_TEACHER_DASHBOARD_NOTE_COLOR: TeacherDashboardNoteColor =
  'white';

export interface TeacherDashboardNote {
  id: number;
  title?: string | null;
  body: string;
  noteColor: TeacherDashboardNoteColor;
  noteLayoutColumn: number;
  notePosition: number;
  contextType: TeacherDashboardNoteContextType;
  unitGroupId?: number | null;
  unitId?: number | null;
  lessonId?: number | null;
  sectionId?: number | null;
  sharedWithSection: boolean;
  sharedSectionIds: number[];
  shareableGlobally: boolean;
  isOwner: boolean;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  lockVersion: number;
}

export interface TeacherDashboardNoteSection {
  id: number;
  name: string;
}

export interface TeacherDashboardNotesContexts {
  sectionId: number;
  unitGroupId?: number | null;
  unitId: number;
  lessonId?: number | null;
}

export interface TeacherDashboardNotesResponse {
  contexts: TeacherDashboardNotesContexts;
  notes: TeacherDashboardNote[];
}

export interface TeacherDashboardNotePayload {
  title?: string | null;
  body: string;
  noteColor: TeacherDashboardNoteColor;
  noteLayoutColumn: number;
  notePosition: number;
  contextType: TeacherDashboardNoteContextType;
  unitGroupId?: number | null;
  unitId?: number | null;
  lessonId?: number | null;
  sectionId?: number | null;
  sharedWithSection: boolean;
  sharedSectionIds: number[];
  shareableGlobally: boolean;
  lockVersion?: number;
}

export interface TeacherDashboardNoteLayoutPayload {
  noteLayoutColumn: number;
  notePosition: number;
}

export interface TeacherDashboardNoteConflict {
  error: string;
  note: TeacherDashboardNote;
}
