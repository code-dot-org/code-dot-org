/* React component to handle importing CSVs and pushing data to Redux store. */
import {getAssetPath} from '../assetPath';
import {styles} from '../constants';
import {parseCSV, MIN_CSV_ROWS, MIN_CSV_COLUMNS} from '../csvReaderWrapper';
import {getDatasets, getAvailableDatasets} from '../datasetManifest';
import {useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {parseJSON} from '../jsonReaderWrapper';
import {
  setSelectedName as setSelectedNameAction,
  setSelectedCSV as setSelectedCSVAction,
  setSelectedJSON as setSelectedJSONAction,
  resetDatasetState as resetDatasetStateAction,
  getSpecifiedDatasets,
  setHighlightDataset as setHighlightDatasetAction,
} from '../redux';

import ScrollableContent from './ScrollableContent';

const SelectDataset = () => {
  const dispatch = useAppDispatch();
  const specifiedDatasets = useAppSelector(getSpecifiedDatasets);
  const name = useAppSelector(state => state.name);
  const highlightDataset = useAppSelector(state => state.highlightDataset);
  const invalidData = useAppSelector(state => state.invalidData);

  const resetDatasetState = () => dispatch(resetDatasetStateAction());
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

      resetDatasetState();
      setSelectedName(dataset.name);
      setSelectedCSV(csvPath);
      setSelectedJSON(jsonPath);

      parseCSV(csvPath, true, false);

      parseJSON(jsonPath);
    }
  };

  const handleUploadSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    resetDatasetState();
    setSelectedCSV(event.target.files![0]);
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
    <div id="select-dataset" style={styles.panel}>
      <ScrollableContent tinted={true}>
        {datasets.map((dataset, index) => {
          return (
            <div
              style={{
                ...styles.selectDatasetItem,
                ...(highlightDataset === dataset.name &&
                  styles.selectDatasetItemHighlighted),
                ...(name === dataset.name && styles.selectDatasetItemSelected),
                ...(index % 3 === 0 && {clear: 'both'}),
              }}
              key={dataset.id}
              onClick={() => handleDatasetClick(dataset.id)}
              onKeyDown={() => handleDatasetClick(dataset.id)}
              onMouseEnter={() => setHighlightDataset(dataset.name)}
              onMouseLeave={() => setHighlightDataset(undefined)}
              role="button"
              tabIndex={0}
            >
              <div style={styles.selectDatasetItemContainer}>
                <img
                  src={assetPath + dataset.imagePath}
                  style={styles.selectDatasetImage}
                  draggable={false}
                  className="uitest-ailab-dataset-image ailab-image-hover"
                  alt={`Select ${dataset.name} dataset`}
                />
                <div style={styles.selectDatasetText}>{dataset.name}</div>
              </div>
            </div>
          );
        })}
      </ScrollableContent>
      {!specifiedDatasets && (
        <div style={styles.contentsCsvButton}>
          <label style={styles.uploadCsvButton}>
            {I18n.t('selectDatasetUploadFileButton', {fileType: 'CSV'})}
            {/* Setting value to empty here allows us to receive an
                onChange event for the same file as previously selected,
                which allows the user to upload a file, then choose an
                existing dataset, and then reupload the same file. */}
            <input
              className="csv-input"
              type="file"
              accept=".csv,text/csv,application/vnd.ms-excel"
              name="file"
              placeholder={undefined}
              onChange={handleUploadSelect}
              style={styles.csvInput}
              value=""
            />
          </label>
          <span style={styles.invalidDataMessageContainer}>
            {getInvalidDataMessage()}
          </span>
        </div>
      )}
    </div>
  );
};

export default SelectDataset;
