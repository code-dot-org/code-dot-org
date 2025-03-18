import React, {useCallback, useEffect, useRef, useState} from 'react';

import {fetchLevelAssets} from './api';
import SelectAssetsDialog, {SelectProps} from './SelectAssetsDialog';
import {AssetData} from './types';
import UploadAssetDialog, {UploadProps} from './UploadAssetDialog';

/**
 * Dialog for managing or selecting level starter assets.
 * Displays the appropriate dialog experience based on the provided `mode` prop.
 */
const StarterAssetsDialog: React.FC<SelectProps | UploadProps> = props => {
  const {levelName, mode, onError} = props;
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const abortControllerRef = useRef(new AbortController());

  const fetchAssets = useCallback(async () => {
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    try {
      const assets = await fetchLevelAssets(levelName, signal);
      setAssets(assets);
    } catch (error) {
      onError?.(error as Error);
      setShowError(true);
    }
    setLoading(false);
  }, [levelName, onError]);

  useEffect(() => {
    fetchAssets();

    const controller = abortControllerRef.current;
    return () => controller.abort();
  }, [fetchAssets]);

  const addAsset = useCallback(
    (asset: AssetData) => {
      // Replace if same filename
      const existingIndex = assets.findIndex(
        existingAsset => existingAsset.filename === asset.filename
      );
      if (existingIndex !== -1) {
        setAssets([
          ...assets.slice(0, existingIndex),
          asset,
          ...assets.slice(existingIndex + 1),
        ]);
      } else {
        setAssets([...assets, asset]);
      }
    },
    [assets]
  );

  const removeAsset = useCallback(
    (filename: string) => {
      setAssets(assets.filter(asset => asset.filename !== filename));
    },
    [assets]
  );

  const setError = useCallback(
    (error: Error) => {
      onError?.(error);
      setShowError(true);
    },
    [onError]
  );

  const dialogProps = {
    assets,
    loading,
    showError,
    // Used by UploadAssetDialog
    addAsset,
    removeAsset,
    setError,
  };

  if (mode === 'select') {
    return <SelectAssetsDialog {...props} {...dialogProps} />;
  }

  return <UploadAssetDialog {...props} {...dialogProps} />;
};

export default StarterAssetsDialog;
