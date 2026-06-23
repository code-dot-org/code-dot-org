/* React component to handle toggling between correct/incorrect test results */
import {faTimes, faCheck} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import {ResultsGrades, styles} from '../constants';
import {useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {setResultsTab} from '../redux';

const ResultsToggle = () => {
  const resultsTab = useAppSelector(state => state.resultsTab);
  const dispatch = useAppDispatch();

  const getTogglePillStyle = (key: string) => {
    let style;
    if (key === resultsTab) {
      style = {...styles.pill, ...styles.selectedPill};
    } else {
      style = styles.pill;
    }
    return style;
  };

  const resultsTabs = [
    {
      key: ResultsGrades.CORRECT,
      headerText: I18n.t('correctAnswer'),
      icon: faCheck,
      iconStyle: styles.correct,
    },
    {
      key: ResultsGrades.INCORRECT,
      headerText: I18n.t('incorrectAnswer'),
      icon: faTimes,
      iconStyle: styles.error,
    },
  ];

  return (
    <div>
      <div style={styles.resultsToggle}>
        {resultsTabs.map(tab => (
          <div
            key={tab.key}
            style={getTogglePillStyle(tab.key)}
            onClick={() => dispatch(setResultsTab(tab.key))}
            onKeyDown={() => dispatch(setResultsTab(tab.key))}
            role="button"
            tabIndex={0}
          >
            <FontAwesomeIcon icon={tab.icon} style={tab.iconStyle} />{' '}
            {tab.headerText}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsToggle;
