import {Algorithms, styles} from '../constants';
import {useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {setSelectedAlgorithm} from '../redux';
import type {AlgorithmId} from '../types';

const algorithmChoices: {
  id: AlgorithmId;
  nameKey: string;
  descriptionKey: string;
}[] = [
  {
    id: Algorithms.KNN,
    nameKey: 'algorithmKnnName',
    descriptionKey: 'algorithmKnnDescription',
  },
  {
    id: Algorithms.DECISION_TREE,
    nameKey: 'algorithmDecisionTreeName',
    descriptionKey: 'algorithmDecisionTreeDescription',
  },
];

const SelectAlgorithm = () => {
  const dispatch = useAppDispatch();
  const selectedAlgorithm = useAppSelector(state => state.selectedAlgorithm);

  return (
    <div id="select-algorithm" style={{...styles.panel, ...styles.algorithmPanel}}>
      <fieldset style={styles.algorithmChoiceFieldset}>
        <legend style={styles.algorithmChoiceLegend}>
          {I18n.t('selectAlgorithmHeading')}
        </legend>
        <div style={styles.algorithmChoiceGrid}>
          {algorithmChoices.map(choice => {
            const selected = selectedAlgorithm === choice.id;
            const inputId = `algorithm-${choice.id}`;
            const descriptionId = `${inputId}-description`;
            return (
              <label
                key={choice.id}
                htmlFor={inputId}
                aria-label={I18n.t(choice.nameKey)}
                style={{
                  ...styles.algorithmChoice,
                  ...(selected ? styles.algorithmChoiceSelected : undefined),
                }}
              >
                <input
                  id={inputId}
                  type="radio"
                  name="algorithm"
                  value={choice.id}
                  checked={selected}
                  onChange={() => dispatch(setSelectedAlgorithm(choice.id))}
                  aria-describedby={descriptionId}
                  style={styles.algorithmChoiceInput}
                />
                <span>
                  <span style={styles.algorithmChoiceTitle}>
                    {I18n.t(choice.nameKey)}
                  </span>
                  <span
                    id={descriptionId}
                    style={styles.algorithmChoiceDescription}
                  >
                    {I18n.t(choice.descriptionKey)}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
};

export default SelectAlgorithm;
