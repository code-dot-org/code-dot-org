export type LtiSection = {
  name: string;
  short_name: string;
  size: number;
  instructors: LtiInstructor[];
};

export interface LtiInstructor {
  name: string;
  id: string;
  isOwner: boolean;
}

export type LtiSectionMap = {[sectionId: string]: LtiSection};

export interface LtiSectionSyncResult {
  all?: LtiSectionMap;
  changed?: LtiSectionMap;
  error?: string;
  message?: string;
  course_name?: string;
}

export interface LtiSectionSyncDialogProps {
  isOpen: boolean;
  syncResult: LtiSectionSyncResult;
  onClose?: () => void;
  disableRosterSyncButtonEnabled?: boolean;
  lmsName: string;
}

export enum SubView {
  SYNC_RESULT = 'syncResult',
  SPINNER = 'spinner',
  ERROR = 'error',
  DISABLE_ROSTER_SYNC = 'disableRosterSync',
}
