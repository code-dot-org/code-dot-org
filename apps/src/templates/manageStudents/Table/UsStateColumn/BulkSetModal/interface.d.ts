export interface BulkSetModalProps {
  isOpen?: boolean;
  onClose: () => void;
  bulkSet: (studentsData: {usState: string | null}) => void;
}
