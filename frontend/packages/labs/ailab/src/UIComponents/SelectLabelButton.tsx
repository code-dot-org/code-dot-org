/* React component to handle selecting a column as the label. */
import {connect} from 'react-redux';

import {styles} from '../constants';
import I18n from '../i18n';
import {setLabelColumn} from '../redux';

interface SelectLabelButtonProps {
  column?: string;
  setLabelColumn: (column: string) => void;
}

const SelectLabelButton = ({
  column,
  setLabelColumn,
}: SelectLabelButtonProps) => {
  const setPredictColumn = (event: React.MouseEvent, column: string) => {
    setLabelColumn(column);
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

export default connect(null, dispatch => ({
  setLabelColumn(column: string) {
    dispatch(setLabelColumn(column));
  },
}))(SelectLabelButton);
