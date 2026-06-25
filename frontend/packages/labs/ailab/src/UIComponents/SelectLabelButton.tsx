/* React component to handle selecting a column as the label. */
import {styles} from '../constants';
import {useAppDispatch} from '../hooks';
import I18n from '../i18n';
import {setLabelColumn} from '../redux';

interface SelectLabelButtonProps {
  column?: string;
}

const SelectLabelButton = ({column}: SelectLabelButtonProps) => {
  const dispatch = useAppDispatch();

  const setPredictColumn = (event: React.MouseEvent, column: string) => {
    dispatch(setLabelColumn(column));
    event.preventDefault();
  };

  return (
    <button
      id="uitest-select-label-button"
      type="button"
      onClick={event => setPredictColumn(event, column!)}
      style={styles.selectLabelButton}
    >
      {I18n.t('selectLabelButton')}
    </button>
  );
};

export default SelectLabelButton;
