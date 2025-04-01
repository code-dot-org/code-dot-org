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
  onError?: (error: Error) => void;
}

export interface DialogProps {
  assets: AssetData[];
  addAsset: (asset: AssetData) => void;
  removeAsset: (filename: string) => void;
  loading: boolean;
  showError: boolean;
  setError: (error: Error) => void;
}
