export interface RowData {
  id: number;
  isEditing: boolean;
  editingData: {
    usState: string;
  };
}

export interface CellProps {
  id: number;
  value: string;
  editedValue: string;
  isEditing?: boolean;
  editStudent: (id: number, studentData: {usState: string | null}) => void;
}
