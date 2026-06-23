/* React component to handle showing details of numerical columns. */
import {styles} from '../constants';
import {useAppSelector} from '../hooks';
import I18n from '../i18n';
import {getNumericalColumnDetails} from '../selectors/currentColumnSelectors';

const ColumnDetailsNumerical = () => {
  const columnDetails = useAppSelector(getNumericalColumnDetails);

  const {extrema, containsOnlyNumbers} = columnDetails;

  return (
    <div>
      <div style={styles.bold}>{I18n.t('columnDetailsInformation')}</div>
      {!containsOnlyNumbers && (
        <p style={styles.error}>{I18n.t('columnDetailsNumericalTypeError')}</p>
      )}
      {containsOnlyNumbers && extrema && (
        <div style={styles.contents}>
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
