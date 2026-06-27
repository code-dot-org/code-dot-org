/* React component to handle showing warning for excessive unique options. */
import {styles, UNIQUE_OPTIONS_MAX} from '../constants';
import {useAppSelector} from '../hooks';
import I18n from '../i18n';
import {hasTooManyUniqueOptions} from '../selectors/currentColumnSelectors';

const UniqueOptionsWarning = () => {
  const showWarning = useAppSelector(hasTooManyUniqueOptions);

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

export default UniqueOptionsWarning;
