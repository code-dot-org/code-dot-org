import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useId} from 'react';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {displayValue} from '../helpers/displayTreeNodeContent';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {getPredictionTrace} from '../selectors/visualizationSelectors';
import {useTrainingData} from '../TrainingDataContext';

import CellText from './CellText';

import tableStyles from './dataTable.module.scss';
import styles from './nodeExample.module.scss';

interface NodeExampleProps {
  nodeId: string;
  emphasizedColumn?: string;
}

const NodeExample = ({nodeId, emphasizedColumn}: NodeExampleProps) => {
  const titleId = useId();
  const {project} = useProject();
  const {trainedModel} = useTrainingData();
  const trace = useAppSelector(state =>
    getPredictionTrace(state, project, trainedModel)
  );
  const testData = useAppSelector(state => state.predictionTestData);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');

  if (!trace?.path.includes(nodeId)) {
    return null;
  }

  const prediction = displayValue(trace.prediction, datasetId);
  const features = project.selectedFeatures;
  const labelColumn = project.labelColumn || 'unknown';

  const cellClassName = (column: string, variant: string) =>
    classNames(tableStyles.bodyCell, variant, {
      [styles.emphasized]: column === emphasizedColumn,
    });

  return (
    <section className={styles.example} aria-labelledby={titleId}>
      <Typography variant="body3" component="h3" className={styles.heading}>
        <span id={titleId} className={styles.title}>
          Your example
        </span>
        <span aria-hidden="true" className={styles.dot} />
        <span className={styles.description}>
          This is the prediction AI made based on your answers.
        </span>
      </Typography>
      <div
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable so a keyboard can scroll a wide example
        tabIndex={0}
        role="group"
        aria-labelledby={titleId}
        className={styles.scroller}
      >
        <table className={classNames(tableStyles.table, styles.table)}>
          <colgroup span={features.length} />
          <thead>
            <tr>
              <th
                scope="colgroup"
                colSpan={features.length}
                className={tableStyles.header}
              >
                <CellText>Your answers</CellText>
              </th>
              <th scope="col" className={tableStyles.header}>
                <CellText>AI predicts</CellText>
              </th>
            </tr>
            <tr>
              {features.map(feature => (
                <th
                  key={feature}
                  scope="col"
                  className={classNames(
                    tableStyles.header,
                    tableStyles.headerFeature
                  )}
                >
                  <CellText>
                    {getLocalizedColumnName(datasetId, feature)}
                  </CellText>
                </th>
              ))}
              <th
                scope="col"
                className={classNames(
                  tableStyles.header,
                  tableStyles.headerLabel
                )}
              >
                <CellText>
                  {getLocalizedColumnName(datasetId, labelColumn)}
                </CellText>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {features.map(feature => (
                <td
                  key={feature}
                  className={cellClassName(
                    feature,
                    tableStyles.bodyCellFeature
                  )}
                >
                  <CellText>
                    {getLocalizedValue(testData[feature], datasetId)}
                  </CellText>
                </td>
              ))}
              <td
                className={cellClassName(
                  labelColumn,
                  tableStyles.bodyCellLabel
                )}
              >
                <CellText>{prediction}</CellText>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default NodeExample;
