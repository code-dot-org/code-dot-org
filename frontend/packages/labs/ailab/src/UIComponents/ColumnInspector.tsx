/*
  React component to handle displaying details, including data visualizations,
  for selected columns.
*/
import {styles, ColumnTypes} from '../constants';
import {getLocalizedColumnName} from '../helpers/columnDetails';
import {useAppSelector} from '../hooks';
import I18n from '../i18n';
import {getCurrentColumnDetails} from '../selectors/currentColumnSelectors';

import AddFeatureButton from './AddFeatureButton';
import ColumnDataTypeDropdown from './ColumnDataTypeDropdown';
import ColumnDetailsCategorical from './ColumnDetailsCategorical';
import ColumnDetailsNumerical from './ColumnDetailsNumerical';
import CrossTab from './CrossTab';
import ScatterPlot from './ScatterPlot';
import ScrollableContent from './ScrollableContent';
import SelectLabelButton from './SelectLabelButton';
import UniqueOptionsWarning from './UniqueOptionsWarning';

const ColumnInspector = () => {
  const currentColumnDetails = useAppSelector(getCurrentColumnDetails);
  const currentPanel = useAppSelector(state => state.currentPanel);
  const datasetId = useAppSelector(
    state => state.metadata && state.metadata.name,
  );
  const selectingFeatures = currentPanel === 'dataDisplayFeatures';
  const selectingLabel = currentPanel === 'dataDisplayLabel';

  const isCategorical =
    currentColumnDetails &&
    currentColumnDetails.dataType === ColumnTypes.CATEGORICAL;
  const isNumerical =
    currentColumnDetails &&
    currentColumnDetails.dataType === ColumnTypes.NUMERICAL;

  if (!currentColumnDetails) {
    return null;
  }

  const localizedDataType = I18n.t(
    `columnType_${currentColumnDetails.dataType}`,
  );
  const localizedColumnName = getLocalizedColumnName(
    datasetId!,
    currentColumnDetails.id,
  );

  return (
    currentColumnDetails && (
      <div
        id="column-inspector"
        style={{
          ...styles.panel,
          ...styles.rightPanel,
        }}
      >
        <div style={styles.largeText}>{localizedColumnName}</div>
        <ScrollableContent>
          <div style={styles.cardRow}>
            <span style={styles.bold}>{I18n.t('columnInspectorDataType')}</span>
            <br />
            {currentColumnDetails.readOnly && localizedDataType}
            {!currentColumnDetails.readOnly && (
              <ColumnDataTypeDropdown
                columnId={currentColumnDetails.id}
                currentDataType={currentColumnDetails.dataType}
              />
            )}
          </div>
          {currentColumnDetails.description && (
            <div style={styles.cardRow}>
              <span style={styles.bold}>
                {I18n.t('columnInspectorDescription')}
              </span>
              &nbsp;
              <div>{currentColumnDetails.description}</div>
            </div>
          )}
          {selectingFeatures && (
            <div style={styles.cardRow}>
              <ScatterPlot />
              <CrossTab />
            </div>
          )}
          {isCategorical && <ColumnDetailsCategorical />}
          {isNumerical && <ColumnDetailsNumerical />}
        </ScrollableContent>
        {selectingLabel && currentColumnDetails.isSelectable && (
          <SelectLabelButton column={currentColumnDetails.id} />
        )}
        {selectingFeatures && currentColumnDetails.isSelectable && (
          <AddFeatureButton column={currentColumnDetails.id} />
        )}
        <UniqueOptionsWarning />
      </div>
    )
  );
};

export default ColumnInspector;
