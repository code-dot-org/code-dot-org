/* React component to handle selecting columns as features. */
import {useAppDispatch} from '../hooks';
import I18n from '../i18n';
import {addSelectedFeature} from '../redux';

import styles from './addFeatureButton.module.scss';

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
      className={styles.button}
    >
      {I18n.t('addFeatureButton')}
    </button>
  );
};

export default AddFeatureButton;
