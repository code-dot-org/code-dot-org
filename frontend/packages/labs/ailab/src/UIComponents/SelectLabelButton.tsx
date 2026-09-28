/* React component to handle selecting a column as the label. */
import {useAppDispatch} from '../hooks';
import I18n from '../i18n';
import {setLabelColumn} from '../redux';

import shared from '../shared.module.scss';

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
      className={`${shared.columnButton} ${shared.labelButton}`}
    >
      {I18n.t('selectLabelButton')}
    </button>
  );
};

export default SelectLabelButton;
