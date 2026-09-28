/* React component to handle showing details of numerical columns. */
import {useAppSelector} from '../hooks';
import I18n from '../i18n';
import {getNumericalColumnDetails} from '../selectors/currentColumnSelectors';

import shared from '../shared.module.scss';
import styles from './columnDetailsNumerical.module.scss';

const ColumnDetailsNumerical = () => {
  const columnDetails = useAppSelector(getNumericalColumnDetails);

  const {extrema, containsOnlyNumbers} = columnDetails;

  return (
    <div>
      <div className={shared.bold}>{I18n.t('columnDetailsInformation')}</div>
      {!containsOnlyNumbers && (
        <p className={shared.error}>
          {I18n.t('columnDetailsNumericalTypeError')}
        </p>
      )}
      {containsOnlyNumbers && extrema && (
        <div className={styles.extrema}>
          {I18n.t('columnDetailsMinimumValue')} {extrema.min}
          <br />
          {I18n.t('columnDetailsMaximumValue')} {extrema.max}
          <br />
          {I18n.t('columnDetailsValueRange')} {extrema.range}
        </div>
      )}
    </div>
  );
};

export default ColumnDetailsNumerical;
