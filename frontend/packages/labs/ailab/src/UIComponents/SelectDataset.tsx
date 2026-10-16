/* React component to handle importing CSVs and pushing data to Redux store. */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useRef} from 'react';

import {getAssetPath} from '../assetPath';
import {parseCSV, MIN_CSV_ROWS, MIN_CSV_COLUMNS} from '../csvReaderWrapper';
import {invalidatePendingDatasetLoads} from '../datasetLoad';
import {getDatasets, getAvailableDatasets} from '../datasetManifest';
import {useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {loadDataset} from '../loadDataset';
import {
  setSelectedName as setSelectedNameAction,
  setSelectedCSV as setSelectedCSVAction,
  setSelectedJSON as setSelectedJSONAction,
  resetState as resetStateAction,
  getSpecifiedDatasets,
  setHighlightDataset as setHighlightDatasetAction,
} from '../redux';

import styles from './selectDataset.module.scss';

const SelectDataset = () => {
  const dispatch = useAppDispatch();
  const specifiedDatasets = useAppSelector(getSpecifiedDatasets);
  const name = useAppSelector(state => state.name);
  const highlightDataset = useAppSelector(state => state.highlightDataset);
  const invalidData = useAppSelector(state => state.invalidData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => dispatch(resetStateAction());
  const setSelectedName = (datasetName: string) =>
    dispatch(setSelectedNameAction(datasetName));
  const setSelectedCSV = (csvfilePath: string | File) =>
    dispatch(setSelectedCSVAction(csvfilePath as string));
  const setSelectedJSON = (jsonfilePath: string) =>
    dispatch(setSelectedJSONAction(jsonfilePath));
  const setHighlightDataset = (id: string | undefined) =>
    dispatch(setHighlightDatasetAction(id as string));

  const handleDatasetClick = (id: string) => {
    const assetPath = getAssetPath();
    const dataset = getDatasets().find(dataset => dataset.id === id);

    // Don't process the click if we're just clicking the current
    // dataset again.
    if (dataset && dataset.name !== name) {
      const csvPath = assetPath + dataset.path;
      const jsonPath = assetPath + dataset.metadataPath;

      resetState();
      setSelectedName(dataset.name);
      setSelectedCSV(csvPath);
      setSelectedJSON(jsonPath);

      invalidatePendingDatasetLoads();
      loadDataset(csvPath, jsonPath);
    }
  };

  const handleUploadSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    resetState();
    setSelectedCSV(event.target.files![0]);
    invalidatePendingDatasetLoads();
    parseCSV(event.target.files![0] as unknown as string, false, true);
  };

  const getInvalidDataMessage = () => {
    if (invalidData === 'tooFewRows') {
      return I18n.t('selectDatasetErrorTooFewRows', {
        count: MIN_CSV_ROWS,
        fileType: 'CSV',
      });
    } else if (invalidData === 'tooFewColumns') {
      return I18n.t('selectDatasetErrorTooFewColumns', {
        count: MIN_CSV_COLUMNS,
        fileType: 'CSV',
      });
    } else {
      return null;
    }
  };

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
        {datasets.map(dataset => {
          return (
            <button
              type="button"
              className={classNames(styles.item, {
                [styles.highlighted]: highlightDataset === dataset.name,
                [styles.selected]: name === dataset.name,
              })}
              key={dataset.id}
              aria-pressed={name === dataset.name}
              onClick={() => handleDatasetClick(dataset.id)}
              onMouseEnter={() => setHighlightDataset(dataset.name)}
              onMouseLeave={() => setHighlightDataset(undefined)}
            >
              <img
                src={assetPath + dataset.imagePath}
                draggable={false}
                className={classNames(
                  'uitest-ailab-dataset-image',
                  styles.image
                )}
                alt=""
              />
              <Typography component="span" variant="label2">
                {dataset.name}
              </Typography>
            </button>
          );
        })}
      </div>
      {!specifiedDatasets && (
        <div className={styles.upload}>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={
              <FontAwesomeV6Icon iconName="file-arrow-up" aria-hidden="true" />
            }
            onClick={() => fileInputRef.current!.click()}
          >
            {I18n.t('selectDatasetUploadFileButton', {fileType: 'CSV'})}
          </Button>
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
          <Typography variant="body3" className={styles.invalidData}>
            {getInvalidDataMessage()}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default SelectDataset;
