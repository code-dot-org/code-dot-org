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

export interface UploadDialogProps extends DialogProps {
  addAsset: (asset: AssetData) => void;
  removeAsset: (filename: string) => void;
  updateAlert: (
    message: string,
    type: 'danger' | 'warning',
    error?: Error
  ) => void;
  clearAlert: () => void;
}
