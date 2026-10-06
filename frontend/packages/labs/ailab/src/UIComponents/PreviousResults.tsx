import {formatAccuracy} from '../helpers/accuracy';
import {useAppSelector} from '../hooks';

import PredictionSentence from './PredictionSentence';

import styles from './previousResults.module.scss';

const PreviousResults = () => {
  const [, ...previousResults] = useAppSelector(state => state.historicResults);

  if (previousResults.length === 0) {
    return (
      <p className={styles.empty}>
        No previous results yet. Go back to Dataset and train another model to
        compare it with this one.
      </p>
    );
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">Model</th>
          <th scope="col" className={styles.accuracy}>
            Accuracy
          </th>
        </tr>
      </thead>
      <tbody>
        {previousResults.map((result, index) => (
          <tr key={index}>
            <td>
              <PredictionSentence
                label={result.label}
                features={result.features}
                size="m"
              />
            </td>
            <td className={styles.accuracy}>
              {formatAccuracy(result.accuracy)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PreviousResults;
