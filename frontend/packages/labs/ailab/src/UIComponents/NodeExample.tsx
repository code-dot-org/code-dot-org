import {Typography} from '@mui/material';
import classNames from 'classnames';
import {useId} from 'react';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';

import CellText from './CellText';

import tableStyles from './dataTable.module.scss';
import styles from './nodeExample.module.scss';

interface NodeExampleProps {
  prediction: string;
  emphasizedColumn?: string;
}

const NodeExample = ({prediction, emphasizedColumn}: NodeExampleProps) => {
  const titleId = useId();
  const {project} = useProject();
  const testData = useAppSelector(state => state.predictionTestData);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
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
      <div className={styles.scroller}>
        <table className={classNames(tableStyles.table, styles.table)}>
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
                    tableStyles.headerFeature,
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
                  tableStyles.headerLabel,
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
                    tableStyles.bodyCellFeature,
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
                  tableStyles.bodyCellLabel,
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
