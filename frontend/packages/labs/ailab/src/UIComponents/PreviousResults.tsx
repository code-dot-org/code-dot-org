import {formatAccuracy} from '../helpers/accuracy';
import {useAppSelector} from '../hooks';
import type {HistoricResult} from '../types';

import PredictionSentence from './PredictionSentence';

import styles from './previousResults.module.scss';

interface ModelTableProps {
  heading: string;
  results: HistoricResult[];
}

const ModelTable = ({heading, results}: ModelTableProps) => (
  <table className={styles.table}>
    <thead>
      <tr>
        <th scope="col">{heading}</th>
        <th scope="col" className={styles.accuracy}>
          Accuracy
        </th>
      </tr>
    </thead>
    <tbody>
      {results.map((result, index) => (
        <tr key={index}>
          <td>
            <PredictionSentence
              label={result.label}
              features={result.features}
              size="m"
            />
          </td>
          <td className={styles.accuracy}>{formatAccuracy(result.accuracy)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const PreviousResults = () => {
  const [current, ...previous] = useAppSelector(state => state.historicResults);

  return (
    <div className={styles.groups}>
      <ModelTable heading="Current" results={[current]} />
      {previous.length > 0 ? (
        <ModelTable heading="Previous" results={previous} />
      ) : (
        <p className={styles.empty}>
          No previous results yet. Go back to the Dataset and train another model to
          compare it with this one.
        </p>
      )}
    </div>
  );
};

export default PreviousResults;
