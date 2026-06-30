/* React component to handle selecting columns as features. */
import {styles} from '../constants';
import {useAppDispatch} from '../hooks';
import I18n from '../i18n';
import {addSelectedFeature} from '../redux';

interface AddFeatureButtonProps {
  column?: string;
}

const AddFeatureButton = ({column}: AddFeatureButtonProps) => {
  const dispatch = useAppDispatch();

  const addFeature = (event: React.MouseEvent, column: string) => {
    dispatch(addSelectedFeature(column));
    event.preventDefault();
  };

  return (
    <button
      id="uitest-add-feature-button"
      type="button"
      onClick={event => addFeature(event, column!)}
      style={styles.selectFeaturesButton}
    >
      {I18n.t('addFeatureButton')}
    </button>
  );
};

export default AddFeatureButton;
