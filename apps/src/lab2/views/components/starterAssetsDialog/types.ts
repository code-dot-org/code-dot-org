/**
 * Information about an asset.
 * TODO: Move to a more shared location if we start using this elsewhere.
 */
export interface AssetData {
  filename: string;
  category: string;
  size: number;
  timestamp: string;
}

export interface CommonProps {
  onClose: () => void;
  levelName: string;
  onError?: (message: string, error?: Error) => void;
}

export interface DialogProps {
  assets: AssetData[];
  loading: boolean;
  alert?: {message: string; type: 'danger' | 'warning'};
}

export type UpdateAlertCallback = <T extends 'danger' | 'warning'>(
  message: string,
  type: T,
  error?: T extends 'danger' ? Error : never
) => void;

export interface UploadDialogProps extends DialogProps {
  addAsset: (asset: AssetData) => void;
  removeAsset: (filename: string) => void;
  updateAlert: UpdateAlertCallback;
  clearAlert: () => void;
}
