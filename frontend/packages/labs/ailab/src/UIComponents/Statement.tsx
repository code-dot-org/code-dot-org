/* React component to display a statement about our model. */
import {faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {useAppSelector} from '../hooks';
import I18n from '../i18n';
import {useProject} from '../ProjectContext';

import shared from '../shared.module.scss';
import styles from './statement.module.scss';

interface StatementProps {
  shouldShow?: boolean;
  currentPanel?: string;
  labelIsPreset?: boolean;
  labelColumn?: string;
  selectedFeatures?: string[];
  setLabelColumn?: (column: string | null) => void;
  removeSelectedFeature?: (id: string) => void;
  datasetId?: string;
}

const Statement = ({
  shouldShow,
  currentPanel,
  labelIsPreset,
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
      <div className={styles.label}>
        {localizedLabel || '____'}
        {localizedLabel && currentPanel === 'datasetView' && !labelIsPreset && (
          <div
            id="uitest-remove-statement-label"
            onClick={() => removeLabel()}
            onKeyDown={() => removeLabel()}
            className={styles.deleteIcon}
            role="button"
            tabIndex={0}
          >
            <div className={styles.deleteCircle} />
            <div className={styles.deleteX}>
              <FontAwesomeIcon icon={faTimesCircle} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const selectedFeaturesHTML = (
    selectedFeatures: string[],
    currentPanel: string
  ) => {
    return (
      <span>
        {selectedFeatures.map((selectedFeature, index) => {
          const localizedName = getLocalizedColumnName(
            datasetId!,
            selectedFeature
          );
          return (
            <span key={index}>
              <div className={styles.feature}>
                {localizedName}
                {currentPanel === 'datasetView' && (
                  <div
                    id="uitest-remove-statement-feature"
                    onClick={() => removeFeature(selectedFeature)}
                    onKeyDown={() => removeFeature(selectedFeature)}
                    className={styles.deleteIcon}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.deleteCircle} />
                    <div className={styles.deleteX}>
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
          <span className={styles.feature}>____</span>
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
    .map((part: string) => {
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
    <div className={shared.largeText} id="statement">
      {predictionStatementComponents}
    </div>
  );
};

// Store-connected container: the default export used in the live panels.
const ConnectedStatement = () => {
  const shouldShow = useAppSelector(state => state.data.length !== 0);
  const currentPanel = useAppSelector(state => state.currentPanel);
  const labelIsPreset = useAppSelector(state => !!state.mode?.hideSelectLabel);
  const {project, setLabelColumn, removeSelectedFeature} = useProject();
  const {labelColumn, selectedFeatures} = project;
  const datasetId = useAppSelector(
    state => state.metadata && state.metadata.name
  );

  return (
    <Statement
      shouldShow={shouldShow}
      currentPanel={currentPanel}
      labelIsPreset={labelIsPreset}
      labelColumn={labelColumn}
      selectedFeatures={selectedFeatures}
      datasetId={datasetId}
      setLabelColumn={column => setLabelColumn(column ?? undefined)}
      removeSelectedFeature={removeSelectedFeature}
    />
  );
};

export default ConnectedStatement;
