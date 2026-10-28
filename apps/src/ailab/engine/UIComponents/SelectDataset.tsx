/* React component to handle importing CSVs and pushing data to Redux store. */
import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Divider, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useRef, useState} from 'react';

import {getAssetPath} from '../assetPath';
import {MIN_CSV_ROWS, MIN_CSV_COLUMNS} from '../csvReaderWrapper';
import {invalidatePendingDatasetLoads} from '../datasetLoad';
import {getDatasets, getAvailableDatasets} from '../datasetManifest';
import {useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {loadDataset, loadUploadedDataset} from '../loadDataset';
import {
  setSelectedName as setSelectedNameAction,
  setSelectedCSV as setSelectedCSVAction,
  resetState as resetStateAction,
  getSpecifiedDatasets,
} from '../redux';

import DatasetTile from './DatasetTile';
import UploadedFileChip from './UploadedFileChip';

import styles from './selectDataset.module.scss';

const SelectDataset = () => {
  const dispatch = useAppDispatch();
  const specifiedDatasets = useAppSelector(getSpecifiedDatasets);
  const name = useAppSelector(state => state.name);
  const csvfile = useAppSelector(state => state.csvfile);
  const invalidData = useAppSelector(state => state.invalidData);
  // Held only while the picker is open, so moving on with one of our datasets
  // drops the upload.
  const [uploadedFile, setUploadedFile] = useState(() =>
    typeof csvfile === 'object' ? csvfile : undefined
  );
  const isUploadSelected =
    uploadedFile !== undefined && csvfile === uploadedFile;
  const isUploadRejected = isUploadSelected && !!invalidData;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);

  const resetState = () => dispatch(resetStateAction());
  const setSelectedName = (datasetName: string) =>
    dispatch(setSelectedNameAction(datasetName));
  const setSelectedCSV = (csvfilePath: string | File) =>
    dispatch(setSelectedCSVAction(csvfilePath));

  const handleDatasetClick = (id: string) => {
    const assetPath = getAssetPath();
    const dataset = getDatasets().find(dataset => dataset.id === id);

    // Don't process the click if we're just clicking the current
    // dataset again.
    if (dataset && dataset.name !== name) {
      const csvPath = assetPath + dataset.path;
      const jsonPath = assetPath + dataset.metadataPath;

      if (isUploadRejected) {
        setUploadedFile(undefined);
      }

      resetState();
      setSelectedName(dataset.name);
      setSelectedCSV(csvPath);

      invalidatePendingDatasetLoads();
      loadDataset(csvPath, jsonPath);
    }
  };

  const loadUpload = (file: File) => {
    resetState();
    setSelectedCSV(file);
    invalidatePendingDatasetLoads();
    loadUploadedDataset(file);
  };

  const handleUploadSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];
    setUploadedFile(file);
    loadUpload(file);
  };

  const handleUploadChipSelect = () => {
    if (!isUploadSelected) {
      loadUpload(uploadedFile!);
    }
  };

  const handleUploadRemove = () => {
    if (isUploadSelected) {
      resetState();
      invalidatePendingDatasetLoads();
    }
    setUploadedFile(undefined);
    uploadButtonRef.current!.focus();
  };

  const getInvalidDataMessage = () => {
    switch (invalidData) {
      case 'tooFewRows':
        return I18n.t('selectDatasetErrorTooFewRows', {
          count: MIN_CSV_ROWS,
          fileType: 'CSV',
        });
      case 'tooFewColumns':
        return I18n.t('selectDatasetErrorTooFewColumns', {
          count: MIN_CSV_COLUMNS,
          fileType: 'CSV',
        });
      case 'loadFailed':
        return 'This dataset could not be loaded. Try another one.';
      default:
        return null;
    }
  };

  const invalidDataMessage = getInvalidDataMessage();
  const datasets = getAvailableDatasets(specifiedDatasets);

  const assetPath = getAssetPath();

  return (
    <div id="select-dataset" className={styles.panel}>
      <div className={styles.header}>
        <Typography component="h3" variant="overline2" className={styles.title}>
          Choose a dataset
        </Typography>
      </div>
      <div className={styles.content}>
        {datasets.map(dataset => (
          <DatasetTile
            key={dataset.id}
            name={dataset.name}
            imageSrc={dataset.imagePath && assetPath + dataset.imagePath}
            rowCount={dataset.rowCount}
            isSelected={name === dataset.name}
            onClick={() => handleDatasetClick(dataset.id)}
          />
        ))}
      </div>
      {invalidDataMessage && (
        <Alert
          type="danger"
          size="s"
          text={invalidDataMessage}
          className={styles.alert}
        />
      )}
      {!specifiedDatasets && (
        <div className={styles.upload}>
          <Button
            ref={uploadButtonRef}
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={
              <FontAwesomeV6Icon
                iconName="arrow-up-from-bracket"
                aria-hidden="true"
              />
            }
            onClick={() => fileInputRef.current!.click()}
          >
            {I18n.t('selectDatasetUploadFileButton', {fileType: 'CSV'})}
          </Button>
          {uploadedFile && !isUploadRejected && (
            <>
              <Divider orientation="vertical" className={styles.divider} />
              <UploadedFileChip
                fileName={uploadedFile.name}
                isSelected={isUploadSelected}
                onSelect={handleUploadChipSelect}
                onRemove={handleUploadRemove}
              />
            </>
          )}
          {/* Setting value to empty here allows us to receive an
              onChange event for the same file as previously selected,
              which allows the user to upload a file, then choose an
              existing dataset, and then reupload the same file. */}
          <input
            ref={fileInputRef}
            className={classNames('csv-input', styles.fileInput)}
            type="file"
            accept=".csv,text/csv,application/vnd.ms-excel"
            name="file"
            placeholder={undefined}
            onChange={handleUploadSelect}
            value=""
          />
        </div>
      )}
    </div>
  );
};

export default SelectDataset;
