/* React component to display a statement about our model. */
import {connect} from 'react-redux';
import {setLabelColumn, removeSelectedFeature, RootState} from '../redux';
import {styles} from '../constants';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import I18n from '../i18n';
import {getLocalizedColumnName} from '../helpers/columnDetails';

interface StatementProps {
  shouldShow?: boolean;
  smallFont?: boolean;
  data?: Record<string, string | number>[];
  currentPanel?: string;
  labelColumn?: string;
  selectedFeatures?: string[];
  setLabelColumn?: (column: string | null) => void;
  removeSelectedFeature?: (id: string) => void;
  datasetId?: string;
}

const Statement = ({
  shouldShow,
  smallFont,
  data,
  currentPanel,
  labelColumn,
  selectedFeatures,
  setLabelColumn,
  removeSelectedFeature,
  datasetId,
}: StatementProps) => {
  const removeLabel = () => {
    setLabelColumn!(null);
  };

  const removeFeature = (id: string) => {
    removeSelectedFeature!(id);
  };

  const labelHTML = (label: string, currentPanel: string) => {
    const localizedLabel = getLocalizedColumnName(datasetId!, label);
    return (
      <div style={styles.statementLabel}>
        {localizedLabel || '____'}
        {localizedLabel && currentPanel === 'dataDisplayLabel' && (
          <div
            id="uitest-remove-statement-label"
            onClick={() => removeLabel()}
            onKeyDown={() => removeLabel()}
            style={styles.statementDeleteIcon}
            role="button"
            tabIndex={0}
          >
            <div style={styles.statementDeleteCircle} />
            <div style={styles.statementDeleteX}>
              <FontAwesomeIcon icon={faTimesCircle} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const selectedFeaturesHTML = (
    selectedFeatures: string[],
    currentPanel: string,
  ) => {
    return (
      <span>
        {selectedFeatures.map((selectedFeature, index) => {
          const localizedName = getLocalizedColumnName(
            datasetId!,
            selectedFeature,
          );
          return (
            <span key={index}>
              <div style={styles.statementFeature}>
                {localizedName}
                {currentPanel === 'dataDisplayFeatures' && (
                  <div
                    id="uitest-remove-statement-feature"
                    onClick={() => removeFeature(selectedFeature)}
                    onKeyDown={() => removeFeature(selectedFeature)}
                    style={styles.statementDeleteIcon}
                    role="button"
                    tabIndex={0}
                  >
                    <div style={styles.statementDeleteCircle} />
                    <div style={styles.statementDeleteX}>
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </div>
                  </div>
                )}
              </div>
              {index < selectedFeatures.length - 1 && ', '}
            </span>
          );
        })}
        {selectedFeatures.length === 0 && (
          <span style={styles.statementFeature}>____</span>
        )}
      </span>
    );
  };

  if (!shouldShow) {
    return null;
  }

  // Placeholders put into the "predictionStatement" string which will be replaced with React
  // components.
  // This placeholder system is necessary because different languages will order the words in
  // the sentence differently. Since we can't predict what order the react components will be
  // in, we need to use placeholders in the plaintext string.
  const OUTPUT_KEY = '__CDO_OUTPUT__';
  const INPUTS_KEY = '__CDO_INPUTS__';
  // The "Predict ___ based on ___" sentence translators receive. The OUTPUT and INPUTS
  // placeholders will be replaced with React components.
  const predictionStatement =
    I18n.t('predictionStatement', {output: OUTPUT_KEY, inputs: INPUTS_KEY}) ||
    '';
  // Regex to split the "Predict..." statement and isolate the dynamic content parts.
  // "Predict __CDO_OUTPUT__ based on __CDO_INPUTS__" becomes
  // ["Predict ", "__CDO_OUTPUT__", " based on ", "__CDO_INPUTS__"]
  const regex = new RegExp(`(${OUTPUT_KEY}|${INPUTS_KEY})`);
  const predictionStatementParts = predictionStatement
    .split(regex)
    .filter((part: string) => part);
  // Swap the OUTPUT and INPUTS placeholders with React components.
  const predictionStatementComponents = predictionStatementParts
    .map((part: string, index: number) => {
      if (part === OUTPUT_KEY) {
        return labelHTML(labelColumn!, currentPanel!);
      } else if (part === INPUTS_KEY) {
        return selectedFeaturesHTML(selectedFeatures!, currentPanel!);
      } else {
        return part;
      }
    })
    .map((part: string | React.ReactElement, index: number) => {
      // React wants sibling elements in a list to have a unique "key".
      return <span key={index}>{part}</span>;
    });

  return (
    <div
      style={smallFont ? styles.statementSmall : styles.statement}
      id="statement"
    >
      {predictionStatementComponents}
    </div>
  );
};

export const UnconnectedStatement = Statement;

export default connect(
  (state: RootState) => ({
    shouldShow: state.data.length !== 0,
    data: state.data,
    currentPanel: state.currentPanel,
    labelColumn: state.labelColumn,
    selectedFeatures: state.selectedFeatures,
    datasetId: state.metadata && state.metadata.name,
  }),
  dispatch => ({
    setLabelColumn(labelColumn: string | null) {
      dispatch(setLabelColumn(labelColumn as string));
    },
    removeSelectedFeature(labelColumn: string) {
      dispatch(removeSelectedFeature(labelColumn));
    },
  }),
)(Statement);
