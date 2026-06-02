/* React component to handle showing warning for excessive unique options. */
import {connect} from 'react-redux';
import {RootState} from '../redux';
import {styles, UNIQUE_OPTIONS_MAX} from '../constants';
import {hasTooManyUniqueOptions} from '../selectors/currentColumnSelectors';
import I18n from '../i18n';

interface UniqueOptionsWarningProps {
  showWarning?: boolean;
}

const UniqueOptionsWarning = ({showWarning}: UniqueOptionsWarningProps) => {
  if (!showWarning) {
    return null;
  }

  return (
    <div>
      <div style={styles.bold}>{I18n.t('uniqueOptionsWarningNotice')}</div>
      <div>
        {I18n.t('uniqueOptionsWarningMessage', {
          valueCount: UNIQUE_OPTIONS_MAX,
        })}
      </div>
    </div>
  );
};

export default connect((state: RootState) => ({
  showWarning: hasTooManyUniqueOptions(state),
}))(UniqueOptionsWarning);
