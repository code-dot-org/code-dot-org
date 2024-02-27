interface LtiSection {
  name: string;
  size: number;
}

type LtiSectionMap = {[sectionId: string]: LtiSection};

export interface LtiSectionSyncResult {
  all?: LtiSectionMap;
  updated?: LtiSectionMap;
  error?: string;
}

export interface LtiSectionSyncDialogProps {
  isOpen: boolean;
  syncResult: LtiSectionSyncResult;
  onClose?: () => void;
}

export enum SubView {
  SYNC_RESULT = 'syncResult',
  SPINNER = 'spinner',
  ERROR = 'error',
}
