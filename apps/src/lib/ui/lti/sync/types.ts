interface LtiSection {
  name: string;
  size: number;
}

export type LtiSectionMap = {[sectionId: string]: LtiSection};

export interface LtiSectionSyncResult {
  all?: LtiSectionMap;
  changed?: LtiSectionMap;
  error?: string;
}

export interface LtiSectionSyncDialogProps {
  isOpen: boolean;
  syncResult: LtiSectionSyncResult;
  onClose?: () => void;
  disableRosterSyncButtonEnabled?: boolean;
}

export enum SubView {
  SYNC_RESULT = 'syncResult',
  SPINNER = 'spinner',
  ERROR = 'error',
  DISABLE_ROSTER_SYNC = 'disableRosterSync',
}
