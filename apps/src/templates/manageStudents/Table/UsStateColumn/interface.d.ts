import {CurrentUserState} from '@cdo/apps/templates/CurrentUserState';

export interface RowData {
  id: number;
  isEditing: boolean;
  editingData: {
    usState: string;
  };
}

export interface Section {
  id: number;
  loginType: string;
}

export interface StudentData {
  usState: string | null;
}

export interface CellProps {
  studentId: number;
  value: string;
  editedValue: string;
  isEditing?: boolean;
  currentUser: CurrentUserState;
  section: Section;
  editStudent: (id: number, studentData: StudentData) => void;
}

export interface BulkSetModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentUser: CurrentUserState;
  section: Section;
  bulkSet: (studentsData: StudentData) => void;
}
